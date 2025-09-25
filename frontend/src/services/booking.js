import { api } from './api'
import { format } from 'date-fns'

export const bookingAPI = {
  // Get user's bookings
  getUserBookings: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    const response = await api.get(`/booking/user${queryParams ? `?${queryParams}` : ''}`)
    return response
  },

  // Create new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/booking', bookingData)
    return response
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    const response = await api.get(`/booking/${bookingId}`)
    return response
  },

  // Check availability
  checkAvailability: async (params) => {
    const queryParams = new URLSearchParams(params).toString()
    const response = await api.get(`/booking/availability?${queryParams}`)
    return response
  },

  // Get available time slots
  getAvailableSlots: async (studioId, date) => {
    const response = await api.get(`/booking/slots?studioId=${studioId}&date=${date}`)
    return response
  },

  // Confirm booking
  confirmBooking: async (bookingId, paymentDetails) => {
    const response = await api.post(`/booking/${bookingId}/confirm`, { paymentDetails })
    return response
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason = '') => {
    const response = await api.post(`/booking/${bookingId}/cancel`, { reason })
    return response
  },

  // Add feedback to booking
  addFeedback: async (bookingId, feedback) => {
    const response = await api.post(`/booking/${bookingId}/feedback`, feedback)
    return response
  },

  // Update booking (admin only)
  updateBooking: async (bookingId, updateData) => {
    const response = await api.put(`/booking/${bookingId}`, updateData)
    return response
  },

  // Update booking status (admin only)
  updateBookingStatus: async (bookingId, status) => {
    const response = await api.patch(`/booking/${bookingId}/status`, { status })
    return response
  },

  // Get booking statistics
  getBookingStats: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    const response = await api.get(`/booking/stats${queryParams ? `?${queryParams}` : ''}`)
    return response
  },

  // Get upcoming bookings
  getUpcomingBookings: async () => {
    const response = await api.get('/booking/user?status=confirmed&upcoming=true')
    return response
  },

  // Get booking history
  getBookingHistory: async (params = {}) => {
    const queryParams = new URLSearchParams({
      ...params,
      completed: true
    }).toString()
    const response = await api.get(`/booking/user?${queryParams}`)
    return response
  }
}

export const studioAPI = {
  // Get all studios
  getStudios: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    const response = await api.get(`/studio${queryParams ? `?${queryParams}` : ''}`)
    return response
  },

  // Get studio by ID
  getStudioById: async (studioId) => {
    const response = await api.get(`/studio/${studioId}`)
    return response
  },

  // Create studio (admin only)
  createStudio: async (studioData) => {
    const response = await api.post('/studio', studioData)
    return response
  },

  // Update studio (admin only)
  updateStudio: async (studioId, studioData) => {
    const response = await api.put(`/studio/${studioId}`, studioData)
    return response
  },

  // Delete studio (admin only)
  deleteStudio: async (studioId) => {
    const response = await api.delete(`/studio/${studioId}`)
    return response
  },

  // Get studio statistics
  getStudioStats: async (studioId) => {
    const response = await api.get(`/studio/${studioId}/stats`)
    return response
  },

  // Search studios
  searchStudios: async (searchTerm, filters = {}) => {
    const params = {
      q: searchTerm,
      ...filters
    }
    const queryParams = new URLSearchParams(params).toString()
    const response = await api.get(`/studio/search?${queryParams}`)
    return response
  },

  // Get studios by session type
  getStudiosByType: async (sessionType) => {
    const response = await api.get(`/studio?sessionType=${sessionType}`)
    return response
  },

  // Get featured studios
  getFeaturedStudios: async () => {
    const response = await api.get('/studio?featured=true')
    return response
  },

  // Upload studio images (admin only)
  uploadStudioImages: async (studioId, images) => {
    const formData = new FormData()
    images.forEach((image, index) => {
      formData.append(`images`, image)
    })
    
    const response = await api.post(`/studio/${studioId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response
  },

  // Delete studio image (admin only)
  deleteStudioImage: async (studioId, imageId) => {
    const response = await api.delete(`/studio/${studioId}/images/${imageId}`)
    return response
  }
}

export const adminAPI = {
  // Get all bookings (admin only)
  getAllBookings: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    const response = await api.get(`/admin/bookings${queryParams ? `?${queryParams}` : ''}`)
    return response
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard-stats')
    return response
  },

  // Get all users (admin only)
  getAllUsers: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    const response = await api.get(`/admin/users${queryParams ? `?${queryParams}` : ''}`)
    return response
  },

  // Update user role (admin only)
  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role })
    return response
  },

  // Block/unblock user (admin only)
  toggleUserStatus: async (userId, isBlocked) => {
    const response = await api.patch(`/admin/users/${userId}/status`, { isBlocked })
    return response
  },

  // Get system settings
  getSettings: async () => {
    const response = await api.get('/admin/settings')
    return response
  },

  // Update system settings
  updateSettings: async (settings) => {
    const response = await api.put('/admin/settings', settings)
    return response
  }
}