import { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'
import { safeApiCall } from '../utils/apiUtils'

// Auth actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SHOW_AUTH_MODAL: 'SET_SHOW_AUTH_MODAL',
  SET_AUTH_STEP: 'SET_AUTH_STEP'
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  showAuthModal: false,
  authStep: 'phone' // 'phone' or 'otp'
}

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      }
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null
      }
    
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      }
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }

    case AUTH_ACTIONS.SET_SHOW_AUTH_MODAL:
      return {
        ...state,
        showAuthModal: action.payload
      }

    case AUTH_ACTIONS.SET_AUTH_STEP:
      return {
        ...state,
        authStep: action.payload
      }
    
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Helper actions
  const setLoading = (loading) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: loading })
  }

  const setUser = (user) => {
    dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user })
  }

  const setError = (error) => {
    dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error })
  }

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  const setShowAuthModal = (show) => {
    dispatch({ type: AUTH_ACTIONS.SET_SHOW_AUTH_MODAL, payload: show })
  }

  const setAuthStep = (step) => {
    dispatch({ type: AUTH_ACTIONS.SET_AUTH_STEP, payload: step })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
    toast.success('Logged out successfully')
  }

  // API call functions
  const sendOTP = async (phone) => {
    const { error } = await safeApiCall(
      async () => {
        // Replace with your actual API endpoint
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phone })
        })

        if (!response.ok) {
          throw new Error('Failed to send OTP')
        }

        return await response.json()
      },
      {
        showErrorToast: true,
        onError: (error) => setError(error.message),
        onSuccess: () => {
          setAuthStep('otp')
          toast.success('OTP sent successfully')
        }
      }
    )

    if (error) {
      throw new Error(error)
    }
  }

  const verifyOTP = async ({ phone, otp, name, email }) => {
    const { data, error } = await safeApiCall(
      async () => {
        // Replace with your actual API endpoint
        const response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phone, otp, name, email })
        })

        if (!response.ok) {
          throw new Error('Invalid OTP')
        }

        return await response.json()
      },
      {
        showErrorToast: true,
        showSuccessToast: true,
        successMessage: 'Welcome to Resonance!',
        onError: (error) => setError(error.message)
      }
    )

    if (error) {
      throw new Error(error)
    }

    // Store tokens and user data
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken)
    }

    setUser(data.user)
  }

  const login = async ({ email, password }) => {
    const { data, error } = await safeApiCall(
      async () => {
        // Replace with your actual API endpoint
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Login failed')
        }

        return await response.json()
      },
      {
        showErrorToast: true,
        showSuccessToast: true,
        successMessage: 'Welcome back!',
        onError: (error) => setError(error.message)
      }
    )

    if (error) {
      throw new Error(error)
    }

    // Store tokens and user data
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken)
    }

    setUser(data.user)
  }

  const register = async ({ name, email, phone, password }) => {
    const { data, error } = await safeApiCall(
      async () => {
        // Replace with your actual API endpoint
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, phone, password })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Registration failed')
        }

        return await response.json()
      },
      {
        showErrorToast: true,
        showSuccessToast: true,
        successMessage: 'Account created successfully!',
        onError: (error) => setError(error.message)
      }
    )

    if (error) {
      throw new Error(error)
    }

    // Store tokens and user data
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken)
    }

    setUser(data.user)
  }

  const resendOTP = async (phone) => {
    const { error } = await safeApiCall(
      async () => {
        // Replace with your actual API endpoint
        const response = await fetch('/api/auth/resend-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phone })
        })

        if (!response.ok) {
          throw new Error('Failed to resend OTP')
        }

        return await response.json()
      },
      {
        showErrorToast: true,
        onError: (error) => setError(error.message),
        onSuccess: () => {
          toast.success('OTP sent successfully')
        }
      }
    )

    if (error) {
      throw new Error(error)
    }
  }

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const { data } = await safeApiCall(
        async () => {
          // Replace with your actual API endpoint
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error('Token invalid')
          }

          return await response.json()
        },
        {
          showErrorToast: false,
          onError: () => {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            setLoading(false)
          }
        }
      )

      if (data) {
        setUser(data)
      }
    }

    checkAuth()
  }, [])

  const value = {
    ...state,
    // Auth actions
    login,
    register,
    logout,
    sendOTP,
    verifyOTP,
    resendOTP,
    // UI actions
    setShowAuthModal,
    setAuthStep,
    setUser,
    setError,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook - this is your useAuthStore equivalent
export const useAuthStore = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuthStore must be used within an AuthProvider')
  }
  
  return context
}

// Alternative hook name for consistency
export const useAuth = () => {
  return useAuthStore()
}