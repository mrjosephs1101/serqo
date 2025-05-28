import { SearchResult } from '@shared/schema';
import { SearchProvider, SearchOptions } from './SearchProvider';
import { storage } from '../../storage';

/**
 * Local search provider that uses data in the database
 * This serves as a fallback when other search providers are unavailable
 */
export class LocalSearchProvider implements SearchProvider {
  name = 'Local';
  
  /**
   * Search for a query using locally stored data
   * @param query The search query
   * @param options Optional search parameters
   * @returns An array of search results
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    // Use storage to get search results from the database
    const results = await storage.getSearchResults(
      query,
      options?.category
    );
    
    // Apply limit if provided
    if (options?.limit && results.length > options.limit) {
      return results.slice(0, options.limit);
    }
    
    return results;
  }
  
  /**
   * Get search suggestions based on a partial query
   * @param partialQuery The partial query to get suggestions for
   * @returns An array of search suggestions
   */
  async getSuggestions(partialQuery: string): Promise<string[]> {
    return await storage.getSearchSuggestions(partialQuery);
  }
  
  /**
   * Local provider is always available
   * @returns true
   */
  isAvailable(): boolean {
    return true;
  }
}