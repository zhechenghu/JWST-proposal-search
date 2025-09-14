import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Search through all abstracts, observation tables and descriptions..." }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleInputChange = (value: string) => {
    setQuery(value);
  };

  const submitSearch = () => {
    onSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto group">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                submitSearch();
              }
            }}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 shadow-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <button
          onClick={submitSearch}
          disabled={!query.trim()}
          className={`inline-flex items-center px-4 py-3 text-white rounded-lg shadow-sm transition-colors duration-200 ${query.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed dark:bg-gray-700'
            }`}
        >
          <Search className="h-5 w-5 mr-2" />
          Search
        </button>
      </div>
    </div>
  );
}