import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { type SearchResult } from '@shared/schema';

// Network status detection
const isOnline = (): boolean => {
  return navigator.onLine;
};

interface SearchState {
  searchQuery: string;
  category: string;
  isSearching: boolean;
  results: SearchResult[] | undefined;
  searchTime: number;
  hasSearched: boolean;
  totalResults: number;
  providers?: string[];
  isOffline: boolean;
}

interface SearchActions {
  performSearch: (query: string) => void;
  setCategory: (category: string) => void;
  clearSearch: () => void;
}

export function useSearch(): [SearchState, SearchActions] {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [hasSearched, setHasSearched] = useState(false);
  const [isOffline, setIsOffline] = useState(!isOnline());
  
  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const { toast } = useToast();

  const { 
    data, 
    isLoading: isSearching,
    refetch 
  } = useQuery({
    queryKey: ['/api/search', searchQuery, category],
    enabled: false,
    queryFn: async ({ queryKey }) => {
      const [endpoint, query, cat] = queryKey as [string, string, string];
      const url = `${endpoint}?q=${encodeURIComponent(query)}&category=${cat}&limit=10`;
      const res = await fetch(url, { credentials: "include" });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Failed to perform search');
      }
      
      return res.json();
    }
  });

  const performSearch = async (query: string) => {
    if (!query) return;
    
    if (!isOnline()) {
      toast({
        title: "No Internet Connection",
        description: "Please check your network connection and try again.",
        variant: "destructive"
      });
      setSearchQuery(query);
      setHasSearched(true);
      setIsOffline(true);
      return;
    }
    
    setSearchQuery(query);
    setHasSearched(true);
    
    try {
      await refetch();
    } catch (error) {
      // Check if the error is related to network connectivity
      const isNetworkError = 
        error instanceof TypeError && 
        (error.message.includes('NetworkError') || 
         error.message.includes('Failed to fetch') ||
         error.message.includes('Network request failed'));
      
      if (isNetworkError) {
        setIsOffline(true);
        toast({
          title: "No Internet Connection",
          description: "Please check your network connection and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Search failed",
          description: "Failed to perform search. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setHasSearched(false);
  };

  return [
    {
      searchQuery,
      category,
      isSearching,
      results: data?.results,
      searchTime: data?.time || 0,
      hasSearched,
      totalResults: data?.total || 0,
      providers: data?.providers || ['Local'],
      isOffline
    },
    {
      performSearch,
      setCategory,
      clearSearch
    }
  ];
}
