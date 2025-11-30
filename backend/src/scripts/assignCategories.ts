import dotenv from 'dotenv';
import { connectDatabase } from '@/config/database';
import { Event } from '@/models/Event';
import { Category } from '@/models/Category';

dotenv.config();

const assignCategories = async () => {
  try {
    await connectDatabase();
    
    // Seedni kategorie pokud neexistují
    const categoryCount = await Category.countDocuments();
    if (categoryCount < 8) {
      console.log('⚠️ Run seed first: npm run db:seed');
      process.exit(1);
    }
    
    const vystavyCategory = await Category.findOne({ name: 'Výstavy' });
    const koncertyCategory = await Category.findOne({ name: 'Koncerty' });
    
    if (!vystavyCategory || !koncertyCategory) {
      console.error('Categories not found!');
      process.exit(1);
    }
    
    const events = await Event.find({});
    
    for (const event of events) {
      const title = event.title.toLowerCase();
      
      let categoryId = vystavyCategory._id; // Default
      
      if (title.includes('tour') || title.includes('koncert') || title.includes('show') || 
          title.includes('harlej') || title.includes('floyd') || title.includes('rybičky')) {
        categoryId = koncertyCategory._id;
      }
      
      await Event.updateOne(
        { _id: event._id },
        { $set: { category: categoryId } }
      );
      
      console.log(`✅ ${event.title}`);
    }
    
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

assignCategories();