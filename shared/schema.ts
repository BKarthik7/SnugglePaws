import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  userType: text("user_type").notNull().default("pet_seeker"),
  bio: text("bio"),
  location: text("location"),
  profileImage: text("profile_image"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    email: true,
    name: true,
    userType: true,
    bio: true,
    location: true,
    profileImage: true,
  });

// Pet model
export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // dog, cat, etc.
  breed: text("breed"),
  age: integer("age"),
  gender: text("gender"),
  size: text("size"), // small, medium, large
  description: text("description"),
  price: doublePrecision("price"),
  images: json("images").$type<string[]>().default([]),
  sellerId: integer("seller_id").notNull(),
  status: text("status").notNull().default("available"), // available, pending, sold
  location: text("location"),
  isFeatured: boolean("is_featured").default(false),
  listingType: text("listing_type").default("sale"), // sale, adoption, rehome
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPetSchema = createInsertSchema(pets)
  .pick({
    name: true,
    type: true,
    breed: true,
    age: true,
    gender: true,
    size: true,
    description: true,
    price: true,
    images: true,
    sellerId: true,
    location: true,
    listingType: true,
    status: true,
  });

// Favorites model
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  petId: integer("pet_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites)
  .pick({
    userId: true,
    petId: true,
  });

// Messages model
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  petId: integer("pet_id"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages)
  .pick({
    senderId: true,
    receiverId: true,
    content: true,
    petId: true,
  });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof pets.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
