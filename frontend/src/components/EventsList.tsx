'use client';

import { useEffect, useState } from 'react';
import { getEvents, Event } from '@/lib/api';
import EventCard from './EventCard';
import Pagination from './Pagination';
import { FilterState } from './EventFilters';
import { Card } from '@/components/ui/card';
import ErrorBoundary from './ErrorBoundary';
import { AlertCircle } from 'lucide-react';

interface EventsListProps {
  searchQuery?: string;
  filters?: FilterState;
}

// ============= SKELETON COMPONENT =============
function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-slate-800/40 border-slate-700/50 animate-pulse">
      <div className="h-64 bg-slate-700/50" />
      <div className="p-6 space-y-4">
        <div className="h-8 bg-slate-700/50 rounded w-3/4" />
        <div className="h-8 bg-slate-700/50 rounded w-1/2" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-700/50 rounded w-full" />
          <div className="h-4 bg-slate-700/50 rounded w-5/6" />
          <div className="h-4 bg-slate-700/50 rounded w-4/6" />
        </div>
        <div className="h-6 bg-slate-700/50 rounded w-2/3" />
      </div>
    </Card>
  );
}

// ============= ERROR FALLBACK PRO EVENTSLIST =============
function EventsListError({ error, resetError }: { error: Error | null; resetError: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="flex justify-center mb-6">
        <AlertCircle className="text-red-500" size={64} />
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">
        Nepodařilo se načíst události
      </h2>
      <p className="text-slate-300 mb-2">
        {error?.message || 'Zkuste to prosím znovu za chvíli'}
      </p>
      <p className="text-slate-400 text-sm mb-8">
        Pokud problém přetrvává, kontaktujte podporu
      </p>
      <button
        onClick={resetError}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105"
      >
        Zkusit znovu
      </button>
    </div>
  );
}

// ============= MAIN COMPONENT =============
function EventsListContent({ searchQuery = '', filters = {} }: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  useEffect(() => {
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null); // ✅ Reset error před novým fetch

      const params = {
        q: searchQuery || undefined,
        ...filters,
        page: currentPage,
        limit: itemsPerPage
      };

      const response = await getEvents(params);

      // ✅ Validace response
      if (!response || !response.data) {
        throw new Error('Neplatná odpověď ze serveru');
      }

      setEvents(response.data);

      if (response.pagination) {
        setTotalPages(response.pagination.pages);
        setTotalEvents(response.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      
      // ✅ Type guard pro Error objekty
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          setError('Nelze se připojit k serveru. Zkontrolujte připojení k internetu.');
        } else if (error.message.includes('timeout')) {
          setError('Požadavek vypršel. Server neodpovídá.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Nepodařilo se načíst události');
      }
    } finally {
      setLoading(false);
    }
  };

  fetchEvents();
}, [searchQuery, filters, currentPage]);

const handlePageChange = (page: number) => {
  setCurrentPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleRetry = () => {
  setError(null);
  // Force reload pro jistotu
  window.location.reload();
};

  // ============= LOADING STATE =============
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-8 bg-slate-700/50 rounded w-48 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ============= ERROR STATE =============
  if (error) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-6">
          <AlertCircle className="text-red-500" size={64} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Nepodařilo se načíst události
        </h2>
        <p className="text-slate-300 mb-2">{error}</p>
        <p className="text-slate-400 text-sm mb-8">
          Zkuste to prosím znovu nebo kontaktujte podporu
        </p>
        <button
          onClick={handleRetry}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105"
        >
          Zkusit znovu
        </button>
      </div>
    );
  }

  // ============= EMPTY STATE =============
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">😕</div>
        <p className="text-slate-300 text-2xl mb-2">
          Žádné události nenalezeny
        </p>
        <p className="text-slate-400">
          {searchQuery || Object.keys(filters).length > 0
            ? 'Zkuste změnit filtry nebo hledaný výraz'
            : 'Momentálně nejsou k dispozici žádné události'
          }
        </p>
      </div>
    );
  }

  // ============= SUCCESS STATE =============
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {searchQuery ? `Výsledky pro: "${searchQuery}"` : 'Události'}
        </h2>
        <p className="text-slate-300">
          {totalEvents > 0 && (
            <>
              {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, totalEvents)} z {totalEvents} událost
              {totalEvents === 1 ? '' : totalEvents < 5 ? 'i' : 'í'}
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <div
            key={event._id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* ✅ Error Boundary pro každou EventCard */}
            <ErrorBoundary
              fallback={
                <Card className="p-6 bg-slate-800/40 border-slate-700/50">
                  <p className="text-slate-400 text-center">
                    Nepodařilo se načíst tuto událost
                  </p>
                </Card>
              }
            >
              <EventCard event={event} />
            </ErrorBoundary>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

// ============= EXPORTED COMPONENT S ERROR BOUNDARY =============
export default function EventsList(props: EventsListProps) {
  return (
    <ErrorBoundary
      fallback={<EventsListError error={null} resetError={() => window.location.reload()} />}
    >
      <EventsListContent {...props} />
    </ErrorBoundary>
  );
}