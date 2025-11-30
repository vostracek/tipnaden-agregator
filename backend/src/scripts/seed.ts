import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category, defaultCategories } from '../models/Category';
import { Location, defaultLocations } from '../models/Location';
import { User } from '../models/User';
import { Event } from '../models/Event';

// Load environment variables
dotenv.config();

// Database connection
const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }
  
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
};

// Seed Categories
const seedCategories = async () => {
  console.log('Seeding categories...');
  
  await Category.deleteMany({});
  
  const categories = await Category.insertMany(defaultCategories);
  console.log(`Created ${categories.length} categories`);
  
  return categories;
};

// Seed Locations
const seedLocations = async () => {
  console.log('Seeding locations...');
  
  await Location.deleteMany({});
  
  const extendedLocations = [
    ...defaultLocations,
    {
      name: 'Palác Akropolis',
      address: 'Kubelíkova 27',
      city: 'Praha',
      region: 'Praha',
      postalCode: '130 00',
      country: 'ČR',
      coordinates: { latitude: 50.0765, longitude: 14.4515 },
      venue: { type: 'club', capacity: 400, website: 'https://www.palacakropolis.cz' }
    },
    {
      name: 'Sono Centrum',
      address: 'Hradební 29',
      city: 'Brno',
      region: 'Jihomoravský',
      postalCode: '602 00',
      country: 'ČR',
      coordinates: { latitude: 49.1996, longitude: 16.6075 },
      venue: { type: 'arena', capacity: 12000, website: 'https://www.sonocentrum.cz' }
    },
    {
      name: 'Nová Chmelnice',
      address: 'Koněvova 219',
      city: 'Praha',
      region: 'Praha',
      postalCode: '130 00',
      country: 'ČR',
      coordinates: { latitude: 50.0958, longitude: 14.4586 },
      venue: { type: 'club', capacity: 200, website: 'https://www.novachmelnice.cz' }
    }
  ];
  
  const locations = await Location.insertMany(extendedLocations);
  console.log(`Created ${locations.length} locations`);
  
  return locations;
};

// Seed Users
const seedUsers = async () => {
  console.log('Seeding users...');
  
  await User.deleteMany({});
  
  const testUsers = [
    {
      clerkId: 'user_test_1',
      email: 'jan.novak@example.com',
      firstName: 'Jan',
      lastName: 'Novák',
      preferences: {
        favoriteCategories: ['koncerty', 'divadla'],
        favoriteLocations: ['Praha', 'Brno'],
        notificationsEnabled: true,
        emailNotifications: false
      }
    }
  ];
  
  const users = await User.insertMany(testUsers);
  console.log(`Created ${users.length} users`);
  
  return users;
};

