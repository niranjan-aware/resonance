import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Studio from '../models/Studio.js';
import Booking from '../models/Booking.js';


// Configuration
const config = {
  dropExisting: process.env.DROP_EXISTING === 'true',
  createIndexes: true,
  logProgress: true
};

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@musicstudio.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1-555-0001',
    verified: true
  },
  {
    name: 'John Producer',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    phone: '+1-555-0002',
    verified: true,
    preferences: {
      notifications: true,
      reminderTime: 24
    }
  },
  {
    name: 'Sarah Musician',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'user',
    phone: '+1-555-0003',
    verified: true,
    preferences: {
      notifications: false,
      reminderTime: 12
    }
  },
  {
    name: 'Mike Band',
    email: 'mike@example.com',
    password: 'password123',
    role: 'user',
    phone: '+1-555-0004',
    verified: false
  },
  {
    name: 'Emma Solo',
    email: 'emma@example.com',
    password: 'password123',
    role: 'user',
    phone: '+1-555-0005',
    verified: true,
    preferences: {
      notifications: true,
      reminderTime: 48
    }
  }
];

const sampleStudios = [
  {
    name: 'Studio A - Professional',
    description: 'Premium recording studio with state-of-the-art equipment perfect for professional recordings and mixing.',
    size: 'large',
    capacity: 8,
    hourlyRate: 150,
    amenities: [
      'SSL Console',
      'Pro Tools HDX',
      'Vintage Microphones',
      'Acoustic Treatment',
      'Isolation Booth',
      'Piano',
      'Drum Kit',
      'Guitar Amps'
    ],
    equipment: [
      'Neumann U87',
      'SSL 4000 Series Console',
      'Pro Tools Ultimate',
      'Yamaha C7 Grand Piano',
      'DW Drum Kit',
      'Marshall JCM800',
      'Fender Twin Reverb'
    ],
    images: [
      'https://example.com/studio-a-1.jpg',
      'https://example.com/studio-a-2.jpg'
    ],
    availability: {
      monday: { start: '09:00', end: '22:00' },
      tuesday: { start: '09:00', end: '22:00' },
      wednesday: { start: '09:00', end: '22:00' },
      thursday: { start: '09:00', end: '22:00' },
      friday: { start: '09:00', end: '23:00' },
      saturday: { start: '10:00', end: '23:00' },
      sunday: { start: '12:00', end: '20:00' }
    },
    active: true
  },
  {
    name: 'Studio B - Creative',
    description: 'Mid-size studio ideal for bands, podcasts, and creative projects with a relaxed atmosphere.',
    size: 'medium',
    capacity: 5,
    hourlyRate: 100,
    amenities: [
      'Digital Mixing Board',
      'Logic Pro X',
      'Podcast Setup',
      'Comfortable Lounge',
      'Kitchenette',
      'Guitar Collection',
      'Bass Amps'
    ],
    equipment: [
      'Focusrite Scarlett 18i20',
      'KRK Rokit Monitors',
      'Shure SM7B',
      'Logic Pro X',
      'Fender Stratocaster',
      'Gibson Les Paul',
      'Ampeg Bass Amp'
    ],
    images: [
      'https://example.com/studio-b-1.jpg',
      'https://example.com/studio-b-2.jpg'
    ],
    availability: {
      monday: { start: '10:00', end: '21:00' },
      tuesday: { start: '10:00', end: '21:00' },
      wednesday: { start: '10:00', end: '21:00' },
      thursday: { start: '10:00', end: '21:00' },
      friday: { start: '10:00', end: '22:00' },
      saturday: { start: '11:00', end: '22:00' },
      sunday: { start: '13:00', end: '19:00' }
    },
    active: true
  },
  {
    name: 'Studio C - Intimate',
    description: 'Cozy studio perfect for solo artists, songwriting sessions, and small acoustic recordings.',
    size: 'small',
    capacity: 3,
    hourlyRate: 75,
    amenities: [
      'Acoustic Treatment',
      'Vintage Microphones',
      'Guitar/Vocal Setup',
      'Natural Lighting',
      'Coffee Bar',
      'Comfortable Seating'
    ],
    equipment: [
      'Audio-Technica AT4040',
      'Presonus Studio 24c',
      'Yamaha HS5 Monitors',
      'GarageBand/Logic Pro X',
      'Taylor Acoustic Guitar',
      'Fender Acoustic',
      'Vocal Booth'
    ],
    images: [
      'https://example.com/studio-c-1.jpg'
    ],
    availability: {
      monday: { start: '09:00', end: '20:00' },
      tuesday: { start: '09:00', end: '20:00' },
      wednesday: { start: '09:00', end: '20:00' },
      thursday: { start: '09:00', end: '20:00' },
      friday: { start: '09:00', end: '21:00' },
      saturday: { start: '10:00', end: '21:00' },
      sunday: { start: '14:00', end: '18:00' }
    },
    active: true
  }
];

