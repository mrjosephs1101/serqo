import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSearchSuggestions } from '@/hooks/use-search';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  onSuggestionClick?: (suggestion: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  onSuggestionClick,
  placeholder = "Search Serqo or type a URL",
  className,
  compact = false
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(value, 300);
  const { data: suggestionsData } = useSearchSuggestions(debouncedQuery);
  const suggestions = suggestionsData?.suggestions || [];

  useEffect(() => {
    if (debouncedQuery && suggestions.length > 0 && isFocused) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedQuery, suggestions, isFocused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedSuggestionIndex >= 0 && suggestions[focusedSuggestionIndex]) {
        handleSuggestionClick(suggestions[focusedSuggestionIndex].text);
      } else {
        onSearch(value);
      }
      setShowSuggestions(false);
      setFocusedSuggestionIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setFocusedSuggestionIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    onChange(suggestionText);
    setShowSuggestions(false);
    setFocusedSuggestionIndex(-1);
    if (onSuggestionClick) {
      onSuggestionClick(suggestionText);
    } else {
      onSearch(suggestionText);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (value && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setIsFocused(false);
        setShowSuggestions(false);
        setFocusedSuggestionIndex(-1);
      }
    }, 100);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={cn(
            "w-full pl-12 pr-4 transition-all duration-200",
            "border border-gray-300 dark:border-gray-600",
            "focus:border-blue-500 dark:focus:border-blue-400",
            "focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400",
            "bg-white dark:bg-gray-800",
            "hover:shadow-sm focus:shadow-md",
            className
          )}
        />
      </div>

      {/* Suggestions dropdown */}
      {isFocused && showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 mt-1"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className={cn(
                "px-4 py-2 cursor-pointer text-sm",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                focusedSuggestionIndex === index && "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <div className="flex items-center gap-2">
                <Search className="h-3 w-3 text-gray-400" />
                <span>{suggestion.text}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}