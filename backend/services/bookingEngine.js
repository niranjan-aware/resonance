import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Studio from '../models/Studio.js';
import User from '../models/User.js';

export class BookingEngine {
  static async checkAvailability(studioId, date, startTime, endTime) {
    try {
      const studio = await Studio.findById(studioId);
      if (!studio || !studio.isActive) {
        throw new Error('Studio not found or not available');
      }

      if (!studio.isAvailableAt(date, startTime, endTime)) {
        throw new Error('Studio not available during requested time');
      }

      const existingBookings = await Booking.find({
        studio: studioId,
        date: new Date(date),
        status: { $in: ['confirmed', 'checked-in'] },
        $or: [
          {
            'timeSlot.startTime': { $lt: endTime },
            'timeSlot.endTime': { $gt: startTime }
          }
        ]
      });

      if (existingBookings.length > 0) {
        throw new Error('Time slot is already booked');
      }

      return { available: true, studio };
    } catch (error) {
      throw error;
    }
  }

  static async createBooking(bookingData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { userId, studioId, date, startTime, endTime, sessionType, sessionDetails } = bookingData;

      const availability = await this.checkAvailability(studioId, date, startTime, endTime);
      const studio = availability.studio;

      const lockKey = `booking_lock_${studioId}_${date}_${startTime}`;
      const existingLock = await this.checkBookingLock(lockKey);
      
      if (existingLock) {
        throw new Error('Another booking is being processed for this time slot');
      }

      await this.createBookingLock(lockKey, userId);

      const baseAmount = studio.calculatePrice(date, startTime, endTime, sessionDetails.equipment || []);
      const taxes = Math.round(baseAmount * 0.18);

      const booking = new Booking({
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
        status: 'pending'
      });

      await booking.save({ session });

      await User.findByIdAndUpdate(
        userId,
        { 
          $push: { 
            bookingHistory: { 
              booking: booking._id, 
              status: 'pending', 
              bookedAt: new Date() 
            } 
          } 
        },
        { session }
      );

      await studio.updateOne(
        { $inc: { 'bookingStats.totalBookings': 1 } },
        { session }
      );

      await session.commitTransaction();

      await this.releaseBookingLock(lockKey);

      return await Booking.findById(booking._id)
        .populate('user', 'name email phone')
        .populate('studio', 'name size images');

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async confirmBooking(bookingId, paymentDetails = null) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await Booking.findById(bookingId).session(session);
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'pending') {
        throw new Error('Booking cannot be confirmed');
      }

      const updateData = { status: 'confirmed' };
      
      if (paymentDetails) {
        updateData.payment = {
          ...booking.payment,
          ...paymentDetails,
          status: 'completed',
          paymentDate: new Date()
        };
      }

      const confirmedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        updateData,
        { new: true, session }
      ).populate('user studio');

      await session.commitTransaction();

      return confirmedBooking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async cancelBooking(bookingId, userId, reason = '') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await Booking.findById(bookingId).session(session);
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.user.toString() !== userId && booking.status !== 'pending') {
        throw new Error('Cannot cancel this booking');
      }

      if (!booking.canCancel) {
        throw new Error('Booking cannot be cancelled (less than 24 hours remaining)');
      }

      const refundAmount = booking.calculateRefundAmount();

      const cancelledBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          status: 'cancelled',
          cancellation: {
            reason,
            cancelledAt: new Date(),
            cancelledBy: userId,
            refundEligible: refundAmount > 0,
            refundProcessed: false
          },
          'payment.refundAmount': refundAmount
        },
        { new: true, session }
      );

      await session.commitTransaction();

      return { booking: cancelledBooking, refundAmount };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getAvailableSlots(studioId, date) {
    try {
      const studio = await Studio.findById(studioId);
      if (!studio) {
        throw new Error('Studio not found');
      }

      const requestedDate = new Date(date);
      const dayOfWeek = requestedDate.getDay();

      if (!studio.availability.workingDays.includes(dayOfWeek)) {
        return [];
      }

      const existingBookings = await Booking.find({
        studio: studioId,
        date: requestedDate,
        status: { $in: ['confirmed', 'checked-in'] }
      });

      const studioStart = studio.availability.startTime;
      const studioEnd = studio.availability.endTime;
      
      const startHour = parseInt(studioStart.split(':')[0]);
      const endHour = parseInt(studioEnd.split(':')[0]);

      const availableSlots = [];

      for (let hour = startHour; hour < endHour; hour++) {
        const slotStart = `${hour.toString().padStart(2, '0')}:00`;
        const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;

        const isBooked = existingBookings.some(booking => {
          return !(
            slotEnd <= booking.timeSlot.startTime || 
            slotStart >= booking.timeSlot.endTime
          );
        });

        if (!isBooked) {
          const isPeakHour = studio.availability.peakHours.some(peak => 
            slotStart >= peak.start && slotEnd <= peak.end
          );

          availableSlots.push({
            startTime: slotStart,
            endTime: slotEnd,
            price: studio.calculatePrice(date, slotStart, slotEnd),
            isPeakHour
          });
        }
      }

      return availableSlots;
    } catch (error) {
      throw error;
    }
  }

  static async createBookingLock(key, userId, ttl = 300) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 100);
    });
  }

  static async checkBookingLock(key) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(false), 50);
    });
  }

  static async releaseBookingLock(key) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 10);
    });
  }
}