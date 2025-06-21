var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertSearchQuerySchema: () => insertSearchQuerySchema,
  insertUserSchema: () => insertUserSchema,
  searchQueries: () => searchQueries,
  users: () => users
});
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var searchQueries = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  filter: text("filter").default("all"),
  resultsCount: integer("results_count").default(0),
  searchTime: integer("search_time").default(0),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertSearchQuerySchema = createInsertSchema(searchQueries).pick({
  query: true,
  filter: true,
  resultsCount: true,
  searchTime: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, sql } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async logSearchQuery(insertQuery) {
    const [query] = await db.insert(searchQueries).values({
      ...insertQuery,
      filter: insertQuery.filter || null,
      resultsCount: insertQuery.resultsCount || null,
      searchTime: insertQuery.searchTime || null
    }).returning();
    return query;
  }
  async getRecentSearches(limit = 10) {
    return await db.select().from(searchQueries).orderBy(desc(searchQueries.timestamp)).limit(limit);
  }
  async getPopularSearches(limit = 10) {
    const popularQueries = await db.select({
      query: searchQueries.query,
      filter: searchQueries.filter,
      count: sql`count(*)`.as("count"),
      // Get the most recent instance of each query
      id: sql`max(${searchQueries.id})`.as("id"),
      resultsCount: sql`max(${searchQueries.resultsCount})`.as("resultsCount"),
      searchTime: sql`max(${searchQueries.searchTime})`.as("searchTime"),
      timestamp: sql`max(${searchQueries.timestamp})`.as("timestamp")
    }).from(searchQueries).groupBy(searchQueries.query, searchQueries.filter).orderBy(desc(sql`count(*)`)).limit(limit);
    return popularQueries.map((item) => ({
      id: item.id,
      query: item.query,
      filter: item.filter,
      resultsCount: item.resultsCount,
      searchTime: item.searchTime,
      timestamp: item.timestamp
    }));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
async function searchBrave(query, offset = 0) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    throw new Error("BRAVE_SEARCH_API_KEY is not configured");
  }
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&offset=${offset}&count=20`;
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey
    }
  });
  if (!response.ok) {
    throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
function convertBraveResults(braveData) {
  if (!braveData?.web?.results) {
    return [];
  }
  return braveData.web.results.map((result, index) => {
    let favicon = `https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}`;
    if (result.profile?.img) {
      favicon = result.profile.img;
    }
    return {
      id: `brave-${index}`,
      title: result.title || "No Title",
      url: result.url || "",
      description: result.description || "No description available",
      favicon,
      lastModified: result.age || void 0,
      tags: result.type ? [result.type] : []
    };
  });
}
async function registerRoutes(app2) {
  app2.get("/api/search", async (req, res) => {
    try {
      const { q: query, filter = "all", page = "1", limit = "10" } = req.query;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      const startTime = Date.now();
      const pageNum = parseInt(page, 10);
      const limitNum = Math.min(parseInt(limit, 10), 20);
      const offset = (pageNum - 1) * limitNum;
      let searchResults = [];
      let totalResults = 0;
      try {
        const braveData = await searchBrave(query, offset);
        searchResults = convertBraveResults(braveData);
        totalResults = braveData?.web?.total_count || searchResults.length;
        console.log(`Brave Search returned ${searchResults.length} results for query: ${query}`);
      } catch (error) {
        console.error("Brave Search API error:", error);
        searchResults = [];
        totalResults = 0;
        console.log(`Search API unavailable for query: ${query}`);
      }
      let filteredResults = searchResults;
      if (filter !== "all" && typeof filter === "string") {
        filteredResults = searchResults.filter((result) => {
          const matchesFilter = result.tags?.some(
            (tag) => tag.toLowerCase().includes(filter.toLowerCase())
          ) || result.title.toLowerCase().includes(filter.toLowerCase()) || result.description.toLowerCase().includes(filter.toLowerCase());
          return matchesFilter;
        });
      }
      const searchTime = Date.now() - startTime;
      const paginatedResults = filteredResults.slice(0, limitNum);
      const totalPages = Math.ceil(totalResults / limitNum);
      try {
        await storage.logSearchQuery({
          query,
          filter,
          resultsCount: filteredResults.length,
          searchTime
        });
      } catch (error) {
        console.error("Failed to log search query:", error);
      }
      const response = {
        results: paginatedResults,
        totalResults,
        searchTime,
        currentPage: pageNum,
        totalPages,
        query,
        filter
      };
      res.json(response);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Internal server error during search" });
    }
  });
  app2.get("/api/suggestions", async (req, res) => {
    try {
      const { q: query } = req.query;
      if (!query || typeof query !== "string" || query.length < 2) {
        return res.json({ suggestions: [] });
      }
      try {
        const apiKey = process.env.BRAVE_SEARCH_API_KEY;
        if (apiKey) {
          const suggestUrl = `https://api.search.brave.com/res/v1/suggest?q=${encodeURIComponent(query)}`;
          const response = await fetch(suggestUrl, {
            headers: {
              "Accept": "application/json",
              "X-Subscription-Token": apiKey
            }
          });
          if (response.ok) {
            const braveData = await response.json();
            if (braveData && braveData[1]) {
              const suggestions = braveData[1].slice(0, 8).map((text2, index) => ({
                text: text2,
                count: Math.max(1e3 - index * 100, 50)
              }));
              return res.json({ suggestions });
            }
          }
        }
      } catch (error) {
        console.error("Brave suggestions API error:", error);
      }
      res.json({ suggestions: [] });
    } catch (error) {
      console.error("Suggestions error:", error);
      res.status(500).json({ error: "Internal server error fetching suggestions" });
    }
  });
  app2.get("/api/popular-searches", async (req, res) => {
    try {
      const popularSearches = await storage.getPopularSearches(10);
      res.json({ searches: popularSearches });
    } catch (error) {
      console.error("Popular searches error:", error);
      res.status(500).json({ error: "Internal server error fetching popular searches" });
    }
  });
  app2.get("/api/recent-searches", async (req, res) => {
    try {
      const recentSearches = await storage.getRecentSearches(10);
      res.json({ searches: recentSearches });
    } catch (error) {
      console.error("Recent searches error:", error);
      res.status(500).json({ error: "Internal server error fetching recent searches" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
