import crypto from 'crypto';
import NotificationService from './notificationService.js';

class OTPService {
  constructor() {
    this.otpStore = new Map();
    this.rateLimitStore = new Map();
  }

  generateOTP(length = 6) {
    return crypto.randomInt(100000, 999999).toString();
  }

  async sendOTP(phone, type = 'verification') {
    try {
      const rateLimitKey = `${phone}_${type}`;
      const lastRequest = this.rateLimitStore.get(rateLimitKey);
      
      if (lastRequest && Date.now() - lastRequest < 60000) {
        throw new Error('Please wait 60 seconds before requesting another OTP');
      }

      const otp = this.generateOTP();
      const otpKey = `${phone}_${type}`;
      
      this.otpStore.set(otpKey, {
        otp,
        createdAt: Date.now(),
        attempts: 0,
        verified: false
      });

      this.rateLimitStore.set(rateLimitKey, Date.now());

      setTimeout(() => {
        this.otpStore.delete(otpKey);
      }, 10 * 60 * 1000);

      await NotificationService.sendOTP(phone, otp);

      return {
        success: true,
        message: 'OTP sent successfully',
        expiresIn: 600
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyOTP(phone, otp, type = 'verification') {
    try {
      const otpKey = `${phone}_${type}`;
      const otpData = this.otpStore.get(otpKey);

      if (!otpData) {
        throw new Error('OTP not found or expired');
      }

      if (otpData.verified) {
        throw new Error('OTP already used');
      }

      if (otpData.attempts >= 3) {
        this.otpStore.delete(otpKey);
        throw new Error('Maximum verification attempts exceeded');
      }

      if (Date.now() - otpData.createdAt > 10 * 60 * 1000) {
        this.otpStore.delete(otpKey);
        throw new Error('OTP expired');
      }

      if (otpData.otp !== otp.toString()) {
        otpData.attempts++;
        throw new Error('Invalid OTP');
      }

      otpData.verified = true;
      
      setTimeout(() => {
        this.otpStore.delete(otpKey);
      }, 5 * 60 * 1000);

      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  isOTPVerified(phone, type = 'verification') {
    const otpKey = `${phone}_${type}`;
    const otpData = this.otpStore.get(otpKey);
    
    return otpData && otpData.verified && 
           (Date.now() - otpData.createdAt <= 15 * 60 * 1000);
  }

  clearOTP(phone, type = 'verification') {
    const otpKey = `${phone}_${type}`;
    this.otpStore.delete(otpKey);
  }

  getOTPStats() {
    return {
      activeOTPs: this.otpStore.size,
      rateLimitedNumbers: this.rateLimitStore.size
    };
  }

  cleanupExpiredOTPs() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, data] of this.otpStore) {
      if (now - data.createdAt > 10 * 60 * 1000) {
        expiredKeys.push(key);
      }
    }

    for (const [key, timestamp] of this.rateLimitStore) {
      if (now - timestamp > 60 * 1000) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.otpStore.delete(key);
      this.rateLimitStore.delete(key);
    });

    return expiredKeys.length;
  }
}

export default new OTPService();

setInterval(() => {
  const cleaned = OTPService.cleanupExpiredOTPs();
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired OTPs`);
  }
}, 5 * 60 * 1000);