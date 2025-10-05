import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Studio from '../models/Studio.js';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

// Get all bookings for a specific date with pagination
export const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      studioId, 
      sessionType,
      sortBy = 'timeSlot.startTime',
      order = 'asc'
    } = req.query;

    // Parse date and get start/end of day
    const selectedDate = parseISO(date);
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);

    // Build query
    const query = {
      date: {
        $gte: dayStart,
        $lte: dayEnd
      }
    };

    // Add filters
    if (status) query.status = status;
    if (studioId) query.studio = studioId;
    if (sessionType) query.sessionType = sessionType;

    // Build sort
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    // Execute queries in parallel
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email phone')
        .populate('studio', 'name size capacity pricing location images')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Booking.countDocuments(query)
    ]);

    // Calculate summary statistics for the day
    const [stats] = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + bookings.length < total,
        hasPrev: parseInt(page) > 1
      },
      stats: stats || {
        totalBookings: 0,
        totalRevenue: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        completedBookings: 0
      }
    });
  } catch (error) {
    console.error('Get bookings by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get date range bookings (for calendar heatmap/overview)
export const getBookingsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));

    const bookings = await Booking.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      bookings: bookings.map(b => ({
        date: b._id,
        count: b.count,
        revenue: b.revenue,
        confirmed: b.confirmed,
        pending: b.pending
      }))
    });
  } catch (error) {
    console.error('Get bookings by date range error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get admin dashboard statistics
export const getDashboardStats = async (req, res) => {
    console.log(req);
    
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const days = periodDays[period] || 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const dateQuery = { $gte: startDate, $lte: now };

    // Parallel queries for different statistics
    const [
      totalStats,
      statusBreakdown,
      revenueByStudio,
      topUsers,
      todayStats
    ] = await Promise.all([
      // Total statistics
      Booking.aggregate([
        { $match: { createdAt: dateQuery } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$pricing.totalAmount' },
            averageBookingValue: { $avg: '$pricing.totalAmount' }
          }
        }
      ]),

      // Status breakdown
      Booking.aggregate([
        { $match: { createdAt: dateQuery } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.totalAmount' }
          }
        }
      ]),

      // Revenue by studio
      Booking.aggregate([
        { 
          $match: { 
            createdAt: dateQuery,
            status: { $in: ['confirmed', 'completed'] }
          } 
        },
        {
          $group: {
            _id: '$studio',
            bookings: { $sum: 1 },
            revenue: { $sum: '$pricing.totalAmount' }
          }
        },
        {
          $lookup: {
            from: 'studios',
            localField: '_id',
            foreignField: '_id',
            as: 'studioInfo'
          }
        },
        { $unwind: '$studioInfo' },
        {
          $project: {
            studioName: '$studioInfo.name',
            bookings: 1,
            revenue: 1
          }
        },
        { $sort: { revenue: -1 } }
      ]),

      // Top users
      Booking.aggregate([
        { 
          $match: { 
            createdAt: dateQuery,
            status: { $in: ['confirmed', 'completed'] }
          } 
        },
        {
          $group: {
            _id: '$user',
            bookings: { $sum: 1 },
            totalSpent: { $sum: '$pricing.totalAmount' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            userName: '$userInfo.name',
            userEmail: '$userInfo.email',
            bookings: 1,
            totalSpent: 1
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 }
      ]),

      // Today's statistics
      Booking.aggregate([
        {
          $match: {
            date: {
              $gte: startOfDay(now),
              $lte: endOfDay(now)
            }
          }
        },
        {
          $group: {
            _id: null,
            todayBookings: { $sum: 1 },
            todayRevenue: { $sum: '$pricing.totalAmount' },
            confirmed: {
              $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const total = totalStats[0] || { 
      totalBookings: 0, 
      totalRevenue: 0, 
      averageBookingValue: 0 
    };
    
    const today = todayStats[0] || {
      todayBookings: 0,
      todayRevenue: 0,
      confirmed: 0,
      pending: 0
    };

    res.status(200).json({
      success: true,
      stats: {
        period: {
          days,
          start: startDate,
          end: now
        },
        overview: {
          totalBookings: total.totalBookings,
          totalRevenue: total.totalRevenue,
          averageBookingValue: Math.round(total.averageBookingValue || 0)
        },
        today: {
          bookings: today.todayBookings,
          revenue: today.todayRevenue,
          confirmed: today.confirmed,
          pending: today.pending
        },
        statusBreakdown,
        revenueByStudio,
        topUsers
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all users (for admin user management)
export const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search,
      role,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) query.role = role;

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    // Get booking counts for each user
    const userIds = users.map(u => u._id);
    const bookingCounts = await Booking.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: '$user',
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    // Merge booking data with users
    const usersWithStats = users.map(user => {
      const stats = bookingCounts.find(b => b._id.toString() === user._id.toString());
      return {
        ...user,
        bookingStats: {
          totalBookings: stats?.totalBookings || 0,
          totalSpent: stats?.totalSpent || 0
        }
      };
    });

    res.status(200).json({
      success: true,
      users: usersWithStats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user role (make user admin or remove admin)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};