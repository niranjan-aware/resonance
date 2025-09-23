import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Studio from '../models/Studio.js';
import User from '../models/User.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🍃 MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

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
      {
        name: 'Drum Kit',
        brand: 'Pearl',
        model: 'Export Series',
        isAvailable: true,
        rentalPrice: 500
      },
      {
        name: 'Electric Guitar',
        brand: 'Fender',
        model: 'Stratocaster',
        isAvailable: true,
        rentalPrice: 300
      },
      {
        name: 'Guitar Amp',
        brand: 'Marshall',
        model: 'DSL40CR',
        isAvailable: true,
        rentalPrice: 400
      },
      {
        name: 'Guitar Amp',
        brand: 'Laney',
        model: 'LX120RT',
        isAvailable: true,
        rentalPrice: 350
      },
      {
        name: 'Bass Amp',
        brand: 'Ampeg',
        model: 'BA-115',
        isAvailable: true,
        rentalPrice: 400
      },
      {
        name: 'Keyboard',
        brand: 'Roland',
        model: 'RD-88',
        isAvailable: true,
        rentalPrice: 350
      }
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
      workingDays: [1, 2, 3, 4, 5, 6, 0],
      peakHours: [
        { start: '18:00', end: '22:00' },
        { start: '10:00', end: '14:00' }
      ]
    },
    specifications: {
      area: '400 sq ft',
      ceilingHeight: '12 ft',
      acoustics: 'Professional acoustic treatment with bass traps',
      powerOutlets: 12,
      airConditioning: true,
      wifi: true,
      parking: true
    },
    suitableFor: ['band', 'live-musicians', 'recording', 'video', 'fb-live', 'show']
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
      {
        name: 'Drum Kit',
        brand: 'Yamaha',
        model: 'Stage Custom',
        isAvailable: true,
        rentalPrice: 400
      },
      {
        name: 'Electric Guitar',
        brand: 'Gibson',
        model: 'Les Paul',
        isAvailable: true,
        rentalPrice: 350
      },
      {
        name: 'Guitar Amp',
        brand: 'Marshall',
        model: 'JCM800',
        isAvailable: true,
        rentalPrice: 450
      },
      {
        name: 'Bass Guitar',
        brand: 'Fender',
        model: 'Precision Bass',
        isAvailable: true,
        rentalPrice: 300
      },
      {
        name: 'Bass Amp',
        brand: 'Ampeg',
        model: 'SVT-3PRO',
        isAvailable: true,
        rentalPrice: 400
      }
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
      workingDays: [1, 2, 3, 4, 5, 6, 0],
      peakHours: [
        { start: '19:00', end: '22:00' }
      ]
    },
    specifications: {
      area: '250 sq ft',
      ceilingHeight: '10 ft',
      acoustics: 'Balanced acoustic treatment for versatile recording',
      powerOutlets: 8,
      airConditioning: true,
      wifi: true,
      parking: true
    },
    suitableFor: ['band', 'live-musicians', 'recording', 'karaoke']
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
      {
        name: 'Acoustic Guitar',
        brand: 'Taylor',
        model: '814ce',
        isAvailable: true,
        rentalPrice: 250
      },
      {
        name: 'Electric Guitar',
        brand: 'Fender',
        model: 'Telecaster',
        isAvailable: true,
        rentalPrice: 250
      },
      {
        name: 'Guitar Amp',
        brand: 'Laney',
        model: 'CUB12R',
        isAvailable: true,
        rentalPrice: 200
      },
      {
        name: 'Keyboard',
        brand: 'Yamaha',
        model: 'P-125',
        isAvailable: true,
        rentalPrice: 300
      }
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
      peakHours: [
        { start: '17:00', end: '21:00' }
      ]
    },
    specifications: {
      area: '150 sq ft',
      ceilingHeight: '9 ft',
      acoustics: 'Warm natural acoustics perfect for acoustic instruments',
      powerOutlets: 6,
      airConditioning: true,
      wifi: true,
      parking: true
    },
    suitableFor: ['karaoke', 'recording', 'live-musicians']
  }
];

const adminUser = {
  name: 'Resonance Admin',
  email: 'admin@resonancestudio.com',
  phone: '+919876543210',
  password: 'admin123',
  role: 'admin',
  authProvider: 'email',
  isVerified: true,
  preferences: {
    notifications: {
      email: true,
      sms: true,
      whatsapp: true
    }
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    await Studio.deleteMany({});
    await User.deleteMany({});

    console.log('🗑️ Cleared existing data');

    const createdStudios = await Studio.insertMany(studiosData);
    console.log(`✅ Created ${createdStudios.length} studios`);

    const createdAdmin = await User.create(adminUser);
    console.log(`✅ Created admin user: ${createdAdmin.email}`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Seeded Data Summary:');
    console.log(`Studios: ${createdStudios.length}`);
    console.log(`Admin User: ${createdAdmin.name} (${createdAdmin.email})`);
    
    console.log('\n🏢 Studios Created:');
    createdStudios.forEach((studio, index) => {
      console.log(`${index + 1}. ${studio.name} (${studio.size}) - ₹${studio.pricing.basePrice}/hr`);
    });

    console.log('\n🔑 Admin Login Credentials:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🍃 Database connection closed');
  }
};

connectDB().then(seedDatabase);