import mongoose, { Schema, model } from 'mongoose';
import { IEvent, IEventDateTime, IEventPricing, IEventMedia, IEventLinks, IEventOrganizer, IEventSource, IEventSEO, IEventStats, EventStatus } from '@/types';

// Sub-schema pro date/time
const EventDateTimeSchema = new Schema<IEventDateTime>({
  start: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(date: Date) {
        return date >= new Date();
      },
      message: 'Start date cannot be in the past'
    }
  },
  end: {
    type: Date,
    validate: {
      validator: function(this: any, date: Date) {
        return !date || date >= this.start;
      },
      message: 'End date must be after start date'
    }
  },
  isMultiDay: {
    type: Boolean,
    default: false
  },
  timezone: {
    type: String,
    default: 'Europe/Prague'
  }
}, { _id: false });

// Sub-schema pro pricing
const EventPricingSchema = new Schema<IEventPricing>({
  isFree: {
    type: Boolean,
    default: false
  },
  currency: {
    type: String,
    default: 'CZK',
    enum: ['CZK', 'EUR', 'USD']
  },
  priceFrom: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  priceTo: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(this: any, price: number) {
        return !price || !this.priceFrom || price >= this.priceFrom;
      },
      message: 'Price to must be greater than price from'
    }
  },
  priceNote: {
    type: String,
    trim: true,
    maxlength: [200, 'Price note cannot exceed 200 characters']
  }
}, { _id: false });

// Sub-schema pro media
const EventMediaSchema = new Schema<IEventMedia>({
  mainImage: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Main image must be a valid URL']
  },
  gallery: [{
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Gallery image must be a valid URL']
  }],
  videos: [{
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Video must be a valid URL']
  }]
}, { _id: false });

// Sub-schema pro links
const EventLinksSchema = new Schema<IEventLinks>({
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Website must be a valid URL']
  },
  ticketing: [{
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Ticketing URL must be valid']
  }],
  facebook: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?(facebook|fb)\.com\/.+/, 'Facebook URL must be valid']
  },
  instagram: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?instagram\.com\/.+/, 'Instagram URL must be valid']
  }
}, { _id: false });

// Sub-schema pro organizer
const EventOrganizerSchema = new Schema<IEventOrganizer>({
  name: {
    type: String,
    required: [true, 'Organizer name is required'],
    trim: true,
    maxlength: [200, 'Organizer name cannot exceed 200 characters']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Organizer website must be a valid URL']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Organizer email must be valid']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[0-9\s\-\(\)]+$/, 'Phone must be a valid phone number']
  }
}, { _id: false });

// Sub-schema pro source
const EventSourceSchema = new Schema<IEventSource>({
  platform: {
    type: String,
    required: [true, 'Source platform is required'],
    enum: ['facebook', 'eventbrite', 'scraped_web', 'manual', 'api']
  },
  sourceId: {
    type: String,
    trim: true
  },
  sourceUrl: {
    type: String,
    required: [true, 'Source URL is required'],
    trim: true,
    match: [/^https?:\/\/.+/, 'Source URL must be valid']
  },
  lastSynced: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Sub-schema pro SEO
const EventSEOSchema = new Schema<IEventSEO>({
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  slug: {
    type: String,
    required: [true, 'SEO slug is required'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and hyphens']
  }
}, { _id: false });

// Sub-schema pro stats
const EventStatsSchema = new Schema<IEventStats>({
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  favorites: {
    type: Number,
    default: 0,
    min: [0, 'Favorites cannot be negative']
  },
  shares: {
    type: Number,
    default: 0,
    min: [0, 'Shares cannot be negative']
  }
}, { _id: false });

// Hlavní Event schema
const EventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  
  subcategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Subcategory cannot exceed 100 characters']
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  dateTime: {
    type: EventDateTimeSchema,
    required: true
  },
  
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: [true, 'Location is required']
  },
  
  pricing: {
    type: EventPricingSchema,
    required: true
  },
  
  media: {
    type: EventMediaSchema,
    default: () => ({ gallery: [], videos: [] })
  },
  
  links: {
    type: EventLinksSchema,
    default: () => ({ ticketing: [] })
  },
  
  organizer: {
    type: EventOrganizerSchema,
    required: true
  },
  
  source: {
    type: EventSourceSchema,
    required: true
  },
  
  status: {
    type: String,
    enum: ['active', 'cancelled', 'postponed', 'sold_out'],
    default: 'active'
  },
  
  seo: {
    type: EventSEOSchema,
    required: true
  },
  
  stats: {
    type: EventStatsSchema,
    default: () => ({ views: 0, favorites: 0, shares: 0 })
  },
  
  isPublished: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============= INDEXES =============

// Compound indexes pro optimální výkon
EventSchema.index({ 'dateTime.start': 1, status: 1, isPublished: 1 });
EventSchema.index({ category: 1, 'dateTime.start': 1 });
EventSchema.index({ location: 1, 'dateTime.start': 1 });
EventSchema.index({ status: 1, isPublished: 1, isFeatured: -1 });

// Text index pro fulltextové vyhledávání
EventSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    tags: 5,
    description: 1
  }
});

// ============= VIRTUAL FIELDS =============

// Virtual pro URL události
EventSchema.virtual('url').get(function() {
  return `/events/${this.seo.slug}`;
});

// Virtual pro kontrolu, jestli událost už proběhla
EventSchema.virtual('isPast').get(function() {
  const endDate = this.dateTime.end || this.dateTime.start;
  return endDate < new Date();
});

