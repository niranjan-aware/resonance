import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Studio',
    required: true
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function(date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 4);
        
        return date >= tomorrow && date <= maxDate;
      },
      message: 'Date must be from tomorrow to 4 months ahead'
    }
  },
  timeSlot: {
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      validate: {
        validator: function(endTime) {
          const start = new Date(`1970-01-01T${this.timeSlot.startTime}:00`);
          const end = new Date(`1970-01-01T${endTime}:00`);
          return end > start && (end - start) >= 3600000;
        },
        message: 'End time must be at least 1 hour after start time'
      }
    }
  },
  sessionType: {
    type: String,
    enum: ['karaoke', 'live-musicians', 'band', 'audio-recording', 'video-recording', 'fb-live', 'show'],
    required: true
  },
  sessionDetails: {
    participants: {
      type: Number,
      min: 1,
      max: 50
    },
    musicians: {
      type: Number,
      min: 1,
      max: 20
    },
    equipment: [{
      type: String,
      enum: ['drum', 'electric-guitar', 'keyboard', 'guitar-amp-laney', 'guitar-amp-marshall', 'bass-amp-ampeg']
    }],
    specialRequirements: {
      type: String,
      maxlength: 500
    }
  },
  pricing: {
    baseAmount: {
      type: Number,
      required: true,
      min: 0
    },
    equipmentCost: {
      type: Number,
      default: 0
    },
    taxes: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'partial', 'completed', 'refunded', 'failed'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['online', 'cash', 'bank-transfer']
    },
    transactionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paidAmount: {
      type: Number,
      default: 0
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    paymentDate: Date,
    refundDate: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  notifications: {
    confirmationSent: { type: Boolean, default: false },
    reminder2Days: { type: Boolean, default: false },
    reminder1Day: { type: Boolean, default: false },
    reminder3Hours: { type: Boolean, default: false },
    completionSent: { type: Boolean, default: false }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: 1000
    },
    submittedAt: Date
  },
  metadata: {
    source: {
      type: String,
      enum: ['website', 'mobile', 'admin'],
      default: 'website'
    },
    ipAddress: String,
    userAgent: String,
    referrer: String
  },
  cancellation: {
    reason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    refundEligible: Boolean,
    refundProcessed: Boolean
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

bookingSchema.virtual('duration').get(function() {
  const start = new Date(`1970-01-01T${this.timeSlot.startTime}:00`);
  const end = new Date(`1970-01-01T${this.timeSlot.endTime}:00`);
  return Math.round((end - start) / (1000 * 60 * 60) * 10) / 10;
});

bookingSchema.virtual('isUpcoming').get(function() {
  const bookingDateTime = new Date(this.date);
  const [hours, minutes] = this.timeSlot.startTime.split(':');
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes));
  return bookingDateTime > new Date();
});

bookingSchema.virtual('canCancel').get(function() {
  if (this.status !== 'confirmed') return false;
  
  const bookingDateTime = new Date(this.date);
  const [hours, minutes] = this.timeSlot.startTime.split(':');
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes));
  
  const hoursUntilBooking = (bookingDateTime - new Date()) / (1000 * 60 * 60);
  return hoursUntilBooking >= 24;
});

bookingSchema.virtual('canReschedule').get(function() {
  return this.canCancel && this.payment.status !== 'refunded';
});

bookingSchema.pre('save', function(next) {
  if (this.isNew) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.bookingId = `RES-${timestamp}-${random}`;
  }
  
  this.pricing.totalAmount = 
    this.pricing.baseAmount + 
    this.pricing.equipmentCost + 
    this.pricing.taxes - 
    this.pricing.discount;
  
  next();
});

bookingSchema.methods.calculateRefundAmount = function() {
  const bookingDateTime = new Date(this.date);
  const [hours, minutes] = this.timeSlot.startTime.split(':');
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes));
  
  const hoursUntilBooking = (bookingDateTime - new Date()) / (1000 * 60 * 60);
  
  if (hoursUntilBooking >= 48) {
    return this.pricing.totalAmount * 0.9;
  } else if (hoursUntilBooking >= 24) {
    return this.pricing.totalAmount * 0.7;
  } else if (hoursUntilBooking >= 6) {
    return this.pricing.totalAmount * 0.5;
  }
  
  return 0;
};

bookingSchema.index({ user: 1, date: -1 });
bookingSchema.index({ studio: 1, date: 1, 'timeSlot.startTime': 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ status: 1, date: 1 });

export default mongoose.model('Booking', bookingSchema);