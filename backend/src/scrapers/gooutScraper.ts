import puppeteer from 'puppeteer';
import { Category } from '@/models/Category';
import { Location } from '@/models/Location';
import { Event } from '@/models/Event';
import { logger } from '@/utils/logger';

interface ScrapedEvent {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  startDate: Date;
  categoryName: string;
  venueName: string;
  venueAddress: string;
  city: string;
  price?: number;
  isFree: boolean;
}

export class GooutScraper {
  private browser: any = null;

  async init() {
    logger.info('Starting browser...');
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      logger.info('Browser closed');
    }
  }

  async scrapeEvents(city: string = 'praha', limit: number = 20): Promise<ScrapedEvent[]> {
    if (!this.browser) {
      await this.init();
    }

    let page = null;
    
    try {
      page = await this.browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      const url = `https://goout.net/cs/${city}/akce/`;
      
      logger.info(`Scraping: ${url}`);
      
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Debug screenshot pouze pokud je DEBUG_MODE zapnutý
      if (process.env.DEBUG_MODE === 'true') {
        try {
          await page.screenshot({ path: './debug-goout.png' });
          logger.debug('Screenshot saved to debug-goout.png');
        } catch (screenshotError) {
          // Silent fail
        }
      }
      
      const html = await page.content();
      logger.debug(`Page HTML length: ${html.length}`);
      
      const possibleSelectors = [
        '.event-card',
        '.event',
        '[data-event]',
        'article',
        '.card',
        'a[href*="/akce/"]',
      ];
      
      let foundSelector = null;
      for (const selector of possibleSelectors) {
        const elements = await page.$$(selector);
        logger.debug(`Testing selector "${selector}": found ${elements.length} elements`);
        if (elements.length > 0) {
          foundSelector = selector;
          break;
        }
      }
      
      if (!foundSelector) {
        logger.warn('No events found with any selector');
        logger.debug(`HTML preview: ${html.substring(0, 1000)}`);
        return [];
      }
      
      logger.info(`Using selector: ${foundSelector}`);
      
      const events = await page.evaluate((selector: string, maxEvents: number) => {
        const elements = document.querySelectorAll(selector);
        const results: any[] = [];
        
        elements.forEach((el: any, index: number) => {
          if (index >= maxEvents) return;
          
          try {
            const titleEl = el.querySelector('h1, h2, h3, h4, .title, [class*="title"]');
            const title = titleEl?.textContent?.trim() || el.textContent?.trim().substring(0, 100) || '';
            
            const linkEl = el.querySelector('a') || el;
            const href = linkEl?.href || '';
            
            const imgEl = el.querySelector('img');
            const imageUrl = imgEl?.src || imgEl?.dataset?.src || '';
            
            if (title && href) {
              results.push({
                title,
                url: href,
                imageUrl,
                dateText: '',
                venueName: '',
                categoryName: 'Nezařazeno',
              });
            }
          } catch (err) {
            console.error('Error parsing element:', err);
          }
        });
        
        return results;
      }, foundSelector, limit);

      logger.info(`Scraped ${events.length} events from Goout`);

      const processedEvents: ScrapedEvent[] = events.map((event: any) => ({
        title: event.title,
        description: `Událost z Goout.net - ${event.title}`,
        url: event.url,
        imageUrl: event.imageUrl,
        startDate: this.parseDate(event.dateText),
        categoryName: this.mapCategory(event.title),
        venueName: event.venueName || 'Neznámé místo',
        venueAddress: '',
        city: this.capitalizeCity(city),
        price: undefined,
        isFree: true,
      }));

      return processedEvents;
    } catch (error) {
      logger.error('Scraping error', { error, city });
      return [];
    } finally {
      // Vždy zavři page
      if (page) {
        try {
          await page.close();
          logger.debug('Page closed');
        } catch (closeError) {
          logger.error('Error closing page', { error: closeError });
        }
      }
    }
  }

  private parseDate(dateText: string): Date {
    const today = new Date();
    
    const match = dateText.match(/(\d+)\.\s*(\w+)/);
    if (match) {
      const day = parseInt(match[1] || '1');
      const monthMap: Record<string, number> = {
        'ledna': 0, 'února': 1, 'března': 2, 'dubna': 3,
        'května': 4, 'června': 5, 'července': 6, 'srpna': 7,
        'září': 8, 'října': 9, 'listopadu': 10, 'prosince': 11
      };
      const monthName = match[2];
      const month = monthName ? (monthMap[monthName] ?? today.getMonth()) : today.getMonth();
      return new Date(today.getFullYear(), month, day, 20, 0, 0);
    }

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    return futureDate;
  }

  private mapCategory(title: string): string {
    const lower = title.toLowerCase();
    
    // Koncerty
    if (lower.includes('tour') || lower.includes('koncert') || lower.includes('show') ||
        lower.includes('harlej') || lower.includes('floyd') || lower.includes('rybičky') ||
        lower.includes('dyk') || lower.includes('quartet') || lower.includes('invasion') ||
        lower.includes('hudba') || lower.includes('music')) {
      return 'Koncerty';
    }
    
    // Divadla
    if (lower.includes('divadl') || lower.includes('theatre') || lower.includes('prohlíd')) {
      return 'Divadla';
    }
    
    // Sport
    if (lower.includes('sport') || lower.includes('hokej') || lower.includes('fotbal')) {
      return 'Sport';
    }
    
    // Festivaly
    if (lower.includes('festival')) {
      return 'Festivaly';
    }
    
    // Film
    if (lower.includes('film') || lower.includes('kino')) {
      return 'Film';
    }
    
    // Výstavy
    if (lower.includes('výstav') || lower.includes('exhibition') || 
        lower.includes('expozice') || lower.includes('museum')) {
      return 'Výstavy';
    }
    
    return 'Výstavy';
  }

  private capitalizeCity(city: string | undefined): string {
    if (!city) return 'Neznámé';
    return city.charAt(0).toUpperCase() + city.slice(1);
  }

  async saveToDatabase(scrapedEvents: ScrapedEvent[]) {
    logger.info(`Saving ${scrapedEvents.length} events to database...`);
    let savedCount = 0;

    for (const eventData of scrapedEvents) {
      try {
        // Najdi kategorii
        let category = await Category.findOne({ name: eventData.categoryName });
        
        if (!category) {
          logger.warn(`Category "${eventData.categoryName}" not found, using Výstavy as default`);
          category = await Category.findOne({ name: 'Výstavy' });
          
          if (!category) {
            logger.error('Default category "Výstavy" not found! Run db:seed first!');
            continue;
          }
        }

        // Najdi nebo vytvoř lokaci
        let location = await Location.findOne({ 
          name: eventData.venueName,
          city: eventData.city 
        });
        
        if (!location) {
          location = await Location.create({
            name: eventData.venueName,
            address: eventData.venueAddress || 'Adresa neuvedena',
            city: eventData.city,
            region: this.getCzechRegion(eventData.city),
            country: 'Česká republika',
            venue: {
              type: 'other',
            },
          });
        }

        // Vytvoř slug
        const baseSlug = eventData.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .substring(0, 50);

        const dateSlug = eventData.startDate.toISOString().split('T')[0];
        const slug = `${baseSlug}-${dateSlug}`;

        // Zkontroluj duplikáty
        const existingEvent = await Event.findOne({ 'seo.slug': slug });
        if (existingEvent) {
          logger.debug(`Skipping duplicate: ${eventData.title}`);
          continue;
        }

        // Vytvoř event
        await Event.create({
          title: eventData.title,
          description: eventData.description,
          shortDescription: eventData.description.substring(0, 160),
          category: category._id,
          tags: [eventData.categoryName.toLowerCase()],
          dateTime: {
            start: eventData.startDate,
            isMultiDay: false,
            timezone: 'Europe/Prague',
          },
          location: location._id,
          pricing: {
            isFree: eventData.isFree,
            currency: 'CZK',
            priceFrom: eventData.price,
          },
          media: {
            mainImage: eventData.imageUrl,
            gallery: [],
          },
          organizer: {
            name: 'Goout.net',
          },
          source: {
            platform: 'scraped_web',
            sourceUrl: eventData.url,
            lastSynced: new Date(),
          },
          seo: {
            slug,
            metaTitle: eventData.title,
            metaDescription: eventData.description.substring(0, 160),
          },
          status: 'active',
          isPublished: true,
          isFeatured: false,
        });

        savedCount++;
        logger.info(`Saved: ${eventData.title} → ${category.name}`);
      } catch (error) {
        logger.error(`Error saving event: ${eventData.title}`, { error });
      }
    }

    logger.info(`Successfully saved ${savedCount} events`);
    return savedCount;
  }

  private getCzechRegion(city: string): string {
    const regions: Record<string, string> = {
      'Praha': 'Hlavní město Praha',
      'Brno': 'Jihomoravský kraj',
      'Ostrava': 'Moravskoslezský kraj',
      'Plzeň': 'Plzeňský kraj',
      'Liberec': 'Liberecký kraj',
      'Olomouc': 'Olomoucký kraj',
    };
    return regions[city] || 'Jiný kraj';
  }
}