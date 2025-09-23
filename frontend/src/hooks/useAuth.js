import { useEffect } from 'react'
import { useAuthStore } from '../context/AuthContext'

export const useAuth = () => {
  const store = useAuthStore()

  useEffect(() => {
    if (store.token && !store.user) {
      store.checkAuth()
    }
  }, [store.token])

  return {
    user: store.user,
    token: store.token,
    isLoading: store.isLoading,
    isAuthenticated: !!store.user && !!store.token,
    login: store.login,
    register: store.register,
    sendOTP: store.sendOTP,
    verifyOTP: store.verifyOTP,
    logout: store.logout,
    updateUser: store.updateUser
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