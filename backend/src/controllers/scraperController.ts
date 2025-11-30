import { Request, Response } from 'express';
import { GooutScraper } from '@/scrapers/gooutScraper';
import { runScraperNow } from '@/jobs/scraperJob';
import { ApiResponse } from '@/types';

export const runScraper = async (req: Request, res: Response): Promise<void> => {
  let scraper: GooutScraper | null = null;
  
  try {
    const { city = 'praha', limit = 20 } = req.query;
    
    console.log(`🤖 Starting scraper for ${city}...`);
    
    scraper = new GooutScraper();
    await scraper.init();
    
    // Scrape events
    const scrapedEvents = await scraper.scrapeEvents(city as string, Number(limit));
    
    // Save to database
    const savedCount = await scraper.saveToDatabase(scrapedEvents);
    
    const response: ApiResponse = {
      success: true,
      message: `Successfully scraped and saved ${savedCount} events from Goout.net`,
      data: {
        scraped: scrapedEvents.length,
        saved: savedCount,
        city,
      },
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Scraper error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to run scraper',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
    
    res.status(500).json(response);
  } finally {
    // ✅ Vždy zavři browser, i když nastala chyba
    if (scraper) {
      try {
        await scraper.close();
        console.log('✅ Scraper browser closed');
      } catch (closeError) {
        console.error('❌ Error closing scraper:', closeError);
      }
    }
  }
};

export const getScraperStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Event } = await import('@/models/Event');
    
    // Spočítej kolik eventů je ze scraperu
    const scrapedCount = await Event.countDocuments({
      'source.platform': 'scraped_web',
    });
    
    const totalCount = await Event.countDocuments();
    
    const response: ApiResponse = {
      success: true,
      data: {
        totalEvents: totalCount,
        scrapedEvents: scrapedCount,
        manualEvents: totalCount - scrapedCount,
        lastUpdate: new Date(),
      },
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Status error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to get scraper status',
    };
    
    res.status(500).json(response);
  }
};

export const runScraperJobManually = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🧪 Manual scraper job triggered via API');
    
    const result = await runScraperNow();
    
    const response: ApiResponse = {
      success: true,
      message: 'Manual scraper job completed',
      data: result,
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Manual scraper job error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Manual scraper job failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
    
    res.status(500).json(response);
  }
};