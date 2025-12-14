// Script để tạo categories mẫu cho hệ thống
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobmate')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Danh sách categories mẫu
const categories = [
  { name: 'Web Development' },
  { name: 'Mobile Development' },
  { name: 'UI/UX Design' },
  { name: 'Graphic Design' },
  { name: 'Content Writing' },
  { name: 'Digital Marketing' },
  { name: 'Data Science' },
  { name: 'Machine Learning' },
  { name: 'Blockchain Development' },
  { name: 'Game Development' },
  { name: 'Video Editing' },
  { name: 'Translation' },
  { name: 'Voice Over' },
  { name: 'Virtual Assistant' },
  { name: 'Accounting' }
];

async function seedCategories() {
  try {
    // Xóa tất cả categories cũ (optional - comment dòng này nếu không muốn xóa)
    // await Category.deleteMany({});
    // console.log('🗑️  Cleared old categories');

    // Kiểm tra và chỉ tạo categories chưa tồn tại
    let created = 0;
    let skipped = 0;

    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        await Category.create(cat);
        created++;
        console.log(`✅ Created: ${cat.name}`);
      } else {
        skipped++;
        console.log(`⏭️  Skipped (exists): ${cat.name}`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Created: ${created} categories`);
    console.log(`⏭️  Skipped: ${skipped} categories`);
    console.log(`📝 Total: ${categories.length} categories`);
    
    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
