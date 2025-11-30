import mongoose, { Schema, model } from 'mongoose';
import { ICategory } from '@/types';

// Schema pro Category
const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
    unique: true
  },
  
  slug: {
    type: String,
    required: false, // Změneno z true - bude se generovat automaticky
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and hyphens']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  icon: {
    type: String,
    trim: true,
    maxlength: [50, 'Icon name cannot exceed 50 characters']
  },
  
  color: {
    type: String,
    trim: true,
    match: [/^#([0-9A-F]{3}){1,2}$/i, 'Color must be a valid hex color']
  },
  
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, // Automaticky přidá createdAt a updatedAt
  toJSON: { virtuals: true }, // Zahrnuje virtual fields do JSON
  toObject: { virtuals: true }
});

// ============= INDEXES =============

// Compound index pro rychlé vyhledávání
CategorySchema.index({ name: 1, isActive: 1 });
CategorySchema.index({ parentCategory: 1, isActive: 1 });

// Text index pro fulltextové vyhledávání
CategorySchema.index({
  name: 'text',
  description: 'text'
});

// ============= VIRTUAL FIELDS =============

// Virtual pro získání child kategorií
CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Virtual pro počet událostí v kategorii (implementujeme později)
CategorySchema.virtual('eventCount', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// ============= MIDDLEWARE =============

// Pre-save middleware pro automatické generování slug
CategorySchema.pre('save', function(next) {
  // Vždy generuj slug z názvu
  if (this.isModified('name') || !this.slug) {
    // Generuje slug z názvu: "Koncerty Rock" -> "koncerty-rock"
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Odstraní speciální znaky
      .replace(/\s+/g, '-') // Nahradí mezery pomlčkami
      .replace(/-+/g, '-'); // Nahradí více pomlček jednou
  }
  next();
});

// Pre-remove middleware pro kontrolu child kategorií
CategorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Zkontroluj, jestli existují child kategorie
    const childCount = await mongoose.model('Category').countDocuments({ 
      parentCategory: this._id 
    });
    
    if (childCount > 0) {
      const error = new Error(`Cannot delete category with ${childCount} subcategories`);
      (error as any).statusCode = 400;
      return next(error);
    }
    
    // Zkontroluj, jestli existují události v této kategorii (implementujeme později)
    // const eventCount = await mongoose.model('Event').countDocuments({ 
    //   category: this._id 
    // });
    // if (eventCount > 0) {
    //   const error = new Error(`Cannot delete category with ${eventCount} events`);
    //   return next(error);
    // }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ============= STATIC METHODS =============

// Statická metoda pro získání root kategorií (bez parent)
CategorySchema.statics.getRootCategories = function() {
  return this.find({ 
    parentCategory: null, 
    isActive: true 
  }).sort({ name: 1 });
};

// Statická metoda pro získání category tree
CategorySchema.statics.getCategoryTree = async function() {
  const categories = await this.find({ isActive: true })
    .populate('children')
    .sort({ name: 1 });
  
  // Filtruj pouze root kategorie, children se načtou přes populate
  return categories.filter((cat: any) => !cat.parentCategory);
};

// Statická metoda pro vyhledávání podle názvu
CategorySchema.statics.searchByName = function(searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true
  }).sort({ score: { $meta: 'textScore' } });
};

// ============= INSTANCE METHODS =============

// Instance metoda pro získání full path kategorie
CategorySchema.methods.getFullPath = async function(): Promise<string> {
  let path = this.name;
  let current: any = this;
  
  while (current.parentCategory) {
    current = await mongoose.model('Category').findById(current.parentCategory);
    if (current) {
      path = `${current.name} > ${path}`;
    } else {
      break;
    }
  }
  
  return path;
};

// Instance metoda pro soft delete
CategorySchema.methods.softDelete = function() {
  this.isActive = false;
  return this.save();
};

// ============= EXPORT =============

// Export modelu
export const Category = model<ICategory>('Category', CategorySchema);

// Export default categories pro seeding
export const defaultCategories = [
  {
    name: 'Koncerty',
    slug: 'koncerty',
    description: 'Hudební koncerty všech žánrů',
    icon: 'music',
    color: '#FF6B6B'
  },
  {
    name: 'Divadla',
    slug: 'divadla',
    description: 'Divadelní představení a muzikály',
    icon: 'theater',
    color: '#4ECDC4'
  },
  {
    name: 'Sport',
    slug: 'sport',
    description: 'Sportovní události a zápasy',
    icon: 'sports',
    color: '#45B7D1'
  },
  {
    name: 'Výstavy',
    slug: 'vystavy',
    description: 'Umělecké výstavy a galerie',
    icon: 'palette',
    color: '#96CEB4'
  },
  {
    name: 'Vzdělávání',
    slug: 'vzdelavani',
    description: 'Přednášky, workshopy a kurzy',
    icon: 'school',
    color: '#FFEAA7'
  },
  {
    name: 'Festivaly',
    slug: 'festivaly',
    description: 'Hudební a kulturní festivaly',
    icon: 'festival',
    color: '#DDA0DD'
  },
  {
    name: 'Film',
    slug: 'film',
    description: 'Filmové projekce a premiéry',
    icon: 'movie',
    color: '#FFB6C1'
  },
  {
    name: 'Gastro',
    slug: 'gastro',
    description: 'Gastronomické události a degustace',
    icon: 'restaurant',
    color: '#F0AD4E'
  }
];