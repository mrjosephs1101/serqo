import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSearchHistorySchema } from "@shared/schema";
import { ZodError } from "zod";
import { 
  generateAIResponse, 
  generateSearchSummary,
  generateTopicAnalysis 
} from "./services/googleAIService";
import { setupAuth } from "./auth";

// Setup auth with passport
export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize authentication
  setupAuth(app);
  // API routes
  // Search queries endpoint
  app.get("/api/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const category = req.query.category as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      
      if (!query || query.trim() === "") {
        return res.status(400).json({ 
          message: "Search query is required"
        });
      }

      // Store search history - use the authenticated user's ID if available
      const userId = req.isAuthenticated() ? (req.user as { id: number }).id : undefined;
      
      await storage.addSearchHistory({
        query,
        userId
      });
      
      const startTime = Date.now();
      
      // Get search results from multiple providers using the search manager
      const { searchManager } = await import('./services/searchProviders/SearchManager');
      
      // Get available providers for this search
      const availableProviders = searchManager.getAvailableProviders();
      const providerNames = availableProviders.map(provider => provider.name);
      
      console.log('Available search providers:', providerNames);
      
      const results = await searchManager.search(query, {
        category,
        limit
      });
      
      // Calculate actual search time in seconds
      const searchTime = (Date.now() - startTime) / 1000;
      
      res.json({
        query,
        results,
        total: results.length,
        time: searchTime,
        providers: providerNames
      });
    } catch (error) {
      console.error("Search error:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid search parameters",
          errors: error.errors
        });
      }
      
      res.status(500).json({ 
        message: "Failed to perform search" 
      });
    }
  });

  // Search suggestions endpoint
  app.get("/api/search/suggestions", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        return res.json({ suggestions: [] });
      }
      
      // Get suggestions from multiple providers
      const { searchManager } = await import('./services/searchProviders/SearchManager');
      const suggestions = await searchManager.getSuggestions(query);
      
      // Get search history for trending/popular suggestions
      const recentHistory = await storage.getSearchHistory();
      
      // Count occurrences of each search query
      const queryCount = new Map<string, number>();
      recentHistory.forEach(entry => {
        const count = queryCount.get(entry.query) || 0;
        queryCount.set(entry.query, count + 1);
      });
      
      // Get top queries
      const trending = Array.from(queryCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([query]) => query);
      
      res.json({ 
        suggestions,
        trending 
      });
    } catch (error) {
      console.error("Suggestions error:", error);
      res.status(500).json({ 
        message: "Failed to fetch search suggestions" 
      });
    }
  });

  // Search history endpoint
  app.get("/api/search/history", async (req: Request, res: Response) => {
    try {
      // Get user ID from authenticated session
      const userId = req.isAuthenticated() ? (req.user as { id: number }).id : undefined;
      
      const history = await storage.getSearchHistory(userId);
      
      res.json({ history });
    } catch (error) {
      console.error("History error:", error);
      res.status(500).json({ 
        message: "Failed to fetch search history" 
      });
    }
  });

  // AI Assistant endpoints
  
  // Get AI response for a query
  app.get("/api/ai/answer", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim() === "") {
        return res.status(400).json({ 
          message: "Query is required"
        });
      }
      
      const response = await generateAIResponse(query);
      
      res.json({ 
        query,
        response
      });
    } catch (error) {
      console.error("AI response error:", error);
      res.status(500).json({ 
        message: "Failed to generate AI response" 
      });
    }
  });
  
  // Get AI summary for search results
  app.post("/api/ai/summary", async (req: Request, res: Response) => {
    try {
      const { query, results } = req.body;
      
      if (!query || !results || !Array.isArray(results)) {
        return res.status(400).json({ 
          message: "Query and results array are required"
        });
      }
      
      const summary = await generateSearchSummary(query, results);
      
      res.json({ 
        query,
        summary
      });
    } catch (error) {
      console.error("Summary error:", error);
      res.status(500).json({ 
        message: "Failed to generate search summary" 
      });
    }
  });
  
  // Get detailed analysis for a topic
  app.get("/api/ai/analyze", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim() === "") {
        return res.status(400).json({ 
          message: "Topic is required"
        });
      }
      
      const analysis = await generateTopicAnalysis(query);
      
      res.json({ 
        query,
        analysis
      });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ 
        message: "Failed to generate topic analysis" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
