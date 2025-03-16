import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertPetSchema, insertFavoriteSchema, insertMessageSchema } from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia" as any,
});

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "snugglepaws-secret",
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication routes
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      // Log in the user after registration
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user as any;
    return res.json(userWithoutPassword);
  });

  // Pet routes
  app.get("/api/pets", async (req, res) => {
    try {
      const {
        type,
        breed,
        minAge,
        maxAge,
        minPrice,
        maxPrice,
        location,
        sellerId,
        isFeatured,
        listingType,
        limit,
        offset,
      } = req.query;

      const filters: any = {};
      if (type) filters.type = String(type);
      if (breed) filters.breed = String(breed);
      if (minAge) filters.minAge = Number(minAge);
      if (maxAge) filters.maxAge = Number(maxAge);
      if (minPrice) filters.minPrice = Number(minPrice);
      if (maxPrice) filters.maxPrice = Number(maxPrice);
      if (location) filters.location = String(location);
      if (sellerId) filters.sellerId = Number(sellerId);
      if (isFeatured === "true") filters.isFeatured = true;
      if (listingType) filters.listingType = String(listingType);

      const pets = await storage.getPets(
        filters,
        limit ? Number(limit) : 20,
        offset ? Number(offset) : 0
      );
      res.json(pets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/pets/:id", async (req, res) => {
    try {
      const pet = await storage.getPet(Number(req.params.id));
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      res.json(pet);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/pets", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      const petData = insertPetSchema.parse({
        ...req.body,
        sellerId: user.id,
      });
      
      const pet = await storage.createPet(petData);
      res.status(201).json(pet);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/pets/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      const petId = Number(req.params.id);
      const pet = await storage.getPet(petId);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      if (pet.sellerId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to update this pet" });
      }
      
      const updatedPet = await storage.updatePet(petId, req.body);
      res.json(updatedPet);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/pets/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      const petId = Number(req.params.id);
      const pet = await storage.getPet(petId);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      if (pet.sellerId !== user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this pet" });
      }
      
      await storage.deletePet(petId);
      res.json({ message: "Pet deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Favorites routes
  app.get("/api/favorites", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      const favorites = await storage.getFavoritesByUser(user.id);
      res.json(favorites);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      const favoriteData = insertFavoriteSchema.parse({
        userId: user.id,
        petId: req.body.petId,
      });
      
      const favorite = await storage.addFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/favorites/:petId", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      const petId = Number(req.params.petId);
      
      const result = await storage.removeFavorite(user.id, petId);
      if (!result) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.json({ message: "Removed from favorites" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/favorites/check/:petId", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      const petId = Number(req.params.petId);
      
      const isFavorite = await storage.isFavorite(user.id, petId);
      res.json({ isFavorite });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Messages routes
  app.get("/api/messages", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      const messages = await storage.getMessages(user.id);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/messages/conversation/:userId", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const currentUser = req.user as any;
      const otherUserId = Number(req.params.userId);
      
      const conversation = await storage.getConversation(currentUser.id, otherUserId);
      
      // Mark messages as read
      await storage.markMessagesAsRead(currentUser.id, otherUserId);
      
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      const messageData = insertMessageSchema.parse({
        senderId: user.id,
        receiverId: req.body.receiverId,
        content: req.body.content,
        petId: req.body.petId,
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/messages/unread", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as any;
      const count = await storage.getUnreadMessageCount(user.id);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { petId } = req.body;
      const pet = await storage.getPet(Number(petId));
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }

      if (!pet.price) {
        return res.status(400).json({
          message: "Pet price is not set"
        });
      }

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(pet.price * 100), // Convert to cents
        currency: "usd",
        metadata: {
          petId: pet.id.toString(),
          buyerId: (req.user as any).id.toString(),
          sellerId: pet.sellerId.toString(),
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  });

  app.post("/api/payment-success", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { paymentIntentId } = req.body;
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          message: "Payment has not succeeded"
        });
      }

      const petId = Number(paymentIntent.metadata.petId);
      const pet = await storage.getPet(petId);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }

      // Update pet status to sold
      await storage.updatePet(petId, {
        status: "sold",
      });

      // Notify seller (in a real app, you'd want to handle this asynchronously)
      await storage.createMessage({
        senderId: Number(paymentIntent.metadata.buyerId),
        receiverId: Number(paymentIntent.metadata.sellerId),
        content: `Payment completed for ${pet.name}. Please arrange the handover details.`,
        petId: petId,
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  });

  // Create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
