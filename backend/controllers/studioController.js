import Studio from '../models/Studio.js';
import Booking from '../models/Booking.js';
import { deleteImage, deleteImages } from '../config/cloudinary.js';

// Get all studios with filtering and sorting
export const getStudios = async (req, res) => {
  try {
    const {
      sessionType,
      capacity,
      minPrice,
      maxPrice,
      size,
      sortBy = 'name',
      order = 'asc',
      page = 1,
      limit = 20,
      search,
      featured,
      isActive = true
    } = req.query;

    // Build query
    const query = { isActive: isActive === 'true' };

    // Session type filter
    if (sessionType) {
      query.suitableFor = { $in: [sessionType] };
    }

    // Capacity filter
    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }

    // Size filter
    if (size && ['small', 'medium', 'large'].includes(size)) {
      query.size = size;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = parseInt(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = parseInt(maxPrice);
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { features: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'price') {
      sortOptions['pricing.basePrice'] = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'rating') {
      sortOptions['ratings.average'] = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'capacity') {
      sortOptions.capacity = order === 'desc' ? -1 : 1;
    } else {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [studios, total] = await Promise.all([
      Studio.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-maintenanceSchedule -bookingStats.__v'),
      Studio.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: studios.length,
      total,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + studios.length < total,
        hasPrev: parseInt(page) > 1
      },
      studios
    });
  } catch (error) {
    console.error('Get studios error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch studios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get studio by ID
export const getStudioById = async (req, res) => {
  try {
    const { id } = req.params;

    const studio = await Studio.findById(id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    // If studio is inactive and user is not admin, return 404
    if (!studio.isActive && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    // Get recent bookings count for this studio (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookingsCount = await Booking.countDocuments({
      studio: id,
      createdAt: { $gte: thirtyDaysAgo },
      status: { $in: ['confirmed', 'completed'] }
    });

    // Add booking popularity to response
    const studioWithStats = studio.toObject();
    studioWithStats.recentBookings = recentBookingsCount;
    studioWithStats.isPopular = recentBookingsCount > 10;

    res.status(200).json({
      success: true,
      studio: studioWithStats
    });
  } catch (error) {
    console.error('Get studio by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch studio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new studio (Admin only)
export const createStudio = async (req, res) => {
  try {
    // Process uploaded images if any
    const images = req.files ? req.files.map((file, index) => ({
      url: file.path,
      public_id: file.filename,
      caption: req.body.imageCaptions?.[index] || '',
      isPrimary: index === 0
    })) : [];

    const studioData = {
      ...req.body,
      images,
      isActive: true
    };

    // Validate required fields
    const requiredFields = ['name', 'size', 'capacity', 'description'];
    for (const field of requiredFields) {
      if (!studioData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Validate pricing
    if (!studioData.pricing?.basePrice || studioData.pricing.basePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid base price is required'
      });
    }

    const studio = await Studio.create(studioData);

    res.status(201).json({
      success: true,
      studio,
      message: 'Studio created successfully'
    });
  } catch (error) {
    console.error('Create studio error:', error);
    
    // If validation error
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create studio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update studio (Admin only)
export const updateStudio = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: file.path,
        public_id: file.filename,
        caption: req.body.imageCaptions?.[index] || '',
        isPrimary: false
      }));
      
      updateData.$push = { images: { $each: newImages } };
    }

    const studio = await Studio.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    res.status(200).json({
      success: true,
      studio,
      message: 'Studio updated successfully'
    });
  } catch (error) {
    console.error('Update studio error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update studio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete/Deactivate studio (Admin only)
export const deleteStudio = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    const studio = await Studio.findById(id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    // Check for existing bookings
    const existingBookings = await Booking.countDocuments({
      studio: id,
      status: { $in: ['confirmed', 'pending'] },
      date: { $gte: new Date() }
    });

    if (existingBookings > 0 && permanent === 'true') {
      return res.status(400).json({
        success: false,
        message: 'Cannot permanently delete studio with existing bookings. Deactivate instead.'
      });
    }

    if (permanent === 'true') {
      // Permanent deletion - delete images from Cloudinary
      if (studio.images && studio.images.length > 0) {
        const publicIds = studio.images
          .filter(img => img.public_id)
          .map(img => img.public_id);
        
        if (publicIds.length > 0) {
          try {
            await deleteImages(publicIds);
          } catch (error) {
            console.error('Error deleting images:', error);
          }
        }
      }

      await Studio.findByIdAndDelete(id);
      
      res.status(200).json({
        success: true,
        message: 'Studio permanently deleted'
      });
    } else {
      // Soft delete - just deactivate
      studio.isActive = false;
      await studio.save();

      res.status(200).json({
        success: true,
        message: 'Studio deactivated successfully'
      });
    }
  } catch (error) {
    console.error('Delete studio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete studio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get studio statistics (Admin only)
export const getStudioStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, period = '30d' } = req.query;

    const studio = await Studio.findById(id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    // Date range for statistics
    let dateQuery = {};
    const now = new Date();
    
    if (startDate || endDate) {
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
    } else {
      // Default period-based date range
      const periodDays = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      
      const days = periodDays[period] || 30;
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      
      dateQuery = { $gte: startDate, $lte: now };
    }

    const bookingsQuery = { 
      studio: id,
      createdAt: dateQuery
    };

    // Parallel queries for different statistics
    const [
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      revenueData,
      utilizationData,
      peakHoursData
    ] = await Promise.all([
      // Total bookings
      Booking.countDocuments(bookingsQuery),
      
      // Confirmed bookings
      Booking.countDocuments({ ...bookingsQuery, status: 'confirmed' }),
      
      // Completed bookings
      Booking.countDocuments({ ...bookingsQuery, status: 'completed' }),
      
      // Cancelled bookings
      Booking.countDocuments({ ...bookingsQuery, status: 'cancelled' }),
      
      // Revenue calculation
      Booking.aggregate([
        { $match: { ...bookingsQuery, status: { $in: ['completed', 'confirmed'] } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.totalAmount' },
            averageBookingValue: { $avg: '$pricing.totalAmount' }
          }
        }
      ]),
      
      // Utilization by day
      Booking.aggregate([
        { $match: { ...bookingsQuery, status: { $in: ['confirmed', 'completed'] } } },
        {
          $group: {
            _id: { $dayOfWeek: '$date' },
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.totalAmount' }
          }
        },
        { $sort: { '_id': 1 } }
      ]),
      
      // Peak hours analysis
      Booking.aggregate([
        { $match: { ...bookingsQuery, status: { $in: ['confirmed', 'completed'] } } },
        {
          $group: {
            _id: '$timeSlot.startTime',
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.totalAmount' }
          }
        },
        { $sort: { 'count': -1 } },
        { $limit: 5 }
      ])
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, averageBookingValue: 0 };
    
    // Calculate utilization rate (assuming 12 hours/day, 7 days/week)
    const periodDays = Math.ceil((dateQuery.$lte - dateQuery.$gte) / (1000 * 60 * 60 * 24));
    const maxPossibleBookings = periodDays * 12; // 12 slots per day
    const utilizationRate = maxPossibleBookings > 0 ? (totalBookings / maxPossibleBookings) * 100 : 0;

    // Day names for utilization data
    const dayNames = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const utilizationByDay = utilizationData.map(day => ({
      day: dayNames[day._id],
      bookings: day.count,
      revenue: day.revenue
    }));

    res.status(200).json({
      success: true,
      stats: {
        period: {
          start: dateQuery.$gte,
          end: dateQuery.$lte,
          days: periodDays
        },
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0
        },
        revenue: {
          total: revenue.totalRevenue,
          average: Math.round(revenue.averageBookingValue || 0)
        },
        utilization: {
          rate: Math.round(utilizationRate * 100) / 100,
          byDay: utilizationByDay
        },
        peakHours: peakHoursData,
        ratings: {
          average: studio.ratings.average,
          count: studio.ratings.count
        }
      }
    });
  } catch (error) {
    console.error('Get studio stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch studio statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Upload studio images (Admin only)
export const uploadStudioImages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    const studio = await Studio.findById(id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    const newImages = req.files.map((file, index) => ({
      url: file.path,
      public_id: file.filename,
      caption: req.body.captions?.[index] || '',
      isPrimary: false
    }));

    studio.images.push(...newImages);
    await studio.save();

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      images: newImages,
      studio
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete studio image (Admin only)
export const deleteStudioImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const studio = await Studio.findById(id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    const imageIndex = studio.images.findIndex(img => img._id.toString() === imageId);

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const image = studio.images[imageIndex];

    // Delete from Cloudinary if it has a public_id
    if (image.public_id) {
      try {
        await deleteImage(image.public_id);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    // Remove from studio
    studio.images.splice(imageIndex, 1);
    
    // If deleted image was primary, make first image primary
    if (image.isPrimary && studio.images.length > 0) {
      studio.images[0].isPrimary = true;
    }

    await studio.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      studio
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Set primary image (Admin only)
export const setPrimaryImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const studio = await Studio.findById(id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    // Reset all images to non-primary
    studio.images.forEach(img => { img.isPrimary = false; });

    // Set selected image as primary
    const targetImage = studio.images.find(img => img._id.toString() === imageId);

    if (!targetImage) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    targetImage.isPrimary = true;
    await studio.save();

    res.status(200).json({
      success: true,
      message: 'Primary image updated successfully',
      studio
    });
  } catch (error) {
    console.error('Set primary image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set primary image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search studios
export const searchStudios = async (req, res) => {
  try {
    const { q, ...filters } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(q, 'i');
    
    const query = {
      isActive: true,
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { features: { $in: [searchRegex] } },
        { 'specifications.area': searchRegex }
      ]
    };

    // Apply additional filters
    if (filters.size) query.size = filters.size;
    if (filters.sessionType) query.suitableFor = { $in: [filters.sessionType] };
    if (filters.minPrice) query['pricing.basePrice'] = { $gte: parseInt(filters.minPrice) };

    const studios = await Studio.find(query)
      .sort({ 'ratings.average': -1, name: 1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: studios.length,
      studios,
      query: q
    });
  } catch (error) {
    console.error('Search studios error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};