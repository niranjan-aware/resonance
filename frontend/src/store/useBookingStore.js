import { create } from 'zustand'
import { bookingAPI, studioAPI } from '../services/booking'
import toast from 'react-hot-toast'

export const useBookingStore = create((set, get) => ({
  // State
  bookings: [],
  studios: [],
  selectedStudio: null,
  availableSlots: [],
  selectedSlot: null,
  isLoading: false,
  error: null,
  
  // Booking form state
  currentStep: 1,
  formData: {
    sessionType: '',
    participants: '',
    musicians: '',
    equipment: [],
    specialRequirements: '',
    date: '',
    timeSlot: null,
    studioId: ''
  },
  
  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Booking form actions
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set(state => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
  prevStep: () => set(state => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  
  updateFormData: (data) => set(state => ({
    formData: { ...state.formData, ...data }
  })),
  
  resetForm: () => set({
    currentStep: 1,
    formData: {
      sessionType: '',
      participants: '',
      musicians: '',
      equipment: [],
      specialRequirements: '',
      date: '',
      timeSlot: null,
      studioId: ''
    },
    selectedStudio: null,
    selectedSlot: null,
    availableSlots: []
  }),
  
  // Studio actions
  setSelectedStudio: (studio) => set(state => ({
    selectedStudio: studio,
    formData: {
      ...state.formData,
      studioId: studio?._id || ''
    },
    availableSlots: [], // Clear slots when studio changes
    selectedSlot: null
  })),
  
  setAvailableSlots: (slots) => set({ availableSlots: slots }),
  
  setSelectedSlot: (slot) => set(state => ({
    selectedSlot: slot,
    formData: {
      ...state.formData,
      timeSlot: slot
    }
  })),
  
  // API Actions
  fetchStudios: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await studioAPI.getStudios(params)
      set({ 
        studios: response.studios || [],
        isLoading: false 
      })
      return response
    } catch (error) {
      set({ 
        isLoading: false,
        error: error.message
      })
      toast.error(error.message)
      throw error
    }
  },
  
  fetchStudioById: async (studioId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await studioAPI.getStudioById(studioId)
      return response
    } catch (error) {
      set({ 
        isLoading: false,
        error: error.message
      })
      toast.error(error.message)
      throw error
    }
  },
  
  fetchAvailableSlots: async (studioId, date) => {
    set({ isLoading: true, error: null })
    try {
      const response = await bookingAPI.getAvailableSlots(studioId, date)
      set({ 
        availableSlots: response.slots || [],
        isLoading: false 
      })
      return response
    } catch (error) {
      set({ 
        isLoading: false,
        error: error.message,
        availableSlots: []
      })
      toast.error(error.message)
      throw error
    }
  },
  
  checkAvailability: async (params) => {
    try {
      const response = await bookingAPI.checkAvailability(params)
      return response
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  },
  
  fetchUserBookings: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await bookingAPI.getUserBookings(params)
      set({ 
        bookings: response.bookings || [],
        isLoading: false 
      })
      return response
    } catch (error) {
      set({ 
        isLoading: false,
        error: error.message
      })
      toast.error(error.message)
      throw error
    }
  },
  
  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await bookingAPI.createBooking(bookingData)
      
      // Add new booking to the list
      set(state => ({
        bookings: [response.booking, ...state.bookings],
        isLoading: false
      }))
      
      toast.success('Booking created successfully!')
      return response
    } catch (error) {
      set({ 
        isLoading: false,
        error: error.message
      })
      toast.error(error.message)
      throw error
    }
  },
  
  confirmBooking: async (bookingId, paymentDetails) => {
    set({ isLoading: true, error: null })
    try {
      const response = await bookingAPI.confirmBooking(bookingId, paymentDetails)
      
      // Update booking in the list
      set(state => ({
        bookings: state.bookings.map(booking => 
          booking._id === bookingId ? response.booking : booking
        ),
        isLoading: false
      }))
      
      toast.success('Booking confirmed successfully!')
      return response
    } catch (error) {
      set({ 
        isLoading: false,
        error: error.message
      })
      toast.error(error.message)
      throw error
    }
  },
  
  cancelBooking: async (bookingId, reason = '') => {
    set({ isLoading: true, error: null })
    try {
      const response = await bookingAPI.cancelBooking(bookingId, reason)
      
      // Update booking in the list
      set(state => ({
        bookings: state.bookings.map(booking => 
          booking._id === bookingId ? response.booking : booking
        ),
        isLoading: false
      }))
      
      toast.success('Booking cancelled successfully!')
      return response
    } catch (error) {
      set({ 
        isLoading: false,
        error: error.message
      })
      toast.error(error.message)
      throw error
    }
  },
  
  addBookingFeedback: async (bookingId, feedback) => {
    set({ isLoading: true, error: null })
    try {
      const response = await bookingAPI.addFeedback(bookingId, feedback)
      
      // Update booking in the list
      set(state => ({
        bookings: state.bookings.map(booking => 
          booking._id === bookingId ? response.booking : booking
        ),
        isLoading: false
      }))
      
      toast.success('Feedback submitted successfully!')
      return response
    } catch (error) {
      set({ 
        isLoading: false,
        error: error.message
      })
      toast.error(error.message)
      throw error
    }
  },
  
  // Form validation
  validateStep: (step) => {
    const { formData, selectedStudio, selectedSlot } = get()
    
    switch (step) {
      case 1:
        return !!formData.sessionType
      
      case 2:
        if (formData.sessionType === 'karaoke') {
          return !!formData.participants && formData.participants > 0
        }
        if (['live-musicians', 'band', 'audio-recording'].includes(formData.sessionType)) {
          return !!formData.musicians && formData.musicians > 0
        }
        return !!formData.participants && formData.participants > 0
      
      case 3:
        return !!selectedStudio
      
      case 4:
        return !!formData.date && !!selectedSlot
      
      case 5:
        return true
      
      default:
        return false
    }
  },
  
  // Get booking summary
  getBookingSummary: () => {
    const { formData, selectedStudio, selectedSlot } = get()
    
    if (!selectedStudio || !selectedSlot) return null
    
    const duration = calculateDuration(selectedSlot.startTime, selectedSlot.endTime)
    const basePrice = selectedSlot.price || (selectedStudio.pricing.basePrice * duration)
    const taxes = basePrice * 0.18
    const total = basePrice + taxes
    
    return {
      studio: selectedStudio.name,
      date: formData.date,
      time: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
      duration,
      sessionType: formData.sessionType,
      participants: formData.participants || formData.musicians,
      equipment: formData.equipment,
      basePrice,
      taxes: Math.round(taxes),
      total: Math.round(total)
    }
  }
}))

