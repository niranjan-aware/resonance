import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Error handler for validation results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// Custom validators
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const isValidPhoneNumber = (value) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(value);
};

const isValidTime = (value) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(value);
};

const isValidDate = (value) => {
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return !isNaN(date.getTime()) && date >= tomorrow;
};

const isValidSessionType = (value) => {
  const validTypes = ['karaoke', 'live-musicians', 'band', 'audio-recording', 'video-recording', 'fb-live', 'show'];
  return validTypes.includes(value);
};

const isValidStudioSize = (value) => {
  const validSizes = ['small', 'medium', 'large'];
  return validSizes.includes(value);
};

const isValidBookingStatus = (value) => {
  const validStatuses = ['pending', 'confirmed', 'checked-in', 'completed', 'cancelled', 'no-show'];
  return validStatuses.includes(value);
};

// Auth validation rules
export const validateSendOTP = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .custom(isValidPhoneNumber)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

export const validateVerifyOTP = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .custom(isValidPhoneNumber)
    .withMessage('Please provide a valid phone number'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .custom(isValidPhoneNumber)
    .withMessage('Please provide a valid phone number'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be boolean'),
  body('preferences.notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification preference must be boolean'),
  body('preferences.notifications.whatsapp')
    .optional()
    .isBoolean()
    .withMessage('WhatsApp notification preference must be boolean'),
  handleValidationErrors
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
  handleValidationErrors
];

// Studio validation rules
export const validateCreateStudio = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Studio name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Studio name must be between 3 and 100 characters'),
  body('size')
    .notEmpty()
    .withMessage('Studio size is required')
    .custom(isValidStudioSize)
    .withMessage('Studio size must be small, medium, or large'),
  body('capacity')
    .isInt({ min: 1, max: 50 })
    .withMessage('Capacity must be between 1 and 50'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('features')
    .isArray({ min: 1 })
    .withMessage('At least one feature is required'),
  body('features.*')
    .trim()
    .notEmpty()
    .withMessage('Feature cannot be empty'),
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('pricing.peakHourMultiplier')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Peak hour multiplier must be at least 1'),
  body('pricing.minimumHours')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum hours must be at least 1'),
  body('pricing.maximumHours')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Maximum hours must be between 1 and 24'),
  body('availability.startTime')
    .custom(isValidTime)
    .withMessage('Start time must be in HH:MM format'),
  body('availability.endTime')
    .custom(isValidTime)
    .withMessage('End time must be in HH:MM format'),
  body('availability.workingDays')
    .isArray({ min: 1 })
    .withMessage('At least one working day is required'),
  body('availability.workingDays.*')
    .isInt({ min: 0, max: 6 })
    .withMessage('Working days must be between 0 (Sunday) and 6 (Saturday)'),
  body('suitableFor')
    .isArray({ min: 1 })
    .withMessage('At least one suitable session type is required'),
  body('suitableFor.*')
    .custom(isValidSessionType)
    .withMessage('Invalid session type'),
  handleValidationErrors
];

export const validateUpdateStudio = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Studio name must be between 3 and 100 characters'),
  body('size')
    .optional()
    .custom(isValidStudioSize)
    .withMessage('Studio size must be small, medium, or large'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Capacity must be between 1 and 50'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('features')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one feature is required'),
  body('pricing.basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('availability.startTime')
    .optional()
    .custom(isValidTime)
    .withMessage('Start time must be in HH:MM format'),
  body('availability.endTime')
    .optional()
    .custom(isValidTime)
    .withMessage('End time must be in HH:MM format'),
  handleValidationErrors
];

// Booking validation rules
export const validateCreateBooking = [
  body('studioId')
    .notEmpty()
    .withMessage('Studio ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid studio ID'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .custom(isValidDate)
    .withMessage('Date must be in the future'),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .custom(isValidTime)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .custom(isValidTime)
    .withMessage('End time must be in HH:MM format')
    .custom((endTime, { req }) => {
      if (!req.body.startTime) return true;
      
      const start = new Date(`1970-01-01T${req.body.startTime}:00`);
      const end = new Date(`1970-01-01T${endTime}:00`);
      
      if (end <= start) {
        throw new Error('End time must be after start time');
      }
      
      const duration = (end - start) / (1000 * 60 * 60);
      if (duration < 1) {
        throw new Error('Minimum booking duration is 1 hour');
      }
      
      return true;
    }),
  body('sessionType')
    .notEmpty()
    .withMessage('Session type is required')
    .custom(isValidSessionType)
    .withMessage('Invalid session type'),
  body('sessionDetails.participants')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Participants must be between 1 and 50'),
  body('sessionDetails.musicians')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Musicians must be between 1 and 20'),
  body('sessionDetails.equipment')
    .optional()
    .isArray()
    .withMessage('Equipment must be an array'),
  body('sessionDetails.specialRequirements')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requirements must be less than 500 characters'),
  handleValidationErrors
];

export const validateConfirmBooking = [
  param('bookingId')
    .custom(isValidObjectId)
    .withMessage('Invalid booking ID'),
  body('paymentDetails')
    .optional()
    .isObject()
    .withMessage('Payment details must be an object'),
  body('paymentDetails.transactionId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Transaction ID cannot be empty'),
  body('paymentDetails.method')
    .optional()
    .isIn(['online', 'cash', 'bank-transfer'])
    .withMessage('Invalid payment method'),
  handleValidationErrors
];

export const validateCancelBooking = [
  param('bookingId')
    .custom(isValidObjectId)
    .withMessage('Invalid booking ID'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason must be less than 500 characters'),
  handleValidationErrors
];

export const validateUpdateBookingStatus = [
  param('bookingId')
    .custom(isValidObjectId)
    .withMessage('Invalid booking ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .custom(isValidBookingStatus)
    .withMessage('Invalid booking status'),
  handleValidationErrors
];

export const validateAddFeedback = [
  param('bookingId')
    .custom(isValidObjectId)
    .withMessage('Invalid booking ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review must be less than 1000 characters'),
  handleValidationErrors
];

// Query validation rules
export const validateGetStudios = [
  query('sessionType')
    .optional()
    .custom(isValidSessionType)
    .withMessage('Invalid session type'),
  query('capacity')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Capacity must be between 1 and 50'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('size')
    .optional()
    .custom(isValidStudioSize)
    .withMessage('Invalid studio size'),
  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'rating', 'capacity', 'createdAt'])
    .withMessage('Invalid sort field'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

export const validateGetBookings = [
  query('status')
    .optional()
    .custom(isValidBookingStatus)
    .withMessage('Invalid booking status'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  handleValidationErrors
];

export const validateCheckAvailability = [
  query('studioId')
    .notEmpty()
    .withMessage('Studio ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid studio ID'),
  query('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be in valid format'),
  query('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .custom(isValidTime)
    .withMessage('Start time must be in HH:MM format'),
  query('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .custom(isValidTime)
    .withMessage('End time must be in HH:MM format'),
  handleValidationErrors
];

export const validateGetAvailableSlots = [
  query('studioId')
    .notEmpty()
    .withMessage('Studio ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid studio ID'),
  query('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be in valid format'),
  handleValidationErrors
];

// Parameter validation
export const validateObjectIdParam = (paramName = 'id') => [
  param(paramName)
    .custom(isValidObjectId)
    .withMessage(`Invalid ${paramName}`),
  handleValidationErrors
];

// Payment validation rules
export const validateCreatePayment = [
  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid booking ID'),
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .optional()
    .isIn(['INR'])
    .withMessage('Currency must be INR'),
  handleValidationErrors
];

export const validatePaymentVerification = [
  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required'),
  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .custom(isValidObjectId)
    .withMessage('Invalid booking ID'),
  handleValidationErrors
];

// File upload validation
export const validateImageUpload = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one image is required'
    });
  }

  // Validate file types and sizes
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  for (const file of req.files) {
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only JPEG, PNG, and WebP images are allowed'
      });
    }

    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'Image size must be less than 10MB'
      });
    }
  }

  next();
};

// Sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Remove any HTML tags and trim strings
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'string') {
        // Remove HTML tags and trim
        obj[key] = obj[key].replace(/<[^>]*>/g, '').trim();
      } else if (obj[key] && typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

export default {
  handleValidationErrors,
  validateSendOTP,
  validateVerifyOTP,
  validateLogin,
  validateRegister,
  validateUpdateProfile,
  validateChangePassword,
  validateCreateStudio,
  validateUpdateStudio,
  validateCreateBooking,
  validateConfirmBooking,
  validateCancelBooking,
  validateUpdateBookingStatus,
  validateAddFeedback,
  validateGetStudios,
  validateGetBookings,
  validateCheckAvailability,
  validateGetAvailableSlots,
  validateObjectIdParam,
  validateCreatePayment,
  validatePaymentVerification,
  validateImageUpload,
  sanitizeInput
};