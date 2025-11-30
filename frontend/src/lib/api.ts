const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// ============= INTERFACES =============

export interface Event {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
    color: string;
  };
  location: {
    _id: string;
    name: string;
    city: string;
    address: string;
  };
  dateTime: {
    start: string;
    end?: string;
    isMultiDay: boolean;
    timezone: string;
  };
  pricing: {
    isFree: boolean;
    currency: string;
    priceFrom?: number;
    priceTo?: number;
  };
  media?: {
    mainImage?: string;
    gallery?: string[];
    videos?: string[];
  };
  organizer?: {
    name: string;
    email?: string;
  };
  source?: {
    platform: string;
    sourceUrl?: string;
  };
  status: string;
  seo: {
    slug: string;
  };
  isFeatured: boolean;
  formattedPrice: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface EventsParams {
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  priceFrom?: number;
  priceTo?: number;
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface EventsResponse {
  success: boolean;
  data: Event[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============= CUSTOM ERROR CLASS =============

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}

// ============= HELPER FUNCTIONS =============

function getNetworkErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Nepodařilo se spojit se serverem. Zkontrolujte připojení.';
  }
  
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return 'Požadavek vypršel. Server neodpovídá, zkuste to prosím znovu.';
  }
  
  if (error instanceof TypeError && error.message?.includes('fetch')) {
    return 'Nelze se připojit k serveru. Zkontrolujte připojení k internetu.';
  }
  
  if (error.message?.includes('Failed to fetch')) {
    return 'Server není dostupný. Zkuste to prosím později.';
  }
  
  return 'Nepodařilo se spojit se serverem. Zkontrolujte připojení.';
}

async function parseJSONResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type');
  
  if (!contentType?.includes('application/json')) {
    throw new APIError(
      'Server vrátil neplatnou odpověď (ne-JSON)',
      response.status,
      'INVALID_RESPONSE'
    );
  }
  
  try {
    return await response.json();
  } catch {
    throw new APIError(
      'Nepodařilo se zpracovat odpověď ze serveru',
      response.status,
      'JSON_PARSE_ERROR'
    );
  }
}

// ============= CORE FETCH FUNCTION =============

async function fetchAPI<T = unknown>(
  endpoint: string,
  options?: RequestInit,
  timeout: number = 30000
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    const data = await parseJSONResponse(response);
    
    if (!response.ok) {
      const errorData = data as { error?: string; message?: string; code?: string; details?: unknown };
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
      
      let userMessage = errorMessage;
      
      if (response.status === 404) {
        userMessage = 'Požadovaný zdroj nebyl nalezen';
      } else if (response.status === 429) {
        userMessage = 'Příliš mnoho požadavků. Zkuste to za chvíli.';
      } else if (response.status === 500) {
        userMessage = 'Chyba serveru. Náš tým byl upozorněn.';
      } else if (response.status === 503) {
        userMessage = 'Server je momentálně nedostupný. Zkuste to později.';
      }
      
      throw new APIError(
        userMessage,
        response.status,
        errorData.code,
        errorData.details
      );
    }
    
    if (data && typeof data === 'object') {
      return data as T;
    }
    
    throw new APIError(
      'Server vrátil neplatná data',
      response.status,
      'INVALID_DATA'
    );
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof APIError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError(
        'Požadavek vypršel. Server neodpovídá.',
        0,
        'TIMEOUT_ERROR'
      );
    }
    
    if (error instanceof Error) {
      const message = getNetworkErrorMessage(error);
      throw new APIError(message, 0, 'NETWORK_ERROR');
    }
    
    throw new APIError(
      'Neočekávaná chyba při komunikaci se serverem',
      0,
      'UNKNOWN_ERROR'
    );
  }
}

// ============= PUBLIC API FUNCTIONS =============

export async function getEvents(params?: EventsParams): Promise<EventsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const data = await fetchAPI<EventsResponse>(endpoint);
    
    if (!data.success || !Array.isArray(data.data)) {
      throw new APIError(
        'Server vrátil neplatná data pro události',
        0,
        'INVALID_RESPONSE_STRUCTURE'
      );
    }
    
    return data;
  } catch (error) {
    console.error('getEvents error:', error);
    throw error;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const data = await fetchAPI<{ success: boolean; data: Category[] }>('/categories');
    
    if (!data.success || !Array.isArray(data.data)) {
      throw new APIError(
        'Server vrátil neplatná data pro kategorie',
        0,
        'INVALID_RESPONSE_STRUCTURE'
      );
    }
    
    return data.data;
  } catch (error) {
    console.error('getCategories error:', error);
    
    if (error instanceof APIError) {
      console.warn('Falling back to empty categories array');
      return [];
    }
    
    throw error;
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    if (!id || typeof id !== 'string') {
      throw new APIError(
        'Neplatné ID události',
        400,
        'INVALID_EVENT_ID'
      );
    }
    
    const data = await fetchAPI<{ success: boolean; data: Event }>(`/events/${id}`);
    
    if (!data.success || !data.data) {
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error('getEvent error:', error);
    
    if (error instanceof APIError && error.statusCode === 404) {
      return null;
    }
    
    throw error;
  }
}

export async function searchEvents(query: string): Promise<Event[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }
    
    const response = await getEvents({ q: query.trim(), limit: 50 });
    return response.data;
  } catch (error) {
    console.error('searchEvents error:', error);
    throw error;
  }
}

export async function getSearchSuggestions(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return {
        success: true,
        data: {
          events: [],
          categories: [],
          cities: [],
        },
      };
    }
    
    const data = await fetchAPI(`/search/suggestions?q=${encodeURIComponent(query.trim())}`);
    return data;
  } catch (error) {
    console.error('getSearchSuggestions error:', error);
    
    return {
      success: false,
      data: {
        events: [],
        categories: [],
        cities: [],
      },
    };
  }
}

// ============= UTILITY FUNCTIONS =============

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function logError(error: Error, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') {
    console.error('Production error:', error, context);
  } else {
    console.error('Development error:', error, context);
  }
}