import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/useAuthStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong'
    
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      toast.error('Session expired. Please login again.')
      return Promise.reject(error)
    }
    
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait and try again.')
    }
    
    if (!error.response) {
      toast.error('Network error. Please check your connection.')
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