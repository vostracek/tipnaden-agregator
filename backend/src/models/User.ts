import mongoose, { Schema, model } from 'mongoose';
import { IUser, IUserPreferences } from '@/types';

// Sub-schema pro user preferences
const UserPreferencesSchema = new Schema<IUserPreferences>({
  favoriteCategories: [{
    type: String,
    trim: true
  }],
  favoriteLocations: [{
    type: String,
    trim: true
  }],
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Hlavní User schema
const UserSchema = new Schema<IUser>({
  clerkId: {
    type: String,
    required: [true, 'Clerk ID is required'],
    unique: true,
    trim: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email must be valid']
  },
  
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  avatar: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Avatar must be a valid URL']
  },
  
  preferences: {
    type: UserPreferencesSchema,
    default: () => ({
      favoriteCategories: [],
      favoriteLocations: [],
      notificationsEnabled: true,
      emailNotifications: false
    })
  },
  
  favoriteEvents: [{
    type: Schema.Types.ObjectId,
    ref: 'Event'
  }],
  
  attendedEvents: [{
    type: Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============= INDEXES =============

// Unique indexes
UserSchema.index({ clerkId: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

// Query indexes
UserSchema.index({ 'preferences.favoriteCategories': 1 });
UserSchema.index({ 'preferences.favoriteLocations': 1 });
UserSchema.index({ favoriteEvents: 1 });

// ============= VIRTUAL FIELDS =============

// Virtual pro full name
UserSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || this.email.split('@')[0];
});

// Virtual pro počet oblíbených událostí
UserSchema.virtual('favoriteEventsCount').get(function() {
  return this.favoriteEvents.length;
});

// Virtual pro počet navštívených událostí
UserSchema.virtual('attendedEventsCount').get(function() {
  return this.attendedEvents.length;
});

// ============= STATIC METHODS =============

// Statická metoda pro vyhledání podle Clerk ID
UserSchema.statics.findByClerkId = function(clerkId: string) {
  return this.findOne({ clerkId });
};

// Statická metoda pro vyhledání podle emailu
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Statická metoda pro získání uživatelů s podobnými preferencemi
UserSchema.statics.findWithSimilarPreferences = function(userId: any) {
  return this.aggregate([
    { $match: { _id: { $ne: userId } } },
    {
      $addFields: {
        similarityScore: {
          $size: {
            $setIntersection: [
              '$preferences.favoriteCategories',
              // Toto by mělo být dynamické podle konkrétního uživatele
              []
            ]
          }
        }
      }
    },
    { $match: { similarityScore: { $gt: 0 } } },
    { $sort: { similarityScore: -1 } },
    { $limit: 10 }
  ]);
};

// ============= INSTANCE METHODS =============

// Instance metoda pro přidání oblíbené události
UserSchema.methods.addFavoriteEvent = function(eventId: any) {
  if (!this.favoriteEvents.includes(eventId)) {
    this.favoriteEvents.push(eventId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance metoda pro odebrání oblíbené události
UserSchema.methods.removeFavoriteEvent = function(eventId: any) {
  this.favoriteEvents = this.favoriteEvents.filter(
    (id: any) => !id.equals(eventId)
  );
  return this.save();
};

// Instance metoda pro přidání navštívené události
UserSchema.methods.addAttendedEvent = function(eventId: any) {
  if (!this.attendedEvents.includes(eventId)) {
    this.attendedEvents.push(eventId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance metoda pro kontrolu, jestli má událost v oblíbených
UserSchema.methods.hasFavoriteEvent = function(eventId: any): boolean {
  return this.favoriteEvents.some((id: any) => id.equals(eventId));
};

// Instance metoda pro kontrolu, jestli navštívil událost
UserSchema.methods.hasAttendedEvent = function(eventId: any): boolean {
  return this.attendedEvents.some((id: any) => id.equals(eventId));
};

// Instance metoda pro aktualizaci preferencí
UserSchema.methods.updatePreferences = function(newPreferences: Partial<IUserPreferences>) {
  this.preferences = { ...this.preferences.toObject(), ...newPreferences };
  return this.save();
};

// Instance metoda pro získání doporučených kategorií
UserSchema.methods.getRecommendedCategories = function() {
  // Jednoduchá logika - nejčastější kategorie z oblíbených událostí
  // V budoucnu může být sofistikovanější ML algoritmus
  return this.populate({
    path: 'favoriteEvents',
    populate: {
      path: 'category',
      select: 'name slug'
    }
  }).then((user: any) => {
    const categoryCount: { [key: string]: number } = {};
    
    user.favoriteEvents.forEach((event: any) => {
      if (event.category) {
        const categoryName = event.category.name;
        categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
      }
    });
    
    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);
  });
};

// ============= MIDDLEWARE =============

// Pre-save middleware pro normalizaci emailu
UserSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// Export modelu
export const User = model<IUser>('User', UserSchema);