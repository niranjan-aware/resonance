import express from 'express';
import Studio from '../models/Studio.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

export const getStudios = async (req, res) => {
  try {
    const { 
      sessionType, 
      capacity, 
      minPrice, 
      maxPrice, 
      size,
      sortBy = 'name',
      order = 'asc'
    } = req.query;

    const query = { isActive: true };

    if (sessionType) {
      query.suitableFor = { $in: [sessionType] };
    }

    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }

    if (size && ['small', 'medium', 'large'].includes(size)) {
      query.size = size;
    }

    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = parseInt(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = parseInt(maxPrice);
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const studios = await Studio.find(query)
      .sort(sortOptions)
      .select('-maintenanceSchedule -bookingStats');

    res.status(200).json({
      success: true,
      count: studios.length,
      studios
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getStudioById = async (req, res) => {
  try {
    const { id } = req.params;

    const studio = await Studio.findById(id);

    if (!studio || !studio.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    res.status(200).json({
      success: true,
      studio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const createStudio = async (req, res) => {
  try {
    const studioData = req.body;
    const studio = await Studio.create(studioData);

    res.status(201).json({
      success: true,
      studio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateStudio = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const studio = await Studio.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    res.status(200).json({
      success: true,
      studio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteStudio = async (req, res) => {
  try {
    const { id } = req.params;

    const studio = await Studio.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Studio deactivated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getStudioStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const studio = await Studio.findById(id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: 'Studio not found'
      });
    }

    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);

    const bookingsQuery = { studio: id };
    if (startDate || endDate) {
      bookingsQuery.date = dateQuery;
    }

    const [totalBookings, completedBookings, totalRevenue] = await Promise.all([
      Booking.countDocuments(bookingsQuery),
      Booking.countDocuments({ ...bookingsQuery, status: 'completed' }),
      Booking.aggregate([
        { $match: { ...bookingsQuery, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
      ])
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const utilizationRate = studio.bookingStats.utilizationRate;

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        completedBookings,
        revenue,
        utilizationRate,
        averageRating: studio.ratings.average,
        totalRatings: studio.ratings.count
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

router.get('/', getStudios);
router.get('/:id', getStudioById);
router.get('/:id/stats', protect, authorize('admin'), getStudioStats);
router.post('/', protect, authorize('admin'), createStudio);
router.put('/:id', protect, authorize('admin'), updateStudio);
router.delete('/:id', protect, authorize('admin'), deleteStudio);

export default router;