import mongoose from 'mongoose';
import { logger } from '@/utils/logger';

// Konfigurace MongoDB připojení
export const connectDatabase = async (): Promise<void> => {
  try {
    // MongoDB URI z environment variables
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    logger.info('Connecting to MongoDB...');
    
    // Mongoose připojení s optimalizovanými nastaveními
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });

    logger.info('MongoDB connected successfully');
    logger.info(`Database: ${mongoose.connection.name}`);
    logger.info(`Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

  } catch (error) {
    logger.error('MongoDB connection failed', { error });
    
    // V production prostředí ukončí aplikaci
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      // V development pouze vyhodí chybu
      throw error;
    }
  }
};

// Graceful disconnect při ukončení aplikace
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', { error });
  }
};

// Event listenery pro MongoDB připojení
export const setupDatabaseEventListeners = (): void => {
  // Připojení úspěšné
  mongoose.connection.on('connected', () => {
    logger.debug('Mongoose connected to MongoDB');
  });

  // Připojení ztraceno
  mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose disconnected from MongoDB');
  });

  // Chyba připojení
  mongoose.connection.on('error', (error) => {
    logger.error('Mongoose connection error', { error });
  });

  // Pokus o znovupřipojení
  mongoose.connection.on('reconnected', () => {
    logger.info('Mongoose reconnected to MongoDB');
  });

  // MongoDB server se připojil
  mongoose.connection.on('open', () => {
    logger.debug('MongoDB connection opened');
  });

  // MongoDB server se odpojil
  mongoose.connection.on('close', () => {
    logger.debug('MongoDB connection closed');
  });
};

// Utility funkce pro kontrolu připojení
export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

// Utility funkce pro získání info o databázi
export const getDatabaseInfo = () => {
  const connection = mongoose.connection;
  return {
    readyState: connection.readyState,
    name: connection.name,
    host: connection.host,
    port: connection.port,
    status: ['disconnected', 'connected', 'connecting', 'disconnecting'][connection.readyState]
  };
};