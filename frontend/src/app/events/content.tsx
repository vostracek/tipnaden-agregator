'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EventsList from '@/components/EventsList';
import EventFilters, { FilterState } from '@/components/EventFilters';
import SearchWithSuggestions from '@/components/SearchWithSuggestions';

function EventsPageInner() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [filters, setFilters] = useState<FilterState>({});

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        
        {/* Search Bar s našeptáváním */}
        <div className="mb-8 max-w-3xl mx-auto">
          <SearchWithSuggestions 
            size="default"
            placeholder="Hledejte události..."
          />
        </div>

        {/* Filtry POD search barem */}
        <EventFilters 
          currentFilters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Výsledky */}
        <EventsList 
          searchQuery={initialSearch}
          filters={filters}
        />
      </main>

    </div>
  );
}

export default function EventsPageContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Načítám...</div>
      </div>
    }>
      <EventsPageInner />
    </Suspense>
  );
}


