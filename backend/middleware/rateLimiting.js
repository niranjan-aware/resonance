import rateLimit from 'express-rate-limit';

export const rateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 10000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 10000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 10000,
  max: 3,
  message: {
    success: false,
    message: 'Too many booking attempts, please wait before trying again'
  }
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 10000,
  max: 1,
  message: {
    success: false,
    message: 'Please wait before requesting another OTP'
  }
});