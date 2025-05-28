import { useRef } from 'react';
import SearchBar from './SearchBar';
import SearchCategories from './SearchCategories';
import SearchResults from './SearchResults';
import URLBar from './URLBar';
import { useSearch } from '@/hooks/useSearch';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function MainContent() {
  const [searchState, searchActions] = useSearch();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onSearchFocus: () => searchInputRef.current?.focus(),
    onClearSearch: searchActions.clearSearch,
    onCategoryChange: searchActions.setCategory
  });

  return (
    <main className="flex flex-col items-center px-3 sm:px-4 pt-4 sm:pt-8 md:pt-16 pb-14 sm:pb-20">
      {/* Search hero text */}
      <div className="text-center mb-5 sm:mb-8">
        <h2 className="text-lg sm:text-xl md:text-3xl font-heading font-medium mb-1.5 sm:mb-2 text-muted-foreground">
          Discover with <span className="text-purple-500 font-bold">AI-powered</span> precision
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-xs sm:text-sm md:text-base">
          The most advanced search experience, enhanced by cutting-edge artificial intelligence
        </p>
      </div>
      
      {/* Search Bar */}
      <SearchBar 
        onSearch={searchActions.performSearch}
        isSearching={searchState.isSearching}
      />
      
      {/* Category filters (only shown after search) */}
      {searchState.hasSearched && !searchState.isSearching && (
        <SearchCategories 
          onCategoryChange={searchActions.setCategory}
          selectedCategory={searchState.category}
        />
      )}
      
      {/* URL Bar (only shown after search) */}
      {searchState.hasSearched && (
        <URLBar 
          searchQuery={searchState.searchQuery}
          isSearching={searchState.isSearching}
        />
      )}
      
      {/* Search Results */}
      {searchState.hasSearched && (
        <SearchResults 
          isLoading={searchState.isSearching}
          results={searchState.results}
          searchQuery={searchState.searchQuery}
          searchTime={searchState.searchTime}
          providers={searchState.providers}
          isOffline={searchState.isOffline}
        />
      )}
    </main>
  );
}
