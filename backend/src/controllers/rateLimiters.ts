import rateLimit from 'express-rate-limit';

// ============= GENERAL API LIMITER =============
// Základní limit pro všechny API endpointy
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minut
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: {
    success: false,
    error: 'Příliš mnoho requestů z této IP adresy. Zkuste to znovu za chvíli.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============= READ OPERATIONS LIMITER =============
// Pro GET requesty - mírnější limit
export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 200, // 200 requests za 15 minut
  message: {
    success: false,
    error: 'Příliš mnoho požadavků na čtení. Zkuste to za chvíli.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests k počítání (volitelné)
  skipSuccessfulRequests: false,
});

// ============= WRITE OPERATIONS LIMITER =============
// Pro POST/PUT/DELETE requesty - přísnější limit
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 50, // 50 requests za 15 minut
  message: {
    success: false,
    error: 'Příliš mnoho požadavků na zápis. Zkuste to za chvíli.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============= SEARCH LIMITER =============
// Pro vyhledávání - střední limit
export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100, // 100 vyhledávání za 15 minut
  message: {
    success: false,
    error: 'Příliš mnoho vyhledávacích požadavků. Zkuste to za chvíli.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============= SCRAPER LIMITER =============
// Pro scraper endpoint - velmi přísný limit
export const scraperLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hodina
  max: 5, // 5 requests za hodinu
  message: {
    success: false,
    error: 'Scraper endpoint má limit 5 requestů za hodinu.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============= AUTH LIMITER =============
// Pro přihlášení/registraci - ochrana před brute-force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 10, // 10 pokusů za 15 minut
  message: {
    success: false,
    error: 'Příliš mnoho pokusů o přihlášení. Zkuste to za 15 minut.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Nepočítej úspěšná přihlášení
});