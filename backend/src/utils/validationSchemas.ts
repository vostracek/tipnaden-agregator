import { z } from 'zod';

// ============= SCRAPER SCHEMAS =============

export const scraperQuerySchema = z.object({
  query: z.object({
    city: z.string()
      .min(1, 'City cannot be empty')
      .max(50, 'City name too long')
      .regex(/^[a-zA-ZáéíóúýčďěňřšťžůÁÉÍÓÚÝČĎĚŇŘŠŤŽŮ]+$/, 'City must contain only letters')
      .transform(val => val.toLowerCase())
      .default('praha')
      .optional(),
    
    limit: z.union([z.string(), z.number()])
      .transform(val => Number(val))
      .pipe(
        z.number()
          .int('Limit must be an integer')
          .min(1, 'Limit must be at least 1')
          .max(100, 'Limit cannot exceed 100')
      )
      .default(20)
      .optional(),
  }).optional(),
});

// ============= EVENT SCHEMAS =============

// Query schema pro GET /events
export const eventQuerySchema = z.object({
  query: z.object({
    // Filters
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID').optional(),
    location: z.string().min(1).max(100).optional(),
    dateFrom: z.string().datetime('Invalid date format').optional(),
    dateTo: z.string().datetime('Invalid date format').optional(),
    priceFrom: z.coerce.number().min(0).optional(),
    priceTo: z.coerce.number().min(0).optional(),
    isFree: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    tags: z.string().optional(),
    featured: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    
    // Search
    q: z.string().min(1).max(200).optional(),
    
    // Pagination
    page: z.coerce.number().int().min(1).max(1000).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20).optional(),
    
    // Sorting
    sort: z.enum(['date', 'title', 'created', 'popularity']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }).optional(),
});

// Param schema pro GET/PUT/DELETE /events/:id
export const eventIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Event ID is required'),
  }),
});

// Schema pro POST /events (vytvoření nové události)
export const createEventSchema = z.object({
  body: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(200, 'Title cannot exceed 200 characters')
      .trim(),
    
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(5000, 'Description cannot exceed 5000 characters')
      .trim(),
    
    shortDescription: z.string()
      .max(300, 'Short description cannot exceed 300 characters')
      .trim()
      .optional(),
    
    category: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
    
    subcategory: z.string()
      .max(100, 'Subcategory cannot exceed 100 characters')
      .trim()
      .optional(),
    
    tags: z.array(
      z.string().max(50, 'Tag cannot exceed 50 characters')
    ).optional(),
    
    dateTime: z.object({
      start: z.string().datetime('Invalid start date format'),
      end: z.string().datetime('Invalid end date format').optional(),
      isMultiDay: z.boolean().default(false),
      timezone: z.string().default('Europe/Prague'),
    }),
    
    location: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid location ID'),
    
    pricing: z.object({
      isFree: z.boolean().default(false),
      currency: z.enum(['CZK', 'EUR', 'USD']).default('CZK'),
      priceFrom: z.number().min(0, 'Price cannot be negative').optional(),
      priceTo: z.number().min(0, 'Price cannot be negative').optional(),
      priceNote: z.string().max(200).trim().optional(),
    }),
    
    media: z.object({
      mainImage: z.string().url('Invalid image URL').optional(),
      gallery: z.array(z.string().url('Invalid gallery image URL')).optional(),
      videos: z.array(z.string().url('Invalid video URL')).optional(),
    }).optional(),
    
    links: z.object({
      website: z.string().url('Invalid website URL').optional(),
      ticketing: z.array(z.string().url('Invalid ticketing URL')).optional(),
      facebook: z.string().url('Invalid Facebook URL').optional(),
      instagram: z.string().url('Invalid Instagram URL').optional(),
    }).optional(),
    
    organizer: z.object({
      name: z.string()
        .min(1, 'Organizer name is required')
        .max(200, 'Organizer name cannot exceed 200 characters')
        .trim(),
      website: z.string().url('Invalid organizer website URL').optional(),
      email: z.string().email('Invalid organizer email').optional(),
      phone: z.string()
        .regex(/^\+?[0-9\s\-\(\)]+$/, 'Invalid phone number')
        .optional(),
    }),
    
    source: z.object({
      platform: z.enum(['facebook', 'eventbrite', 'scraped_web', 'manual', 'api']),
      sourceId: z.string().trim().optional(),
      sourceUrl: z.string().url('Invalid source URL'),
      lastSynced: z.string().datetime().optional(),
    }),
    
    seo: z.object({
      slug: z.string()
        .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and hyphens')
        .optional(),
      metaTitle: z.string().max(60, 'Meta title cannot exceed 60 characters').optional(),
      metaDescription: z.string().max(160, 'Meta description cannot exceed 160 characters').optional(),
    }).optional(),
    
    status: z.enum(['active', 'cancelled', 'postponed', 'sold_out']).default('active'),
    isPublished: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
  }),
});

// Schema pro PUT /events/:id (update události)
export const updateEventSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Event ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().min(10).max(5000).trim().optional(),
    shortDescription: z.string().max(300).trim().optional(),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    subcategory: z.string().max(100).trim().optional(),
    tags: z.array(z.string().max(50)).optional(),
    
    dateTime: z.object({
      start: z.string().datetime().optional(),
      end: z.string().datetime().optional(),
      isMultiDay: z.boolean().optional(),
      timezone: z.string().optional(),
    }).optional(),
    
    location: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    
    pricing: z.object({
      isFree: z.boolean().optional(),
      currency: z.enum(['CZK', 'EUR', 'USD']).optional(),
      priceFrom: z.number().min(0).optional(),
      priceTo: z.number().min(0).optional(),
      priceNote: z.string().max(200).optional(),
    }).optional(),
    
    status: z.enum(['active', 'cancelled', 'postponed', 'sold_out']).optional(),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }).partial(), // všechna pole jsou optional pro update
});

// ============= VALIDATION HELPERS =============

// Custom refinement pro kontrolu price range
export const priceRangeRefinement = (data: any) => {
  if (data.priceFrom && data.priceTo && data.priceTo < data.priceFrom) {
    throw new z.ZodError([{
      code: 'custom',
      path: ['priceTo'],
      message: 'Price to must be greater than price from',
    }]);
  }
  return true;
};