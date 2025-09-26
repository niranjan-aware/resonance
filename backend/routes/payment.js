// backend/routes/payment.js
import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/auth.js';
import { validateCreatePayment, validatePaymentVerification } from '../middleware/validation.js';
import NotificationService from '../services/notificationService.js';

const router = express.Router();

/* ---------- Razorpay lazy init ---------- */
let razorpayClient = null;
function getRazorpayClient() {
  if (razorpayClient) return razorpayClient;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables.');
  }

  razorpayClient = new Razorpay({ key_id, key_secret });
  return razorpayClient;
}

/* ---------- Handlers (defined before route registration) ---------- */

// Create Razorpay order
export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    const booking = await Booking.findById(bookingId).populate('studio');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (booking.payment?.status === 'completed') return res.status(400).json({ success: false, message: 'Payment already completed' });
    if (amount !== booking.pricing.totalAmount) return res.status(400).json({ success: false, message: 'Payment amount does not match booking total' });

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `booking_${bookingId}_${Date.now()}`,
      notes: {
        booking_id: bookingId,
        user_id: req.user.id,
        studio_name: booking.studio.name
      }
    };

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create(options);

    booking.payment = booking.payment || {};
    booking.payment.razorpayOrderId = order.id;
    booking.payment.status = 'pending';
    await booking.save();

    res.status(200).json({
      success: true,
      order: { id: order.id, currency: order.currency, amount: order.amount, booking_id: bookingId },
      key_id: process.env.RAZORPAY_KEY_ID,
      booking: { id: booking._id, bookingId: booking.bookingId, studio: booking.studio.name, totalAmount: booking.pricing.totalAmount }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Verify payment (client posts razorpay_payment_id, razorpay_order_id, razorpay_signature)
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const booking = await Booking.findById(bookingId).populate('user studio');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    const razorpay = getRazorpayClient();
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status === 'captured' || payment.status === 'authorized') {
      booking.payment = {
        ...booking.payment,
        status: 'completed',
        method: 'online',
        transactionId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paidAmount: booking.pricing.totalAmount,
        paymentDate: new Date()
      };
      booking.status = 'confirmed';
      await booking.save();

      try {
        await NotificationService.sendBookingConfirmation(booking);
        await NotificationService.sendAdminNotification(booking, 'payment_received');
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        booking: { id: booking._id, bookingId: booking.bookingId, status: booking.status, paymentStatus: booking.payment.status, paidAmount: booking.payment.paidAmount },
        payment: { id: razorpay_payment_id, status: payment.status, method: payment.method, amount: payment.amount / 100 }
      });
    } else {
      booking.payment = booking.payment || {};
      booking.payment.status = 'failed';
      booking.payment.razorpayPaymentId = razorpay_payment_id;
      await booking.save();

      return res.status(400).json({ success: false, message: 'Payment verification failed', payment_status: payment.status });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Handle payment failure (client notifies server)
export const handlePaymentFailure = async (req, res) => {
  try {
    const { bookingId, error_description } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    booking.payment = booking.payment || {};
    booking.payment.status = 'failed';
    booking.payment.failureReason = error_description;
    await booking.save();

    res.status(200).json({ success: true, message: 'Payment failure recorded', booking: { id: booking._id, status: booking.status, paymentStatus: booking.payment.status } });
  } catch (error) {
    console.error('Handle payment failure error:', error);
    res.status(500).json({ success: false, message: 'Failed to handle payment failure', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { amount, reason } = req.body;

    const booking = await Booking.findById(bookingId).populate('user');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.payment?.status !== 'completed') return res.status(400).json({ success: false, message: 'Cannot refund payment that is not completed' });
    if (!booking.payment?.razorpayPaymentId) return res.status(400).json({ success: false, message: 'No Razorpay payment ID found for refund' });

    const refundAmount = amount || (typeof booking.calculateRefundAmount === 'function' ? booking.calculateRefundAmount() : 0);
    if (refundAmount <= 0) return res.status(400).json({ success: false, message: 'No refund amount available' });

    const razorpay = getRazorpayClient();
    const refund = await razorpay.payments.refund(booking.payment.razorpayPaymentId, {
      amount: Math.round(refundAmount * 100),
      speed: 'normal',
      notes: { booking_id: bookingId, reason: reason || 'Booking cancellation' }
    });

    booking.payment.refundAmount = refundAmount;
    booking.payment.refundDate = new Date();
    booking.payment.status = 'refunded';
    if (booking.cancellation) booking.cancellation.refundProcessed = true;
    await booking.save();

    // optional notification: you can implement NotificationService.sendRefundNotification
    try {
      console.log(`Refund processed for booking ${booking.bookingId}: ₹${refundAmount}`);
    } catch (notificationError) {
      console.error('Refund notification error:', notificationError);
    }

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refund: { id: refund.id, amount: refundAmount, status: refund.status, created_at: refund.created_at },
      booking: { id: booking._id, paymentStatus: booking.payment.status, refundAmount: booking.payment.refundAmount }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ success: false, message: 'Failed to process refund', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Get refund status
export const getRefundStatus = async (req, res) => {
  try {
    const { refundId } = req.params;
    const razorpay = getRazorpayClient();
    const refund = await razorpay.refunds.fetch(refundId);

    res.status(200).json({
      success: true,
      refund: { id: refund.id, amount: refund.amount / 100, status: refund.status, created_at: refund.created_at, processed_at: refund.processed_at }
    });
  } catch (error) {
    console.error('Get refund status error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch refund status', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Webhook helper functions
const handlePaymentCaptured = async (payment) => {
  try {
    const bookingId = payment.notes?.booking_id;
    if (!bookingId) return;
    const booking = await Booking.findById(bookingId).populate('user studio');
    if (!booking) return;

    if (booking.payment?.status !== 'completed') {
      booking.payment = {
        ...booking.payment,
        status: 'completed',
        method: 'online',
        transactionId: payment.id,
        razorpayPaymentId: payment.id,
        paidAmount: payment.amount / 100,
        paymentDate: new Date()
      };
      booking.status = 'confirmed';
      await booking.save();

      await NotificationService.sendBookingConfirmation(booking);
      await NotificationService.sendAdminNotification(booking, 'payment_received');
    }
  } catch (error) {
    console.error('Handle payment captured error:', error);
  }
};

const handlePaymentFailedWebhook = async (payment) => {
  try {
    const bookingId = payment.notes?.booking_id;
    if (!bookingId) return;
    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.payment = booking.payment || {};
      booking.payment.status = 'failed';
      booking.payment.failureReason = payment.error_description;
      await booking.save();
    }
  } catch (error) {
    console.error('Handle payment failed webhook error:', error);
  }
};

const handleOrderPaid = async (order) => {
  try {
    const bookingId = order.notes?.booking_id;
    if (!bookingId) return;
    console.log(`Order paid for booking: ${bookingId}`);
    // additional logic if needed
  } catch (error) {
    console.error('Handle order paid error:', error);
  }
};

// Webhook handler — uses raw body for signature verification
export const handleWebhook = async (req, res) => {
  try {
    // req.body is Buffer because express.raw() is used on this route
    const rawBody = req.body;
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      if (webhookSignature !== expectedSignature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const payload = JSON.parse(rawBody.toString());
    const event = payload.event;
    const data = payload.payload;

    console.log(`Received webhook: ${event}`);

    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(data.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailedWebhook(data.payment.entity);
        break;
      case 'order.paid':
        await handleOrderPaid(data.order.entity);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};

// Get payment details (including optional Razorpay fetch for admins)
export const getPaymentDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('user studio');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });

    const paymentDetails = {
      bookingId: booking._id,
      paymentStatus: booking.payment?.status,
      method: booking.payment?.method,
      amount: booking.pricing?.totalAmount,
      paidAmount: booking.payment?.paidAmount,
      paymentDate: booking.payment?.paymentDate,
      transactionId: booking.payment?.transactionId,
      razorpayOrderId: booking.payment?.razorpayOrderId,
      razorpayPaymentId: booking.payment?.razorpayPaymentId,
      refundAmount: booking.payment?.refundAmount,
      refundDate: booking.payment?.refundDate,
      failureReason: booking.payment?.failureReason
    };

    if (req.user.role === 'admin') {
      try {
        if (booking.payment?.razorpayPaymentId) {
          const razorpay = getRazorpayClient();
          const razorpayPayment = await razorpay.payments.fetch(booking.payment.razorpayPaymentId);
          paymentDetails.razorpayDetails = {
            id: razorpayPayment.id,
            status: razorpayPayment.status,
            method: razorpayPayment.method,
            bank: razorpayPayment.bank,
            wallet: razorpayPayment.wallet,
            vpa: razorpayPayment.vpa,
            card_id: razorpayPayment.card_id,
            created_at: razorpayPayment.created_at,
            fee: razorpayPayment.fee,
            tax: razorpayPayment.tax
          };
        }
      } catch (error) {
        console.log('Could not fetch Razorpay payment details:', error.message);
      }
    }

    res.status(200).json({ success: true, payment: paymentDetails });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment details', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Get payment statistics (Admin only)
export const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate, period = '30d' } = req.query;
    let dateQuery = {};
    const now = new Date();

    if (startDate || endDate) {
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
    } else {
      const periodDays = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
      const days = periodDays[period] || 30;
      const start = new Date(now);
      start.setDate(start.getDate() - days);
      dateQuery = { $gte: start, $lte: now };
    }

    const paymentsQuery = { 'payment.paymentDate': dateQuery };

    const [paymentStats = [], statusStats = [], methodStats = []] = await Promise.all([
      Booking.aggregate([
        { $match: { ...paymentsQuery, 'payment.status': 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$pricing.totalAmount' }, totalPayments: { $sum: 1 }, averagePayment: { $avg: '$pricing.totalAmount' }, totalRefunds: { $sum: '$payment.refundAmount' } } }
      ]),
      Booking.aggregate([
        { $match: paymentsQuery },
        { $group: { _id: '$payment.status', count: { $sum: 1 }, amount: { $sum: '$pricing.totalAmount' } } }
      ]),
      Booking.aggregate([
        { $match: { ...paymentsQuery, 'payment.status': 'completed' } },
        { $group: { _id: '$payment.method', count: { $sum: 1 }, amount: { $sum: '$pricing.totalAmount' } } }
      ])
    ]);

    const stats = (paymentStats && paymentStats[0]) || { totalRevenue: 0, totalPayments: 0, averagePayment: 0, totalRefunds: 0 };

    res.status(200).json({
      success: true,
      stats: {
        period: { start: dateQuery.$gte, end: dateQuery.$lte },
        summary: { totalRevenue: stats.totalRevenue, totalPayments: stats.totalPayments, averagePayment: Math.round(stats.averagePayment || 0), totalRefunds: stats.totalRefunds, netRevenue: stats.totalRevenue - stats.totalRefunds },
        byStatus: statusStats,
        byMethod: methodStats
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment statistics', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

/* ---------- Route registration (after handlers are defined) ---------- */

// Protected routes
router.post('/create-order', protect, validateCreatePayment, createPaymentOrder);
router.post('/verify', protect, validatePaymentVerification, verifyPayment);
router.post('/failure', protect, handlePaymentFailure);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook); // webhook must be raw
router.get('/details/:bookingId', protect, getPaymentDetails);
router.post('/refund/:bookingId', protect, processRefund);
router.get('/refund/:refundId', protect, getRefundStatus);
router.get('/stats', protect, getPaymentStats);

export default router;
