import { Request, Response } from "express";
import { Event } from "@/models/Event";
import { Category } from "@/models/Category";
import { Location } from "@/models/Location";
import { logger } from "@/utils/logger";

// ============= HLAVNÍ VYHLEDÁVÁNÍ =============
export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    // Validace query
    if (!q || typeof q !== "string" || q.trim().length === 0) {
      res.json({
        success: true,
        data: {
          events: [],
          total: 0,
        },
      });
      return;
    }

    const searchTerm = q.trim();
    const regex = new RegExp(searchTerm, "i");

    logger.info(`Searching for: ${searchTerm}`);

    // Hledej v Events
    const events = await Event.find({
      $or: [
        { title: regex },
        { description: regex },
        { tags: regex }
      ],
      "dateTime.start": { $gte: new Date() },
      status: "active",
      isPublished: true,
    })
      .populate("category", "name slug color")
      .populate("location", "name city address")
      .select("title shortDescription dateTime pricing media seo stats")
      .sort({ "dateTime.start": 1 })
      .limit(50)
      .lean();

    logger.info(`Found ${events.length} events for query: ${searchTerm}`);

    res.json({
      success: true,
      data: {
        events,
        total: events.length,
        query: searchTerm,
      },
    });
  } catch (error) {
    logger.error("Search error", { error });
    
    res.status(500).json({
      success: false,
      error: "Failed to perform search",
    });
  }
};

// ============= SUGGESTIONS (AUTOCOMPLETE) =============
export const getSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    // Validace query
    if (!q || typeof q !== "string" || q.trim().length === 0) {
      res.json({
        success: true,
        data: {
          events: [],
          categories: [],
          cities: [],
        },
      });
      return;
    }

    const searchTerm = q.trim();
    const regex = new RegExp(searchTerm, "i");

    logger.debug(`Getting suggestions for: ${searchTerm}`);

    // Paralelní vyhledávání
    const [events, categories, locations] = await Promise.all([
      // Events
      Event.find({
        $or: [{ title: regex }, { tags: regex }],
        "dateTime.start": { $gte: new Date() },
        status: "active",
        isPublished: true,
      })
        .select("title seo.slug location category dateTime.start")
        .populate("location", "city")
        .populate("category", "name")
        .limit(5)
        .sort({ "dateTime.start": 1 })
        .lean(),

      // Categories
      Category.find({
        $or: [{ name: regex }, { slug: regex }],
      })
        .select("name slug")
        .limit(3)
        .lean(),

      // Locations (města)
      Location.find({
        $or: [{ city: regex }, { address: regex }],
      })
        .select("city")
        .limit(5)
        .lean(),
    ]);

    // Formátování výsledků
    const formattedEvents = events.map((event) => ({
      type: "event" as const,
      id: event._id,
      title: event.title,
      slug: event.seo.slug,
      city: (event.location as any)?.city || "Neuvedeno",
      category: (event.category as any)?.name || "Neuvedeno",
      date: event.dateTime.start,
    }));

    const formattedCategories = categories.map((cat) => ({
      type: "category" as const,
      name: cat.name,
      slug: cat.slug,
    }));

    // Deduplikace měst
    const uniqueCities = [...new Set(locations.map((loc) => loc.city))].map(
      (city) => ({
        type: "city" as const,
        name: city,
      })
    );

    res.json({
      success: true,
      data: {
        events: formattedEvents,
        categories: formattedCategories,
        cities: uniqueCities.slice(0, 3),
      },
    });
  } catch (error) {
    logger.error("Search suggestions error", { error });
    
    res.status(500).json({
      success: false,
      error: "Failed to fetch search suggestions",
    });
  }
};

// ============= BACKWARDS COMPATIBILITY =============
// Ponech původní funkci pro kompatibilitu
export const getSearchSuggestions = getSuggestions;