// Virtual pro kontrolu, jestli událost probíhá
EventSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  const endDate = this.dateTime.end || this.dateTime.start;
  return this.dateTime.start <= now && endDate >= now;
});

// Virtual pro formatted price
EventSchema.virtual('formattedPrice').get(function() {
  if (this.pricing.isFree) return 'Zdarma';
  if (!this.pricing.priceFrom) return 'Cena nezveřejněna';
  
  const currency = this.pricing.currency === 'CZK' ? 'Kč' : this.pricing.currency;
  
  if (this.pricing.priceTo && this.pricing.priceTo !== this.pricing.priceFrom) {
    return `${this.pricing.priceFrom} - ${this.pricing.priceTo} ${currency}`;
  }
  return `${this.pricing.priceFrom} ${currency}`;
});

// ============= STATIC METHODS =============

// Vyhledání nadcházejících událostí
EventSchema.statics.findUpcoming = function(limit = 50) {
  return this.find({
    'dateTime.start': { $gte: new Date() },
    status: 'active',
    isPublished: true
  })
  .populate('category location')
  .sort({ 'dateTime.start': 1 })
  .limit(limit);
};

// Vyhledání featured událostí
EventSchema.statics.findFeatured = function(limit = 10) {
  return this.find({
    isFeatured: true,
    'dateTime.start': { $gte: new Date() },
    status: 'active',
    isPublished: true
  })
  .populate('category location')
  .sort({ 'dateTime.start': 1 })
  .limit(limit);
};

// Vyhledání podle kategorie
EventSchema.statics.findByCategory = function(categoryId: any, limit = 50) {
  return this.find({
    category: categoryId,
    'dateTime.start': { $gte: new Date() },
    status: 'active',
    isPublished: true
  })
  .populate('category location')
  .sort({ 'dateTime.start': 1 })
  .limit(limit);
};

// Fulltextové vyhledávání
EventSchema.statics.searchEvents = function(searchTerm: string, filters: any = {}) {
  const query: any = {
    $text: { $search: searchTerm },
    'dateTime.start': { $gte: new Date() },
    status: 'active',
    isPublished: true,
    ...filters
  };
  
  return this.find(query)
    .populate('category location')
    .sort({ score: { $meta: 'textScore' }, 'dateTime.start': 1 })
    .limit(50);
};

// Vyhledání podle lokace
EventSchema.statics.findByLocation = function(locationId: any, limit = 50) {
  return this.find({
    location: locationId,
    'dateTime.start': { $gte: new Date() },
    status: 'active',
    isPublished: true
  })
  .populate('category location')
  .sort({ 'dateTime.start': 1 })
  .limit(limit);
};

// ============= INSTANCE METHODS =============

// Instance metoda pro zvýšení počtu zobrazení
EventSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

// Instance metoda pro zvýšení počtu oblíbených
EventSchema.methods.incrementFavorites = function() {
  this.stats.favorites += 1;
  return this.save();
};

// Instance metoda pro snížení počtu oblíbených
EventSchema.methods.decrementFavorites = function() {
  if (this.stats.favorites > 0) {
    this.stats.favorites -= 1;
  }
  return this.save();
};

// Instance metoda pro zvýšení počtu sdílení
EventSchema.methods.incrementShares = function() {
  this.stats.shares += 1;
  return this.save();
};

// Instance metoda pro publikování události
EventSchema.methods.publish = function() {
  this.isPublished = true;
  this.publishedAt = new Date();
  return this.save();
};

// Instance metoda pro zrušení publikování
EventSchema.methods.unpublish = function() {
  this.isPublished = false;
  this.publishedAt = undefined;
  return this.save();
};

// ============= MIDDLEWARE =============

// Pre-save middleware pro automatické generování slug
EventSchema.pre('save', function(next) {
  if (this.isModified('title') && (!this.seo.slug || this.isNew)) {
    const baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    // Přidej datum pro uniqueness
    const date = this.dateTime.start.toISOString().split('T')[0];
    this.seo.slug = `${baseSlug}-${date}`;
  }
  
  // Auto-generate shortDescription pokud není
  if (this.isModified('description') && !this.shortDescription) {
    this.shortDescription = this.description
      .substring(0, 250)
      .trim() + '...';
  }
  
  // Auto-generate SEO fields
  if (this.isModified('title') && !this.seo.metaTitle) {
    this.seo.metaTitle = this.title.substring(0, 60);
  }
  
  if (this.isModified('shortDescription') && !this.seo.metaDescription) {
    this.seo.metaDescription = (this.shortDescription || this.description)
      .substring(0, 160);
  }
  
  next();
});

// Pre-save middleware pro validaci dat
EventSchema.pre('save', function(next) {
  // Kontrola pricing konzistence
  if (!this.pricing.isFree && !this.pricing.priceFrom) {
    const error = new Error('Price is required for paid events');
    (error as any).statusCode = 400;
    return next(error);
  }
  
  if (this.pricing.isFree) {
    this.pricing.priceFrom = undefined;
    this.pricing.priceTo = undefined;
  }
  
  next();
});

// Post-save middleware pro aktualizaci related dokumentů
EventSchema.post('save', async function(doc: any) {
  try {
    // Aktualizuj category eventCount virtual
    // Aktualizuj location eventCount virtual
    // Toto se dělá automaticky přes virtuals
  } catch (error) {
    console.error('Error in post-save middleware:', error);
  }
});

// Export modelu
export const Event = model<IEvent>('Event', EventSchema);