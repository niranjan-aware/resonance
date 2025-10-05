import express from 'express';
import {
  getBookingsByDate,
  getBookingsByDateRange,
  getDashboardStats,
  getAllUsers,
  updateUserRole
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { rateLimitConfig } from '../middleware/rateLimiting.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));
router.use(rateLimitConfig);

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Booking routes
router.get('/bookings/date/:date', getBookingsByDate);
router.get('/bookings/date-range', getBookingsByDateRange);

// User management routes
router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);

export default router;