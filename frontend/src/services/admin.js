import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with auth
const createAuthAxios = () => {
  const token = localStorage.getItem('auth-storage');
  let authToken = null;
  
  if (token) {
    try {
      const parsed = JSON.parse(token);
      authToken = parsed.state?.token;
    } catch (e) {
      console.error('Error parsing token:', e);
    }
  }

  return axios.create({
    baseURL: `${API_URL}/api/admin`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` })
    }
  });
};

export const adminAPI = {
  // Get dashboard statistics
  getDashboardStats: async (period = '30d') => {
    try {
      const axiosInstance = createAuthAxios();
      const response = await axiosInstance.get('/stats', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get bookings by specific date
  getBookingsByDate: async (date, params = {}) => {
    try {
      const axiosInstance = createAuthAxios();
      const response = await axiosInstance.get(`/bookings/date/${date}`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status,
          studioId: params.studioId,
          sessionType: params.sessionType,
          sortBy: params.sortBy || 'timeSlot.startTime',
          order: params.order || 'asc'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get bookings by date range (for calendar heatmap)
  getBookingsByDateRange: async (startDate, endDate) => {
    try {
      const axiosInstance = createAuthAxios();
      const response = await axiosInstance.get('/bookings/date-range', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all users
  getAllUsers: async (params = {}) => {
    try {
      const axiosInstance = createAuthAxios();
      const response = await axiosInstance.get('/users', {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          search: params.search,
          role: params.role,
          sortBy: params.sortBy || 'createdAt',
          order: params.order || 'desc'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const axiosInstance = createAuthAxios();
      const response = await axiosInstance.put(`/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default adminAPI;