// Funkce pro odstranění diakritiky
const removeDiacritics = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// Seed Events
const seedEvents = async (categories: any[], locations: any[]) => {
  console.log('Seeding events...');
  
  await Event.deleteMany({});
  
  const now = new Date();
  const futureDate = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  const koncertyCategory = categories.find(c => c.name === 'Koncerty');
  const divadlaCategory = categories.find(c => c.name === 'Divadla');
  const sportCategory = categories.find(c => c.name === 'Sport');
  const festivalyCategory = categories.find(c => c.name === 'Festivaly');
  
  const o2Arena = locations.find(l => l.name === 'O2 Arena');
  const narDivadlo = locations.find(l => l.name === 'Národní divadlo');
  const akropolis = locations.find(l => l.name === 'Palác Akropolis');
  
  const sampleEvents: any[] = [
    {
      title: 'Olympic - Podzimní turné 2024',
      description: 'Legendární česká rocková skupina Olympic se vrací s novým turné. Zahrajou největší hity i nové písně z připravovaného alba.',
      shortDescription: 'Olympic na podzimním turné s největšími hity',
      category: koncertyCategory?._id,
      tags: ['rock', 'česká hudba'],
      dateTime: {
        start: futureDate(30),
        isMultiDay: false,
        timezone: 'Europe/Prague'
      },
      location: o2Arena?._id,
      pricing: {
        isFree: false,
        currency: 'CZK',
        priceFrom: 690,
        priceTo: 1890
      },
      organizer: {
        name: 'Barong Entertainment',
        email: 'info@barong.cz'
      },
      source: {
        platform: 'manual',
        sourceUrl: 'https://tipnaden.cz'
      },
      seo: {
        slug: 'olympic-podzimni-turne-2024'
      },
      isPublished: true,
      isFeatured: true
    },
    {
      title: 'Lucie - Akustické turné',
      description: 'Kultovní skupina Lucie představí své největší hity v akustickém provedení. Intimní koncert v menším prostoru.',
      shortDescription: 'Lucie akusticky',
      category: koncertyCategory?._id,
      tags: ['rock', 'akustické'],
      dateTime: {
        start: futureDate(45),
        isMultiDay: false,
        timezone: 'Europe/Prague'
      },
      location: akropolis?._id,
      pricing: {
        isFree: false,
        currency: 'CZK',
        priceFrom: 490,
        priceTo: 890
      },
      organizer: {
        name: 'Klubové koncerty s.r.o.',
        email: 'info@klubovekoncerty.cz'
      },
      source: {
        platform: 'manual',
        sourceUrl: 'https://tipnaden.cz'
      },
      seo: {
        slug: 'lucie-akusticke-turne'
      },
      isPublished: true
    },
    {
      title: 'Hamlet - Národní divadlo',
      description: 'Shakespearův nesmrtelný Hamlet v novém nastudování Národního divadla. Režie: Jan Burian, v hlavní roli: David Prachař.',
      shortDescription: 'Hamlet v Národním divadle',
      category: divadlaCategory?._id,
      tags: ['shakespeare', 'drama', 'klasika'],
      dateTime: {
        start: futureDate(14),
        isMultiDay: false,
        timezone: 'Europe/Prague'
      },
      location: narDivadlo?._id,
      pricing: {
        isFree: false,
        currency: 'CZK',
        priceFrom: 290,
        priceTo: 890
      },
      organizer: {
        name: 'Národní divadlo',
        email: 'info@narodni-divadlo.cz'
      },
      source: {
        platform: 'manual',
        sourceUrl: 'https://tipnaden.cz'
      },
      seo: {
        slug: 'hamlet-narodni-divadlo'
      },
      isPublished: true
    },
    {
      title: 'HC Sparta Praha vs HC Plzeň',
      description: 'Prestižní hokejový zápas mezi pražskou Spartou a plzeňským HC Plzeň. Derby v rámci extraligy.',
      shortDescription: 'Hokejové derby',
      category: sportCategory?._id,
      tags: ['hokej', 'sparta', 'extraliga'],
      dateTime: {
        start: futureDate(21),
        isMultiDay: false,
        timezone: 'Europe/Prague'
      },
      location: o2Arena?._id,
      pricing: {
        isFree: false,
        currency: 'CZK',
        priceFrom: 390,
        priceTo: 1290
      },
      organizer: {
        name: 'HC Sparta Praha',
        email: 'tickets@hcsparta.cz'
      },
      source: {
        platform: 'manual',
        sourceUrl: 'https://tipnaden.cz'
      },
      seo: {
        slug: 'sparta-plzen-hokej'
      },
      isPublished: true
    },
    {
      title: 'Rock for People 2025',
      description: 'Největší český rockový festival oznamuje první vlnu interpretů. Předprodej Early Bird vstupenek za zvýhodněné ceny.',
      shortDescription: 'Festival Rock for People',
      category: festivalyCategory?._id,
      tags: ['festival', 'rock', 'létní'],
      dateTime: {
        start: futureDate(180),
        end: futureDate(183),
        isMultiDay: true,
        timezone: 'Europe/Prague'
      },
      location: locations.find(l => l.name === 'Dolní Vítkovice')?._id || locations[0]._id,
      pricing: {
        isFree: false,
        currency: 'CZK',
        priceFrom: 1990,
        priceTo: 4990
      },
      organizer: {
        name: 'Rock for People s.r.o.',
        email: 'info@rockforpeople.cz'
      },
      source: {
        platform: 'manual',
        sourceUrl: 'https://tipnaden.cz'
      },
      seo: {
        slug: 'rock-for-people-2025'
      },
      isPublished: true,
      isFeatured: true
    },
    {
      title: 'Café Savoy - Jazzové večery',
      description: 'Týdenní jazzové večery v kavárně Savoy. Živá hudba od 20:00.',
      shortDescription: 'Jazz v Café Savoy',
      category: koncertyCategory?._id,
      tags: ['jazz', 'kavárna', 'live'],
      dateTime: {
        start: futureDate(7),
        isMultiDay: false,
        timezone: 'Europe/Prague'
      },
      location: akropolis?._id,
      pricing: {
        isFree: true,
        currency: 'CZK'
      },
      organizer: {
        name: 'Café Savoy',
        email: 'info@cafesavoy.cz'
      },
      source: {
        platform: 'manual',
        sourceUrl: 'https://tipnaden.cz'
      },
      seo: {
        slug: 'cafe-savoy-jazz'
      },
      isPublished: true
    }
  ];

  // ============= NÁHODNÉ EVENTY =============
  const additionalEvents: any[] = [];
  const eventTitles = [
    'Stand-up comedy večer', 'DJ Night', 'Filmová projekce', 'Workshop fotografování',
    'Vinný degustace', 'Běžecký závod', 'Taneční večer', 'Poetry slam',
    'Výstava moderního umění', 'Charitativní večer', 'Food festival', 'Craftové pivo fest',
    'Halloween párty', 'Silvestr 2024', 'Valentýnský koncert', 'Jarní trhy',
    'Letní kino', 'Vánoční jarmark', 'Techno párty', 'Hip-hop battle'
  ];
  
  for (let i = 0; i < 20; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomTitle = eventTitles[Math.floor(Math.random() * eventTitles.length)] || 'Událost';
    const randomDays = Math.floor(Math.random() * 120) + 5;
    
    // Vytvoř slug BEZ diakritiky
    const slug = removeDiacritics(randomTitle)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') // Odstraní všechny nepovolené znaky
      + `-${i + 1}`;
    
    additionalEvents.push({
      title: `${randomTitle} ${i + 1}`,
      description: `Popis události ${randomTitle}. Přijďte si užít skvělou atmosféru a zábavu!`,
      shortDescription: `${randomTitle} - nezapomenutelný zážitek`,
      category: randomCategory._id,
      tags: ['zábava', 'kultura'],
      dateTime: {
        start: futureDate(randomDays),
        isMultiDay: false,
        timezone: 'Europe/Prague'
      },
      location: randomLocation._id,
      pricing: {
        isFree: Math.random() > 0.6,
        currency: 'CZK',
        priceFrom: Math.random() > 0.6 ? Math.floor(Math.random() * 500) + 100 : undefined,
        priceTo: Math.random() > 0.6 ? Math.floor(Math.random() * 1000) + 600 : undefined
      },
      organizer: {
        name: `Organizátor ${i + 1}`,
        email: `organizer${i}@example.com`
      },
      source: {
        platform: 'manual',
        sourceUrl: 'https://tipnaden.cz'
      },
      seo: {
        slug: slug
      },
      isPublished: true,
      isFeatured: Math.random() > 0.8
    });
  }
  
  // Sloučíme všechny eventy
  const allEvents = [...sampleEvents, ...additionalEvents];
  
  // Uložíme do databáze
  const events = await Event.insertMany(allEvents);
  console.log(`Created ${events.length} events`);
  
  return events;
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDatabase();
    
    const categories = await seedCategories();
    const locations = await seedLocations();
    const users = await seedUsers();
    const events = await seedEvents(categories, locations);
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Locations: ${locations.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Events: ${events.length}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Clear database function
const clearDatabase = async () => {
  try {
    console.log('🗑️ Clearing database...');
    
    await connectDatabase();
    
    await Promise.all([
      Category.deleteMany({}),
      Location.deleteMany({}),
      User.deleteMany({}),
      Event.deleteMany({})
    ]);
    
    console.log('✅ Database cleared successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

// CLI handling
const command = process.argv[2];

if (command === 'clear') {
  clearDatabase();
} else {
  seedDatabase();
}