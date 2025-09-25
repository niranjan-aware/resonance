import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { bookingAPI, studioAPI } from '../services/booking'
import { safeApiCall, formatDateForAPI } from '../utils/apiUtils'
import toast from 'react-hot-toast'

// Query keys
export const QUERY_KEYS = {
  USER_BOOKINGS: 'userBookings',
  BOOKING: 'booking',
  STUDIOS: 'studios',
  STUDIO: 'studio',
  AVAILABLE_SLOTS: 'availableSlots',
  BOOKING_STATS: 'bookingStats'
}

// Custom hook for user bookings
export const useBookings = (params = {}) => {
  return useQuery(
    [QUERY_KEYS.USER_BOOKINGS, params],
    () => bookingAPI.getUserBookings(params),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch bookings:', error)
      }
    }
  )
}

// Custom hook for single booking
export const useBooking = (bookingId) => {
  return useQuery(
    [QUERY_KEYS.BOOKING, bookingId],
    () => bookingAPI.getBookingById(bookingId),
    {
      enabled: !!bookingId,
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch booking:', error)
      }
    }
  )
}

// Custom hook for creating bookings
export const useCreateBooking = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (bookingData) => bookingAPI.createBooking(bookingData),
    {
      onSuccess: (data) => {
        // Invalidate and refetch bookings
        queryClient.invalidateQueries(QUERY_KEYS.USER_BOOKINGS)
        queryClient.invalidateQueries([QUERY_KEYS.AVAILABLE_SLOTS])
        
        toast.success('Booking created successfully!')
        return data
      },
      onError: (error) => {
        const message = error.message || 'Failed to create booking'
        toast.error(message)
      }
    }
  )
}

// Custom hook for cancelling bookings
export const useCancelBooking = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ bookingId, reason }) => bookingAPI.cancelBooking(bookingId, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_KEYS.USER_BOOKINGS)
        queryClient.invalidateQueries([QUERY_KEYS.AVAILABLE_SLOTS])
        
        toast.success('Booking cancelled successfully!')
      },
      onError: (error) => {
        const message = error.message || 'Failed to cancel booking'
        toast.error(message)
      }
    }
  )
}

// Custom hook for confirming bookings
export const useConfirmBooking = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ bookingId, paymentDetails }) => bookingAPI.confirmBooking(bookingId, paymentDetails),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_KEYS.USER_BOOKINGS)
        toast.success('Booking confirmed successfully!')
      },
      onError: (error) => {
        const message = error.message || 'Failed to confirm booking'
        toast.error(message)
      }
    }
  )
}

// Custom hook for adding feedback
export const useAddFeedback = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ bookingId, feedback }) => bookingAPI.addFeedback(bookingId, feedback),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_KEYS.USER_BOOKINGS)
        queryClient.invalidateQueries(QUERY_KEYS.STUDIOS)
        
        toast.success('Feedback submitted successfully!')
      },
      onError: (error) => {
        const message = error.message || 'Failed to submit feedback'
        toast.error(message)
      }
    }
  )
}

// Custom hook for studios
export const useStudios = (params = {}) => {
  return useQuery(
    [QUERY_KEYS.STUDIOS, params],
    () => studioAPI.getStudios(params),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch studios:', error)
      }
    }
  )
}

// Custom hook for single studio
export const useStudio = (studioId) => {
  return useQuery(
    [QUERY_KEYS.STUDIO, studioId],
    () => studioAPI.getStudioById(studioId),
    {
      enabled: !!studioId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch studio:', error)
      }
    }
  )
}

// Custom hook for available slots
export const useAvailableSlots = (studioId, date, options = {}) => {
  const { enabled = true } = options
  
  return useQuery(
    [QUERY_KEYS.AVAILABLE_SLOTS, studioId, date],
    () => bookingAPI.getAvailableSlots(studioId, formatDateForAPI(date)),
    {
      enabled: enabled && !!studioId && !!date,
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch available slots:', error)
      }
    }
  )
}

// Custom hook for checking availability
export const useCheckAvailability = () => {
  return useMutation(
    (params) => bookingAPI.checkAvailability(params),
    {
      onError: (error) => {
        console.error('Availability check failed:', error)
      }
    }
  )
}

