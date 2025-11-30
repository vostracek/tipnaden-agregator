'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Tag, Calendar } from 'lucide-react';
import { debounce } from 'lodash';
import { analytics } from '@/lib/analytics';

interface EventSuggestion {
  type: 'event';
  id: string;
  title: string;
  slug: string;
  city: string;
  category: string;
  date: string;
}

interface CategorySuggestion {
  type: 'category';
  name: string;
  slug: string;
}

interface CitySuggestion {
  type: 'city';
  name: string;
}

type Suggestion = EventSuggestion | CategorySuggestion | CitySuggestion;

interface SuggestionsResponse {
  events: EventSuggestion[];
  categories: CategorySuggestion[];
  cities: CitySuggestion[];
}

interface SearchWithSuggestionsProps {
  placeholder?: string;
  className?: string;
  size?: 'default' | 'large';
}

export default function SearchWithSuggestions({ 
  placeholder = 'Hledejte koncerty, divadla, festivaly...', 
  className = '',
  size = 'large'
}: SearchWithSuggestionsProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionsResponse>({
    events: [],
    categories: [],
    cities: []
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchSuggestions = async (searchTerm: string) => {
    if (searchTerm.trim().length === 0) {
      setSuggestions({ events: [], categories: [], cities: [] });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/search/suggestions?q=${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      
      const data = await response.json();
      setSuggestions(data.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions({ events: [], categories: [], cities: [] });
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(
    debounce((term: string) => fetchSuggestions(term), 300),
    []
  );

  useEffect(() => {
    if (query.trim().length > 0) {
      debouncedFetch(query);
    } else {
      setSuggestions({ events: [], categories: [], cities: [] });
    }
  }, [query, debouncedFetch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const totalResults = suggestions.events.length + suggestions.categories.length + suggestions.cities.length;
      
      // ✅ TRACKING: Search query
      analytics.search(query, totalResults);
      
      router.push(`/events?search=${encodeURIComponent(query)}`);
      setQuery('');
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // ✅ TRACKING: Kliknutí na suggestion
    if (suggestion.type === 'event') {
      analytics.clickEvent(suggestion.title, suggestion.id);
      router.push(`/events/${suggestion.slug}`);
    } else if (suggestion.type === 'category') {
      analytics.filterEvents('category', suggestion.name);
      router.push(`/events?search=${encodeURIComponent(suggestion.name)}`);
    } else if (suggestion.type === 'city') {
      analytics.filterEvents('city', suggestion.name);
      router.push(`/events?city=${encodeURIComponent(suggestion.name)}`);
    }
    setQuery('');
    setShowDropdown(false);
  };

  const isLarge = size === 'large';
  const hasResults = 
    suggestions.events.length > 0 || 
    suggestions.categories.length > 0 || 
    suggestions.cities.length > 0;
  const showSuggestions = showDropdown && query.trim().length > 0;

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center gap-2 bg-white rounded-2xl shadow-2xl p-2 hover:shadow-3xl transition-shadow">
          <Search 
            className={`absolute ${isLarge ? 'left-6' : 'left-4'} text-slate-400 pointer-events-none`} 
            size={isLarge ? 24 : 20} 
          />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => {
              setTimeout(() => setShowDropdown(false), 200);
            }}
            className={`flex-1 ${isLarge ? 'pl-14 pr-4 py-6 text-lg' : 'pl-12 pr-4 py-3 text-base'} border-0 focus:outline-none focus:ring-0 bg-transparent`}
          />
          <button
            type="submit"
            className={`${isLarge ? 'px-8 py-3 text-lg' : 'px-6 py-2 text-base'} bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors`}
          >
            Hledat
          </button>
        </div>
      </form>

      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full bg-white border-t border-slate-200 rounded-b-2xl shadow-2xl max-h-[500px] overflow-y-auto z-[9999]">
          
          {isLoading && (
            <div className="px-6 py-4 text-center text-slate-500">
              Načítám...
            </div>
          )}

          {!isLoading && !hasResults && (
            <div className="px-6 py-6 text-center">
              <p className="text-slate-500 text-sm">
                Žádné výsledky pro &quot;{query}&quot;
              </p>
            </div>
          )}

          {!isLoading && hasResults && (
            <>
              {suggestions.events.length > 0 && (
                <div className="border-b border-slate-100">
                  <div className="px-6 py-2 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Události
                    </p>
                  </div>
                  {suggestions.events.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(event);
                      }}
                      className="w-full px-6 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                    >
                      <Calendar size={18} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-900 font-medium text-sm truncate">
                          {event.title}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          {event.city} • {event.category}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {suggestions.categories.length > 0 && (
                <div className="border-b border-slate-100">
                  <div className="px-6 py-2 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Kategorie
                    </p>
                  </div>
                  {suggestions.categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(cat);
                      }}
                      className="w-full px-6 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                    >
                      <Tag size={16} className="text-blue-500 flex-shrink-0" />
                      <div className="text-slate-900 font-medium text-sm">
                        {cat.name}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {suggestions.cities.length > 0 && (
                <div>
                  <div className="px-6 py-2 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Města
                    </p>
                  </div>
                  {suggestions.cities.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(city);
                      }}
                      className="w-full px-6 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                    >
                      <MapPin size={16} className="text-red-500 flex-shrink-0" />
                      <div className="text-slate-900 font-medium text-sm">
                        {city.name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}