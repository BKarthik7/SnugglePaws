import { 
  users, type User, type InsertUser,
  pets, type Pet, type InsertPet,
  favorites, type Favorite, type InsertFavorite,
  messages, type Message, type InsertMessage
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Pet operations
  getPet(id: number): Promise<Pet | undefined>;
  getPets(filters: Partial<{
    type: string;
    breed: string;
    minAge: number;
    maxAge: number;
    minPrice: number;
    maxPrice: number;
    location: string;
    sellerId: number;
    isFeatured: boolean;
    listingType: string;
  }>, limit?: number, offset?: number): Promise<Pet[]>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: number, pet: Partial<InsertPet>): Promise<Pet | undefined>;
  deletePet(id: number): Promise<boolean>;
  
  // Favorite operations
  getFavoritesByUser(userId: number): Promise<Pet[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, petId: number): Promise<boolean>;
  isFavorite(userId: number, petId: number): Promise<boolean>;
  
  // Message operations
  getMessages(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(userId: number, senderId: number): Promise<boolean>;
  getUnreadMessageCount(userId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pets: Map<number, Pet>;
  private favorites: Map<number, Favorite>;
  private messages: Map<number, Message>;
  
  private userIdCounter: number;
  private petIdCounter: number;
  private favoriteIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.pets = new Map();
    this.favorites = new Map();
    this.messages = new Map();
    
    this.userIdCounter = 1;
    this.petIdCounter = 1;
    this.favoriteIdCounter = 1;
    this.messageIdCounter = 1;
    
    // Add some initial seed data
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isVerified: false,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Pet operations
  async getPet(id: number): Promise<Pet | undefined> {
    return this.pets.get(id);
  }
  
  async getPets(filters: Partial<{
    type: string;
    breed: string;
    minAge: number;
    maxAge: number;
    minPrice: number;
    maxPrice: number;
    location: string;
    sellerId: number;
    isFeatured: boolean;
    listingType: string;
  }> = {}, limit = 20, offset = 0): Promise<Pet[]> {
    let pets = Array.from(this.pets.values());
    
    // Apply filters
    if (filters.type) {
      pets = pets.filter(pet => pet.type.toLowerCase() === filters.type!.toLowerCase());
    }
    
    if (filters.breed) {
      pets = pets.filter(pet => pet.breed && pet.breed.toLowerCase().includes(filters.breed!.toLowerCase()));
    }
    
    if (filters.minAge !== undefined) {
      pets = pets.filter(pet => pet.age !== null && pet.age >= filters.minAge!);
    }
    
    if (filters.maxAge !== undefined) {
      pets = pets.filter(pet => pet.age !== null && pet.age <= filters.maxAge!);
    }
    
    if (filters.minPrice !== undefined) {
      pets = pets.filter(pet => pet.price !== null && pet.price >= filters.minPrice!);
    }
    
    if (filters.maxPrice !== undefined) {
      pets = pets.filter(pet => pet.price !== null && pet.price <= filters.maxPrice!);
    }
    
    if (filters.location) {
      pets = pets.filter(pet => pet.location && pet.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }
    
    if (filters.sellerId !== undefined) {
      pets = pets.filter(pet => pet.sellerId === filters.sellerId);
    }
    
    if (filters.isFeatured !== undefined) {
      pets = pets.filter(pet => pet.isFeatured === filters.isFeatured);
    }
    
    if (filters.listingType) {
      pets = pets.filter(pet => pet.listingType === filters.listingType);
    }
    
    // Sort by most recent
    pets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Apply pagination
    return pets.slice(offset, offset + limit);
  }
  
  async createPet(insertPet: InsertPet): Promise<Pet> {
    const id = this.petIdCounter++;
    const now = new Date();
    const pet: Pet = { 
      ...insertPet, 
      id, 
      status: "available",
      isFeatured: false, 
      createdAt: now
    };
    this.pets.set(id, pet);
    return pet;
  }
  
  async updatePet(id: number, petData: Partial<InsertPet>): Promise<Pet | undefined> {
    const pet = this.pets.get(id);
    if (!pet) return undefined;
    
    const updatedPet = { ...pet, ...petData };
    this.pets.set(id, updatedPet);
    return updatedPet;
  }
  
  async deletePet(id: number): Promise<boolean> {
    return this.pets.delete(id);
  }
  
  // Favorite operations
  async getFavoritesByUser(userId: number): Promise<Pet[]> {
    const favoritePetIds = Array.from(this.favorites.values())
      .filter(fav => fav.userId === userId)
      .map(fav => fav.petId);
    
    return Array.from(this.pets.values())
      .filter(pet => favoritePetIds.includes(pet.id));
  }
  
  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    // Check if already exists
    const existing = Array.from(this.favorites.values()).find(
      f => f.userId === insertFavorite.userId && f.petId === insertFavorite.petId
    );
    
    if (existing) return existing;
    
    const id = this.favoriteIdCounter++;
    const now = new Date();
    const favorite: Favorite = { 
      ...insertFavorite, 
      id, 
      createdAt: now
    };
    this.favorites.set(id, favorite);
    return favorite;
  }
  
  async removeFavorite(userId: number, petId: number): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      f => f.userId === userId && f.petId === petId
    );
    
    if (!favorite) return false;
    return this.favorites.delete(favorite.id);
  }
  
  async isFavorite(userId: number, petId: number): Promise<boolean> {
    return Array.from(this.favorites.values()).some(
      f => f.userId === userId && f.petId === petId
    );
  }
  
  // Message operations
  async getMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.senderId === userId || msg.receiverId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => 
        (msg.senderId === user1Id && msg.receiverId === user2Id) || 
        (msg.senderId === user2Id && msg.receiverId === user1Id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id, 
      isRead: false,
      createdAt: now
    };
    this.messages.set(id, message);
    return message;
  }
  
  async markMessagesAsRead(userId: number, senderId: number): Promise<boolean> {
    let updated = false;
    
    Array.from(this.messages.values())
      .filter(msg => msg.receiverId === userId && msg.senderId === senderId && !msg.isRead)
      .forEach(msg => {
        const updatedMsg = { ...msg, isRead: true };
        this.messages.set(msg.id, updatedMsg);
        updated = true;
      });
    
    return updated;
  }
  
  async getUnreadMessageCount(userId: number): Promise<number> {
    return Array.from(this.messages.values())
      .filter(msg => msg.receiverId === userId && !msg.isRead)
      .length;
  }
  
  // Seed data for demo purposes
  private seedData() {
    // Seed users
    const user1: User = {
      id: this.userIdCounter++,
      username: "johndoe",
      password: "password123",
      email: "john@example.com",
      name: "John Doe",
      userType: "pet_seeker",
      bio: "Animal lover looking for a new furry friend",
      location: "Seattle, WA",
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
      isVerified: true,
      createdAt: new Date()
    };
    
    const user2: User = {
      id: this.userIdCounter++,
      username: "janesmith",
      password: "password123",
      email: "jane@example.com",
      name: "Jane Smith",
      userType: "breeder",
      bio: "Certified ethical dog breeder with 10 years of experience",
      location: "Portland, OR",
      profileImage: "https://randomuser.me/api/portraits/women/1.jpg",
      isVerified: true,
      createdAt: new Date()
    };
    
    const user3: User = {
      id: this.userIdCounter++,
      username: "pawshelter",
      password: "password123",
      email: "shelter@pawshelter.com",
      name: "Paws Animal Shelter",
      userType: "shelter",
      bio: "No-kill animal shelter helping pets find forever homes",
      location: "Vancouver, WA",
      profileImage: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      isVerified: true,
      createdAt: new Date()
    };
    
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(user3.id, user3);
    
    // Seed pets
    const pets: InsertPet[] = [
      {
        name: "Max",
        type: "dog",
        breed: "Golden Retriever",
        age: 8,
        gender: "male",
        size: "large",
        description: "Max is a friendly and playful Golden Retriever who loves to fetch and swim. He's great with kids and other pets.",
        price: 1200,
        images: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"],
        sellerId: user2.id,
        location: "Portland, OR",
        listingType: "sale"
      },
      {
        name: "Luna",
        type: "cat",
        breed: "Calico",
        age: 3,
        gender: "female",
        size: "small",
        description: "Luna is a sweet and gentle calico kitten who loves to cuddle and play with toys. She's litter trained and ready for her forever home.",
        price: 600,
        images: ["https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"],
        sellerId: user2.id,
        location: "Seattle, WA",
        listingType: "sale"
      },
      {
        name: "Cooper",
        type: "dog",
        breed: "Labrador",
        age: 4,
        gender: "male",
        size: "large",
        description: "Cooper is an energetic labrador puppy who loves to play and learn new tricks. He's partially house trained and great with kids.",
        price: 950,
        images: ["https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"],
        sellerId: user2.id,
        location: "Bellevue, WA",
        listingType: "sale"
      },
      {
        name: "Oliver",
        type: "cat",
        breed: "Siamese",
        age: 12,
        gender: "male",
        size: "medium",
        description: "Oliver is a beautiful Siamese cat with striking blue eyes. He's quiet, independent, and enjoys lounging in sunny spots.",
        price: 750,
        images: ["https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"],
        sellerId: user2.id,
        location: "Tacoma, WA",
        listingType: "sale"
      },
      {
        name: "Bella",
        type: "dog",
        breed: "Border Collie",
        age: 12,
        gender: "female",
        size: "medium",
        description: "Bella is a smart, energetic Border Collie who loves to play and learn new tricks. She excels at agility training and is very loyal.",
        price: 850,
        images: ["https://images.unsplash.com/photo-1581888227599-779811939961?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"],
        sellerId: user2.id,
        location: "Vancouver, WA",
        listingType: "sale"
      },
      {
        name: "Whiskers",
        type: "cat",
        breed: "Tabby",
        age: 36,
        gender: "male",
        size: "medium",
        description: "Whiskers is a gentle, loving cat who enjoys cuddles and playtime with feather toys. He's litter trained and gets along with other cats.",
        price: 75,
        images: ["https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"],
        sellerId: user3.id,
        location: "Seattle, WA",
        listingType: "adoption"
      },
      {
        name: "Buddy",
        type: "dog",
        breed: "Pug",
        age: 24,
        gender: "male",
        size: "small",
        description: "Buddy is a friendly, loyal pug who loves to nap and go for short walks. He's great with children and gets along with other dogs.",
        price: 950,
        images: ["https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"],
        sellerId: user2.id,
        location: "Portland, OR",
        listingType: "sale"
      },
      {
        name: "Simba",
        type: "cat",
        breed: "Maine Coon",
        age: 12,
        gender: "male",
        size: "large",
        description: "Simba is a majestic Maine Coon with a playful personality and stunning coat. He's very affectionate and loves to be brushed.",
        price: 800,
        images: ["https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"],
        sellerId: user2.id,
        location: "Olympia, WA",
        listingType: "sale"
      },
      {
        name: "Charlie",
        type: "dog",
        breed: "Beagle",
        age: 48,
        gender: "male",
        size: "medium",
        description: "Charlie is a sweet beagle who needs a new loving home due to owner relocation. He's house trained and knows basic commands.",
        price: 400,
        images: ["https://images.unsplash.com/photo-1602250798340-c33fb5909efd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"],
        sellerId: user1.id,
        location: "Eugene, OR",
        listingType: "rehome"
      },
      {
        name: "Tiger",
        type: "cat",
        breed: "Bengal",
        age: 8,
        gender: "female",
        size: "medium",
        description: "Tiger is an energetic Bengal kitten with stunning markings and a playful disposition. She loves interactive toys and climbing.",
        price: 1200,
        images: ["https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"],
        sellerId: user2.id,
        location: "Tacoma, WA",
        listingType: "sale"
      }
    ];
    
    // Add pets with featured flag
    pets.forEach((petData) => {
      const pet: Pet = {
        ...petData,
        id: this.petIdCounter++,
        status: "available",
        isFeatured: Math.random() > 0.5,
        createdAt: new Date()
      };
      this.pets.set(pet.id, pet);
    });
    
    // Add some favorites
    this.addFavorite({ userId: user1.id, petId: 1 });
    this.addFavorite({ userId: user1.id, petId: 3 });
    
    // Add some messages
    this.createMessage({ 
      senderId: user1.id, 
      receiverId: user2.id, 
      content: "Hi, I'm interested in Max. Is he still available?",
      petId: 1
    });
    
    this.createMessage({ 
      senderId: user2.id, 
      receiverId: user1.id, 
      content: "Yes, Max is still available! Would you like to schedule a visit?",
      petId: 1
    });
    
    this.createMessage({ 
      senderId: user1.id, 
      receiverId: user3.id, 
      content: "Hello, I'm interested in Whiskers. Can I come see him?",
      petId: 6
    });
  }
}

export const storage = new MemStorage();
