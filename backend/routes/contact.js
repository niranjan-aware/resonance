// backend/routes/contact.js
import express from 'express';
import { sendContactMessage, getContactInfo } from '../controllers/contactController.js';
import { rateLimitConfig } from '../middleware/rateLimiting.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

const validateContactForm = [
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
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject must be less than 200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  body('preferredContact')
    .optional()
    .isIn(['email', 'phone', 'whatsapp'])
    .withMessage('Invalid preferred contact method'),
  handleValidationErrors
];

router.post('/send', rateLimitConfig, validateContactForm, sendContactMessage);
router.get('/info', getContactInfo);

export default router;