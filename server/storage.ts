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

import session from "express-session";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Search history methods
  getSearchHistory(userId?: number): Promise<SearchHistory[]>;
  addSearchHistory(searchQuery: InsertSearchHistory): Promise<SearchHistory>;
  
  // Search results methods
  getSearchResults(query: string, category?: string): Promise<SearchResult[]>;
  getSearchSuggestions(partialQuery: string): Promise<string[]>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

import createMemoryStore from "memorystore";

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private searchHistoryEntries: Map<number, SearchHistory>;
  private searchResultEntries: Map<number, SearchResult>;
  private userIdCounter: number;
  private searchHistoryIdCounter: number;
  private searchResultIdCounter: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.searchHistoryEntries = new Map();
    this.searchResultEntries = new Map();
    this.userIdCounter = 1;
    this.searchHistoryIdCounter = 1;
    this.searchResultIdCounter = 1;
    
    // Create memory store for sessions
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add some demo search results
    this.addDemoSearchResults();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getSearchHistory(userId?: number): Promise<SearchHistory[]> {
    const entries = Array.from(this.searchHistoryEntries.values());
    
    if (userId) {
      return entries
        .filter(entry => entry.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    
    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  async addSearchHistory(searchQuery: InsertSearchHistory): Promise<SearchHistory> {
    const id = this.searchHistoryIdCounter++;
    const timestamp = new Date();
    
    const entry: SearchHistory = {
      id,
      query: searchQuery.query,
      userId: searchQuery.userId || null,
      timestamp
    };
    
    this.searchHistoryEntries.set(id, entry);
    return entry;
  }
  
  async getSearchResults(query: string, category?: string): Promise<SearchResult[]> {
    const entries = Array.from(this.searchResultEntries.values());
    
    const filteredEntries = entries.filter(entry => {
      const matchesQuery = entry.query.toLowerCase().includes(query.toLowerCase()) || 
                          entry.title.toLowerCase().includes(query.toLowerCase()) ||
                          entry.description.toLowerCase().includes(query.toLowerCase());
      
      if (category && category !== 'all') {
        return matchesQuery && entry.category.toLowerCase() === category.toLowerCase();
      }
      
      return matchesQuery;
    });
    
    return filteredEntries;
  }
  
  async getSearchSuggestions(partialQuery: string): Promise<string[]> {
    if (!partialQuery) return [];
    
    // Get unique queries from search history
    const queries = new Set<string>();
    Array.from(this.searchHistoryEntries.values()).forEach(entry => {
      queries.add(entry.query);
    });
    
    // Filter queries that match partial query
    return Array.from(queries)
      .filter(query => query.toLowerCase().includes(partialQuery.toLowerCase()))
      .slice(0, 5);
  }
  
  private addDemoSearchResults() {
    const demoResults: InsertSearchResult[] = [
      // Artificial Intelligence
      {
        query: "artificial intelligence",
        title: "Understanding Artificial Intelligence: A Comprehensive Guide",
        description: "Explore the fundamentals of artificial intelligence, from basic algorithms to advanced neural networks. Learn about the history, current applications, and future potential of AI technology.",
        url: "https://artificial-intelligence.research.com/guide",
        category: "all",
        tags: ["research", "machine learning"],
        source: "artificial-intelligence.research.com"
      },
      {
        query: "artificial intelligence",
        title: "Recent Breakthroughs in Neural Network Architecture",
        description: "A detailed analysis of recent innovations in neural network design that have led to significant improvements in AI performance across various domains.",
        url: "https://tech.university.edu/neural-networks",
        category: "all",
        tags: ["technical", "academic"],
        source: "tech.university.edu"
      },
      {
        query: "artificial intelligence",
        title: "Ethical Considerations in Artificial Intelligence Development",
        description: "Examining the ethical implications of artificial intelligence systems, including bias, privacy concerns, transparency, and accountability in AI deployments.",
        url: "https://ai-ethics-institute.org/considerations",
        category: "all",
        tags: ["ethics", "social impact"],
        source: "ai-ethics-institute.org"
      },
      {
        query: "artificial intelligence",
        title: "The Evolution of AI: From Turing to Transformers",
        description: "A historical perspective on artificial intelligence development, tracing its path from early theoretical concepts to modern deep learning architectures like transformers.",
        url: "https://ai-history.edu/evolution",
        category: "all",
        tags: ["academic", "research"],
        source: "ai-history.edu"
      },
      {
        query: "artificial intelligence",
        title: "AI in Healthcare: Revolutionizing Patient Care",
        description: "Discover how artificial intelligence is transforming healthcare delivery, from diagnostic assistance to personalized treatment planning and drug discovery.",
        url: "https://medical-ai-journal.org/revolution",
        category: "all",
        tags: ["healthcare", "technology"],
        source: "medical-ai-journal.org"
      },
      {
        query: "artificial intelligence",
        title: "Top 10 AI Tools for Developers in 2025",
        description: "A curated list of the most powerful and innovative artificial intelligence tools that developers should be using to build next-generation applications.",
        url: "https://dev-ai-resources.com/top-tools",
        category: "all",
        tags: ["tutorial", "technology"],
        source: "dev-ai-resources.com"
      },
      // Machine Learning
      {
        query: "machine learning",
        title: "Introduction to Machine Learning Algorithms",
        description: "A beginner-friendly introduction to the most popular machine learning algorithms and their applications in various fields.",
        url: "https://machine-learning-basics.com/intro",
        category: "all",
        tags: ["beginner", "tutorial"],
        source: "machine-learning-basics.com"
      },
      {
        query: "machine learning",
        title: "Advanced Techniques in Feature Engineering",
        description: "Deep dive into sophisticated feature engineering approaches that can dramatically improve machine learning model performance across various data types.",
        url: "https://ml-engineering.tech/features",
        category: "all",
        tags: ["technical", "machine learning"],
        source: "ml-engineering.tech"
      },
      {
        query: "machine learning",
        title: "Reinforcement Learning: From Theory to Practice",
        description: "Comprehensive guide to reinforcement learning methods, including practical implementations and case studies from robotics to game AI.",
        url: "https://reinforcement-learning-guide.org",
        category: "all",
        tags: ["machine learning", "technical"],
        source: "reinforcement-learning-guide.org"
      },
      // Neural Networks
      {
        query: "neural networks",
        title: "Deep Learning and Neural Networks Explained",
        description: "An in-depth explanation of how deep learning works and how neural networks are transforming various industries.",
        url: "https://deep-learning-explained.com",
        category: "all",
        tags: ["deep learning", "technology"],
        source: "deep-learning-explained.com"
      },
      {
        query: "neural networks",
        title: "Convolutional Neural Networks for Computer Vision",
        description: "Explore how CNNs have revolutionized image recognition, object detection, and other computer vision tasks with practical implementation examples.",
        url: "https://vision-ai-institute.org/cnn",
        category: "all",
        tags: ["deep learning", "computer vision"],
        source: "vision-ai-institute.org"
      },
      // For Images category
      {
        query: "ai generated images",
        title: "The New Era of AI Image Generation",
        description: "How diffusion models and GANs have transformed the landscape of AI-generated imagery, enabling unprecedented creative applications.",
        url: "https://ai-art-revolution.com",
        category: "images",
        tags: ["technology", "creative"],
        source: "ai-art-revolution.com"
      },
      {
        query: "ai art",
        title: "Top AI Art Generators of 2025",
        description: "Comprehensive comparison of the most powerful AI art and image generation tools available today, with examples and technical evaluations.",
        url: "https://digital-art-review.com/ai-generators",
        category: "images",
        tags: ["technology", "creative"],
        source: "digital-art-review.com"
      },
      // For Videos category
      {
        query: "ai video generation",
        title: "Text-to-Video: The Next Frontier in AI Content Creation",
        description: "Exploring how advanced AI models are now capable of generating realistic video content from simple text descriptions.",
        url: "https://video-ai-trends.org/text2video",
        category: "videos",
        tags: ["technology", "creative"],
        source: "video-ai-trends.org"
      },
      // For News category
      {
        query: "ai news",
        title: "Breaking: AI System Achieves Human-Level Performance in Medical Diagnosis",
        description: "Researchers at leading university develop AI diagnostic system that matches or exceeds the accuracy of experienced physicians across multiple specialties.",
        url: "https://tech-headline-news.com/ai-medical-breakthrough",
        category: "news",
        tags: ["healthcare", "technology"],
        source: "tech-headline-news.com"
      },
      // For Research category
      {
        query: "ai research papers",
        title: "Attention Mechanisms: A Comprehensive Survey",
        description: "This research paper provides a systematic review of attention mechanisms in deep learning, from their inception to state-of-the-art implementations.",
        url: "https://ai-research-journals.edu/attention-survey",
        category: "research",
        tags: ["academic", "research"],
        source: "ai-research-journals.edu"
      }
    ];
    
    demoResults.forEach(result => {
      const id = this.searchResultIdCounter++;
      const timestamp = new Date();
      
      this.searchResultEntries.set(id, {
        ...result,
        id,
        timestamp,
        tags: result.tags || null,
        source: result.source || null,
        thumbnailUrl: result.thumbnailUrl || null
      });
    });
  }
}

// Import DatabaseStorage
import { DatabaseStorage } from "./DatabaseStorage";

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
