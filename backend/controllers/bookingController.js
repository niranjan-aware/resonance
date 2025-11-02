import { BookingEngine } from '../services/bookingEngine.js';
import Booking from '../models/Booking.js';
import Studio from '../models/Studio.js';
import NotificationService from '../services/notificationService.js';
import GoogleIntegrationService from '../services/googleIntegration.js';

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
        availabilityPercentage: totalSlots > 0 ? Math.round((availableCount / totalSlots) * 100) : 0,
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

    // Validation
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

    console.log(`📝 Creating booking for user ${req.user.id} at studio ${studioId}`);

    // Use BookingEngine to create booking (with atomic transaction)
    const booking = await BookingEngine.createBooking({
      userId: req.user.id,
      studioId,
      date,
      startTime,
      endTime,
      sessionType,
      sessionDetails: sessionDetails || {},
      metadata: {
        source: 'website',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    console.log(`✅ Booking created successfully: ${booking.bookingId}`);

    // Google Integration (non-blocking - runs in background)
    setImmediate(async () => {
      try {
        console.log('🔄 Starting Google Integration...');
        
        const calendarEvent = await GoogleIntegrationService.addToCalendar(booking);
        await GoogleIntegrationService.addToSheet(booking);
        
        if (calendarEvent?.id) {
          await Booking.findByIdAndUpdate(booking._id, {
            'googleIntegration.calendarEventId': calendarEvent.id,
            'googleIntegration.syncStatus': 'synced',
            'googleIntegration.lastSyncedAt': new Date()
          });
        }
        
        console.log('✅ Google Integration successful');
      } catch (googleError) {
        console.error('❌ Google Integration error:', googleError);
        
        await Booking.findByIdAndUpdate(booking._id, {
          'googleIntegration.syncStatus': 'failed',
          'googleIntegration.syncError': googleError.message
        });
      }
    });

    // Send notifications (non-blocking)
    setImmediate(async () => {
      try {
        // await NotificationService.sendBookingCreatedNotification(booking);
        // await NotificationService.sendAdminNotification(booking, 'new_booking');
      } catch (notifError) {
        console.error('Notification error:', notifError);
      }
    });

    res.status(201).json({
      success: true,
      booking,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('❌ Booking creation error:', error);
    
    // Handle specific errors
    if (error.message.includes('already booked')) {
      return res.status(409).json({
        success: false,
        message: error.message,
        code: 'SLOT_ALREADY_BOOKED'
      });
    }

    if (error.message.includes('high traffic')) {
      return res.status(503).json({
        success: false,
        message: error.message,
        code: 'BOOKING_CONFLICT'
      });
    }
    
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

    // Update Google Calendar event
    setImmediate(async () => {
      try {
        if (booking.googleIntegration?.calendarEventId) {
          await GoogleIntegrationService.updateCalendarEvent(
            confirmedBooking,
            booking.googleIntegration.calendarEventId
          );
        }
        
        await GoogleIntegrationService.updateSheetRow(confirmedBooking);
        
        await Booking.findByIdAndUpdate(bookingId, {
          'googleIntegration.syncStatus': 'synced',
          'googleIntegration.lastSyncedAt': new Date()
        });
      } catch (googleError) {
        console.error('Google sync error:', googleError);
      }
    });

    // Send confirmation notification
    setImmediate(async () => {
      try {
        await NotificationService.sendBookingConfirmation(confirmedBooking);
      } catch (notifError) {
        console.error('Notification error:', notifError);
      }
    });

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

    // Update Google services
    setImmediate(async () => {
      try {
        if (booking.googleIntegration?.calendarEventId) {
          await GoogleIntegrationService.deleteCalendarEvent(
            booking.studio,
            booking.googleIntegration.calendarEventId
          );
        }
        
        await GoogleIntegrationService.updateSheetRow(populatedBooking);
        
        await Booking.findByIdAndUpdate(bookingId, {
          'googleIntegration.syncStatus': 'synced',
          'googleIntegration.lastSyncedAt': new Date()
        });
      } catch (googleError) {
        console.error('Google sync error:', googleError);
      }
    });

    // Send notifications
    setImmediate(async () => {
      try {
        await NotificationService.sendBookingCancellation(populatedBooking);
        await NotificationService.sendAdminNotification(populatedBooking, 'cancelled_booking');
      } catch (notifError) {
        console.error('Notification error:', notifError);
      }
    });

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
      .populate('studio', 'name size images pricing')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        current: parseInt(page),
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

    // Update Google services
    setImmediate(async () => {
      try {
        if (booking.googleIntegration?.calendarEventId) {
          await GoogleIntegrationService.updateCalendarEvent(
            booking,
            booking.googleIntegration.calendarEventId
          );
        }
        
        await GoogleIntegrationService.updateSheetRow(booking);
        
        await Booking.findByIdAndUpdate(bookingId, {
          'googleIntegration.syncStatus': 'synced',
          'googleIntegration.lastSyncedAt': new Date()
        });
      } catch (googleError) {
        console.error('Google sync error:', googleError);
      }
    });

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

    // Update studio ratings
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

export const getCalendarUrls = async (req, res) => {
  try {
    const studios = await Studio.find({ isActive: true }).select('_id name');
    
    const calendarUrls = studios.map(studio => ({
      studioId: studio._id,
      studioName: studio.name,
      calendarUrl: GoogleIntegrationService.getCalendarPublicUrl(studio._id)
    }));

    res.status(200).json({
      success: true,
      calendars: calendarUrls,
      sheetUrl: GoogleIntegrationService.getSheetPublicUrl()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};