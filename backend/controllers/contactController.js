import NotificationService from '../services/notificationService.js';

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message, preferredContact } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    const contactData = {
      name,
      email,
      phone: phone || 'Not provided',
      subject: subject || 'General Inquiry',
      message,
      preferredContact: preferredContact || 'email'
    };

    await NotificationService.sendContactFormNotification(contactData);

    console.log(`✅ Contact form processed for ${email}`);

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again or contact us directly.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getContactInfo = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      contact: {
        address: 'Sinhgad Road, Pune, Maharashtra',
        phone: '+91-XXXXXXXXXX',
        email: 'info@resonancestudio.com',
        hours: {
          weekdays: '9:00 AM - 10:00 PM',
          weekends: '10:00 AM - 11:00 PM'
        },
        social: {
          facebook: 'https://facebook.com/resonancestudio',
          instagram: 'https://instagram.com/resonancestudio',
          twitter: 'https://twitter.com/resonancestudio'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact information'
    });
  }
};