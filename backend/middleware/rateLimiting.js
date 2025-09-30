import rateLimit from 'express-rate-limit';

// Helper function to create rate limiter with zero-check
const createRateLimiter = (config) => {
  // If max is 0, return a pass-through middleware (no rate limiting)
  if (config.max === 0) {
    return (req, res, next) => next();
  }
  return rateLimit(config);
};

export const rateLimitConfig = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes (fixed: was 10000ms = 10 seconds)
  max: 0, // Set to 0 to disable, or increase to 200-500 for development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Set to 0 to disable
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
});

export const bookingLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute (fixed: was 10000ms = 10 seconds)
  max: 0, // Set to 0 to disable - RECOMMENDED for calendar availability checks
  message: {
    success: false,
    message: 'Too many booking attempts, please wait before trying again'
  }
});

export const otpLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Changed from 1 to 3 - allows 3 OTP requests per minute
  message: {
    success: false,
    message: 'Please wait before requesting another OTP'
  }
});