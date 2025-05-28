import { useState } from 'react';

interface SearchCategoriesProps {
  onCategoryChange: (category: string) => void;
  selectedCategory: string;
}

export default function SearchCategories({ onCategoryChange, selectedCategory }: SearchCategoriesProps) {
  const categories = [
    { id: 'all', name: 'All', icon: 'ri-search-line' },
    { id: 'images', name: 'Images', icon: 'ri-image-line' },
    { id: 'videos', name: 'Videos', icon: 'ri-vidicon-line' },
    { id: 'news', name: 'News', icon: 'ri-news-line' },
    { id: 'research', name: 'Research', icon: 'ri-book-2-line' },
    { id: 'maps', name: 'Maps', icon: 'ri-map-pin-line' }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 sm:mt-6 px-1 sm:px-0">
      <div className="border-b border-border">
        <nav className="flex space-x-0.5 sm:space-x-2 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors ${
                selectedCategory === category.id
                  ? 'text-purple-500 border-purple-500 font-medium'
                  : 'text-muted-foreground hover:text-muted-foreground/80 border-transparent hover:border-muted-foreground/30'
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              <i className={`${category.icon} mr-1 sm:mr-1.5`}></i>
              <span>{category.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
