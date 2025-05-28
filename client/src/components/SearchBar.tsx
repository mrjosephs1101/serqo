import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

interface SuggestionsData {
  suggestions?: string[];
  trending?: string[];
}

export default function SearchBar({ onSearch, isSearching }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch search suggestions when the user types
  const { data: suggestionsData } = useQuery<SuggestionsData>({
    queryKey: ['/api/search/suggestions', searchQuery],
    enabled: searchQuery.length > 1,
    refetchOnWindowFocus: false,
  });

  // Focus search input when pressing '/' or 'Ctrl+K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && 
          document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onSearch(searchQuery);
    } else {
      toast({
        title: "Search query required",
        description: "Please enter a search term.",
        variant: "destructive"
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleVoiceSearch = () => {
    // This would normally integrate with browser's speech recognition API
    toast({
      title: "Voice Search",
      description: "Voice search feature coming soon!",
      variant: "default"
    });
  };

  // Sample suggestions and trending topics
  const suggestions: string[] = (suggestionsData && 'suggestions' in suggestionsData) ? suggestionsData.suggestions || [] : [];
  const trendingTopics: string[] = (suggestionsData && 'trending' in suggestionsData) ? suggestionsData.trending || [] : [
    "Machine learning",
    "Computing trends",
    "Programming languages"
  ];

  return (
    <div id="search-container" className="w-full max-w-3xl mx-auto px-2 sm:px-0">
      <div className="relative">
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit}>
          <div className="relative flex items-center bg-primary/50 border border-border focus-within:border-purple-500/50 rounded-full shadow-lg transition-all duration-300 group hover:shadow-purple-500/20 focus-within:shadow-purple-500/20">
            <div className="absolute left-3 sm:left-4 text-lg text-muted-foreground">
              <i className="ri-search-line"></i>
            </div>
            <input 
              ref={searchInputRef}
              id="search-input" 
              type="text" 
              className="w-full bg-transparent py-3 sm:py-4 pl-10 sm:pl-12 pr-14 sm:pr-16 text-base sm:text-lg focus:outline-none placeholder-muted-foreground/70" 
              placeholder="What are you searching for?"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchQuery("");
                  setShowSuggestions(false);
                }
              }}
              autoComplete="off"
            />
            <div className="flex absolute right-3 sm:right-4 space-x-1 sm:space-x-2">
              <button 
                type="button"
                className="p-1.5 sm:p-2 text-muted-foreground hover:text-purple-500 transition-colors" 
                aria-label="Voice search"
                onClick={handleVoiceSearch}
              >
                <i className="ri-mic-line"></i>
              </button>
              {searchQuery && (
                <button 
                  type="button"
                  className="p-1.5 sm:p-2 text-muted-foreground hover:text-purple-500 transition-colors" 
                  aria-label="Clear search"
                  onClick={handleClearSearch}
                >
                  <i className="ri-close-line"></i>
                </button>
              )}
            </div>
          </div>
        </form>
        
        {/* Search Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute w-full mt-2 py-2 bg-primary/90 backdrop-blur border border-border rounded-2xl shadow-lg z-10 animate-in fade-in">
            <div className="px-4 py-2 text-sm text-muted-foreground">
              <span className="typing-animation">Try searching for...</span>
            </div>
            <div className="px-2 py-1">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion: string, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-center px-4 py-2 hover:bg-purple-500/10 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <i className="ri-history-line mr-3 text-muted-foreground"></i>
                    <span>{suggestion}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center px-4 py-2 text-muted-foreground">
                  <i className="ri-information-line mr-3"></i>
                  <span>Start typing to see suggestions</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Trending Topics / Chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {trendingTopics.map((topic: string, index: number) => {
          const icons = ["ri-brain-line", "ri-cpu-line", "ri-code-s-slash-line"];
          const icon = icons[index % icons.length];
          
          return (
            <button 
              key={index}
              className="px-4 py-1.5 bg-primary/50 hover:bg-purple-500/20 border border-border rounded-full text-sm text-muted-foreground hover:text-foreground transition-all hover:border-purple-500/30 hover:shadow-sm"
              onClick={() => {
                setSearchQuery(topic);
                onSearch(topic);
              }}
            >
              <i className={`${icon} mr-1.5 text-purple-500`}></i>
              {topic}
            </button>
          );
        })}
      </div>
    </div>
  );
}
