import { BookingEngine } from '../services/bookingEngine.js';
import Booking from '../models/Booking.js';
import Studio from '../models/Studio.js';
import NotificationService from '../services/notificationService.js';

export const checkAvailability = async (req, res) => {
  try {
    const { studioId, date, startTime, endTime } = req.query;

    if (!studioId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Studio ID, date, start time, and end time are required'
      });
    }

    const availability = await BookingEngine.checkAvailability(
      studioId, date, startTime, endTime
    );

    res.status(200).json({
      success: true,
      available: availability.available,
      studio: availability.studio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      available: false
    });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { studioId, date } = req.query;

    if (!studioId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Studio ID and date are required'
      });
    }

    const slots = await BookingEngine.getAvailableSlots(studioId, date);

    const availableCount = slots.filter(s => s.available).length;
    const bookedCount = slots.filter(s => s.isBooked).length;
    const totalSlots = slots.length;

    const timeRanges = BookingEngine.getAvailableTimeRanges(slots);

    res.status(200).json({
      success: true,
      slots,
      summary: {
        total: totalSlots,
        available: availableCount,
        booked: bookedCount,
        availabilityPercentage: Math.round((availableCount / totalSlots) * 100),
        timeRanges
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const createBooking = async (req, res) => {
  try {
    const {
      studioId,
      date,
      startTime,
      endTime,
      sessionType,
      sessionDetails
    } = req.body;

    if (!studioId || !date || !startTime || !endTime || !sessionType) {
      return res.status(400).json({
        success: false,
        message: 'All booking details are required',
        errors: [
          { field: 'studioId', message: !studioId ? 'Studio is required' : null },
          { field: 'date', message: !date ? 'Date is required' : null },
          { field: 'startTime', message: !startTime ? 'Start time is required' : null },
          { field: 'endTime', message: !endTime ? 'End time is required' : null },
          { field: 'sessionType', message: !sessionType ? 'Session type is required' : null }
        ].filter(e => e.message)
      });
    }

    const studio = await Studio.findById(studioId);
    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const durationHours = (end - start) / (1000 * 60 * 60);

    let hourlyRate = 
      studio.pricing?.hourlyRate || 
      studio.pricing?.basePrice || 
      1000;

    if (!hourlyRate || isNaN(hourlyRate) || hourlyRate <= 0) {
      hourlyRate = 1000;
    }

    const isPeakHour = BookingEngine.isPeakHour(startTime, endTime);
    const peakMultiplier = isPeakHour ? (studio.pricing?.peakHourMultiplier || 1.5) : 1;

    const baseAmount = Math.round(hourlyRate * durationHours * peakMultiplier);
    const taxes = Math.round(baseAmount * 0.18);
    const totalAmount = baseAmount + taxes;

    if (isNaN(baseAmount) || isNaN(taxes) || isNaN(totalAmount)) {
      throw new Error('Pricing calculation resulted in invalid values');
    }

    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const generatedBookingId = `RES-${timestamp}-${random}`;

    const bookingData = {
      bookingId: generatedBookingId,
      user: req.user.id,
      studio: studioId,
      date: new Date(date),
      timeSlot: {
        startTime: startTime,
        endTime: endTime
      },
      sessionType,
      sessionDetails: sessionDetails || {},
      pricing: {
        baseAmount,
        equipmentCost: 0,
        taxes,
        discount: 0,
        totalAmount
      },
      metadata: {
        source: 'website',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    };

    const booking = await Booking.create(bookingData);

    const populatedBooking = await Booking.findById(booking._id)
      .populate('studio', 'name size capacity pricing location images')
      .populate('user', 'name email phone')
      .lean();

    try {
      await NotificationService.sendBookingCreatedNotification(populatedBooking);
      await NotificationService.sendAdminNotification(populatedBooking, 'new_booking');
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.status(201).json({
      success: true,
      booking: populatedBooking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Booking validation failed',
        errors
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create booking'
    });
  }
};

export const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentDetails } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this booking'
      });
    }

    const confirmedBooking = await BookingEngine.confirmBooking(
      bookingId, 
      paymentDetails
    );

    const populatedBooking = await Booking.findById(confirmedBooking._id)
      .populate('studio', 'name size capacity pricing location images')
      .populate('user', 'name email phone');

    await NotificationService.sendBookingConfirmation(populatedBooking);

    res.status(200).json({
      success: true,
      booking: confirmedBooking,
      message: 'Booking confirmed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    const result = await BookingEngine.cancelBooking(
      bookingId, 
      req.user.id, 
      reason
    );

    const populatedBooking = await Booking.findById(result.booking._id)
      .populate('studio', 'name size capacity pricing location images')
      .populate('user', 'name email phone');

    await NotificationService.sendBookingCancellation(populatedBooking);
    await NotificationService.sendAdminNotification(populatedBooking, 'cancelled_booking');

    res.status(200).json({
      success: true,
      booking: result.booking,
      refundAmount: result.refundAmount,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;

    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('studio', 'name size images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email phone')
      .populate('studio');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const validStatuses = ['confirmed', 'checked-in', 'completed', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).populate('user studio');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      booking,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const addBookingFeedback = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add feedback for this booking'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only add feedback for completed bookings'
      });
    }

    booking.feedback = {
      rating,
      review,
      submittedAt: new Date()
    };

    await booking.save();

    const studio = await Studio.findById(booking.studio);
    const newAverage = ((studio.ratings.average * studio.ratings.count) + rating) / (studio.ratings.count + 1);
    
    await Studio.findByIdAndUpdate(booking.studio, {
      'ratings.average': Math.round(newAverage * 10) / 10,
      'ratings.count': studio.ratings.count + 1
    });

    res.status(200).json({
      success: true,
      booking,
      message: 'Feedback added successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};