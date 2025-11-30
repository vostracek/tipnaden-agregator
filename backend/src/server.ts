import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import scraperRoutes from '@/routes/scraperRoutes';
import { startScraperJob } from '@/jobs/scraperJob';
import { logger } from '@/utils/logger';

// Rate limiters
import { apiLimiter } from '@/controllers/rateLimiters';

// Databáze
import { connectDatabase, disconnectDatabase, setupDatabaseEventListeners, getDatabaseInfo } from '@/config/database';

// Routes
import apiRoutes from '@/routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ============= MIDDLEWARE =============

app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression() as any);

app.use((req: Request, res: Response, next: any) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

// ✅ GLOBAL API RATE LIMITER
// Aplikuje se na všechny /api/* requesty jako základní ochrana
app.use('/api', apiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============= ROUTES =============

app.get('/health', (req: Request, res: Response) => {
  const dbInfo = getDatabaseInfo();
  
  res.status(200).json({
    status: 'OK',
    message: 'TipNaDen.cz API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    database: {
      status: dbInfo.status,
      name: dbInfo.name,
      connected: dbInfo.readyState === 1
    }
  });
});

// API Routes (každá route má svůj vlastní rate limiter)
app.use('/api', apiRoutes);

// Catch-all pro neexistující routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: ['/health', '/api'],
  });
});

// ============= ERROR HANDLING =============

app.use((err: any, req: Request, res: Response, next: any) => {
  logger.error('Global Error Handler', { 
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  const statusCode = err.statusCode || 500;
  
  const errorResponse = {
    error: true,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  };
  
  res.status(statusCode).json(errorResponse);
});

// ============= SERVER START =============

const startServer = async () => {
  try {
    setupDatabaseEventListeners();
    await connectDatabase();
    
    const server = app.listen(PORT, () => {
      logger.info('================================');
      logger.info('TipNaDen.cz API Server Running!');
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Port: ${PORT}`);
      logger.info(`Health Check: http://localhost:${PORT}/health`);
      logger.info(`API Base: http://localhost:${PORT}/api`);
      logger.info('================================');
      logger.info('Rate Limiting Active:');
      logger.info('  - API: 100 requests/15min');
      logger.info('  - Read: 200 requests/15min');
      logger.info('  - Write: 50 requests/15min');
      logger.info('  - Search: 100 requests/15min');
      logger.info('  - Scraper: 5 requests/hour');
      logger.info('================================');
    });

    startScraperJob();

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} signal received: closing HTTP server and database connection`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDatabase();
        logger.info('Graceful shutdown completed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', async (err) => {
      logger.error('Uncaught Exception', { error: err });
      await disconnectDatabase();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      logger.error('Unhandled Rejection', { reason, promise });
      await disconnectDatabase();
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

startServer();

export default app;