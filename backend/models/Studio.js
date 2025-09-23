import mongoose from 'mongoose';

const studioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  features: [{
    type: String,
    trim: true
  }],
  equipment: [{
    name: {
      type: String,
      required: true
    },
    brand: String,
    model: String,
    isAvailable: {
      type: Boolean,
      default: true
    },
    rentalPrice: {
      type: Number,
      default: 0
    }
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    public_id: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    peakHourMultiplier: {
      type: Number,
      default: 1.2
    },
    minimumHours: {
      type: Number,
      default: 1
    },
    maximumHours: {
      type: Number,
      default: 12
    }
  },
  availability: {
    startTime: {
      type: String,
      required: true,
      default: '09:00'
    },
    endTime: {
      type: String,
      required: true,
      default: '22:00'
    },
    workingDays: [{
      type: Number,
      min: 0,
      max: 6
    }],
    peakHours: [{
      start: String,
      end: String
    }],
    holidays: [{
      date: Date,
      reason: String
    }]
  },
  specifications: {
    area: String,
    ceilingHeight: String,
    acoustics: String,
    powerOutlets: Number,
    airConditioning: Boolean,
    wifi: Boolean,
    parking: Boolean
  },
  suitableFor: [{
    type: String,
    enum: ['karaoke', 'live-musicians', 'band', 'recording', 'video', 'streaming']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  maintenanceSchedule: [{
    date: Date,
    duration: Number,
    type: String,
    description: String
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  bookingStats: {
    totalBookings: { type: Number, default: 0 },
    monthlyRevenue: { type: Number, default: 0 },
    utilizationRate: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

studioSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

studioSchema.virtual('currentBookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'studio',
  match: {
    date: { $gte: new Date() },
    status: { $in: ['confirmed', 'checked-in'] }
  }
});

studioSchema.methods.isAvailableAt = function(date, startTime, endTime) {
  const dayOfWeek = new Date(date).getDay();
  
  if (!this.availability.workingDays.includes(dayOfWeek)) {
    return false;
  }
  
  const studioStart = this.availability.startTime;
  const studioEnd = this.availability.endTime;
  
  return startTime >= studioStart && endTime <= studioEnd;
};

studioSchema.methods.calculatePrice = function(date, startTime, endTime, equipment = []) {
  const duration = this.calculateDuration(startTime, endTime);
  let basePrice = this.pricing.basePrice * duration;
  
  const isPeakHour = this.availability.peakHours.some(peak => 
    startTime >= peak.start && endTime <= peak.end
  );
  
  if (isPeakHour) {
    basePrice *= this.pricing.peakHourMultiplier;
  }
  
  const equipmentCost = equipment.reduce((total, item) => {
    const equipmentItem = this.equipment.find(e => e._id.toString() === item);
    return total + (equipmentItem?.rentalPrice || 0);
  }, 0);
  
  return Math.round(basePrice + equipmentCost);
};

studioSchema.methods.calculateDuration = function(startTime, endTime) {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  return (end - start) / (1000 * 60 * 60);
};

studioSchema.index({ size: 1, isActive: 1 });
studioSchema.index({ 'suitableFor': 1 });
studioSchema.index({ 'pricing.basePrice': 1 });

export default mongoose.model('Studio', studioSchema);