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

  static getDateRange(dateString) {
    const date = new Date(dateString);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return { startOfDay, endOfDay };
  }

  static async checkAvailability(studioId, date, startTime, endTime, session = null) {
    try {
      const studioQuery = Studio.findById(studioId);
      if (session) {
        studioQuery.session(session);
      }
      
      const studio = await studioQuery;
      
      if (!studio || !studio.isActive) {
        throw new Error('Studio not found or not available');
      }

      const { startOfDay, endOfDay } = this.getDateRange(date);

      const conflictQuery = {
        studio: studioId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $in: ['confirmed', 'checked-in', 'pending'] },
        $or: [
          {
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

  static async createBooking(bookingData) {
    const session = await mongoose.startSession();
    let createdBooking = null;
    
    try {
      await session.withTransaction(async () => {
        const { userId, studioId, date, startTime, endTime, sessionType, sessionDetails } = bookingData;

        console.log('🔒 Transaction started - Checking availability...');

        const availability = await this.checkAvailability(studioId, date, startTime, endTime, session);
        const studio = availability.studio;

        console.log('✅ Slot available - Creating booking...');

        const baseAmount = studio.calculatePrice(date, startTime, endTime, sessionDetails.equipment || []);
        const taxes = Math.round(baseAmount * 0.18);

        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        const generatedBookingId = `RES-${timestamp}-${random}`;

        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);

        const bookingDoc = new Booking({
          bookingId: generatedBookingId,
          user: userId,
          studio: studioId,
          date: bookingDate,
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

        const savedBookings = await bookingDoc.save({ session });
        createdBooking = savedBookings;

        console.log('✅ Booking created - Updating user and studio...');

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

      const booking = await Booking.findById(createdBooking._id)
        .populate('user', 'name email phone')
        .populate('studio', 'name size images pricing location capacity');

      return booking;

    } catch (error) {
      console.error('❌ Transaction failed:', error.message);
      
      if (error.code === 11000 || error.message.includes('already booked')) {
        throw new Error('This time slot is already booked. Please select a different time.');
      }
      
      if (error.message.includes('Transaction')) {
        throw new Error('Booking failed due to high traffic. Please try again.');
      }
      
      throw error;
    } finally {
      await session.endSession();
    }
  }

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

      return await Booking.findById(updatedBooking._id)
        .populate('user', 'name email phone')
        .populate('studio', 'name size capacity pricing location images');

    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  }

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

        if (booking.status === 'confirmed' && !booking.canCancel) {
          throw new Error('Booking cannot be cancelled (less than 24 hours remaining)');
        }

        refundAmount = booking.calculateRefundAmount();

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

  static async getAvailableSlots(studioId, date) {
    try {
      const studio = await Studio.findById(studioId);
      if (!studio || !studio.isActive) {
        throw new Error('Studio not found or not available');
      }

      const { startOfDay, endOfDay } = this.getDateRange(date);
      const requestedDate = new Date(date);
      const dayOfWeek = requestedDate.getDay();

      if (!studio.availability.workingDays.includes(dayOfWeek)) {
        return [];
      }

      console.log('Querying bookings for date range:', {
        studioId,
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString()
      });

      const existingBookings = await Booking.find({
        studio: studioId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $in: ['confirmed', 'checked-in', 'pending'] }
      })
      .select('timeSlot date status')
      .lean();

      console.log('Found existing bookings:', existingBookings.length, existingBookings);

      const availableSlots = [];
      const studioStartHour = parseInt(studio.availability.startTime.split(':')[0]);
      const studioEndHour = parseInt(studio.availability.endTime.split(':')[0]);

      for (let hour = studioStartHour; hour < studioEndHour; hour++) {
        const slotStart = `${hour.toString().padStart(2, '0')}:00`;
        const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;

        const isBooked = existingBookings.some(booking => {
          const bookingStart = booking.timeSlot.startTime;
          const bookingEnd = booking.timeSlot.endTime;
          
          const overlap = !(
            slotEnd <= bookingStart || 
            slotStart >= bookingEnd
          );
          
          if (overlap) {
            console.log('Slot overlap found:', {
              slot: `${slotStart}-${slotEnd}`,
              booking: `${bookingStart}-${bookingEnd}`,
              bookingDate: booking.date
            });
          }
          
          return overlap;
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

      console.log('Generated slots:', availableSlots.map(s => ({
        time: `${s.startTime}-${s.endTime}`,
        isBooked: s.isBooked,
        available: s.available
      })));

      return availableSlots;
    } catch (error) {
      console.error('Error in getAvailableSlots:', error);
      throw error;
    }
  }

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
        currentRange.end = availableSlots[i].endTime;
      } else {
        ranges.push({ ...currentRange });
        currentRange = {
          start: availableSlots[i].startTime,
          end: availableSlots[i].endTime
        };
      }
    }

    ranges.push(currentRange);

    return ranges.map(r => `${r.start} - ${r.end}`);
  }
}