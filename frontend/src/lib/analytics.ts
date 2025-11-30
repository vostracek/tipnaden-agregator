// lib/analytics.ts

// Definice window.gtag typu
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: {
        event_category?: string;
        event_label?: string;
        value?: number;
      }
    ) => void;
  }
}

export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Konkrétní event trackery
export const analytics = {
  // Kliknutí na událost
  clickEvent: (eventTitle: string, eventId: string) => {
    trackEvent('click_event', 'Events', `${eventTitle} (${eventId})`);
  },

  // Search query
  search: (query: string, resultsCount: number) => {
    trackEvent('search', 'Search', query, resultsCount);
  },

  // Kliknutí na "Koupit lístek"
  clickTicket: (eventTitle: string, eventId: string) => {
    trackEvent('click_ticket', 'Conversions', `${eventTitle} (${eventId})`);
  },

  // Filtrování
  filterEvents: (filterType: string, filterValue: string) => {
    trackEvent('filter', 'Events', `${filterType}: ${filterValue}`);
  },
};