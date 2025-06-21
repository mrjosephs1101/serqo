import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { SearchBar } from '@/components/search-bar';
import { SearchResults } from '@/components/search-results';
import { Pagination } from '@/components/pagination';
import { useSearch } from '@/hooks/use-search';
import { useDebounce } from '@/hooks/use-debounce';
import { Loader2 } from 'lucide-react';
import serqoLogoPath from '@assets/20250620_150619_1750447628914.png';

export default function Results() {
  const [location, setLocation] = useLocation();

  // Extract search ID from URL path
  const searchId = location.split('/sq/')[1]?.split('?')[0] || '';

  // Parse URL parameters
  const params = new URLSearchParams(location.split('?')[1] || '');

  const [searchQuery, setSearchQuery] = useState(params.get('q') || '');
  const [filter, setFilter] = useState(params.get('filter') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(params.get('page') || '1', 10));
  const [shouldSearch, setShouldSearch] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  const { data: searchData, isLoading, error, refetch } = useSearch(
    shouldSearch ? lastSearchQuery : '',
    filter,
    currentPage
  );

  // Reset shouldSearch when search completes
  React.useEffect(() => {
    if (searchData) {
      setShouldSearch(false);
    }
  }, [searchData]);

  // Update document title
  useEffect(() => {
    if (searchQuery) {
      document.title = `${searchQuery} - Serqo Search`;
    } else {
      document.title = 'Search Results - Serqo';
    }
  }, [searchQuery]);

  // Sync search query with URL parameters and trigger search if needed
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const urlQuery = params.get('q') || '';
    const urlFilter = params.get('filter') || 'all';
    const urlPage = parseInt(params.get('page') || '1', 10);

    // Only update state if values actually changed to prevent loops
    if (urlQuery && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
      setLastSearchQuery(urlQuery);
      setShouldSearch(true);
    }
    if (urlFilter !== filter) {
      setFilter(urlFilter);
    }
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }, [location]);

  // Update URL when search parameters change (only for actual searches)
  useEffect(() => {
    if (!shouldSearch || !lastSearchQuery.trim()) return;

    const newParams = new URLSearchParams();
    newParams.set('q', lastSearchQuery);
    if (filter !== 'all') newParams.set('filter', filter);
    if (currentPage !== 1) newParams.set('page', currentPage.toString());

    // Generate search ID based on query and filter
    const searchIdValue = `${lastSearchQuery.toLowerCase().replace(/\s+/g, '-')}-${filter}`;
    const newUrl = `/sq/${searchIdValue}?${newParams.toString()}`;

    if (location !== newUrl) {
      setLocation(newUrl, { replace: true });
    }
  }, [shouldSearch, lastSearchQuery, filter, currentPage, location, setLocation]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLastSearchQuery(query);
    setShouldSearch(true);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleGoHome = () => {
    setLocation('/');
  };

  if (isLoading && !searchData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-90 flex items-center justify-center">
          <div className="flex items-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mr-3" />
            <span className="text-lg text-gray-600 dark:text-gray-300">Searching...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Search Error
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error instanceof Error ? error.message : 'Something went wrong with your search.'}
            </p>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-4 mb-6 z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-6">
            <div 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
              onClick={() => setLocation('/')}
            >
              <img 
                src={serqoLogoPath} 
                alt="Serqo Bird Logo Small" 
                className="w-10 h-10 object-contain drop-shadow-sm"
              />
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Serqo
              </span>
            </div>

            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              compact={true}
              className="flex-1 max-w-2xl"
            />
          </div>
        </div>
      </header>

      {/* Search Results */}
      {searchData && (
        <>
          <SearchResults
            results={searchData.results}
            totalResults={searchData.totalResults}
            searchTime={searchData.searchTime}
            query={searchData.query}
            filter={searchData.filter}
            onFilterChange={handleFilterChange}
          />

          {searchData.totalPages > 1 && (
            <Pagination
              currentPage={searchData.currentPage}
              totalPages={searchData.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Loading overlay for subsequent searches */}
      {isLoading && searchData && (
        <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 bg-opacity-90 p-4 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-center">
            <Loader2 className="animate-spin h-5 w-5 text-blue-600 mr-2" />
            <span className="text-gray-600 dark:text-gray-300">Searching...</span>
          </div>
        </div>
      )}
    </div>
  );
}