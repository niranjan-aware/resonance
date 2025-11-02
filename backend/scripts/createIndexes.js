import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB');
    console.log('📝 Creating unique compound index for bookings...');

    const db = mongoose.connection.db;
    const bookingsCollection = db.collection('bookings');

    // Drop existing index if it exists (optional)
    try {
      await bookingsCollection.dropIndex('unique_active_booking_slot');
      console.log('🗑️  Dropped old index');
    } catch (err) {
      console.log('ℹ️  No existing index to drop');
    }

    // Create the unique compound index
    const result = await bookingsCollection.createIndex(
      {
        studio: 1,
        date: 1,
        'timeSlot.startTime': 1,
        'timeSlot.endTime': 1,
        status: 1
      },
      {
        unique: true,
        partialFilterExpression: {
          status: { $in: ['pending', 'confirmed', 'checked-in'] }
        },
        name: 'unique_active_booking_slot'
      }
    );

    console.log('✅ Unique index created successfully:', result);
    console.log('');
    console.log('📊 Index Details:');
    console.log('   - Prevents duplicate bookings for same time slot');
    console.log('   - Only applies to active bookings (pending, confirmed, checked-in)');
    console.log('   - Cancelled bookings are excluded from uniqueness check');
    console.log('');
    
    // List all indexes
    const indexes = await bookingsCollection.indexes();
    console.log('📋 All Booking Indexes:');
    indexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${index.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating index:', error);
    process.exit(1);
  }
}

createIndexes();