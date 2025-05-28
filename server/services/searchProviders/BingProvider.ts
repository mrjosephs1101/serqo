import { SearchResult } from '@shared/schema';
import { SearchProvider, SearchOptions } from './SearchProvider';

/**
 * Bing search provider
 * Uses the Bing Search API to fetch search results
 */
export class BingProvider implements SearchProvider {
  name = 'Bing';
  private apiKey: string | undefined;
  private endpoint = 'https://api.bing.microsoft.com/v7.0';
  
  constructor() {
    this.apiKey = process.env.BING_SEARCH_API_KEY;
  }
  
  /**
   * Search for a query using Bing API
   * @param query The search query
   * @param options Optional search parameters
   * @returns An array of search results
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.isAvailable()) {
      return [];
    }
    
    try {
      // Determine which API endpoint to use based on category
      const searchType = this.getSearchTypeForCategory(options?.category || 'web');
      const apiUrl = `${this.endpoint}/${searchType}?q=${encodeURIComponent(query)}&count=${options?.limit || 10}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey!
        }
      });
      
      if (!response.ok) {
        throw new Error(`Bing API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse the results based on the search type
      return this.parseResults(data, searchType, options?.limit || 10);
    } catch (error) {
      console.error('Error searching with Bing API:', error);
      return [];
    }
  }
  
  /**
   * Get search suggestions from Bing API
   * @param partialQuery The partial query to get suggestions for
   * @returns An array of search suggestions
   */
  async getSuggestions(partialQuery: string): Promise<string[]> {
    if (!this.isAvailable()) {
      return [];
    }
    
    try {
      const apiUrl = `${this.endpoint}/Suggestions?q=${encodeURIComponent(partialQuery)}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey!
        }
      });
      
      if (!response.ok) {
        throw new Error(`Bing Suggestions API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract suggestions
      return (data.suggestionGroups?.[0]?.searchSuggestions || [])
        .map((suggestion: any) => suggestion.displayText);
    } catch (error) {
      console.error('Error getting suggestions from Bing API:', error);
      return [];
    }
  }
  
  /**
   * Parse Bing API results into SearchResult objects
   * @param data Bing API response data
   * @param searchType The type of search performed
   * @param limit Maximum number of results to return
   * @returns Array of search results
   */
  private parseResults(data: any, searchType: string, limit: number): SearchResult[] {
    const results: SearchResult[] = [];
    
    if (searchType === 'search') {
      // Parse web search results
      const webPages = data.webPages?.value || [];
      
      webPages.slice(0, limit).forEach((result: any, index: number) => {
        results.push({
          id: index + 1,
          query: "",
          title: result.name || '',
          url: result.url || '',
          description: result.snippet || '',
          source: 'Bing',
          category: 'web',
          timestamp: new Date(),
          thumbnailUrl: null,
          tags: []
        });
      });
    } else if (searchType === 'images/search') {
      // Parse image search results
      const images = data.value || [];
      
      images.slice(0, limit).forEach((result: any, index: number) => {
        results.push({
          id: index + 1,
          query: "",
          title: result.name || '',
          url: result.contentUrl || '',
          description: result.name || '',
          source: 'Bing Images',
          category: 'images',
          timestamp: new Date(),
          thumbnailUrl: result.thumbnailUrl || null,
          tags: []
        });
      });
    } else if (searchType === 'news/search') {
      // Parse news search results
      const news = data.value || [];
      
      news.slice(0, limit).forEach((result: any, index: number) => {
        results.push({
          id: index + 1,
          query: "",
          title: result.name || '',
          url: result.url || '',
          description: result.description || '',
          source: 'Bing News',
          category: 'news',
          timestamp: new Date(),
          thumbnailUrl: result.image?.thumbnail?.contentUrl || null,
          tags: [result.provider?.[0]?.name || 'News']
        });
      });
    }
    
    return results;
  }
  
  /**
   * Map categories to Bing API search types
   * @param category The search category
   * @returns The corresponding Bing API search type
   */
  private getSearchTypeForCategory(category: string): string {
    switch (category) {
      case 'images':
        return 'images/search';
      case 'news':
        return 'news/search';
      case 'videos':
        return 'videos/search';
      default:
        return 'search'; // Default to regular web search
    }
  }
  
  /**
   * Check if the provider is available
   * @returns true if the API key is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}