import express from 'express';
import {
  checkAvailability,
  getAvailableSlots,
  createBooking,
  confirmBooking,
  cancelBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  addBookingFeedback
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';
import { bookingLimiter } from '../middleware/rateLimiting.js';
import { 
  validateCreateBooking,
  validateGetAvailableSlots,
  validateCheckAvailability,
  validateConfirmBooking,
  validateCancelBooking,
  validateUpdateBookingStatus,
  validateAddFeedback
} from '../middleware/validation.js';

const router = express.Router();

router.get('/availability', validateCheckAvailability, checkAvailability);
router.get('/slots', validateGetAvailableSlots, getAvailableSlots);
router.post('/', protect, bookingLimiter, validateCreateBooking, createBooking);
router.put('/:bookingId/confirm', protect, validateConfirmBooking, confirmBooking);
router.put('/:bookingId/cancel', protect, validateCancelBooking, cancelBooking);
router.get('/user', protect, getUserBookings);
router.get('/:bookingId', protect, getBookingById);
router.put('/:bookingId/status', protect, authorize('admin'), validateUpdateBookingStatus, updateBookingStatus);
router.post('/:bookingId/feedback', protect, validateAddFeedback, addBookingFeedback);

export default router;