// Custom hook for booking form state
export const useBookingForm = (initialData = {}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    sessionType: '',
    participants: '',
    musicians: '',
    equipment: [],
    specialRequirements: '',
    date: '',
    timeSlot: null,
    studioId: '',
    ...initialData
  })
  const [selectedStudio, setSelectedStudio] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [errors, setErrors] = useState({})

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))
  const goToStep = (step) => setCurrentStep(step)
  
  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const resetForm = () => {
    setCurrentStep(1)
    setFormData({
      sessionType: '',
      participants: '',
      musicians: '',
      equipment: [],
      specialRequirements: '',
      date: '',
      timeSlot: null,
      studioId: ''
    })
    setSelectedStudio(null)
    setSelectedSlot(null)
    setErrors({})
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!formData.sessionType) {
          newErrors.sessionType = 'Please select a session type'
        }
        break
      
      case 2:
        if (formData.sessionType === 'karaoke' && !formData.participants) {
          newErrors.participants = 'Number of participants is required'
        }
        if (['live-musicians', 'band', 'audio-recording'].includes(formData.sessionType) && !formData.musicians) {
          newErrors.musicians = 'Number of musicians is required'
        }
        break
      
      case 3:
        if (!selectedStudio) {
          newErrors.studio = 'Please select a studio'
        }
        break
      
      case 4:
        if (!formData.date) {
          newErrors.date = 'Please select a date'
        }
        if (!selectedSlot) {
          newErrors.timeSlot = 'Please select a time slot'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isStepValid = (step) => {
    return validateStep(step)
  }

  return {
    currentStep,
    formData,
    selectedStudio,
    selectedSlot,
    errors,
    nextStep,
    prevStep,
    goToStep,
    updateFormData,
    setSelectedStudio,
    setSelectedSlot,
    resetForm,
    validateStep,
    isStepValid
  }
}

// Custom hook for booking statistics
export const useBookingStats = (params = {}) => {
  return useQuery(
    [QUERY_KEYS.BOOKING_STATS, params],
    () => bookingAPI.getBookingStats(params),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error) => {
        console.error('Failed to fetch booking stats:', error)
      }
    }
  )
}

// Custom hook for upcoming bookings
export const useUpcomingBookings = () => {
  return useQuery(
    [QUERY_KEYS.USER_BOOKINGS, 'upcoming'],
    () => bookingAPI.getUpcomingBookings(),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
      refetchOnWindowFocus: true,
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch upcoming bookings:', error)
      }
    }
  )
}

// Custom hook for booking history
export const useBookingHistory = (params = {}) => {
  return useQuery(
    [QUERY_KEYS.USER_BOOKINGS, 'history', params],
    () => bookingAPI.getBookingHistory(params),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch booking history:', error)
      }
    }
  )
}

// Custom hook for infinite loading of bookings
export const useInfiniteBookings = (params = {}) => {
  const { useInfiniteQuery } = require('react-query')
  
  return useInfiniteQuery(
    [QUERY_KEYS.USER_BOOKINGS, 'infinite', params],
    ({ pageParam = 1 }) => bookingAPI.getUserBookings({ ...params, page: pageParam }),
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.pagination && lastPage.pagination.current < lastPage.pagination.pages) {
          return lastPage.pagination.current + 1
        }
        return undefined
      },
      staleTime: 2 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2
    }
  )
}

// Custom hook for real-time slot updates
export const useRealtimeSlots = (studioId, date) => {
  const [slots, setSlots] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  const fetchSlots = async () => {
    if (!studioId || !date) return
    
    setIsLoading(true)
    const { data, error } = await safeApiCall(
      () => bookingAPI.getAvailableSlots(studioId, formatDateForAPI(date)),
      { showErrorToast: false }
    )
    
    if (data?.slots) {
      setSlots(data.slots)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchSlots()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchSlots, 30 * 1000) // Poll every 30 seconds
    
    return () => clearInterval(interval)
  }, [studioId, date])

  return { slots, isLoading, refetch: fetchSlots }
}