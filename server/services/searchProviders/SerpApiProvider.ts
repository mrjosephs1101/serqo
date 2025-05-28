import { SearchResult } from '@shared/schema';
import { SearchProvider, SearchOptions } from './SearchProvider';

/**
 * SerpApi search provider
 * Provides access to multiple search engines through the SerpApi service
 */
export class SerpApiProvider implements SearchProvider {
  name = 'SerpApi';
  private apiKey: string | undefined;
  
  constructor() {
    this.apiKey = process.env.SERPAPI_API_KEY;
  }
  
  /**
   * Search for a query using SerpApi
   * @param query The search query
   * @param options Optional search parameters
   * @returns An array of search results
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.isAvailable()) {
      console.log('SerpApi is not available - missing API key');
      return [];
    }
    
    console.log(`SerpApi searching for "${query}" with API key: ${this.apiKey?.substring(0, 5)}...`);
    
    try {
      // Determine which engine to use based on category
      const engine = this.getEngineForCategory(options?.category || 'web');
      console.log(`SerpApi using engine: ${engine}`);
      
      // Build the API URL
      const apiUrl = new URL('https://serpapi.com/search');
      apiUrl.searchParams.append('api_key', this.apiKey!);
      apiUrl.searchParams.append('q', query);
      apiUrl.searchParams.append('engine', engine);
      
      // Add additional parameters for specific engines
      if (engine === 'google') {
        apiUrl.searchParams.append('gl', 'us'); // country
        apiUrl.searchParams.append('hl', 'en'); // language
        apiUrl.searchParams.append('num', String(options?.limit || 10)); // number of results
      }
      
      console.log(`SerpApi URL: ${apiUrl.toString().replace(this.apiKey!, '[REDACTED]')}`);
      
      const response = await fetch(apiUrl.toString());
      
      console.log(`SerpApi response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`SerpApi request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log(`SerpApi got response data with keys: ${Object.keys(data).join(', ')}`);
      
      // Parse the results depending on the engine
      const results = this.parseResults(data, engine, options?.limit || 10);
      console.log(`SerpApi parsed ${results.length} results from the response`);
      
      return results;
    } catch (error) {
      console.error('Error searching with SerpApi:', error);
      return [];
    }
  }
  
  /**
   * Parse SerpApi results into SearchResult objects
   * @param data SerpApi response data
   * @param engine The search engine used
   * @param limit Maximum number of results to return
   * @returns Array of search results
   */
  private parseResults(data: any, engine: string, limit: number): SearchResult[] {
    const results: SearchResult[] = [];
    
    if (engine === 'google') {
      if (data.error) {
        console.error(`SerpApi error: ${data.error}`);
        return [];
      }
      
      const organicResults = data.organic_results || [];
      console.log(`SerpApi found ${organicResults.length} organic results`);
      
      if (organicResults.length === 0) {
        console.log('SerpApi response structure:', JSON.stringify(data).substring(0, 500) + '...');
      }
      
      organicResults.slice(0, limit).forEach((result: any, index: number) => {
        console.log(`Processing result #${index + 1}: ${result.title}`);
        results.push({
          id: index + 1,
          query: "",
          title: result.title || '',
          url: result.link || '',
          description: result.snippet || '',
          source: 'Google (via SerpApi)',
          category: 'web',
          timestamp: new Date(),
          thumbnailUrl: result.thumbnail || null,
          tags: result.rich_snippet?.top?.extensions || []
        });
      });
    } 
    // Additional parsers for other engines can be added here
    
    return results;
  }
  
  /**
   * Map categories to SerpApi engines
   * @param category The search category
   * @returns The corresponding SerpApi engine
   */
  private getEngineForCategory(category: string): string {
    switch (category) {
      case 'images':
        return 'google_images';
      case 'news':
        return 'google_news';
      case 'videos':
        return 'youtube';
      case 'shopping':
        return 'google_shopping';
      case 'scholar':
        return 'google_scholar';
      default:
        return 'google'; // Default to regular web search
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