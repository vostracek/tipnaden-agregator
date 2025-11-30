import dotenv from 'dotenv';
import { connectDatabase } from '@/config/database';
import { Event } from '@/models/Event';

dotenv.config();

const clearEvents = async () => {
  try {
    console.log('🗑️ Clearing events...');
    await connectDatabase();
    
    const result = await Event.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} events`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearEvents();