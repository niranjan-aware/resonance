import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { emailTemplates } from '../utils/emailTemplates.js';

class NotificationService {
  constructor() {
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendEmail(to, subject, template, data) {
    try {
      const htmlContent = emailTemplates[template](data);
      
      const mailOptions = {
        from: `Resonance Studio <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html: htmlContent
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}:`, result.messageId);
      return result;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async sendSMS(to, message) {
    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });

      console.log(`SMS sent to ${to}:`, result.sid);
      return result;
    } catch (error) {
      console.error('SMS send error:', error);
      throw error;
    }
  }

  async sendWhatsApp(to, message) {
    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${to}`
      });

      console.log(`WhatsApp sent to ${to}:`, result.sid);
      return result;
    } catch (error) {
      console.error('WhatsApp send error:', error);
      throw error;
    }
  }

  async sendOTP(phone, otp) {
    try {
      const message = `Your Resonance Studio verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
      
      if (phone.includes('whatsapp:')) {
        return await this.sendWhatsApp(phone, message);
      } else {
        return await this.sendSMS(phone, message);
      }
    } catch (error) {
      console.error('OTP send error:', error);
      throw error;
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
        date: booking.date.toLocaleDateString('en-IN'),
        startTime: booking.timeSlot.startTime,
        endTime: booking.timeSlot.endTime,
        sessionType: booking.sessionType,
        totalAmount: booking.pricing.totalAmount,
        studioImage: studio.images[0]?.url
      };

      if (user.preferences.notifications.email) {
        await this.sendEmail(
          user.email,
          `Booking Confirmed - ${booking.bookingId}`,
          'bookingConfirmation',
          emailData
        );
      }

      const smsMessage = `Resonance Studio: Booking ${booking.bookingId} confirmed for ${studio.name} on ${emailData.date} at ${booking.timeSlot.startTime}. Total: ₹${booking.pricing.totalAmount}`;

      if (user.preferences.notifications.sms) {
        await this.sendSMS(user.phone, smsMessage);
      }

      if (user.preferences.notifications.whatsapp) {
        await this.sendWhatsApp(user.phone, smsMessage);
      }

      return true;
    } catch (error) {
      console.error('Booking confirmation error:', error);
      return false;
    }
  }

  async sendBookingReminder(booking, type) {
    try {
      const user = booking.user;
      const studio = booking.studio;

      const timeMessages = {
        '2days': '2 days',
        '1day': '1 day',
        '3hours': '3 hours'
      };

      const emailData = {
        userName: user.name,
        bookingId: booking.bookingId,
        studioName: studio.name,
        date: booking.date.toLocaleDateString('en-IN'),
        startTime: booking.timeSlot.startTime,
        timeUntil: timeMessages[type]
      };

      if (user.preferences.notifications.email) {
        await this.sendEmail(
          user.email,
          `Upcoming Booking Reminder - ${booking.bookingId}`,
          'bookingReminder',
          emailData
        );
      }

      const message = `Reminder: Your Resonance Studio booking ${booking.bookingId} is in ${timeMessages[type]} (${emailData.date} at ${booking.timeSlot.startTime})`;

      if (user.preferences.notifications.sms) {
        await this.sendSMS(user.phone, message);
      }

      return true;
    } catch (error) {
      console.error('Booking reminder error:', error);
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
        date: booking.date.toLocaleDateString('en-IN'),
        startTime: booking.timeSlot.startTime,
        refundAmount: booking.payment.refundAmount
      };

      if (user.preferences.notifications.email) {
        await this.sendEmail(
          user.email,
          `Booking Cancelled - ${booking.bookingId}`,
          'bookingCancellation',
          emailData
        );
      }

      const message = `Booking ${booking.bookingId} has been cancelled. ${booking.payment.refundAmount > 0 ? `Refund of ₹${booking.payment.refundAmount} will be processed within 5-7 business days.` : ''}`;

      if (user.preferences.notifications.sms) {
        await this.sendSMS(user.phone, message);
      }

      return true;
    } catch (error) {
      console.error('Booking cancellation error:', error);
      return false;
    }
  }

  async sendAdminNotification(booking, type) {
    try {
      const adminEmails = ['admin@resonancestudio.com', 'bookings@resonancestudio.com'];
      
      const subject = {
        'new_booking': `New Booking Received - ${booking.bookingId}`,
        'cancelled_booking': `Booking Cancelled - ${booking.bookingId}`,
        'payment_received': `Payment Received - ${booking.bookingId}`
      };

      const emailData = {
        bookingId: booking.bookingId,
        userName: booking.user.name,
        userPhone: booking.user.phone,
        studioName: booking.studio.name,
        date: booking.date.toLocaleDateString('en-IN'),
        startTime: booking.timeSlot.startTime,
        endTime: booking.timeSlot.endTime,
        sessionType: booking.sessionType,
        totalAmount: booking.pricing.totalAmount,
        status: booking.status
      };

      for (const email of adminEmails) {
        await this.sendEmail(email, subject[type], 'adminNotification', emailData);
      }

      return true;
    } catch (error) {
      console.error('Admin notification error:', error);
      return false;
    }
  }
}

export default new NotificationService();