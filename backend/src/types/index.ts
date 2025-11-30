import { Document, Types } from 'mongoose';

// ============= BASE INTERFACES =============

// Základní interface pro všechny dokumenty
export interface BaseDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ============= USER TYPES =============

export interface IUserPreferences {
  favoriteCategories: string[];
  favoriteLocations: string[];
  notificationsEnabled: boolean;
  emailNotifications: boolean;
}

export interface IUser extends BaseDocument {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  preferences: IUserPreferences;
  favoriteEvents: Types.ObjectId[];
  attendedEvents: Types.ObjectId[];
}

// DTO pro vytvoření uživatele
export interface CreateUserDTO {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  preferences?: Partial<IUserPreferences>;
}

// DTO pro aktualizaci uživatele
export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  preferences?: Partial<IUserPreferences>;
}

// ============= CATEGORY TYPES =============

export interface ICategory extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentCategory?: Types.ObjectId;
  isActive: boolean;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentCategory?: string;
}

// ============= LOCATION TYPES =============

export interface ICoordinates {
  latitude: number;
  longitude: number;
}

export interface IVenue {
  type: 'arena' | 'theater' | 'club' | 'outdoor' | 'online' | 'other';
  capacity?: number;
  website?: string;
  phone?: string;
}

export interface ILocation extends BaseDocument {
  name: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
  country: string;
  coordinates?: ICoordinates;
  venue: IVenue;
}

export interface CreateLocationDTO {
  name: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
  country?: string;
  coordinates?: ICoordinates;
  venue: IVenue;
}

// ============= EVENT TYPES =============

export interface IEventDateTime {
  start: Date;
  end?: Date;
  isMultiDay: boolean;
  timezone: string;
}

export interface IEventPricing {
  isFree: boolean;
  currency: string;
  priceFrom?: number;
  priceTo?: number;
  priceNote?: string;
}

export interface IEventMedia {
  mainImage?: string;
  gallery: string[];
  videos?: string[];
}

export interface IEventLinks {
  website?: string;
  ticketing?: string[];
  facebook?: string;
  instagram?: string;
}

export interface IEventOrganizer {
  name: string;
  website?: string;
  email?: string;
  phone?: string;
}

export interface IEventSource {
  platform: 'facebook' | 'eventbrite' | 'scraped_web' | 'manual' | 'api';
  sourceId?: string;
  sourceUrl: string;
  lastSynced: Date;
}

export interface IEventSEO {
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
}

export interface IEventStats {
  views: number;
  favorites: number;
  shares: number;
}

export type EventStatus = 'active' | 'cancelled' | 'postponed' | 'sold_out';

export interface IEvent extends BaseDocument {
  title: string;
  description: string;
  shortDescription?: string;
  category: Types.ObjectId;
  subcategory?: string;
  tags: string[];
  dateTime: IEventDateTime;
  location: Types.ObjectId;
  pricing: IEventPricing;
  media: IEventMedia;
  links: IEventLinks;
  organizer: IEventOrganizer;
  source: IEventSource;
  status: EventStatus;
  seo: IEventSEO;
  stats: IEventStats;
  isPublished: boolean;
  isFeatured?: boolean;
  publishedAt?: Date;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  dateTime: IEventDateTime;
  location: string;
  pricing: IEventPricing;
  media?: Partial<IEventMedia>;
  links?: Partial<IEventLinks>;
  organizer: IEventOrganizer;
  source: IEventSource;
  status?: EventStatus;
  seo?: Partial<IEventSEO>;
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  stats?: Partial<IEventStats>;
}

// ============= SOURCE TYPES =============

export interface IScrapingConfig {
  selectors: {
    title: string;
    date: string;
    location: string;
    price: string;
    description: string;
    image: string;
  };
  pagination?: {
    nextPageSelector: string;
    maxPages: number;
  };
}

export interface IAPIConfig {
  endpoint: string;
  authRequired: boolean;
  rateLimit: number;
}

export type SourceType = 'api' | 'scraping';

export interface ISource extends BaseDocument {
  name: string;
  type: SourceType;
  baseUrl: string;
  scraping?: IScrapingConfig;
  api?: IAPIConfig;
  isActive: boolean;
  lastScrapeTime?: Date;
  lastSuccessfulScrape?: Date;
  errorCount: number;
}

export interface CreateSourceDTO {
  name: string;
  type: SourceType;
  baseUrl: string;
  scraping?: IScrapingConfig;
  api?: IAPIConfig;
}

// ============= API RESPONSE TYPES =============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any; // Pro validation errors a další detailní informace
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface EventSearchQuery extends PaginationQuery {
  q?: string;              // Search term
  category?: string;       // Category ID or slug
  location?: string;       // Location ID or city
  dateFrom?: string;       // ISO date string
  dateTo?: string;         // ISO date string
  priceFrom?: number;
  priceTo?: number;
  isFree?: boolean | string;  // ← NOVÉ: Filtr pro zdarma události
  tags?: string;           // Comma separated tags
  status?: EventStatus;
  featured?: boolean;
}

// ============= ERROR TYPES =============

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}