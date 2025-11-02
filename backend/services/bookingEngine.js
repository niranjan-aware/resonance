import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Studio from '../models/Studio.js';
import User from '../models/User.js';

export class BookingEngine {
  static PEAK_HOURS = [
    { start: '18:00', end: '23:00' },
    { start: '10:00', end: '14:00' }
  ];

  static PEAK_WEEKEND_HOURS = [
    { start: '10:00', end: '23:00' }
  ];

  static isPeakHour(startTime, endTime) {
    const start = startTime.split(':').map(Number);
    const end = endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];

    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    const peakHours = isWeekend ? this.PEAK_WEEKEND_HOURS : this.PEAK_HOURS;

    return peakHours.some(peak => {
      const peakStart = peak.start.split(':').map(Number);
      const peakEnd = peak.end.split(':').map(Number);
      const peakStartMinutes = peakStart[0] * 60 + peakStart[1];
      const peakEndMinutes = peakEnd[0] * 60 + peakEnd[1];

      return startMinutes >= peakStartMinutes && endMinutes <= peakEndMinutes;
    });
  }

  /**
   * Check availability with atomic query
   * @param {string} studioId - Studio ID
   * @param {string} date - Date in ISO format
   * @param {string} startTime - Start time in HH:MM format
   * @param {string} endTime - End time in HH:MM format
   * @param {object} session - MongoDB session for transactions
   * @returns {object} - Availability status and studio
   */
  static async checkAvailability(studioId, date, startTime, endTime, session = null) {
    try {
      // Find studio with session if provided
      const studioQuery = Studio.findById(studioId);
      if (session) {
        studioQuery.session(session);
      }
      
      const studio = await studioQuery;
      
      if (!studio || !studio.isActive) {
        throw new Error('Studio not found or not available');
      }

      // Check for overlapping bookings atomically
      const conflictQuery = {
        studio: studioId,
        date: new Date(date),
        status: { $in: ['confirmed', 'checked-in', 'pending'] },
        $or: [
          {
            // New booking overlaps with existing booking
            'timeSlot.startTime': { $lt: endTime },
            'timeSlot.endTime': { $gt: startTime }
          }
        ]
      };

      const countQuery = Booking.countDocuments(conflictQuery);
      if (session) {
        countQuery.session(session);
      }
      
      const conflictingBookings = await countQuery;

      if (conflictingBookings > 0) {
        throw new Error('This time slot is already booked. Please select a different time.');
      }

      return { available: true, studio };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create booking with MongoDB transaction for atomicity
   * @param {object} bookingData - Booking details
   * @returns {object} - Created booking
   */
  static async createBooking(bookingData) {
    const session = await mongoose.startSession();
    let createdBooking = null;
    
    try {
      // Start transaction with retry logic for write conflicts
      await session.withTransaction(async () => {
        const { userId, studioId, date, startTime, endTime, sessionType, sessionDetails } = bookingData;

        console.log('🔒 Transaction started - Checking availability...');

        // Check availability within transaction (with session lock)
        const availability = await this.checkAvailability(studioId, date, startTime, endTime, session);
        const studio = availability.studio;

        console.log('✅ Slot available - Creating booking...');

        // Calculate pricing
        const baseAmount = studio.calculatePrice(date, startTime, endTime, sessionDetails.equipment || []);
        const taxes = Math.round(baseAmount * 0.18);

        // Generate unique booking ID
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        const generatedBookingId = `RES-${timestamp}-${random}`;

        // Create booking document
        const bookingDoc = new Booking({
          bookingId: generatedBookingId,
          user: userId,
          studio: studioId,
          date: new Date(date),
          timeSlot: { startTime, endTime },
          sessionType,
          sessionDetails,
          pricing: {
            baseAmount,
            equipmentCost: 0,
            taxes,
            totalAmount: baseAmount + taxes
          },
          status: 'pending',
          metadata: bookingData.metadata || {}
        });

        // Save with session to ensure atomicity
        const savedBookings = await bookingDoc.save({ session });
        createdBooking = savedBookings;

        console.log('✅ Booking created - Updating user and studio...');

        // Update user and studio in same transaction
        await Promise.all([
          User.findByIdAndUpdate(
            userId,
            { 
              $push: { 
                bookingHistory: { 
                  booking: bookingDoc._id, 
                  status: 'pending', 
                  bookedAt: new Date() 
                } 
              } 
            },
            { session }
          ),
          Studio.findByIdAndUpdate(
            studioId,
            { $inc: { 'bookingStats.totalBookings': 1 } },
            { session }
          )
        ]);

        console.log('✅ Transaction completed successfully');

      }, {
        readPreference: 'primary',
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' },
        maxCommitTimeMS: 10000
      });

      // After successful transaction, fetch populated booking
      const booking = await Booking.findById(createdBooking._id)
        .populate('user', 'name email phone')
        .populate('studio', 'name size images pricing location capacity');

      return booking;

    } catch (error) {
      console.error('❌ Transaction failed:', error.message);
      
      // Handle duplicate key errors
      if (error.code === 11000 || error.message.includes('already booked')) {
        throw new Error('This time slot is already booked. Please select a different time.');
      }
      
      // Handle transaction errors
      if (error.message.includes('Transaction')) {
        throw new Error('Booking failed due to high traffic. Please try again.');
      }
      
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Confirm booking with transaction
   */
  static async confirmBooking(bookingId, paymentDetails = null) {
    const session = await mongoose.startSession();
    
    try {
      let updatedBooking;

      await session.withTransaction(async () => {
        const booking = await Booking.findById(bookingId).session(session);
        
        if (!booking) {
          throw new Error('Booking not found');
        }

        if (booking.status !== 'pending') {
          throw new Error(`Booking cannot be confirmed. Current status: ${booking.status}`);
        }

        // Update booking status
        booking.status = 'confirmed';
        
        if (paymentDetails) {
          booking.payment = {
            ...booking.payment.toObject(),
            ...paymentDetails,
            status: 'completed',
            paymentDate: new Date()
          };
        }

        await booking.save({ session });
        updatedBooking = booking;
      });

      // Return populated booking
      return await Booking.findById(updatedBooking._id)
        .populate('user', 'name email phone')
        .populate('studio', 'name size capacity pricing location images');

    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Cancel booking with transaction
   */
  static async cancelBooking(bookingId, userId, reason = '') {
    const session = await mongoose.startSession();

    try {
      let cancelledBooking;
      let refundAmount = 0;

      await session.withTransaction(async () => {
        const booking = await Booking.findById(bookingId).session(session);
        
        if (!booking) {
          throw new Error('Booking not found');
        }

        if (booking.user.toString() !== userId) {
          throw new Error('Not authorized to cancel this booking');
        }

        if (booking.status === 'cancelled') {
          throw new Error('Booking is already cancelled');
        }

        if (booking.status === 'completed') {
          throw new Error('Cannot cancel a completed booking');
        }

        // Calculate refund only for confirmed bookings
        if (booking.status === 'confirmed' && !booking.canCancel) {
          throw new Error('Booking cannot be cancelled (less than 24 hours remaining)');
        }

        refundAmount = booking.calculateRefundAmount();

        // Update booking
        booking.status = 'cancelled';
        booking.cancellation = {
          reason,
          cancelledAt: new Date(),
          cancelledBy: userId,
          refundEligible: refundAmount > 0,
          refundProcessed: false
        };
        booking.payment.refundAmount = refundAmount;

        await booking.save({ session });
        cancelledBooking = booking;

        // Update studio stats
        await Studio.findByIdAndUpdate(
          booking.studio,
          { $inc: { 'bookingStats.totalBookings': -1 } },
          { session }
        );
      });

      return { booking: cancelledBooking, refundAmount };
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get available slots for a studio on a specific date
   */
  static async getAvailableSlots(studioId, date) {
    try {
      const studio = await Studio.findById(studioId);
      if (!studio || !studio.isActive) {
        throw new Error('Studio not found or not available');
      }

      const requestedDate = new Date(date);
      const dayOfWeek = requestedDate.getDay();

      // Check if studio is open on this day
      if (!studio.availability.workingDays.includes(dayOfWeek)) {
        return [];
      }

      // Get all existing bookings for this date (use lean for performance)
      const existingBookings = await Booking.find({
        studio: studioId,
        date: requestedDate,
        status: { $in: ['confirmed', 'checked-in', 'pending'] }
      })
      .select('timeSlot')
      .lean();

      const availableSlots = [];
      const studioStartHour = parseInt(studio.availability.startTime.split(':')[0]);
      const studioEndHour = parseInt(studio.availability.endTime.split(':')[0]);

      // Generate hourly slots
      for (let hour = studioStartHour; hour < studioEndHour; hour++) {
        const slotStart = `${hour.toString().padStart(2, '0')}:00`;
        const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;

        // Check if slot overlaps with any existing booking
        const isBooked = existingBookings.some(booking => {
          return !(
            slotEnd <= booking.timeSlot.startTime || 
            slotStart >= booking.timeSlot.endTime
          );
        });

        const isPeakHour = this.isPeakHour(slotStart, slotEnd);
        const slotPrice = studio.calculatePrice(date, slotStart, slotEnd);

        availableSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
          price: slotPrice,
          isPeakHour,
          isBooked,
          available: !isBooked
        });
      }

      return availableSlots;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available time ranges (continuous slots)
   */
  static getAvailableTimeRanges(slots) {
    const availableSlots = slots
      .filter(s => s.available)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (availableSlots.length === 0) return [];

    const ranges = [];
    let currentRange = {
      start: availableSlots[0].startTime,
      end: availableSlots[0].endTime
    };

    for (let i = 1; i < availableSlots.length; i++) {
      if (availableSlots[i].startTime === currentRange.end) {
        // Extend current range
        currentRange.end = availableSlots[i].endTime;
      } else {
        // Save current range and start new one
        ranges.push({ ...currentRange });
        currentRange = {
          start: availableSlots[i].startTime,
          end: availableSlots[i].endTime
        };
      }
    }

    // Add last range
    ranges.push(currentRange);

    return ranges.map(r => `${r.start} - ${r.end}`);
  }
}