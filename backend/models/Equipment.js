import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true,
    maxlength: [100, 'Equipment name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Equipment category is required'],
    enum: {
      values: ['instrument', 'amplifier', 'recording', 'lighting', 'audio', 'accessories'],
      message: '{VALUE} is not a valid equipment category'
    }
  },
  type: {
    type: String,
    required: [true, 'Equipment type is required'],
    trim: true,
    maxlength: [50, 'Equipment type cannot exceed 50 characters']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [100, 'Model name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  specifications: {
    power: String,
    frequency_response: String,
    impedance: String,
    weight: String,
    dimensions: String,
    color: String,
    material: String,
    connectivity: [String],
    additional_features: [String]
  },
  pricing: {
    purchasePrice: {
      type: Number,
      min: [0, 'Purchase price cannot be negative']
    },
    rentalPrice: {
      type: Number,
      required: [true, 'Rental price is required'],
      min: [0, 'Rental price cannot be negative']
    },
    rentalPeriod: {
      type: String,
      enum: ['hourly', 'daily', 'session'],
      default: 'hourly'
    }
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'needs_repair', 'retired'],
      default: 'excellent'
    },
    lastMaintenance: Date,
    nextMaintenanceDue: Date,
    maintenanceNotes: String
  },
  location: {
    studio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Studio'
    },
    storageArea: String,
    isPortable: {
      type: Boolean,
      default: true
    }
  },
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
  usage: {
    totalHours: {
      type: Number,
      default: 0,
      min: 0
    },
    bookingCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastUsed: Date,
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  booking_restrictions: {
    requiresTraining: {
      type: Boolean,
      default: false
    },
    minimumExperience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    supervisionRequired: {
      type: Boolean,
      default: false
    },
    insuranceRequired: {
      type: Boolean,
      default: false
    }
  },
  compatibility: {
    sessionTypes: [{
      type: String,
      enum: ['karaoke', 'live-musicians', 'band', 'audio-recording', 'video-recording', 'fb-live', 'show']
    }],
    compatibleWith: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment'
    }],
    requiredWith: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment'
    }]
  },
  purchase_info: {
    vendor: String,
    purchaseDate: Date,
    warrantyExpiry: Date,
    invoiceNumber: String,
    serialNumber: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  popularity_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
equipmentSchema.index({ name: 1, isActive: 1 });
equipmentSchema.index({ category: 1, type: 1 });
equipmentSchema.index({ 'availability.isAvailable': 1, isActive: 1 });
equipmentSchema.index({ 'location.studio': 1 });
equipmentSchema.index({ tags: 1 });
equipmentSchema.index({ popularity_score: -1 });

// Virtual for primary image
equipmentSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

// Virtual for availability status
equipmentSchema.virtual('availabilityStatus').get(function() {
  if (!this.isActive) return 'inactive';
  if (!this.availability.isAvailable) return 'unavailable';
  if (this.availability.condition === 'needs_repair') return 'maintenance';
  return 'available';
});

// Virtual for next maintenance
equipmentSchema.virtual('maintenanceDue').get(function() {
  if (!this.availability.nextMaintenanceDue) return false;
  return this.availability.nextMaintenanceDue <= new Date();
});

// Virtual for rental price display
equipmentSchema.virtual('rentalPriceDisplay').get(function() {
  const price = this.pricing.rentalPrice;
  const period = this.pricing.rentalPeriod;
  return `₹${price}/${period === 'hourly' ? 'hr' : period}`;
});

// Methods
equipmentSchema.methods.updateUsageStats = function(hours = 1) {
  this.usage.totalHours += hours;
  this.usage.bookingCount += 1;
  this.usage.lastUsed = new Date();
  
  // Update popularity score based on usage
  this.popularity_score = Math.min(100, 
    (this.usage.bookingCount * 5) + 
    (this.usage.averageRating * 10) +
    (this.usage.totalHours / 10)
  );
  
  return this.save();
};

equipmentSchema.methods.addRating = function(rating, review = null) {
  const currentTotal = this.usage.averageRating * this.usage.reviewCount;
  this.usage.reviewCount += 1;
  this.usage.averageRating = (currentTotal + rating) / this.usage.reviewCount;
  
  // Update popularity score
  this.popularity_score = Math.min(100, 
    (this.usage.bookingCount * 5) + 
    (this.usage.averageRating * 10) +
    (this.usage.totalHours / 10)
  );
  
  return this.save();
};

equipmentSchema.methods.scheduleMaintenance = function(date, notes = '') {
  this.availability.nextMaintenanceDue = date;
  this.availability.maintenanceNotes = notes;
  return this.save();
};

equipmentSchema.methods.markMaintained = function(notes = '') {
  this.availability.lastMaintenance = new Date();
  this.availability.condition = 'excellent';
  this.availability.isAvailable = true;
  this.availability.maintenanceNotes = notes;
  
  // Schedule next maintenance (default: 6 months)
  const nextMaintenance = new Date();
  nextMaintenance.setMonth(nextMaintenance.getMonth() + 6);
  this.availability.nextMaintenanceDue = nextMaintenance;
  
  return this.save();
};

equipmentSchema.methods.isCompatibleWith = function(sessionType) {
  return this.compatibility.sessionTypes.includes(sessionType);
};

equipmentSchema.methods.getRequiredEquipment = function() {
  return this.populate('compatibility.requiredWith');
};

equipmentSchema.methods.getCompatibleEquipment = function() {
  return this.populate('compatibility.compatibleWith');
};

// Static methods
equipmentSchema.statics.findAvailable = function(filters = {}) {
  return this.find({
    isActive: true,
    'availability.isAvailable': true,
    'availability.condition': { $ne: 'needs_repair' },
    ...filters
  });
};

equipmentSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category, 
    isActive: true,
    'availability.isAvailable': true 
  }).sort({ popularity_score: -1, name: 1 });
};

