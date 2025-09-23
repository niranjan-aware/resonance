import { createContext, useContext, useReducer } from 'react'

const BookingContext = createContext()

const initialState = {
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
  availableSlots: [],
  isLoading: false,
  error: null
}

const bookingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload
      }
    
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 5)
      }
    
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1)
      }
    
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload
        }
      }
    
    case 'SET_SELECTED_STUDIO':
      return {
        ...state,
        selectedStudio: action.payload,
        formData: {
          ...state.formData,
          studioId: action.payload?._id || ''
        }
      }
    
    case 'SET_AVAILABLE_SLOTS':
      return {
        ...state,
        availableSlots: action.payload
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }
    
    case 'RESET_BOOKING':
      return initialState
    
    case 'SAVE_DRAFT':
      if (typeof window !== 'undefined') {
        localStorage.setItem('booking-draft', JSON.stringify(state))
      }
      return state
    
    case 'LOAD_DRAFT':
      if (typeof window !== 'undefined') {
        const draft = localStorage.getItem('booking-draft')
        if (draft) {
          return { ...state, ...JSON.parse(draft) }
        }
      }
      return state
    
    case 'CLEAR_DRAFT':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('booking-draft')
      }
      return state
    
    default:
      return state
  }
}

export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  const actions = {
    setStep: (step) => dispatch({ type: 'SET_STEP', payload: step }),
    nextStep: () => dispatch({ type: 'NEXT_STEP' }),
    prevStep: () => dispatch({ type: 'PREV_STEP' }),
    updateFormData: (data) => dispatch({ type: 'UPDATE_FORM_DATA', payload: data }),
    setSelectedStudio: (studio) => dispatch({ type: 'SET_SELECTED_STUDIO', payload: studio }),
    setAvailableSlots: (slots) => dispatch({ type: 'SET_AVAILABLE_SLOTS', payload: slots }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    resetBooking: () => dispatch({ type: 'RESET_BOOKING' }),
    saveDraft: () => dispatch({ type: 'SAVE_DRAFT' }),
    loadDraft: () => dispatch({ type: 'LOAD_DRAFT' }),
    clearDraft: () => dispatch({ type: 'CLEAR_DRAFT' })
  }

  const value = {
    ...state,
    ...actions,
    isFormValid: () => {
      const { formData, currentStep } = state
      
      switch (currentStep) {
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
          return !!state.selectedStudio
        case 4:
          return !!formData.date && !!formData.timeSlot
        case 5:
          return true
        default:
          return false
      }
    },
    getBookingSummary: () => {
      const { formData, selectedStudio } = state
      
      if (!selectedStudio || !formData.timeSlot) return null
      
      const duration = calculateDuration(formData.timeSlot.startTime, formData.timeSlot.endTime)
      const basePrice = selectedStudio.pricing.basePrice * duration
      const taxes = basePrice * 0.18
      const total = basePrice + taxes
      
      return {
        studio: selectedStudio.name,
        date: formData.date,
        time: `${formData.timeSlot.startTime} - ${formData.timeSlot.endTime}`,
        duration,
        sessionType: formData.sessionType,
        participants: formData.participants || formData.musicians,
        equipment: formData.equipment,
        basePrice,
        taxes,
        total
      }
    }
  }

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}

export const useBookingContext = () => {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider')
  }
  return context
}

const calculateDuration = (startTime, endTime) => {
  const start = new Date(`1970-01-01T${startTime}:00`)
  const end = new Date(`1970-01-01T${endTime}:00`)
  return (end - start) / (1000 * 60 * 60)
}