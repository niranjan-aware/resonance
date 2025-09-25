import toast from 'react-hot-toast'

// API Error Handler Class
export class APIError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.data = data
  }
}

// Validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone)
}

export const validatePassword = (password) => {
  return password && password.length >= 6
}

export const validateOTP = (otp) => {
  const otpRegex = /^\d{6}$/
  return otpRegex.test(otp)
}

// Request retry utility
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await requestFn()
      return result
    } catch (error) {
      lastError = error
      
      // Don't retry on client errors (4xx) except for 408, 429
      if (error.status >= 400 && error.status < 500 && 
          error.status !== 408 && error.status !== 429) {
        throw error
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError
}

// Format API errors for user display
export const formatError = (error) => {
  if (error.isNetworkError) {
    return 'Connection failed. Please check your internet connection and try again.'
  }

  if (error.status === 401) {
    return 'Please log in to continue.'
  }

  if (error.status === 403) {
    return 'You don\'t have permission to perform this action.'
  }

  if (error.status === 404) {
    return 'The requested resource was not found.'
  }

  if (error.status === 422) {
    return error.validationErrors 
      ? Object.values(error.validationErrors).join(', ')
      : 'Please check your input and try again.'
  }

  if (error.status >= 500) {
    return 'Server error. Please try again later.'
  }

  return error.message || 'Something went wrong. Please try again.'
}

// Safe API call wrapper
export const safeApiCall = async (apiCall, options = {}) => {
  const { 
    showErrorToast = true, 
    showSuccessToast = false,
    successMessage = '',
    retries = 0,
    onError,
    onSuccess 
  } = options

  try {
    const result = retries > 0 
      ? await retryRequest(apiCall, retries)
      : await apiCall()

    if (showSuccessToast && successMessage) {
      toast.success(successMessage)
    }

    if (onSuccess) {
      onSuccess(result)
    }

    return { data: result, error: null }
  } catch (error) {
    const formattedError = formatError(error)
    
    if (showErrorToast) {
      toast.error(formattedError)
    }

    if (onError) {
      onError(error)
    }

    return { data: null, error: formattedError }
  }
}

// Parse query parameters
export const parseQueryParams = (params) => {
  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  
  return new URLSearchParams(filtered).toString()
}

// Format date for API calls
export const formatDateForAPI = (date) => {
  if (!date) return ''
  
  if (typeof date === 'string') {
    return date
  }
  
  return date.toISOString().split('T')[0]
}

// Debounce function for API calls
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Cache utility for API responses
class APICache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttl
  }

  generateKey(url, params = {}) {
    return `${url}_${JSON.stringify(params)}`
  }

  get(key) {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() > cached.expiry) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl
    })
  }

  clear() {
    this.cache.clear()
  }

  delete(key) {
    this.cache.delete(key)
  }
}

export const apiCache = new APICache()

// Cached API call wrapper
export const cachedApiCall = async (key, apiCall, useCache = true) => {
  if (useCache) {
    const cached = apiCache.get(key)
    if (cached) {
      return cached
    }
  }

  const result = await apiCall()
  
  if (useCache && result) {
    apiCache.set(key, result)
  }

  return result
}

// Upload progress handler
export const createUploadHandler = (onProgress, onSuccess, onError) => {
  return {
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress?.(percentCompleted)
      }
    },
    onSuccess: (response) => {
      onSuccess?.(response)
      toast.success('Upload completed successfully!')
    },
    onError: (error) => {
      onError?.(error)
      toast.error('Upload failed. Please try again.')
    }
  }
}

// Batch API calls
export const batchApiCalls = async (apiCalls, options = {}) => {
  const { concurrency = 3, delay = 100 } = options
  const results = []
  const errors = []

  for (let i = 0; i < apiCalls.length; i += concurrency) {
    const batch = apiCalls.slice(i, i + concurrency)
    
    const batchPromises = batch.map(async (apiCall, index) => {
      try {
        await new Promise(resolve => setTimeout(resolve, delay * index))
        const result = await apiCall()
        return { index: i + index, data: result, error: null }
      } catch (error) {
        return { index: i + index, data: null, error }
      }
    })

    const batchResults = await Promise.allSettled(batchPromises)
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { index, data, error } = result.value
        if (error) {
          errors.push({ index, error })
        } else {
          results.push({ index, data })
        }
      } else {
        errors.push({ index: i, error: result.reason })
      }
    })
  }

  return { results, errors }
}

// Request timeout wrapper
export const withTimeout = (promise, timeoutMs = 30000) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new APIError('Request timeout', 408))
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise])
}

// Health check utility
export const checkAPIHealth = async (apiClient) => {
  try {
    const startTime = Date.now()
    await apiClient.get('/health')
    const responseTime = Date.now() - startTime
    
    return {
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

// Local storage utilities for offline support
export const offlineStorage = {
  set: (key, data) => {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.warn('Failed to save to offline storage:', error)
    }
  },

  get: (key, maxAge = 24 * 60 * 60 * 1000) => { // 24 hours default
    try {
      const item = localStorage.getItem(`offline_${key}`)
      if (!item) return null

      const { data, timestamp } = JSON.parse(item)
      
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`offline_${key}`)
        return null
      }

      return data
    } catch (error) {
      console.warn('Failed to read from offline storage:', error)
      return null
    }
  },

  remove: (key) => {
    localStorage.removeItem(`offline_${key}`)
  },

  clear: () => {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('offline_')) {
        localStorage.removeItem(key)
      }
    })
  }
}