equipmentSchema.statics.findBySessionType = function(sessionType) {
  return this.find({
    'compatibility.sessionTypes': sessionType,
    isActive: true,
    'availability.isAvailable': true
  }).sort({ popularity_score: -1 });
};

equipmentSchema.statics.findByStudio = function(studioId) {
  return this.find({
    'location.studio': studioId,
    isActive: true
  }).sort({ category: 1, name: 1 });
};

equipmentSchema.statics.getPopular = function(limit = 10) {
  return this.find({
    isActive: true,
    'availability.isAvailable': true
  })
  .sort({ popularity_score: -1, 'usage.averageRating': -1 })
  .limit(limit);
};

equipmentSchema.statics.needsMaintenance = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    $or: [
      { 'availability.nextMaintenanceDue': { $lte: now } },
      { 'availability.condition': 'needs_repair' }
    ]
  }).sort({ 'availability.nextMaintenanceDue': 1 });
};

equipmentSchema.statics.searchEquipment = function(searchTerm, filters = {}) {
  const searchRegex = new RegExp(searchTerm, 'i');
  
  return this.find({
    ...filters,
    isActive: true,
    $or: [
      { name: searchRegex },
      { description: searchRegex },
      { brand: searchRegex },
      { model: searchRegex },
      { tags: { $in: [searchRegex] } },
      { type: searchRegex }
    ]
  }).sort({ popularity_score: -1, name: 1 });
};

// Pre-save middleware
equipmentSchema.pre('save', function(next) {
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    const primaryCount = this.images.filter(img => img.isPrimary).length;
    
    if (primaryCount === 0) {
      this.images[0].isPrimary = true;
    } else if (primaryCount > 1) {
      // Keep only the first primary image
      let foundPrimary = false;
      this.images.forEach(img => {
        if (img.isPrimary && foundPrimary) {
          img.isPrimary = false;
        } else if (img.isPrimary) {
          foundPrimary = true;
        }
      });
    }
  }
  
  // Auto-generate tags from name, brand, model
  const autoTags = [
    this.name,
    this.brand,
    this.model,
    this.category,
    this.type
  ].filter(Boolean)
   .map(tag => tag.toLowerCase().trim())
   .filter(tag => tag.length > 2);
  
  // Merge with existing tags
  const allTags = [...new Set([...this.tags, ...autoTags])];
  this.tags = allTags;
  
  next();
});

// Pre-remove middleware
equipmentSchema.pre('remove', function(next) {
  // Mark as inactive instead of actually removing
  this.isActive = false;
  this.availability.isAvailable = false;
  next();
});

export default mongoose.model('Equipment', equipmentSchema);