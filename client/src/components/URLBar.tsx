import { useState, useEffect } from 'react';

interface URLBarProps {
  searchQuery: string;
  isSearching: boolean;
}

export default function URLBar({ searchQuery, isSearching }: URLBarProps) {
  const [url, setUrl] = useState('https://serqo.com/search');
  const [isCopied, setIsCopied] = useState(false);
  
  // Update URL when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setUrl(`https://serqo.com/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      setUrl('https://serqo.com/search');
    }
  }, [searchQuery]);

  // Handle URL copy
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 sm:mt-6 mb-1 sm:mb-2 px-1 sm:px-0">
      <div className="relative flex items-center">
        <div className="absolute left-2 sm:left-3 text-xs sm:text-sm text-muted-foreground flex items-center">
          <i className="ri-shield-check-line text-green-500"></i>
          <span className="ml-1 hidden sm:inline">https://</span>
        </div>
        <div className="flex-1 bg-primary/30 border border-border py-1.5 sm:py-2 pl-8 sm:pl-12 pr-14 sm:pr-20 rounded-lg text-xs sm:text-sm text-muted-foreground overflow-hidden whitespace-nowrap overflow-ellipsis">
          {url.replace('https://', '')}
          {isSearching && (
            <span className="inline-block ml-2">
              <i className="ri-loader-4-line animate-spin"></i>
            </span>
          )}
        </div>
        <div className="absolute right-1 sm:right-3 flex space-x-0.5 sm:space-x-1">
          <button 
            className="p-1 sm:p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors hover:bg-primary-light"
            onClick={handleCopyUrl}
            title="Copy URL"
            aria-label="Copy URL"
          >
            {isCopied ? (
              <i className="ri-check-line text-green-500"></i>
            ) : (
              <i className="ri-clipboard-line"></i>
            )}
          </button>
          <button 
            className="p-1 sm:p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors hover:bg-primary-light"
            title="Share"
            aria-label="Share"
          >
            <i className="ri-share-line"></i>
          </button>
          <button 
            className="hidden xs:block p-1 sm:p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors hover:bg-primary-light"
            title="Bookmark"
            aria-label="Bookmark"
          >
            <i className="ri-bookmark-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}