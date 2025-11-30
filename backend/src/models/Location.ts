import mongoose, { Schema, model } from 'mongoose';
import { ILocation, ICoordinates, IVenue } from '@/types';

// Sub-schema pro coordinates
const CoordinatesSchema = new Schema<ICoordinates>({
  latitude: {
    type: Number,
    required: true,
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    required: true,
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  }
}, { _id: false });

// Sub-schema pro venue
const VenueSchema = new Schema<IVenue>({
  type: {
    type: String,
    enum: ['arena', 'theater', 'club', 'outdoor', 'online', 'other'],
    default: 'other'
  },
  capacity: {
    type: Number,
    min: [0, 'Capacity cannot be negative']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Website must be a valid URL']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[0-9\s\-\(\)]+$/, 'Phone must be a valid phone number']
  }
}, { _id: false });

// Hlavní Location schema
const LocationSchema = new Schema<ILocation>({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [200, 'Location name cannot exceed 200 characters']
  },
  
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [300, 'Address cannot exceed 300 characters']
  },
  
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  
  region: {
    type: String,
    required: [true, 'Region is required'],
    trim: true,
    maxlength: [100, 'Region name cannot exceed 100 characters']
  },
  
  postalCode: {
    type: String,
    trim: true,
    match: [/^\d{3}\s?\d{2}$/, 'Postal code must be in format 12345 or 123 45']
  },
  
  country: {
    type: String,
    required: true,
    default: 'ČR',
    trim: true,
    maxlength: [50, 'Country name cannot exceed 50 characters']
  },
  
  coordinates: {
    type: CoordinatesSchema,
    required: false
  },
  
  venue: {
    type: VenueSchema,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============= INDEXES =============

// Geospatial index pro coordinates
LocationSchema.index({ coordinates: '2dsphere' });

// Compound indexes
LocationSchema.index({ city: 1, region: 1 });
LocationSchema.index({ 'venue.type': 1, city: 1 });

// Text index pro vyhledávání
LocationSchema.index({
  name: 'text',
  address: 'text',
  city: 'text'
});

// ============= VIRTUAL FIELDS =============

// Virtual pro počet událostí na lokaci
LocationSchema.virtual('eventCount', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'location',
  count: true
});

// Virtual pro full address string
LocationSchema.virtual('fullAddress').get(function() {
  const parts = [this.address, this.city];
  if (this.postalCode) parts.push(this.postalCode);
  if (this.region !== this.city) parts.push(this.region);
  return parts.join(', ');
});

// ============= STATIC METHODS =============

// Statická metoda pro vyhledání lokací v okolí
LocationSchema.statics.findNearby = function(
  longitude: number, 
  latitude: number, 
  maxDistance: number = 5000 // metry
) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// Statická metoda pro vyhledání podle města
LocationSchema.statics.findByCity = function(city: string) {
  return this.find({ 
    city: new RegExp(city, 'i') 
  }).sort({ name: 1 });
};

// Statická metoda pro vyhledání podle typu venue
LocationSchema.statics.findByVenueType = function(venueType: string) {
  return this.find({ 
    'venue.type': venueType 
  }).sort({ name: 1 });
};

// ============= INSTANCE METHODS =============

// Instance metoda pro výpočet vzdálenosti od bodu
LocationSchema.methods.distanceFrom = function(
  longitude: number, 
  latitude: number
): number | null {
  if (!this.coordinates) return null;
  
  // Haversine formula pro výpočet vzdálenosti
  const R = 6371000; // Poloměr Země v metrech
  const φ1 = this.coordinates.latitude * Math.PI / 180;
  const φ2 = latitude * Math.PI / 180;
  const Δφ = (latitude - this.coordinates.latitude) * Math.PI / 180;
  const Δλ = (longitude - this.coordinates.longitude) * Math.PI / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Vzdálenost v metrech
};

// Export modelu
export const Location = model<ILocation>('Location', LocationSchema);

// Export default locations pro seeding
export const defaultLocations = [
  {
    name: 'O2 Arena',
    address: 'Českomoravská 2345/17',
    city: 'Praha',
    region: 'Praha',
    postalCode: '190 00',
    country: 'ČR',
    coordinates: { latitude: 50.1036, longitude: 14.5206 },
    venue: { type: 'arena', capacity: 18000, website: 'https://www.o2arena.cz' }
  },
  {
    name: 'Národní divadlo',
    address: 'Národní 2',
    city: 'Praha',
    region: 'Praha', 
    postalCode: '110 00',
    country: 'ČR',
    coordinates: { latitude: 50.0811, longitude: 14.4137 },
    venue: { type: 'theater', capacity: 1500, website: 'https://www.narodni-divadlo.cz' }
  },
  {
    name: 'Janáčkovo divadlo',
    address: 'Rooseveltova 1',
    city: 'Brno',
    region: 'Jihomoravský',
    postalCode: '602 00',
    country: 'ČR',
    coordinates: { latitude: 49.1925, longitude: 16.6070 },
    venue: { type: 'theater', capacity: 1155, website: 'https://www.ndbrno.cz' }
  },
  {
    name: 'Dolní Vítkovice',
    address: 'Ruská 2993/37',
    city: 'Ostrava',
    region: 'Moravskoslezský',
    postalCode: '703 00',
    country: 'ČR',
    coordinates: { latitude: 49.8164, longitude: 18.2765 },
    venue: { type: 'outdoor', capacity: 25000, website: 'https://www.dolnivitkovice.cz' }
  }
];