// quick-seed.js - Run this to populate your database
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://nirobaaware26_db_user:ICMpfwZ4gVtvBBw3@cluster0.iog6i83.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Update with your URI

// Schema definitions (simplified)
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  authProvider: { type: String, default: 'email' },
  isVerified: { type: Boolean, default: true }
});

const StudioSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: String, enum: ['small', 'medium', 'large'] },
  capacity: Number,
  description: String,
  features: [String],
  equipment: [{
    name: String,
    brand: String,
    model: String,
    isAvailable: { type: Boolean, default: true },
    rentalPrice: { type: Number, default: 0 }
  }],
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  pricing: {
    basePrice: Number,
    peakHourMultiplier: { type: Number, default: 1.2 },
    minimumHours: { type: Number, default: 1 },
    maximumHours: { type: Number, default: 12 }
  },
  availability: {
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '22:00' },
    workingDays: [{ type: Number }],
    peakHours: [{ start: String, end: String }]
  },
  suitableFor: [String],
  isActive: { type: Boolean, default: true },
  ratings: {
    average: { type: Number, default: 4.8 },
    count: { type: Number, default: 25 }
  }
});

const User = mongoose.model('User', UserSchema);
const Studio = mongoose.model('Studio', StudioSchema);

// Seed data
const studiosData = [
  {
    name: 'Studio A - The Arena',
    size: 'large',
    capacity: 15,
    description: 'Our flagship studio featuring premium acoustics, professional-grade equipment, and spacious recording area. Perfect for bands, orchestras, and large group sessions.',
    features: [
      'Professional acoustic treatment',
      'Climate controlled environment',
      'Premium monitoring system',
      'Isolated control room',
      'Natural lighting',
      'Spacious live room'
    ],
    equipment: [
      { name: 'Drum Kit', brand: 'Pearl', model: 'Export Series', isAvailable: true, rentalPrice: 500 },
      { name: 'Electric Guitar', brand: 'Fender', model: 'Stratocaster', isAvailable: true, rentalPrice: 300 },
      { name: 'Guitar Amp', brand: 'Marshall', model: 'DSL40CR', isAvailable: true, rentalPrice: 400 },
      { name: 'Bass Amp', brand: 'Ampeg', model: 'BA-115', isAvailable: true, rentalPrice: 400 },
      { name: 'Keyboard', brand: 'Roland', model: 'RD-88', isAvailable: true, rentalPrice: 350 }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop',
        caption: 'Main recording area with full band setup',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
        caption: 'Professional acoustic treatment',
        isPrimary: false
      },
      {
        url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop',
        caption: 'State-of-the-art equipment',
        isPrimary: false
      }
    ],
    pricing: {
      basePrice: 2500,
      peakHourMultiplier: 1.3,
      minimumHours: 2,
      maximumHours: 8
    },
    availability: {
      startTime: '09:00',
      endTime: '22:00',
      workingDays: [0, 1, 2, 3, 4, 5, 6],
      peakHours: [
        { start: '18:00', end: '22:00' },
        { start: '10:00', end: '14:00' }
      ]
    },
    suitableFor: ['band', 'live-musicians', 'video-recording', 'audio-recording', 'show'],
    isActive: true,
    ratings: { average: 4.9, count: 127 }
  },
  {
    name: 'Studio B - The Booth',
    size: 'medium',
    capacity: 8,
    description: 'Perfect for smaller bands, duos, and solo artists. Features excellent acoustics and professional equipment in a cozy environment.',
    features: [
      'Intimate recording space',
      'Professional monitors',
      'Vocal booth',
      'Digital mixing console',
      'Comfortable seating area',
      'Ambient lighting'
    ],
    equipment: [
      { name: 'Drum Kit', brand: 'Yamaha', model: 'Stage Custom', isAvailable: true, rentalPrice: 400 },
      { name: 'Electric Guitar', brand: 'Gibson', model: 'Les Paul', isAvailable: true, rentalPrice: 350 },
      { name: 'Guitar Amp', brand: 'Marshall', model: 'JCM800', isAvailable: true, rentalPrice: 450 },
      { name: 'Bass Guitar', brand: 'Fender', model: 'Precision Bass', isAvailable: true, rentalPrice: 300 }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        caption: 'Cozy medium-sized studio perfect for bands',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1519508234439-4f23643125c1?w=800&h=600&fit=crop',
        caption: 'Professional vocal booth',
        isPrimary: false
      }
    ],
    pricing: {
      basePrice: 1800,
      peakHourMultiplier: 1.2,
      minimumHours: 1,
      maximumHours: 6
    },
    availability: {
      startTime: '10:00',
      endTime: '22:00',
      workingDays: [0, 1, 2, 3, 4, 5, 6],
      peakHours: [{ start: '19:00', end: '22:00' }]
    },
    suitableFor: ['band', 'live-musicians', 'audio-recording', 'karaoke'],
    isActive: true,
    ratings: { average: 4.8, count: 89 }
  },
  {
    name: 'Studio C - The Corner',
    size: 'small',
    capacity: 5,
    description: 'Intimate space ideal for solo artists, acoustic sessions, and small group recordings. Features warm acoustics and essential equipment.',
    features: [
      'Warm acoustic environment',
      'Perfect for acoustic sessions',
      'Professional microphones',
      'Compact mixing setup',
      'Comfortable atmosphere',
      'Great for demos'
    ],
    equipment: [
      { name: 'Acoustic Guitar', brand: 'Taylor', model: '814ce', isAvailable: true, rentalPrice: 250 },
      { name: 'Electric Guitar', brand: 'Fender', model: 'Telecaster', isAvailable: true, rentalPrice: 250 },
      { name: 'Guitar Amp', brand: 'Laney', model: 'CUB12R', isAvailable: true, rentalPrice: 200 },
      { name: 'Keyboard', brand: 'Yamaha', model: 'P-125', isAvailable: true, rentalPrice: 300 }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop',
        caption: 'Intimate corner studio for solo artists',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
        caption: 'Perfect for acoustic sessions',
        isPrimary: false
      }
    ],
    pricing: {
      basePrice: 1200,
      peakHourMultiplier: 1.15,
      minimumHours: 1,
      maximumHours: 4
    },
    availability: {
      startTime: '09:00',
      endTime: '21:00',
      workingDays: [1, 2, 3, 4, 5, 6],
      peakHours: [{ start: '17:00', end: '21:00' }]
    },
    suitableFor: ['karaoke', 'audio-recording', 'live-musicians'],
    isActive: true,
    ratings: { average: 4.7, count: 64 }
  }
];

const adminUser = {
  name: 'Admin User',
  email: 'admin@resonancestudio.com',
  phone: '+919876543210',
  password: 'admin123',
  role: 'admin',
  authProvider: 'email',
  isVerified: true
};

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Studio.deleteMany({});
    await User.deleteMany({});

    // Seed studios
    console.log('🏢 Creating studios...');
    const createdStudios = await Studio.insertMany(studiosData);
    console.log(`✅ Created ${createdStudios.length} studios`);

    // Create admin user with hashed password
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash(adminUser.password, 12);
    const admin = await User.create({
      ...adminUser,
      password: hashedPassword
    });
    console.log(`✅ Created admin: ${admin.email}`);

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📋 Created:');
    console.log(`• ${createdStudios.length} studios`);
    console.log(`• 1 admin user (${admin.email})`);
    
    console.log('\n🔑 Login with:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🍃 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeder
seedDatabase();