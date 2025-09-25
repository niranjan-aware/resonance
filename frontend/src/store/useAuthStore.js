import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/auth'
import toast from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      showAuthModal: false,
      authStep: 'phone',
      error: null,
      
      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Auth Modal Actions
      setShowAuthModal: (show) => set({ 
        showAuthModal: show,
        error: null,
        authStep: show ? 'phone' : 'phone' // Reset step when closing
      }),
      setAuthStep: (step) => set({ authStep: step }),
      
      // Login with email/password
      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.login(credentials)
          
          if (response.success) {
            set({
              user: response.user,
              token: response.token,
              isLoading: false,
              showAuthModal: false,
              authStep: 'phone',
              error: null
            })
            
            toast.success('Welcome back!')
            return response
          } else {
            throw new Error(response.message || 'Login failed')
          }
        } catch (error) {
          const errorMessage = error.message || 'Login failed. Please try again.'
          set({ 
            isLoading: false,
            error: errorMessage
          })
          toast.error(errorMessage)
          throw error
        }
      },
      
      // Send OTP to phone
      sendOTP: async (phone) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.sendOTP(phone)
          
          if (response.success) {
            set({ 
              isLoading: false,
              authStep: 'otp',
              error: null
            })
            
            toast.success('OTP sent successfully!')
            return response
          } else {
            throw new Error(response.message || 'Failed to send OTP')
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to send OTP. Please try again.'
          set({ 
            isLoading: false,
            error: errorMessage
          })
          toast.error(errorMessage)
          throw error
        }
      },
      
      // Verify OTP and login/register
      verifyOTP: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.verifyOTP(data)
          
          if (response.success) {
            set({
              user: response.user,
              token: response.token,
              isLoading: false,
              showAuthModal: false,
              authStep: 'phone',
              error: null
            })
            
            toast.success('Welcome to Resonance Studio!')
            return response
          } else {
            throw new Error(response.message || 'OTP verification failed')
          }
        } catch (error) {
          const errorMessage = error.message || 'OTP verification failed. Please try again.'
          set({ 
            isLoading: false,
            error: errorMessage
          })
          toast.error(errorMessage)
          throw error
        }
      },
      
      // Register with email/password
      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.register(userData)
          
          if (response.success) {
            set({
              user: response.user,
              token: response.token,
              isLoading: false,
              showAuthModal: false,
              error: null
            })
            
            toast.success('Account created successfully!')
            return response
          } else {
            throw new Error(response.message || 'Registration failed')
          }
        } catch (error) {
          const errorMessage = error.message || 'Registration failed. Please try again.'
          set({ 
            isLoading: false,
            error: errorMessage
          })
          toast.error(errorMessage)
          throw error
        }
      },
      
      // Logout user
      logout: async () => {
        set({ isLoading: true })
        try {
          await authAPI.logout()
        } catch (error) {
          console.error('Logout API call failed:', error)
          // Continue with logout even if API call fails
        } finally {
          set({
            user: null,
            token: null,
            isLoading: false,
            showAuthModal: false,
            authStep: 'phone',
            error: null
          })
          
          toast.success('Logged out successfully')
        }
      },
      
      // Update user profile
      updateUser: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.updateProfile(userData)
          
          if (response.success) {
            set(state => ({
              user: { ...state.user, ...response.user },
              isLoading: false,
              error: null
            }))
            
            toast.success('Profile updated successfully!')
            return response
          } else {
            throw new Error(response.message || 'Profile update failed')
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to update profile. Please try again.'
          set({ 
            isLoading: false,
            error: errorMessage
          })
          toast.error(errorMessage)
          throw error
        }
      },
      
      // Change password
      changePassword: async (passwordData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.changePassword(passwordData)
          
          if (response.success) {
            set({
              isLoading: false,
              error: null
            })
            
            toast.success('Password changed successfully!')
            return response
          } else {
            throw new Error(response.message || 'Password change failed')
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to change password. Please try again.'
          set({ 
            isLoading: false,
            error: errorMessage
          })
          toast.error(errorMessage)
          throw error
        }
      },
      
      // Check authentication status
      checkAuth: async () => {
        const { token } = get()
        if (!token) return
        
        set({ isLoading: true })
        try {
          const response = await authAPI.getProfile()
          
          if (response.success) {
            set({ 
              user: response.user,
              isLoading: false,
              error: null
            })
          } else {
            // Token is invalid, clear auth state
            set({ 
              user: null, 
              token: null,
              isLoading: false,
              error: null
            })
          }
        } catch (error) {
          // Token is invalid or network error, clear auth state
          set({ 
            user: null, 
            token: null,
            isLoading: false,
            error: null
          })
        }
      },
      
      // Resend OTP
      resendOTP: async (phone) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.resendOTP(phone)
          
          if (response.success) {
            set({ 
              isLoading: false,
              error: null
            })
            
            toast.success('OTP resent successfully!')
            return response
          } else {
            throw new Error(response.message || 'Failed to resend OTP')
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to resend OTP. Please try again.'
          set({ 
            isLoading: false,
            error: errorMessage
          })
          toast.error(errorMessage)
          throw error
        }
      },
      
      // Forgot password
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.forgotPassword(email)
          
          if (response.success) {
            set({ 
              isLoading: false,
              error: null
            })
            
            toast.success('Password reset instructions sent to your email!')
            return response
          } else {
            throw new Error(response.message || 'Failed to send reset instructions')
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to send reset instructions. Please try again.'
          set({ 
            isLoading: false,
            error: errorMessage
          })
          toast.error(errorMessage)
          throw error
        }
      },
      
      // Reset password
      resetPassword: async (resetData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authAPI.resetPassword(resetData)
          
          if (response.success) {
            set({
              user: response.user,
              token: response.token,
              isLoading: false,
              showAuthModal: false,
              error: null
            })
            
            toast.success('Password reset successfully!')
            return response
          } else {
            throw new Error(response.message || 'Password reset failed')
          }
        } catch (error) {
          const errorMessage = error.message || 'Password reset failed. Please try again.'
          set({ 
            isLoading: false,
            error: errorMessage
          })
          toast.error(errorMessage)
          throw error
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user 
      }),
    }
  )
)

// Helper hooks for convenience
export const useAuth = () => {
  const store = useAuthStore()
  return {
    user: store.user,
    token: store.token,
    isLoading: store.isLoading,
    error: store.error,
    isAuthenticated: !!(store.user && store.token),
    login: store.login,
    register: store.register,
    sendOTP: store.sendOTP,
    verifyOTP: store.verifyOTP,
    logout: store.logout,
    updateUser: store.updateUser,
    changePassword: store.changePassword,
    checkAuth: store.checkAuth,
    clearError: store.clearError
  }
}

export const useAuthModal = () => {
  const store = useAuthStore()
  return {
    showAuthModal: store.showAuthModal,
    authStep: store.authStep,
    setShowAuthModal: store.setShowAuthModal,
    setAuthStep: store.setAuthStep
  }
}

// Auth Provider component (if needed for React Query integration)
export const AuthProvider = ({ children }) => {
  return children
}