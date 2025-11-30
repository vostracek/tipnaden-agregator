import cron from 'node-cron';
import { GooutScraper } from '@/scrapers/gooutScraper';
import { logger } from '@/utils/logger';

export function startScraperJob() {
  // Každý den ve 3:00 ráno
  cron.schedule('0 3 * * *', async () => {
    logger.info('===================================');
    logger.info('SCHEDULED SCRAPER JOB STARTED');
    logger.info(`Time: ${new Date().toLocaleString('cs-CZ')}`);
    logger.info('===================================');
    
    const scraper = new GooutScraper();
    
    try {
      await scraper.init();
      
      const cities = ['praha', 'brno', 'ostrava'];
      let totalScraped = 0;
      let totalSaved = 0;
      
      for (const city of cities) {
        try {
          logger.info(`Scraping ${city.toUpperCase()}...`);
          
          const events = await scraper.scrapeEvents(city, 50);
          const saved = await scraper.saveToDatabase(events);
          
          totalScraped += events.length;
          totalSaved += saved;
          
          logger.info(`${city}: Scraped ${events.length}, Saved ${saved}`);
          
          // Pauza mezi městy
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          logger.error(`Error scraping ${city}`, { error });
        }
      }
      
      await scraper.close();
      
      logger.info('===================================');
      logger.info('SCRAPER JOB COMPLETED');
      logger.info(`Total Scraped: ${totalScraped}`);
      logger.info(`Total Saved: ${totalSaved}`);
      logger.info('===================================');
      
    } catch (error) {
      logger.error('Scraper job fatal error', { error });
      await scraper.close();
    }
  });
  
  logger.info('===================================');
  logger.info('CRON JOB SCHEDULED');
  logger.info('Schedule: Every day at 3:00 AM');
  logger.info('Cities: Praha, Brno, Ostrava');
  logger.info('Limit: 50 events per city');
  logger.info('===================================');
}

// Pro testování - spustí scraper hned
export async function runScraperNow() {
  logger.info('MANUAL SCRAPER RUN');
  
  const scraper = new GooutScraper();
  
  try {
    await scraper.init();
    
    const cities = ['praha', 'brno', 'ostrava'];
    let totalScraped = 0;
    let totalSaved = 0;
    
    for (const city of cities) {
      try {
        logger.info(`Scraping ${city.toUpperCase()}...`);
        
        const events = await scraper.scrapeEvents(city, 50);
        const saved = await scraper.saveToDatabase(events);
        
        totalScraped += events.length;
        totalSaved += saved;
        
        logger.info(`${city}: Scraped ${events.length}, Saved ${saved}`);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        logger.error(`Error scraping ${city}`, { error });
      }
    }
    
    await scraper.close();
    
    logger.info('Manual scraper completed');
    logger.info(`Total: ${totalScraped} scraped, ${totalSaved} saved`);
    
    return { totalScraped, totalSaved };
    
  } catch (error) {
    logger.error('Manual scraper error', { error });
    await scraper.close();
    throw error;
  }
}