import { 
  searchHistory, 
  type SearchHistory, 
  type InsertSearchHistory,
  searchResults,
  type SearchResult,
  type InsertSearchResult,
  users, 
  type User, 
  type InsertUser 
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, desc, and, like, or, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PgStore = connectPg(session);
    this.sessionStore = new PgStore({
      pool,
      createTableIfMissing: true
    });
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async getSearchHistory(userId?: number): Promise<SearchHistory[]> {
    if (userId) {
      return db.select()
        .from(searchHistory)
        .where(eq(searchHistory.userId, userId))
        .orderBy(desc(searchHistory.timestamp));
    }
    
    return db.select()
      .from(searchHistory)
      .orderBy(desc(searchHistory.timestamp));
  }
  
  async addSearchHistory(searchQuery: InsertSearchHistory): Promise<SearchHistory> {
    const [entry] = await db.insert(searchHistory)
      .values(searchQuery)
      .returning();
      
    return entry;
  }
  
  async getSearchResults(query: string, category?: string): Promise<SearchResult[]> {
    const searchTerm = `%${query}%`;
    
    if (category && category !== 'all') {
      return db.select()
        .from(searchResults)
        .where(
          and(
            or(
              like(searchResults.query, searchTerm),
              like(searchResults.title, searchTerm),
              like(searchResults.description, searchTerm)
            ),
            eq(searchResults.category, category)
          )
        )
        .orderBy(desc(searchResults.timestamp));
    }
    
    return db.select()
      .from(searchResults)
      .where(
        or(
          like(searchResults.query, searchTerm),
          like(searchResults.title, searchTerm),
          like(searchResults.description, searchTerm)
        )
      )
      .orderBy(desc(searchResults.timestamp));
  }
  
  async getSearchSuggestions(partialQuery: string): Promise<string[]> {
    if (!partialQuery) return [];
    
    const searchTerm = `%${partialQuery}%`;
    
    const result = await db.selectDistinct({ query: searchHistory.query })
      .from(searchHistory)
      .where(like(searchHistory.query, searchTerm))
      .limit(5);
      
    return result.map(item => item.query);
  }

  // Seed database with initial search results
  async seedSearchResults(results: InsertSearchResult[]): Promise<void> {
    try {
      // First check if we already have search results
      const existing = await db.select({ count: sql<number>`count(*)` }).from(searchResults);
      
      // If we have fewer records than the expected demo data, seed the database
      if (existing[0].count < results.length) {
        // Clear existing data to avoid duplicates
        if (existing[0].count > 0) {
          console.log("Clearing existing search results...");
          await db.delete(searchResults);
        }
        
        console.log(`Inserting ${results.length} search results into database`);
        
        // Process each result individually to avoid batch issues
        for (const result of results) {
          try {
            // Make sure tags, source, and thumbnailUrl are always defined as at least null
            const searchResult = {
              ...result,
              tags: result.tags || null,
              source: result.source || null,
              thumbnailUrl: result.thumbnailUrl || null
            };
            
            await db.insert(searchResults).values(searchResult);
          } catch (err) {
            console.error(`Error inserting search result: ${err}`);
          }
        }
      } else {
        console.log(`Database already has ${existing[0].count} records, skipping seed`);
      }
    } catch (error) {
      console.error('Error in seedSearchResults:', error);
      throw error;
    }
  }
}