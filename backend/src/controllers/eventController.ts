import { Request, Response } from "express";
import { Event } from "@/models/Event";
import { ApiResponse, CreateEventDTO, EventSearchQuery } from "@/types";
import { Category } from "@/models/Category";
import { logger } from "@/utils/logger";

// ============= GET ALL EVENTS =============
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: EventSearchQuery = req.query;
    logger.debug('Getting events with filters', { query });

    // Build MongoDB query
    const mongoQuery: any = {
      isPublished: true,
      status: "active",
    };

    mongoQuery["dateTime.start"] = { $gte: new Date() };

    // Category filter
    if (query.category) {
      mongoQuery.category = query.category;
    }

    // Location filter
    if (query.location) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(query.location);

      if (isObjectId) {
        mongoQuery.location = query.location;
      } else {
        const { Location } = await import("@/models/Location");
        const locations = await Location.find({
          city: { $regex: new RegExp(`^${query.location}$`, "i") },
        });

        if (locations.length > 0) {
          mongoQuery.location = { $in: locations.map((loc) => loc._id) };
        }
      }
    }

    // Date range filters
    if (query.dateFrom) {
      mongoQuery["dateTime.start"] = {
        ...mongoQuery["dateTime.start"],
        $gte: new Date(query.dateFrom),
      };
    }

    if (query.dateTo) {
      mongoQuery["dateTime.start"] = {
        ...mongoQuery["dateTime.start"],
        $lte: new Date(query.dateTo),
      };
    }

    // Price filters
    if (query.priceFrom || query.priceTo) {
      const priceFilter: any = {};
      if (query.priceFrom) priceFilter.$gte = query.priceFrom;
      if (query.priceTo) priceFilter.$lte = query.priceTo;
      mongoQuery["pricing.priceFrom"] = priceFilter;
    }

    // Free events filter
    if (query.isFree === 'true' || query.isFree === true) {
      mongoQuery['pricing.isFree'] = true;
    }

    // Tags filter
    if (query.tags) {
      const tagsArray = query.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase());
      mongoQuery.tags = { $in: tagsArray };
    }

    // Featured filter
    if (query.featured === true) {
      mongoQuery.isFeatured = true;
    }

    // Text search
    if (query.q) {
      const categoryMatch = await Category.findOne({
        name: { $regex: new RegExp(`^${query.q}$`, "i") },
      });

      if (categoryMatch) {
        logger.debug(`Found category match: ${categoryMatch.name}`);
        mongoQuery.category = categoryMatch._id;
      } else {
        mongoQuery.$text = { $search: query.q };
      }
    }

    // Pagination
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    // Sorting
    let sort: any = { "dateTime.start": 1 };

    if (query.sort) {
      const sortOrder = query.order === "desc" ? -1 : 1;
      switch (query.sort) {
        case "date":
          sort = { "dateTime.start": sortOrder };
          break;
        case "title":
          sort = { title: sortOrder };
          break;
        case "created":
          sort = { createdAt: sortOrder };
          break;
        case "popularity":
          sort = { "stats.views": sortOrder };
          break;
        default:
          sort = { "dateTime.start": 1 };
      }
    }

    if (query.q && !mongoQuery.category) {
      sort = { score: { $meta: "textScore" }, ...sort };
    }

    // Execute query
    const events = await Event.find(mongoQuery)
      .populate("category", "name slug color")
      .populate("location", "name city address venue")
      .select(
        "title shortDescription dateTime pricing media seo stats status isFeatured"
      )
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(mongoQuery);
    const pages = Math.ceil(total / limit);

    logger.info(`Found ${events.length} events (${total} total)`);

    const response: ApiResponse = {
      success: true,
      data: events,
      message: `Found ${events.length} events`,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error getting events', { error });

    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch events",
    };

    res.status(500).json(response);
  }
};

// ============= GET SINGLE EVENT =============
export const getEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: "Event ID is required",
      };

      res.status(400).json(response);
      return;
    }

    logger.debug(`Getting event with ID: ${id}`);

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    let query;
    if (isValidObjectId) {
      query = { _id: id };
    } else {
      query = { "seo.slug": id };
    }

    const event = await Event.findOne(query)
      .populate("category", "name slug description color")
      .populate("location", "name address city region venue coordinates");

    if (!event) {
      const response: ApiResponse = {
        success: false,
        error: "Event not found",
      };

      res.status(404).json(response);
      return;
    }

    // Increment view count
    event.stats.views += 1;
    await event.save();

    logger.debug(`Found event: ${event.title}`);

    const response: ApiResponse = {
      success: true,
      data: event,
      message: "Event found",
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error getting event', { error });

    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch event",
    };

    res.status(500).json(response);
  }
};

