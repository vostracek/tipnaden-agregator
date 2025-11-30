import dotenv from 'dotenv';
import { connectDatabase } from '@/config/database';
import { runScraperNow } from '@/jobs/scraperJob';

// Načti environment variables
dotenv.config();

const main = async () => {
  try {
    console.log('🚀 Starting scraper...\n');
    await connectDatabase();
    await runScraperNow();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

main();