import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/auth'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      showAuthModal: false,
      authStep: 'phone',
      
      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.login(credentials)
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
            showAuthModal: false
          })
          return response
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      sendOTP: async (phone) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.sendOTP(phone)
          set({ 
            isLoading: false,
            authStep: 'otp'
          })
          return response
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      verifyOTP: async (data) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.verifyOTP(data)
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
            showAuthModal: false,
            authStep: 'phone'
          })
          return response
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.register(userData)
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
            showAuthModal: false
          })
          return response
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      logout: () => {
        authAPI.logout()
        set({
          user: null,
          token: null,
          showAuthModal: false,
          authStep: 'phone'
        })
      },
      
      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }))
      },
      
      setShowAuthModal: (show) => set({ showAuthModal: show }),
      setAuthStep: (step) => set({ authStep: step }),
      
      checkAuth: async () => {
        const token = get().token
        if (!token) return
        
        try {
          const response = await authAPI.getProfile()
          set({ user: response.user })
        } catch (error) {
          set({ user: null, token: null })
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

export const AuthProvider = ({ children }) => {
  return children
}