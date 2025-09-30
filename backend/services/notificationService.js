import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { emailTemplates } from '../utils/emailTemplates.js';
import Booking from '../models/Booking.js';
import cron from 'node-cron';

class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.twilioClient = null;
    this.adminEmail = 'niroba.aware.26@gmail.com';
    this.initializeEmail();
    this.initializeTwilio();
    this.startScheduledJobs();
  }

  initializeEmail() {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email configuration missing. Email notifications will be disabled.');
      return;
    }

    try {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      this.emailTransporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email configuration error:', error.message);
        } else {
          console.log('✅ Email service ready');
        }
      });
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
    }
  }

  initializeTwilio() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn('⚠️ Twilio configuration missing. SMS/WhatsApp notifications will be disabled.');
      return;
    }

    try {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log('✅ Twilio service ready');
    } catch (error) {
      console.error('❌ Failed to initialize Twilio service:', error.message);
    }
  }

  startScheduledJobs() {
    cron.schedule('0 * * * *', () => {
      this.sendHourlyAdminDigest();
    });

    cron.schedule('0 20 * * *', () => {
      this.sendTomorrowBookingsToAdmin();
    });

    cron.schedule('*/15 * * * *', () => {
      this.checkAndSendReminders();
    });

    console.log('✅ Scheduled notification jobs started');
  }

  async sendEmail(to, subject, template, data) {
    if (!this.emailTransporter) {
      console.warn('Email service not configured. Skipping email to:', to);
      return null;
    }

    try {
      const htmlContent = emailTemplates[template](data);
      
      const mailOptions = {
        from: `Resonance Studio <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log(`✉️ Email sent to ${to}:`, result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Email send error:', error.message);
      throw error;
    }
  }

  async sendSMS(to, message) {
    if (!this.twilioClient) {
      console.warn('Twilio service not configured. Skipping SMS to:', to);
      return null;
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });

      console.log(`📱 SMS sent to ${to}:`, result.sid);
      return result;
    } catch (error) {
      console.error('❌ SMS send error:', error.message);
      throw error;
    }
  }

  async sendWhatsApp(to, message) {
    if (!this.twilioClient) {
      console.warn('Twilio service not configured. Skipping WhatsApp to:', to);
      return null;
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${to}`
      });

      console.log(`💬 WhatsApp sent to ${to}:`, result.sid);
      return result;
    } catch (error) {
      console.error('❌ WhatsApp send error:', error.message);
      throw error;
    }
  }

  async sendOTP(phone, otp) {
    try {
      const message = `Your Resonance Studio verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
      
      console.log(`📲 Sending OTP to ${phone}: ${otp}`);
      
      if (phone.includes('whatsapp:')) {
        return await this.sendWhatsApp(phone, message);
      } else {
        return await this.sendSMS(phone, message);
      }
    } catch (error) {
      console.error('❌ OTP send error:', error.message);
      throw error;
    }
  }

  async sendBookingCreatedNotification(booking) {
    try {
      const user = booking.user;
      const studio = booking.studio;

      const emailData = {
        userName: user.name,
        bookingId: booking.bookingId,
        studioName: studio.name,
        date: new Date(booking.date).toLocaleDateString('en-IN'),
        startTime: booking.timeSlot.startTime,
        endTime: booking.timeSlot.endTime,
        sessionType: booking.sessionType,
        totalAmount: booking.pricing.totalAmount,
        status: 'pending',
        studioImage: studio.images?.[0]?.url
      };

      if (user.preferences?.notifications?.email !== false) {
        await this.sendEmail(
          user.email,
          `Booking Created - ${booking.bookingId}`,
          'bookingCreated',
          emailData
        );
      }

      const smsMessage = `Resonance Studio: Booking ${booking.bookingId} created for ${studio.name} on ${emailData.date} at ${booking.timeSlot.startTime}. Total: ₹${booking.pricing.totalAmount}. Please complete payment to confirm.`;

      if (user.preferences?.notifications?.sms !== false) {
        await this.sendSMS(user.phone, smsMessage);
      }

      return true;
    } catch (error) {
      console.error('❌ Booking created notification error:', error.message);
      return false;
    }
  }

  async sendBookingConfirmation(booking) {
    try {
      const user = booking.user;
      const studio = booking.studio;

      const emailData = {
        userName: user.name,
        bookingId: booking.bookingId,
        studioName: studio.name,
        date: new Date(booking.date).toLocaleDateString('en-IN'),
        startTime: booking.timeSlot.startTime,
        endTime: booking.timeSlot.endTime,
        sessionType: booking.sessionType,
        totalAmount: booking.pricing.totalAmount,
        studioImage: studio.images?.[0]?.url
      };

      if (user.preferences?.notifications?.email !== false) {
        await this.sendEmail(
          user.email,
          `Booking Confirmed - ${booking.bookingId}`,
          'bookingConfirmation',
          emailData
        );
      }

      const smsMessage = `Resonance Studio: Booking ${booking.bookingId} confirmed for ${studio.name} on ${emailData.date} at ${booking.timeSlot.startTime}. Total: ₹${booking.pricing.totalAmount}`;

      if (user.preferences?.notifications?.sms !== false) {
        await this.sendSMS(user.phone, smsMessage);
      }

      if (user.preferences?.notifications?.whatsapp !== false) {
        await this.sendWhatsApp(user.phone, smsMessage);
      }

      return true;
    } catch (error) {
      console.error('❌ Booking confirmation error:', error.message);
      return false;
    }
  }

  async sendBookingReminder(booking, type) {
    try {
      const user = booking.user;
      const studio = booking.studio;

      const timeMessages = {
        '3hours': '3 hours',
        '6hours': '6 hours',
        '12hours': '12 hours',
        '24hours': '24 hours'
      };

      const emailData = {
        userName: user.name,
        bookingId: booking.bookingId,
        studioName: studio.name,
        date: new Date(booking.date).toLocaleDateString('en-IN'),
        startTime: booking.timeSlot.startTime,
        timeUntil: timeMessages[type]
      };

      if (user.preferences?.notifications?.email !== false) {
        await this.sendEmail(
          user.email,
          `Upcoming Booking Reminder - ${booking.bookingId}`,
          'bookingReminder',
          emailData
        );
      }

      const message = `Reminder: Your Resonance Studio booking ${booking.bookingId} is in ${timeMessages[type]} (${emailData.date} at ${booking.timeSlot.startTime})`;

      if (user.preferences?.notifications?.sms !== false) {
        await this.sendSMS(user.phone, message);
      }

      return true;
    } catch (error) {
      console.error('❌ Booking reminder error:', error.message);
      return false;
    }
  }

  async sendBookingCancellation(booking) {
    try {
      const user = booking.user;
      const studio = booking.studio;

      const emailData = {
        userName: user.name,
        bookingId: booking.bookingId,
        studioName: studio.name,
        date: new Date(booking.date).toLocaleDateString('en-IN'),
        startTime: booking.timeSlot.startTime,
        refundAmount: booking.payment?.refundAmount || 0
      };

      if (user.preferences?.notifications?.email !== false) {
        await this.sendEmail(
          user.email,
          `Booking Cancelled - ${booking.bookingId}`,
          'bookingCancellation',
          emailData
        );
      }

      const message = `Booking ${booking.bookingId} has been cancelled. ${booking.payment?.refundAmount > 0 ? `Refund of ₹${booking.payment.refundAmount} will be processed within 5-7 business days.` : ''}`;

      if (user.preferences?.notifications?.sms !== false) {
        await this.sendSMS(user.phone, message);
      }

      return true;
    } catch (error) {
      console.error('❌ Booking cancellation error:', error.message);
      return false;
    }
  }

  async sendAdminNotification(booking, type) {
    try {
      const subject = {
        'new_booking': `New Booking Received - ${booking.bookingId}`,
        'cancelled_booking': `Booking Cancelled - ${booking.bookingId}`,
        'payment_received': `Payment Received - ${booking.bookingId}`
      };

      const emailData = {
        bookingId: booking.bookingId,
        userName: booking.user?.name || 'Unknown',
        userPhone: booking.user?.phone || 'N/A',
        userEmail: booking.user?.email || 'N/A',
        studioName: booking.studio?.name || 'Unknown',
        date: new Date(booking.date).toLocaleDateString('en-IN'),
        startTime: booking.timeSlot.startTime,
        endTime: booking.timeSlot.endTime,
        sessionType: booking.sessionType,
        totalAmount: booking.pricing.totalAmount,
        status: booking.status
      };

      await this.sendEmail(this.adminEmail, subject[type], 'adminNotification', emailData);

      return true;
    } catch (error) {
      console.error('❌ Admin notification error:', error.message);
      return false;
    }
  }

  async sendContactFormNotification(contactData) {
    try {
      const emailData = {
        userName: contactData.name,
        userEmail: contactData.email,
        userPhone: contactData.phone || 'Not provided',
        subject: contactData.subject || 'General Inquiry',
        message: contactData.message,
        preferredContact: contactData.preferredContact || 'email',
        timestamp: new Date().toLocaleString('en-IN', {
          dateStyle: 'full',
          timeStyle: 'short'
        })
      };

      await this.sendEmail(
        this.adminEmail,
        `New Contact Form Submission - ${contactData.subject || 'General Inquiry'}`,
        'contactFormAdmin',
        emailData
      );

      await this.sendEmail(
        contactData.email,
        'Thank you for contacting Resonance Studio',
        'contactFormUser',
        emailData
      );

      console.log(`✅ Contact form notifications sent for ${contactData.email}`);
      return true;
    } catch (error) {
      console.error('❌ Contact form notification error:', error.message);
      return false;
    }
  }

  async checkAndSendReminders() {
    try {
      const now = new Date();
      const bookings = await Booking.find({
        status: { $in: ['confirmed', 'checked-in'] },
        date: { $gte: now }
      }).populate('user studio');

      for (const booking of bookings) {
        const bookingDateTime = new Date(booking.date);
        const [hours, minutes] = booking.timeSlot.startTime.split(':');
        bookingDateTime.setHours(parseInt(hours), parseInt(minutes));

        const hoursUntil = (bookingDateTime - now) / (1000 * 60 * 60);

        if (hoursUntil <= 3 && hoursUntil > 2.5 && !booking.notifications.reminder3Hours) {
          await this.sendBookingReminder(booking, '3hours');
          await Booking.findByIdAndUpdate(booking._id, { 'notifications.reminder3Hours': true });
        } else if (hoursUntil <= 6 && hoursUntil > 5.5 && !booking.notifications.reminder6Hours) {
          await this.sendBookingReminder(booking, '6hours');
          await Booking.findByIdAndUpdate(booking._id, { 'notifications.reminder6Hours': true });
        } else if (hoursUntil <= 12 && hoursUntil > 11.5 && !booking.notifications.reminder12Hours) {
          await this.sendBookingReminder(booking, '12hours');
          await Booking.findByIdAndUpdate(booking._id, { 'notifications.reminder12Hours': true });
        } else if (hoursUntil <= 24 && hoursUntil > 23.5 && !booking.notifications.reminder24Hours) {
          await this.sendBookingReminder(booking, '24hours');
          await Booking.findByIdAndUpdate(booking._id, { 'notifications.reminder24Hours': true });
        }
      }

      console.log('✅ Reminder check completed');
    } catch (error) {
      console.error('❌ Reminder check error:', error.message);
    }
  }

  async sendHourlyAdminDigest() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const newBookings = await Booking.find({
        createdAt: { $gte: oneHourAgo }
      }).populate('user studio');

      if (newBookings.length === 0) {
        console.log('No new bookings in the last hour');
        return;
      }

      const emailData = {
        period: 'Last Hour',
        bookings: newBookings.map(b => ({
          bookingId: b.bookingId,
          userName: b.user?.name || 'Unknown',
          userEmail: b.user?.email || 'N/A',
          userPhone: b.user?.phone || 'N/A',
          studioName: b.studio?.name || 'Unknown',
          date: new Date(b.date).toLocaleDateString('en-IN'),
          startTime: b.timeSlot.startTime,
          endTime: b.timeSlot.endTime,
          sessionType: b.sessionType,
          totalAmount: b.pricing.totalAmount,
          status: b.status,
          createdAt: b.createdAt.toLocaleString('en-IN')
        })),
        count: newBookings.length,
        totalRevenue: newBookings.reduce((sum, b) => sum + b.pricing.totalAmount, 0)
      };

      await this.sendEmail(
        this.adminEmail,
        `Hourly Booking Digest - ${newBookings.length} New Bookings`,
        'hourlyDigest',
        emailData
      );

      console.log(`✅ Hourly admin digest sent with ${newBookings.length} bookings`);
    } catch (error) {
      console.error('❌ Hourly digest error:', error.message);
    }
  }

  async sendTomorrowBookingsToAdmin() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const tomorrowBookings = await Booking.find({
        date: { $gte: tomorrow, $lt: dayAfter },
        status: { $in: ['confirmed', 'checked-in'] }
      }).populate('user studio').sort({ 'timeSlot.startTime': 1 });

      if (tomorrowBookings.length === 0) {
        console.log('No bookings for tomorrow');
        return;
      }

      const emailData = {
        date: tomorrow.toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        bookings: tomorrowBookings.map(b => ({
          bookingId: b.bookingId,
          userName: b.user?.name || 'Unknown',
          userEmail: b.user?.email || 'N/A',
          userPhone: b.user?.phone || 'N/A',
          studioName: b.studio?.name || 'Unknown',
          startTime: b.timeSlot.startTime,
          endTime: b.timeSlot.endTime,
          sessionType: b.sessionType,
          totalAmount: b.pricing.totalAmount,
          status: b.status,
          participants: b.sessionDetails?.participants || b.sessionDetails?.musicians || 'N/A'
        })),
        count: tomorrowBookings.length,
        totalRevenue: tomorrowBookings.reduce((sum, b) => sum + b.pricing.totalAmount, 0)
      };

      await this.sendEmail(
        this.adminEmail,
        `Tomorrow's Bookings - ${tomorrowBookings.length} Sessions Scheduled`,
        'tomorrowBookings',
        emailData
      );

      console.log(`✅ Tomorrow's bookings sent to admin: ${tomorrowBookings.length} bookings`);
    } catch (error) {
      console.error('❌ Tomorrow bookings error:', error.message);
    }
  }
}

export default new NotificationService();