// Utility functions
const log = (message, type = 'info') => {
  if (!config.logProgress) return;
  
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || '📝';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const generateBookings = (users, studios) => {
  const bookings = [];
  const statuses = ['confirmed', 'pending', 'cancelled', 'completed'];
  const purposes = [
    'Recording Session',
    'Mixing & Mastering',
    'Rehearsal',
    'Podcast Recording',
    'Voice Over',
    'Music Video Audio',
    'Demo Recording',
    'Live Session'
  ];

  // Generate bookings for the past 30 days and next 60 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  for (let i = 0; i < 50; i++) {
    const randomDate = new Date(startDate);
    randomDate.setDate(startDate.getDate() + Math.floor(Math.random() * 90));
    
    // Skip weekends for some bookings to make it realistic
    if (Math.random() < 0.3 && (randomDate.getDay() === 0 || randomDate.getDay() === 6)) {
      continue;
    }
    
    const randomUser = users[Math.floor(Math.random() * (users.length - 1)) + 1]; // Skip admin
    const randomStudio = studios[Math.floor(Math.random() * studios.length)];
    
    const startHour = Math.floor(Math.random() * 10) + 9; // 9 AM to 6 PM start times
    const duration = [1, 2, 3, 4, 6, 8][Math.floor(Math.random() * 6)]; // Various durations
    
    const startTime = new Date(randomDate);
    startTime.setHours(startHour, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + duration);
    
    // Determine status based on date
    let status;
    const now = new Date();
    if (startTime < now) {
      status = Math.random() < 0.8 ? 'completed' : 'cancelled';
    } else {
      status = Math.random() < 0.9 ? 'confirmed' : 'pending';
    }
    
    const totalCost = randomStudio.hourlyRate * duration;
    
    bookings.push({
      user: randomUser._id,
      studio: randomStudio._id,
      startTime,
      endTime,
      duration,
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      status,
      totalCost,
      notes: Math.random() < 0.3 ? 'Special requirements discussed via phone' : undefined,
      paymentStatus: status === 'completed' ? 'paid' : status === 'confirmed' ? 'pending' : 'refunded',
      createdAt: new Date(startTime.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Created 0-7 days before booking
      metadata: {
        source: 'web',
        userAgent: 'Mozilla/5.0 (compatible)',
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`
      }
    });
  }
  
  return bookings.sort((a, b) => a.startTime - b.startTime);
};

// Database operations
const createIndexes = async () => {
  log('Creating database indexes...');
  
  try {
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ verified: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    
    // Studio indexes
    await Studio.collection.createIndex({ name: 1 }, { unique: true });
    await Studio.collection.createIndex({ active: 1 });
    await Studio.collection.createIndex({ size: 1 });
    await Studio.collection.createIndex({ hourlyRate: 1 });
    await Studio.collection.createIndex({ 'availability.monday.start': 1 });
    
    // Booking indexes
    await Booking.collection.createIndex({ user: 1 });
    await Booking.collection.createIndex({ studio: 1 });
    await Booking.collection.createIndex({ startTime: 1 });
    await Booking.collection.createIndex({ endTime: 1 });
    await Booking.collection.createIndex({ status: 1 });
    await Booking.collection.createIndex({ paymentStatus: 1 });
    await Booking.collection.createIndex({ createdAt: -1 });
    
    // Compound indexes for common queries
    await Booking.collection.createIndex({ studio: 1, startTime: 1, endTime: 1 });
    await Booking.collection.createIndex({ user: 1, status: 1 });
    await Booking.collection.createIndex({ studio: 1, status: 1 });
    await Booking.collection.createIndex({ startTime: 1, status: 1 });
    
    log('Database indexes created successfully', 'success');
  } catch (error) {
    log(`Error creating indexes: ${error.message}`, 'error');
    throw error;
  }
};

const dropCollections = async () => {
  log('Dropping existing collections...');
  
  try {
    const collections = ['users', 'studios', 'bookings'];
    
    for (const collection of collections) {
      try {
        await mongoose.connection.db.dropCollection(collection);
        log(`Dropped collection: ${collection}`, 'success');
      } catch (error) {
        if (error.message.includes('ns not found')) {
          log(`Collection ${collection} doesn't exist, skipping`, 'warning');
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    log(`Error dropping collections: ${error.message}`, 'error');
    throw error;
  }
};

const seedUsers = async () => {
  log('Seeding users...');
  
  try {
    const users = [];
    
    for (const userData of sampleUsers) {
      const hashedPassword = await hashPassword(userData.password);
      const user = new User({
        ...userData,
        password: hashedPassword,
        createdAt: new Date()
      });
      users.push(user);
    }
    
    const createdUsers = await User.insertMany(users);
    log(`Created ${createdUsers.length} users`, 'success');
    
    return createdUsers;
  } catch (error) {
    log(`Error seeding users: ${error.message}`, 'error');
    throw error;
  }
};

const seedStudios = async () => {
  log('Seeding studios...');
  
  try {
    const studios = sampleStudios.map(studio => new Studio({
      ...studio,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const createdStudios = await Studio.insertMany(studios);
    log(`Created ${createdStudios.length} studios`, 'success');
    
    return createdStudios;
  } catch (error) {
    log(`Error seeding studios: ${error.message}`, 'error');
    throw error;
  }
};

const seedBookings = async (users, studios) => {
  log('Seeding bookings...');
  
  try {
    const bookingData = generateBookings(users, studios);
    const bookings = bookingData.map(booking => new Booking(booking));
    
    const createdBookings = await Booking.insertMany(bookings);
    log(`Created ${createdBookings.length} bookings`, 'success');
    
    return createdBookings;
  } catch (error) {
    log(`Error seeding bookings: ${error.message}`, 'error');
    throw error;
  }
};

const validateData = async () => {
  log('Validating seeded data...');
  
  try {
    const userCount = await User.countDocuments();
    const studioCount = await Studio.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const activeStudios = await Studio.countDocuments({ active: true });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    
    log(`Validation Results:`, 'info');
    log(`  Users: ${userCount} (${adminCount} admin)`, 'info');
    log(`  Studios: ${studioCount} (${activeStudios} active)`, 'info');
    log(`  Bookings: ${bookingCount} (${confirmedBookings} confirmed)`, 'info');
    
    // Check for data integrity
    const orphanedBookings = await Booking.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDoc'
        }
      },
      {
        $lookup: {
          from: 'studios',
          localField: 'studio',
          foreignField: '_id',
          as: 'studioDoc'
        }
      },
      {
        $match: {
          $or: [
            { userDoc: { $size: 0 } },
            { studioDoc: { $size: 0 } }
          ]
        }
      }
    ]);
    
    if (orphanedBookings.length > 0) {
      log(`Warning: Found ${orphanedBookings.length} orphaned bookings`, 'warning');
    } else {
      log('Data integrity check passed', 'success');
    }
    
  } catch (error) {
    log(`Error validating data: ${error.message}`, 'error');
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    log('Starting database seeding process...', 'info');
    const startTime = Date.now();
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    
    // Drop existing data if configured
    if (config.dropExisting) {
      await dropCollections();
    }
    
    // Create indexes
    if (config.createIndexes) {
      await createIndexes();
    }
    
    // Seed data in order
    const users = await seedUsers();
    const studios = await seedStudios();
    const bookings = await seedBookings(users, studios);
    
    // Validate the seeded data
    await validateData();
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    log(`Database seeding completed successfully in ${duration} seconds! 🎉`, 'success');
    
    return {
      users: users.length,
      studios: studios.length,
      bookings: bookings.length,
      duration
    };
    
  } catch (error) {
    log(`Database seeding failed: ${error.message}`, 'error');
    throw error;
  }
};

export {
  seedDatabase,
  createIndexes,
  dropCollections,
  sampleUsers,
  sampleStudios,
  config
};


// Run seeding if this file is executed directly
if (require.main === module) {
  const runSeed = async () => {
    try {
      // Connect to database if not already connected
      if (mongoose.connection.readyState === 0) {
        const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
        if (!mongoUri) {
          throw new Error('MongoDB URI not found in environment variables');
        }
        
        log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        log('Connected to MongoDB', 'success');
      }
      
      await seedDatabase();
      
    } catch (error) {
      log(`Seeding process failed: ${error.message}`, 'error');
      process.exit(1);
    } finally {
      // Close connection if we opened it
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        log('Database connection closed');
      }
    }
  };
  
  runSeed();
}