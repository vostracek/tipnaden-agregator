import { Router, Request, Response } from 'express';
import categoryRoutes from './categoryRoutes';
import locationRoutes from './locationRoutes';
import userRoutes from './userRoutes';
import eventRoutes from './eventRoutes';
import searchRoutes from './searchRoutes';
import scraperRoutes from './scraperRoutes'; // ← PŘIDEJ

const router = Router();

// ============= API INFO ENDPOINT =============

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to TipNaDen.cz API',
    version: 'v1',
    endpoints: {
      health: '/health',
      categories: '/api/v1/categories',
      events: '/api/v1/events',
      users: '/api/v1/users',
      locations: '/api/v1/locations',
      scraper: '/api/v1/scraper', // ← PŘIDEJ
    },
    documentation: 'https://tipnaden.cz/api/docs',
    status: 'active'
  });
});

// ============= API V1 ROUTES =============

router.use('/v1/categories', categoryRoutes);
router.use('/v1/locations', locationRoutes);
router.use('/v1/users', userRoutes);
router.use('/v1/events', eventRoutes);
router.use('/v1/search', searchRoutes);
router.use('/v1/scraper', scraperRoutes); // ← PŘIDEJ

// ============= API V1 INFO ENDPOINT =============

router.get('/v1', (req: Request, res: Response) => {
  res.status(200).json({
    version: '1.0.0',
    message: 'TipNaDen.cz API v1',
    availableEndpoints: {
      categories: {
        path: '/api/v1/categories',
        methods: ['GET', 'POST'],
        description: 'Manage event categories'
      },
      events: {
        path: '/api/v1/events',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage events',
        status: 'active'
      },
      users: {
        path: '/api/v1/users',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage users',
        status: 'active'
      },
      locations: {
        path: '/api/v1/locations',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Manage locations',
        status: 'active'
      },
      scraper: { // ← PŘIDEJ
        path: '/api/v1/scraper',
        methods: ['GET', 'POST'],
        description: 'Run web scraper',
        status: 'active'
      }
    },
    features: [
      'RESTful API design',
      'MongoDB integration',
      'Clerk authentication',
      'Rate limiting',
      'Error handling',
      'Input validation'
    ]
  });
});

export default router;