import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  userId: integer("user_id"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).pick({
  query: true,
  userId: true,
});

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

export const searchResults = pgTable("search_results", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array(),
  source: text("source"),
  thumbnailUrl: text("thumbnail_url"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertSearchResultSchema = createInsertSchema(searchResults).omit({
  id: true,
  timestamp: true,
}).extend({
  thumbnailUrl: z.string().nullable().optional(),
});

export type InsertSearchResult = z.infer<typeof insertSearchResultSchema>;
export type SearchResult = typeof searchResults.$inferSelect;
