import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { useProperties } from '@/contexts/PropertyContext';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  size?: 'default' | 'large';
  onSearch?: (query: string) => void;
}

const suggestions = [
  'Florianópolis, SC',
  'Jurerê Internacional',
  'Lagoa da Conceição',
  'Centro, Florianópolis',
  'Ingleses',
  'Campeche',
  'Trindade',
];

export function SearchBar({ className, size = 'default', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setSearchQuery } = useProperties();

  useEffect(() => {
    if (query.length > 0) {
      const filtered = suggestions.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(suggestions);
    }
  }, [query]);

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      setSearchQuery(searchQuery);
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        navigate(`/buscar?q=${encodeURIComponent(searchQuery)}`);
      }
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <Search
          className={cn(
            'absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground',
            size === 'large' ? 'h-6 w-6' : 'h-5 w-5'
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Busque por cidade, bairro ou endereço..."
          className={cn(
            'search-input',
            size === 'large' ? 'h-16 text-lg pl-14 pr-32' : 'h-12 text-base pl-12 pr-28'
          )}
        />
        <button
          onClick={() => handleSearch()}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground font-semibold rounded-md transition-colors hover:bg-primary/90',
            size === 'large' ? 'px-6 py-3' : 'px-4 py-2 text-sm'
          )}
        >
          Buscar
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-dropdown overflow-hidden z-50 animate-fade-in">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-secondary transition-colors"
            >
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
