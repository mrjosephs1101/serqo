import { SearchResult } from '@shared/schema';
import { SearchProvider, SearchOptions } from './SearchProvider';
import { LocalSearchProvider } from './LocalSearchProvider';
import { DuckDuckGoProvider } from './DuckDuckGoProvider';
import { SerpApiProvider } from './SerpApiProvider';
import { BingProvider } from './BingProvider';

/**
 * SearchManager class
 * Manages multiple search providers and aggregates results
 */
export class SearchManager {
  private providers: SearchProvider[];
  
  constructor() {
    // Initialize all search providers
    this.providers = [
      new LocalSearchProvider(),
      new DuckDuckGoProvider(),
      new SerpApiProvider(),
      new BingProvider()
    ];
  }
  
  /**
   * Get all available search providers
   * @returns Array of available search providers
   */
  getAvailableProviders(): SearchProvider[] {
    const availableProviders = this.providers.filter(provider => provider.isAvailable());
    console.log('Provider availability:');
    this.providers.forEach(provider => {
      console.log(`- ${provider.name}: ${provider.isAvailable() ? 'Available' : 'Not available'}`);
    });
    return availableProviders;
  }
  
  /**
   * Search across all available providers and merge results
   * @param query The search query
   * @param options Optional search parameters
   * @returns Merged search results from all providers
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    const availableProviders = this.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      console.warn('No search providers available');
      return [];
    }
    
    try {
      // Search with each provider in parallel
      console.log(`Starting search for "${query}" with ${availableProviders.length} providers`);
      
      const providerPromises = availableProviders.map(provider => {
        console.log(`Searching with ${provider.name} provider...`);
        return provider.search(query, {
          ...options,
          limit: options?.limit ? Math.ceil(options.limit / availableProviders.length) : 5
        })
        .then(results => {
          console.log(`${provider.name} provider returned ${results.length} results`);
          return results;
        })
        .catch(error => {
          console.error(`Error with ${provider.name} provider:`, error);
          return [] as SearchResult[];
        });
      });
      
      const providerResults = await Promise.all(providerPromises);
      
      // Merge and sort results
      const mergedResults = this.mergeResults(providerResults, options?.limit || 10);
      
      return mergedResults;
    } catch (error) {
      console.error('Error in search manager:', error);
      
      // Fallback to LocalSearchProvider as last resort
      const localProvider = this.providers.find(p => p instanceof LocalSearchProvider);
      if (localProvider) {
        return await localProvider.search(query, options);
      }
      
      return [];
    }
  }
  
  /**
   * Get search suggestions from all available providers
   * @param partialQuery The partial query to get suggestions for
   * @returns Merged search suggestions from all providers
   */
  async getSuggestions(partialQuery: string): Promise<string[]> {
    const availableProviders = this.getAvailableProviders()
      .filter(provider => typeof provider.getSuggestions === 'function');
    
    if (availableProviders.length === 0) {
      // Fallback to LocalSearchProvider
      const localProvider = this.providers.find(p => p instanceof LocalSearchProvider);
      if (localProvider && localProvider.getSuggestions) {
        return await localProvider.getSuggestions(partialQuery);
      }
      return [];
    }
    
    try {
      // Get suggestions from each provider that supports it
      const providerSuggestions = await Promise.all(
        availableProviders.map(provider => 
          provider.getSuggestions!(partialQuery)
          .catch(error => {
            console.error(`Error getting suggestions from ${provider.name}:`, error);
            return [] as string[];
          })
        )
      );
      
      // Merge suggestions (remove duplicates)
      const mergedSuggestions = Array.from(
        new Set(providerSuggestions.flat())
      ).slice(0, 10);
      
      return mergedSuggestions;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }
  
  /**
   * Merge results from multiple providers
   * @param providerResults Results from each provider
   * @param limit Maximum number of results to return
   * @returns Merged search results
   */
  private mergeResults(providerResults: SearchResult[][], limit: number): SearchResult[] {
    // Combine all results
    const allResults: SearchResult[] = [];
    
    // Take results in a round-robin fashion from each provider
    for (let i = 0; allResults.length < limit; i++) {
      let addedAny = false;
      
      for (const results of providerResults) {
        if (i < results.length) {
          // Add a unique ID
          const uniqueResult = {
            ...results[i],
            id: allResults.length + 1 // Ensure IDs are sequential
          };
          
          // Check for duplicates (based on URL)
          const isDuplicate = allResults.some(
            r => r.url === uniqueResult.url
          );
          
          if (!isDuplicate) {
            allResults.push(uniqueResult);
            addedAny = true;
            
            // Check if we've reached the limit
            if (allResults.length >= limit) {
              break;
            }
          }
        }
      }
      
      // If we didn't add any results in this iteration, we're done
      if (!addedAny) {
        break;
      }
    }
    
    return allResults;
  }
}

// Create and export a singleton instance
export const searchManager = new SearchManager();