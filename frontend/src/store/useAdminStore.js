import { create } from 'zustand';
import { adminAPI } from '../services/admin';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const useAdminStore = create((set, get) => ({
  // State
  bookings: [],
  selectedDate: new Date(),
  dateRangeBookings: {},
  stats: null,
  users: [],
  isLoading: false,
  error: null,
  
  // Pagination
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  },
  
  // Filters
  filters: {
    status: '',
    studioId: '',
    sessionType: '',
    sortBy: 'timeSlot.startTime',
    order: 'asc',
    page: 1,
    limit: 10
  },
  
  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Date selection
  setSelectedDate: (date) => set({ 
    selectedDate: date,
    filters: { ...get().filters, page: 1 } // Reset to page 1 when date changes
  }),
  
  // Update filters
  updateFilters: (newFilters) => set(state => ({
    filters: { ...state.filters, ...newFilters, page: 1 } // Reset to page 1 on filter change
  })),
  
  // Clear filters
  clearFilters: () => set({
    filters: {
      status: '',
      studioId: '',
      sessionType: '',
      sortBy: 'timeSlot.startTime',
      order: 'asc',
      page: 1,
      limit: 10
    }
  }),
  
  // Set page
  setPage: (page) => set(state => ({
    filters: { ...state.filters, page }
  })),
  
  // Fetch dashboard stats
  fetchDashboardStats: async (period = '30d') => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.getDashboardStats(period);
      set({ 
        stats: response.stats,
        isLoading: false 
      });
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch dashboard statistics';
      set({ 
        isLoading: false,
        error: errorMessage
      });
      toast.error(errorMessage);
      throw error;
    }
  },
  
  // Fetch bookings for selected date
  fetchBookingsByDate: async (date = null) => {
    const targetDate = date || get().selectedDate;
    const { filters } = get();
    
    set({ isLoading: true, error: null });
    try {
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      const response = await adminAPI.getBookingsByDate(dateStr, filters);
      
      set({ 
        bookings: response.bookings || [],
        pagination: response.pagination || {},
        stats: response.stats || null,
        isLoading: false 
      });
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch bookings';
      set({ 
        isLoading: false,
        error: errorMessage,
        bookings: []
      });
      toast.error(errorMessage);
      throw error;
    }
  },
  
  // Fetch bookings for date range (calendar heatmap)
  fetchBookingsByDateRange: async (startDate, endDate) => {
    try {
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');
      
      const response = await adminAPI.getBookingsByDateRange(startStr, endStr);
      
      // Convert array to map for easy lookup
      const bookingsMap = {};
      response.bookings.forEach(booking => {
        bookingsMap[booking.date] = booking;
      });
      
      set({ dateRangeBookings: bookingsMap });
      return response;
    } catch (error) {
      console.error('Failed to fetch date range bookings:', error);
      throw error;
    }
  },
  
  // Fetch all users
  fetchUsers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.getAllUsers(params);
      set({ 
        users: response.users || [],
        pagination: response.pagination || {},
        isLoading: false 
      });
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch users';
      set({ 
        isLoading: false,
        error: errorMessage
      });
      toast.error(errorMessage);
      throw error;
    }
  },
  
  // Update user role
  updateUserRole: async (userId, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.updateUserRole(userId, role);
      
      // Update user in the list
      set(state => ({
        users: state.users.map(user => 
          user._id === userId ? { ...user, role } : user
        ),
        isLoading: false
      }));
      
      toast.success(`User role updated to ${role}`);
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Failed to update user role';
      set({ 
        isLoading: false,
        error: errorMessage
      });
      toast.error(errorMessage);
      throw error;
    }
  },
  
  // Refresh current view
  refresh: async () => {
    const { selectedDate, filters } = get();
    await get().fetchBookingsByDate(selectedDate);
  }
}));