// ============= CREATE EVENT =============
export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const eventData: CreateEventDTO = req.body;
    logger.info('Creating new event', { title: eventData.title });

    // Validate required fields
    const requiredFields: (keyof CreateEventDTO)[] = [
      "title",
      "description",
      "category",
      "location",
      "dateTime",
      "pricing",
      "organizer",
      "source",
    ];
    const missingFields = requiredFields.filter((field) => !eventData[field]);

    if (missingFields.length > 0) {
      const response: ApiResponse = {
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      };

      res.status(400).json(response);
      return;
    }

    // Generate SEO slug if not provided
    if (!eventData.seo?.slug) {
      const baseSlug = eventData.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      const date = new Date(eventData.dateTime.start)
        .toISOString()
        .split("T")[0];
      const generatedSlug = `${baseSlug}-${date}`;

      eventData.seo = {
        ...eventData.seo,
        slug: generatedSlug,
      };
    }

    // Check for duplicate slug
    const existingEvent = await Event.findOne({
      "seo.slug": eventData.seo.slug,
    });
    if (existingEvent) {
      const response: ApiResponse = {
        success: false,
        error: "Event with this slug already exists",
      };

      res.status(409).json(response);
      return;
    }

    const event = new Event(eventData);
    const savedEvent = await event.save();

    await savedEvent.populate("category location");

    logger.info(`Event created: ${savedEvent.title}`, { id: savedEvent._id });

    const response: ApiResponse = {
      success: true,
      data: savedEvent,
      message: "Event created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating event', { error });

    if ((error as any).name === "ValidationError") {
      const validationErrors = Object.values((error as any).errors).map(
        (err: any) => err.message
      );

      const response: ApiResponse = {
        success: false,
        error: "Validation failed",
        details: validationErrors,
      };

      res.status(400).json(response);
      return;
    }

    if ((error as any).code === 11000) {
      const response: ApiResponse = {
        success: false,
        error: "Event with this slug already exists",
      };

      res.status(409).json(response);
      return;
    }

    const response: ApiResponse = {
      success: false,
      error: "Failed to create event",
    };

    res.status(500).json(response);
  }
};

// ============= UPDATE EVENT =============
export const updateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: "Event ID is required",
      };

      res.status(400).json(response);
      return;
    }

    logger.info(`Updating event: ${id}`);

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    let query;
    if (isValidObjectId) {
      query = { _id: id };
    } else {
      query = { "seo.slug": id };
    }

    const event = await Event.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true,
    }).populate("category location");

    if (!event) {
      const response: ApiResponse = {
        success: false,
        error: "Event not found",
      };

      res.status(404).json(response);
      return;
    }

    logger.info(`Event updated: ${event.title}`);

    const response: ApiResponse = {
      success: true,
      data: event,
      message: "Event updated successfully",
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error updating event', { error });

    if ((error as any).name === "ValidationError") {
      const validationErrors = Object.values((error as any).errors).map(
        (err: any) => err.message
      );

      const response: ApiResponse = {
        success: false,
        error: "Validation failed",
        details: validationErrors,
      };

      res.status(400).json(response);
      return;
    }

    const response: ApiResponse = {
      success: false,
      error: "Failed to update event",
    };

    res.status(500).json(response);
  }
};

// ============= DELETE EVENT =============
export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: "Event ID is required",
      };

      res.status(400).json(response);
      return;
    }

    logger.info(`Deleting event: ${id}`);

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    let query;
    if (isValidObjectId) {
      query = { _id: id };
    } else {
      query = { "seo.slug": id };
    }

    const event = await Event.findOneAndDelete(query);

    if (!event) {
      const response: ApiResponse = {
        success: false,
        error: "Event not found",
      };

      res.status(404).json(response);
      return;
    }

    logger.info(`Event deleted: ${event.title}`);

    const response: ApiResponse = {
      success: true,
      message: "Event deleted successfully",
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error deleting event', { error });

    const response: ApiResponse = {
      success: false,
      error: "Failed to delete event",
    };

    res.status(500).json(response);
  }
};