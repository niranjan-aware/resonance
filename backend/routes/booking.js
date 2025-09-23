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

const router = express.Router();

router.get('/availability', checkAvailability);
router.get('/slots', getAvailableSlots);
router.post('/', protect, bookingLimiter, createBooking);
router.put('/:bookingId/confirm', protect, confirmBooking);
router.put('/:bookingId/cancel', protect, cancelBooking);
router.get('/user', protect, getUserBookings);
router.get('/:bookingId', protect, getBookingById);
router.put('/:bookingId/status', protect, authorize('admin'), updateBookingStatus);
router.post('/:bookingId/feedback', protect, addBookingFeedback);

export default router;