// Helper function to calculate duration
const calculateDuration = (startTime, endTime) => {
  const start = new Date(`1970-01-01T${startTime}:00`)
  const end = new Date(`1970-01-01T${endTime}:00`)
  return (end - start) / (1000 * 60 * 60)
}

// Helper hooks
export const useBookingForm = () => {
  const store = useBookingStore()
  return {
    currentStep: store.currentStep,
    formData: store.formData,
    selectedStudio: store.selectedStudio,
    selectedSlot: store.selectedSlot,
    availableSlots: store.availableSlots,
    isLoading: store.isLoading,
    error: store.error,
    
    // Actions
    setCurrentStep: store.setCurrentStep,
    nextStep: store.nextStep,
    prevStep: store.prevStep,
    updateFormData: store.updateFormData,
    resetForm: store.resetForm,
    setSelectedStudio: store.setSelectedStudio,
    setSelectedSlot: store.setSelectedSlot,
    
    // Validation
    validateStep: store.validateStep,
    getBookingSummary: store.getBookingSummary
  }
}

export const useStudios = () => {
  const store = useBookingStore()
  return {
    studios: store.studios,
    isLoading: store.isLoading,
    error: store.error,
    fetchStudios: store.fetchStudios,
    fetchStudioById: store.fetchStudioById
  }
}

export const useBookings = () => {
  const store = useBookingStore()
  return {
    bookings: store.bookings,
    isLoading: store.isLoading,
    error: store.error,
    fetchUserBookings: store.fetchUserBookings,
    createBooking: store.createBooking,
    confirmBooking: store.confirmBooking,
    cancelBooking: store.cancelBooking,
    addBookingFeedback: store.addBookingFeedback
  }
}