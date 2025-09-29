// import axios from 'axios'
// import toast from 'react-hot-toast'

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// // Create axios instance
// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// // Request interceptor to add auth token
// apiClient.interceptors.request.use(
//   (config) => {
//     // Get token from Zustand store
//     const authStorage = localStorage.getItem('auth-storage')
//     if (authStorage) {
//       try {
//         const { state } = JSON.parse(authStorage)
//         if (state?.token) {
//           config.headers.Authorization = `Bearer ${state.token}`
//         }
//       } catch (error) {
//         console.error('Error parsing auth storage:', error)
//       }
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

// // Response interceptor to handle errors
// apiClient.interceptors.response.use(
//   (response) => {
//     return response.data
//   },
//   (error) => {
//     const message = error.response?.data?.message || 'Something went wrong'
    
//     // Handle different error statuses
//     if (error.response?.status === 401) {
//       // Clear auth data on unauthorized
//       localStorage.removeItem('auth-storage')
      
//       // Only show login message if not already on auth flow
//       if (!window.location.pathname.includes('/auth')) {
//         toast.error('Session expired. Please login again.')
//       }
      
//       return Promise.reject({
//         ...error,
//         message: 'Please log in to continue',
//         status: 401
//       })
//     }
    
//     if (error.response?.status === 429) {
//       toast.error('Too many requests. Please wait and try again.')
//     }
    
//     if (error.response?.status >= 500) {
//       toast.error('Server error. Please try again later.')
//     }
    
//     if (!error.response) {
//       toast.error('Network error. Please check your connection.')
//     }
    
//     return Promise.reject({
//       ...error,
//       message,
//       status: error.response?.status
//     })
//   }
// )

// export const api = {
//   get: (url, config) => apiClient.get(url, config),
//   post: (url, data, config) => apiClient.post(url, data, config),
//   put: (url, data, config) => apiClient.put(url, data, config),
//   delete: (url, config) => apiClient.delete(url, config),
//   patch: (url, data, config) => apiClient.patch(url, data, config),
// }

// export default apiClient


// frontend/src/services/api.js - UPDATED VERSION
import axios from 'axios'
import toast from 'react-hot-toast'

// FIXED: Correct API base URL for your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

console.log('🔗 API Base URL:', API_BASE_URL) // Debug log

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from Zustand store
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error)
      }
    }
    
    // Debug log for requests
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Debug log for successful responses
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`)
    return response.data
  },
  (error) => {
    // More detailed error logging
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      code: error.code
    })

    const message = error.response?.data?.message || error.message || 'Something went wrong'
    
    // Handle different error statuses
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('auth-storage')
      
      // Only show login message if not already on auth flow
      if (!window.location.pathname.includes('/auth')) {
        toast.error('Session expired. Please login again.')
      }
      
      return Promise.reject({
        ...error,
        message: 'Please log in to continue',
        status: 401
      })
    }
    
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait and try again.')
    }
    
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    
    // Network errors (like connection refused)
    if (!error.response && error.code === 'ERR_NETWORK') {
      toast.error('Cannot connect to server. Please check if backend is running.')
    }
    
    return Promise.reject({
      ...error,
      message,
      status: error.response?.status
    })
  }
)

export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
}

export default apiClient