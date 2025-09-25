import { api } from './api'

export const authAPI = {
  // Send OTP to phone number
  sendOTP: async (phone) => {
    const response = await api.post('/auth/send-otp', { phone })
    return response
  },

  // Verify OTP and create/login user
  verifyOTP: async (data) => {
    const response = await api.post('/auth/verify-otp', data)
    return response
  },

  // Email/password login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response
  },

  // Register new user with email/password
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/me')
    return response
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/updateprofile', profileData)
    return response
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/changepassword', passwordData)
    return response
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error)
    }
    
    // Clear local storage
    localStorage.removeItem('auth-storage')
  },

  // Refresh token (if needed)
  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    return response
  },

  // Request password reset
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response
  },

  // Reset password with token
  resetPassword: async (resetData) => {
    const response = await api.post('/auth/reset-password', resetData)
    return response
  },

  // Resend OTP
  resendOTP: async (phone) => {
    const response = await api.post('/auth/resend-otp', { phone })
    return response
  },

  // Verify email address
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token })
    return response
  }
}