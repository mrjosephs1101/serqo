import { SearchResult } from '@shared/schema';

/**
 * Interface for search providers
 * This allows us to have a common interface for different search APIs
 */
export interface SearchProvider {
  /**
   * Name of the search provider
   */
  name: string;
  
  /**
   * Search for a query
   * @param query The search query
   * @param options Optional search parameters
   * @returns An array of search results
   */
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  
  /**
   * Get search suggestions based on a partial query
   * @param partialQuery The partial query to get suggestions for
   * @returns An array of search suggestions
   */
  getSuggestions?(partialQuery: string): Promise<string[]>;
  
  /**
   * Check if the provider is available (has required API keys, etc.)
   * @returns Whether the provider is available
   */
  isAvailable(): boolean;
}

/**
 * Options for search
 */
export interface SearchOptions {
  /**
   * Category to search in (web, images, news, etc.)
   */
  category?: string;
  
  /**
   * Number of results to return
   */
  limit?: number;
  
  /**
   * Page of results to return (for pagination)
   */
  page?: number;
  
  /**
   * Additional provider-specific options
   */
  [key: string]: any;
}