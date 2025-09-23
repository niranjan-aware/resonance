export const SESSION_TYPES = {
  KARAOKE: 'karaoke',
  LIVE_MUSICIANS: 'live-musicians',
  BAND: 'band',
  AUDIO_RECORDING: 'audio-recording',
  VIDEO_RECORDING: 'video-recording',
  FB_LIVE: 'fb-live',
  SHOW: 'show'
}

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked-in',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show'
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
  FAILED: 'failed'
}

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
}

export const STUDIO_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
}

export const EQUIPMENT_LIST = [
  { id: 'drum', name: 'Drum Kit', icon: '🥁' },
  { id: 'electric-guitar', name: 'Electric Guitar', icon: '🎸' },
  { id: 'keyboard', name: 'Keyboard', icon: '🎹' },
  { id: 'guitar-amp-laney', name: 'Guitar Amp (Laney)', icon: '🔊' },
  { id: 'guitar-amp-marshall', name: 'Guitar Amp (Marshall)', icon: '🔊' },
  { id: 'bass-amp-ampeg', name: 'Bass Amp (Ampeg)', icon: '🔊' }
]

export const TIME_SLOTS = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '21:00', label: '9:00 PM' },
  { value: '22:00', label: '10:00 PM' }
]

export const VALIDATION_RULES = {
  PHONE: {
    PATTERN: /^\+?[1-9]\d{1,14}$/,
    MESSAGE: 'Please enter a valid phone number'
  },
  EMAIL: {
    PATTERN: /^\S+@\S+$/i,
    MESSAGE: 'Please enter a valid email address'
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MESSAGE: 'Password must be at least 6 characters'
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    MESSAGE: 'Name must be between 2-100 characters'
  }
}

export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/me',
    UPDATE_PROFILE: '/auth/updateprofile',
    CHANGE_PASSWORD: '/auth/changepassword',
    LOGOUT: '/auth/logout'
  },
  BOOKING: {
    LIST: '/booking/user',
    CREATE: '/booking',
    GET: '/booking/:id',
    CONFIRM: '/booking/:id/confirm',
    CANCEL: '/booking/:id/cancel',
    AVAILABILITY: '/booking/availability',
    SLOTS: '/booking/slots',
    FEEDBACK: '/booking/:id/feedback'
  },
  STUDIO: {
    LIST: '/studio',
    GET: '/studio/:id',
    STATS: '/studio/:id/stats',
    CREATE: '/studio',
    UPDATE: '/studio/:id',
    DELETE: '/studio/:id'
  }
}

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
}

export const LOCAL_STORAGE_KEYS = {
  THEME: 'theme',
  AUTH_STORAGE: 'auth-storage',
  BOOKING_DRAFT: 'booking-draft'
}

export const CONTACT_INFO = {
  PHONE: '+91 98765 43210',
  EMAIL: 'hello@resonancestudio.com',
  ADDRESS: 'Sinhgad Road, Pune, Maharashtra 411041',
  HOURS: '9:00 AM - 10:00 PM (All Days)',
  SOCIAL: {
    INSTAGRAM: 'https://instagram.com/resonancestudio',
    FACEBOOK: 'https://facebook.com/resonancestudio',
    YOUTUBE: 'https://youtube.com/resonancestudio',
    TWITTER: 'https://twitter.com/resonancestudio'
  }
}

export const PRICING_TIERS = {
  BASIC: {
    name: 'Basic',
    multiplier: 1.0,
    features: ['Standard Equipment', 'Basic Acoustics']
  },
  PREMIUM: {
    name: 'Premium',
    multiplier: 1.3,
    features: ['Premium Equipment', 'Enhanced Acoustics', 'Recording Facilities']
  },
  PROFESSIONAL: {
    name: 'Professional',
    multiplier: 1.5,
    features: ['Professional Equipment', 'Studio Engineer', 'Mixing & Mastering']
  }
}

export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  API: 'yyyy-MM-dd',
  TIME: 'h:mm a',
  DATETIME: 'MMM d, yyyy h:mm a',
  FULL: 'EEEE, MMMM d, yyyy'
}

export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  }
}