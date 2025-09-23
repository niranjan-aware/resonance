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

    res.status(200).json({
      success: true,
      slots,
      count: slots.length
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
        message: 'All booking details are required'
      });
    }

    const bookingData = {
      userId: req.user.id,
      studioId,
      date,
      startTime,
      endTime,
      sessionType,
      sessionDetails: sessionDetails || {}
    };

    const booking = await BookingEngine.createBooking(bookingData);

    await NotificationService.sendAdminNotification(booking, 'new_booking');

    res.status(201).json({
      success: true,
      booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
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

    await NotificationService.sendBookingConfirmation(confirmedBooking);

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

    await NotificationService.sendBookingCancellation(result.booking);
    await NotificationService.sendAdminNotification(result.booking, 'cancelled_booking');

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