import { Router } from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} from '@/controllers/eventController';
import { validateRequest } from '@/controllers/validateRequest';
import { readLimiter, writeLimiter } from '@/controllers/rateLimiters';
import {
  eventQuerySchema,
  createEventSchema,
  updateEventSchema,
  eventIdParamSchema
} from '@/utils/validationSchemas';

const router = Router();

// ============= EVENT ROUTES =============

// GET /api/v1/events - Získání událostí s filtry a paginací
// ✅ READ limiter - 200 requests/15min
router.get(
  '/', 
  readLimiter,
  validateRequest(eventQuerySchema), 
  getEvents
);

// GET /api/v1/events/:id - Získání jedné události
// ✅ READ limiter - 200 requests/15min
router.get(
  '/:id', 
  readLimiter,
  validateRequest(eventIdParamSchema), 
  getEvent
);

// POST /api/v1/events - Vytvoření nové události
// ✅ WRITE limiter - 50 requests/15min
router.post(
  '/', 
  writeLimiter,
  validateRequest(createEventSchema), 
  createEvent
);

// PUT /api/v1/events/:id - Aktualizace události
// ✅ WRITE limiter - 50 requests/15min
router.put(
  '/:id', 
  writeLimiter,
  validateRequest(updateEventSchema), 
  updateEvent
);

// DELETE /api/v1/events/:id - Smazání události
// ✅ WRITE limiter - 50 requests/15min
router.delete(
  '/:id', 
  writeLimiter,
  validateRequest(eventIdParamSchema), 
  deleteEvent
);

export default router;