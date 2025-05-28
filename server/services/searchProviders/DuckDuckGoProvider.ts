import { SearchResult } from '@shared/schema';
import { SearchProvider, SearchOptions } from './SearchProvider';

/**
 * DuckDuckGo search provider
 * Uses the DuckDuckGo API to fetch search results
 */
export class DuckDuckGoProvider implements SearchProvider {
  name = 'DuckDuckGo';
  
  /**
   * Search for a query using DuckDuckGo API
   * @param query The search query
   * @param options Optional search parameters
   * @returns An array of search results
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    try {
      // DuckDuckGo doesn't have a direct API, so we use the HTML API (this is a common workaround)
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`DuckDuckGo search request failed with status: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Parse the HTML response to extract search results
      const results = this.parseResults(html, options?.limit || 10);
      
      return results;
    } catch (error) {
      console.error('Error searching with DuckDuckGo:', error);
      return [];
    }
  }
  
  /**
   * Parse HTML response from DuckDuckGo to extract search results
   * @param html The HTML response from DuckDuckGo
   * @param limit Maximum number of results to return
   * @returns Array of search results
   */
  private parseResults(html: string, limit: number): SearchResult[] {
    const results: SearchResult[] = [];
    
    // Simple regex-based extraction (in a production app, we'd use a proper HTML parser)
    const resultRegex = /<div class="result__body">([\s\S]*?)<\/div>/g;
    const titleRegex = /<a class="result__a" href="([\s\S]*?)">([\s\S]*?)<\/a>/;
    const snippetRegex = /<a class="result__snippet"[\s\S]*?>([\s\S]*?)<\/a>/;
    
    const matches = html.match(resultRegex) || [];
    
    for (let i = 0; i < Math.min(matches.length, limit); i++) {
      const resultHtml = matches[i];
      
      const titleMatch = resultHtml.match(titleRegex);
      const snippetMatch = resultHtml.match(snippetRegex);
      
      if (titleMatch && snippetMatch) {
        const url = titleMatch[1].trim();
        const title = this.stripHtml(titleMatch[2]);
        const description = this.stripHtml(snippetMatch[1]);
        
        results.push({
          id: i + 1,
          query: "",
          title,
          url,
          description,
          source: 'DuckDuckGo',
          category: 'web',
          timestamp: new Date(),
          thumbnailUrl: null,
          tags: []
        });
      }
    }
    
    return results;
  }
  
  /**
   * Remove HTML tags from a string
   * @param html String with HTML tags
   * @returns String without HTML tags
   */
  private stripHtml(html: string): string {
    return html.replace(/<\/?[^>]+(>|$)/g, '').trim();
  }
  
  /**
   * Check if the provider is available
   * DuckDuckGo's HTML API doesn't require API keys, so it's always available
   * @returns true
   */
  isAvailable(): boolean {
    return true;
  }
}