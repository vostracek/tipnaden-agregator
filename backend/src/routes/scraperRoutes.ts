import { Router } from 'express';
import { runScraper, getScraperStatus, runScraperJobManually } from '@/controllers/scraperController';
import { validateRequest } from '@/controllers/validateRequest';
import { scraperLimiter, readLimiter } from '@/controllers/rateLimiters';
import { scraperQuerySchema } from '@/utils/validationSchemas';

const router = Router();

// GET /api/v1/scraper/run?city=praha&limit=20
// ✅ SCRAPER limiter - 5 requests/hour
router.get(
  '/run', 
  scraperLimiter,
  validateRequest(scraperQuerySchema), 
  runScraper
);

// GET /api/v1/scraper/status
// ✅ READ limiter - 200 requests/15min (status je read operation)
router.get(
  '/status', 
  readLimiter,
  getScraperStatus
);

// POST /api/v1/scraper/run-job (spustí full job)
// ✅ SCRAPER limiter - 5 requests/hour
router.post(
  '/run-job', 
  scraperLimiter,
  runScraperJobManually
);

export default router;