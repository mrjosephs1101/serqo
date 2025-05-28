import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { type SearchResult } from '@shared/schema';

interface SearchResultsProps {
  isLoading: boolean;
  results: SearchResult[] | undefined;
  searchQuery: string;
  searchTime?: number;
  providers?: string[];
  isOffline?: boolean;
}

export default function SearchResults({ 
  isLoading, 
  results, 
  searchQuery,
  searchTime = 0,
  providers = ['Local'],
  isOffline = false
}: SearchResultsProps) {
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    // Animate in search results when loaded
    if (!isLoading && results) {
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  }, [isLoading, results]);

  // Display the No Internet screen
  if (isOffline) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 sm:mt-12 text-center px-3 sm:px-0">
        <div className="bg-primary/50 border border-border rounded-2xl p-5 sm:p-8 animate-in fade-in">
          <div className="text-4xl sm:text-5xl font-mono mb-4 sm:mb-6 text-muted-foreground">:/</div>
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-primary flex items-center justify-center">
            <i className="ri-wifi-off-line text-2xl sm:text-3xl text-red-500"></i>
          </div>
          <h3 className="text-lg sm:text-xl font-medium text-foreground mb-1 sm:mb-2">No Internet Connection</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-5">We can't reach our search servers. Please check your connection and try again.</p>
          <div className="max-w-md mx-auto">
            <h4 className="text-muted-foreground mb-2 sm:mb-3 text-xs sm:text-sm font-medium">Try:</h4>
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5 sm:space-y-2">
              <li className="flex items-start">
                <i className="ri-check-line text-purple-500 mt-0.5 mr-2"></i>
                <span>Checking your network cables and WiFi connection</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-purple-500 mt-0.5 mr-2"></i>
                <span>Reconnecting to your wireless network</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-purple-500 mt-0.5 mr-2"></i>
                <span>Running network diagnostics</span>
              </li>
            </ul>
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              // Force navigator online check
              if (navigator.onLine) {
                window.location.reload();
              }
            }}
            className="mt-4 sm:mt-6 px-4 sm:px-6 py-1.5 sm:py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm sm:text-base rounded-lg transition-colors"
          >
            <i className="ri-refresh-line mr-1.5 sm:mr-2"></i>Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 sm:mt-12 text-center px-3 sm:px-0">
        <div className="relative">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="mt-4 text-muted-foreground text-xs sm:text-sm">Searching through billions of pages...</p>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 sm:mt-12 text-center px-3 sm:px-0">
        <div className="bg-primary/50 border border-border rounded-2xl p-5 sm:p-8 animate-in fade-in">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-primary flex items-center justify-center">
            <i className="ri-search-eye-line text-2xl sm:text-3xl text-purple-500"></i>
          </div>
          <h3 className="text-lg sm:text-xl font-medium text-foreground mb-1 sm:mb-2">No results found</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-5">We couldn't find any results matching your search.</p>
          <div className="max-w-md mx-auto">
            <h4 className="text-muted-foreground mb-2 sm:mb-3 text-xs sm:text-sm font-medium">Try:</h4>
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5 sm:space-y-2">
              <li className="flex items-start">
                <i className="ri-check-line text-purple-500 mt-0.5 mr-2"></i>
                <span>Checking your spelling</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-purple-500 mt-0.5 mr-2"></i>
                <span>Using more general keywords</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-purple-500 mt-0.5 mr-2"></i>
                <span>Trying different terms that mean the same thing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-3xl mx-auto mt-4 sm:mt-6 px-2 sm:px-0 transition-all duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      {/* AI Summary Section */}
      <div className="bg-gradient-to-br from-primary to-primary/50 border border-purple-500/20 rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 shadow-lg shadow-purple-500/10 animate-in fade-in">
        <div className="flex items-start justify-between">
          <div className="flex space-x-2 sm:space-x-3">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <i className="ri-ai-generate text-base sm:text-lg text-purple-500"></i>
            </div>
            <div>
              <h3 className="font-heading font-medium text-base sm:text-lg text-foreground mb-1 sm:mb-2">AI-Generated Summary</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {searchQuery.toLowerCase().includes('artificial intelligence') ? (
                  <>Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by humans or animals. Modern AI techniques utilize advanced algorithms and neural networks to analyze data, recognize patterns, and make predictions. The field has seen significant growth with applications spanning from virtual assistants and autonomous vehicles to healthcare diagnostics and creative content generation.</>
                ) : (
                  <>Based on your search for "{searchQuery}", here's a summary of the key concepts. This field involves cutting-edge technologies and methodologies that are transforming how we interact with digital systems. Recent advances have led to significant improvements in performance and applicability across various domains.</>
                )}
              </p>
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
                <button className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-primary rounded-lg border border-purple-500/30 text-purple-500 hover:bg-purple-500/10 transition-colors">
                  <i className="ri-links-line mr-1"></i>Key sources
                </button>
                <button className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-primary rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors">
                  <i className="ri-refresh-line mr-1"></i>Regenerate
                </button>
              </div>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground p-1 transition-colors ml-1 -mt-1">
            <i className="ri-more-2-fill"></i>
          </button>
        </div>
      </div>
      
      {/* Providers section */}
      <div className="bg-primary/70 border border-border rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 animate-in fade-in">
        <div className="flex items-center text-muted-foreground text-xs sm:text-sm">
          <div className="flex-shrink-0 mr-1.5 sm:mr-2">
            <i className="ri-database-2-line text-purple-500"></i>
          </div>
          <div className="overflow-x-auto flex-1 whitespace-nowrap pb-1">
            <span className="font-medium">Powered by:</span>{' '}
            <span className="inline-flex items-center flex-wrap">
              {providers.map((provider, index) => {
                const color = getProviderColor(provider);
                return (
                  <span key={index} className="inline-flex items-center ml-1">
                    <span style={{ color: color }}>{provider}</span>
                    {index < providers.length - 1 && <span className="mx-1">•</span>}
                  </span>
                );
              })}
            </span>
          </div>
        </div>
      </div>
      
      {/* Stats and timing */}
      <div className="flex flex-wrap justify-between items-center text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 px-1 gap-y-2">
        <div>About {results.length.toLocaleString()} results ({searchTime.toFixed(2)} seconds)</div>
        <div className="flex items-center">
          <button className="flex items-center hover:text-muted-foreground/80 transition-colors">
            <i className="ri-filter-3-line mr-1"></i>
            <span className="hidden xs:inline">Filters</span>
          </button>
        </div>
      </div>
      
      {/* Results list */}
      <div className="space-y-3 sm:space-y-5">
        {results.map((result, index) => (
          <div 
            key={index}
            className="bg-primary/50 border border-border rounded-xl p-3 sm:p-4 hover:border-purple-500/30 transition-all hover:shadow-sm animate-in slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <a href={result.url} className="block" target="_blank" rel="noopener noreferrer">
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground mb-1">
                <span>{result.source}</span>
                <span className="hidden sm:inline">•</span>
                <span>{getRandomTimeAgo()}</span>
                {result.source && <span className="hidden sm:inline-flex bg-primary-foreground/10 text-muted-foreground/70 px-1.5 py-0.5 rounded text-xs">
                  {result.source}
                </span>}
              </div>
              
              {/* Mobile thumbnail layout */}
              {result.thumbnailUrl && (
                <div className="sm:hidden w-full h-32 mb-2 rounded-lg overflow-hidden bg-primary-foreground/10">
                  <img 
                    src={result.thumbnailUrl} 
                    alt={result.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Desktop layout with side-by-side thumbnail */}
              <div className="flex">
                <div className={`flex-1 ${result.thumbnailUrl ? 'sm:pr-4' : ''}`}>
                  <h3 className="text-base sm:text-lg font-medium text-foreground hover:text-purple-500 transition-colors mb-1 sm:mb-1.5">
                    {result.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
                    {result.description}
                  </p>
                </div>
                {result.thumbnailUrl && (
                  <div className="hidden sm:block flex-shrink-0 ml-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-primary-foreground/10">
                      <img 
                        src={result.thumbnailUrl} 
                        alt={result.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-2">
                {result.tags && result.tags.slice(0, 3).map((tag, tagIndex) => {
                  const bgColors = ['bg-blue-500/20', 'bg-purple-500/20', 'bg-amber-500/20', 'bg-rose-500/20'];
                  const textColors = ['text-blue-500', 'text-purple-500', 'text-amber-500', 'text-rose-500'];
                  const randomIndex = Math.floor((tagIndex + index) % bgColors.length);
                  
                  return (
                    <Badge 
                      key={tagIndex} 
                      variant="outline" 
                      className={`text-xs ${bgColors[randomIndex]} ${textColors[randomIndex]} border-0`}
                    >
                      <i className={`${getTagIcon(tag)} mr-1`}></i> {tag}
                    </Badge>
                  );
                })}
                {result.tags && result.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground mt-1">+{result.tags.length - 3} more</span>
                )}
              </div>
            </a>
          </div>
        ))}
        
        {/* Pagination */}
        {results.length > 0 && (
          <div className="flex justify-center pt-3 sm:pt-4 pb-6 sm:pb-8 animate-in fade-in">
            <nav className="flex flex-wrap justify-center gap-1" aria-label="Pagination">
              <button className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-muted-foreground bg-primary/50 hover:bg-primary-light transition-colors" disabled>
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <button className="w-8 sm:w-10 py-1.5 sm:py-2 rounded-lg text-foreground bg-purple-500 hover:bg-purple-600 transition-colors">1</button>
              <button className="w-8 sm:w-10 py-1.5 sm:py-2 rounded-lg text-muted-foreground bg-primary/50 hover:bg-primary-light transition-colors hidden xs:block">2</button>
              <button className="w-8 sm:w-10 py-1.5 sm:py-2 rounded-lg text-muted-foreground bg-primary/50 hover:bg-primary-light transition-colors hidden xs:block">3</button>
              <button className="w-8 sm:w-10 py-1.5 sm:py-2 rounded-lg text-muted-foreground bg-primary/50 hover:bg-primary-light transition-colors hidden sm:block">4</button>
              <button className="w-8 sm:w-10 py-1.5 sm:py-2 rounded-lg text-muted-foreground bg-primary/50 hover:bg-primary-light transition-colors hidden sm:block">5</button>
              <button className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-muted-foreground bg-primary/50 hover:bg-primary-light transition-colors">
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getRandomTimeAgo() {
  const times = ['3 days ago', '1 week ago', '2 weeks ago', '1 month ago', '5 hours ago'];
  return times[Math.floor(Math.random() * times.length)];
}

function getTagIcon(tag: string) {
  const tagMap: Record<string, string> = {
    'research': 'ri-article-line',
    'machine learning': 'ri-brain-line',
    'technical': 'ri-code-s-slash-line',
    'academic': 'ri-book-2-line',
    'ethics': 'ri-error-warning-line',
    'social impact': 'ri-group-line',
    'beginner': 'ri-seedling-line',
    'tutorial': 'ri-lightbulb-line',
    'deep learning': 'ri-cloud-line',
    'technology': 'ri-cpu-line'
  };
  
  return tagMap[tag.toLowerCase()] || 'ri-hashtag';
}

function getProviderColor(provider: string) {
  const colorMap: Record<string, string> = {
    'Local': '#9333ea', // purple-600
    'DuckDuckGo': '#d97706', // amber-600
    'Bing': '#2563eb', // blue-600
    'SerpApi': '#16a34a', // green-600
    'Google': '#dc2626'  // red-600
  };
  
  return colorMap[provider] || '#9333ea';
}
