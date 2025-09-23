import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { bookingAPI, studioAPI } from '../services/booking'
import toast from 'react-hot-toast'

export const useBookings = (params = {}) => {
  return useQuery(
    ['bookings', params],
    () => bookingAPI.getUserBookings(params),
    {
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        toast.error(error.message || 'Failed to fetch bookings')
      }
    }
  )
}

export const useBooking = (bookingId) => {
  return useQuery(
    ['booking', bookingId],
    () => bookingAPI.getBookingById(bookingId),
    {
      enabled: !!bookingId,
      staleTime: 2 * 60 * 1000,
      onError: (error) => {
        toast.error(error.message || 'Failed to fetch booking details')
      }
    }
  )
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (bookingData) => bookingAPI.createBooking(bookingData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('bookings')
        toast.success('Booking created successfully!')
        return data
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create booking')
      }
    }
  )
}

export const useCancelBooking = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ bookingId, reason }) => bookingAPI.cancelBooking(bookingId, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings')
        toast.success('Booking cancelled successfully!')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to cancel booking')
      }
    }
  )
}

export const useConfirmBooking = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ bookingId, paymentDetails }) => bookingAPI.confirmBooking(bookingId, paymentDetails),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings')
        toast.success('Booking confirmed successfully!')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to confirm booking')
      }
    }
  )
}

export const useStudios = (params = {}) => {
  return useQuery(
    ['studios', params],
    () => studioAPI.getStudios(params),
    {
      staleTime: 10 * 60 * 1000,
      onError: (error) => {
        toast.error(error.message || 'Failed to fetch studios')
      }
    }
  )
}

export const useStudio = (studioId) => {
  return useQuery(
    ['studio', studioId],
    () => studioAPI.getStudioById(studioId),
    {
      enabled: !!studioId,
      staleTime: 10 * 60 * 1000,
      onError: (error) => {
        toast.error(error.message || 'Failed to fetch studio details')
      }
    }
  )
}

export const useAvailableSlots = (studioId, date) => {
  return useQuery(
    ['availableSlots', studioId, date],
    () => bookingAPI.getAvailableSlots(studioId, date),
    {
      enabled: !!studioId && !!date,
      staleTime: 2 * 60 * 1000,
      onError: (error) => {
        toast.error(error.message || 'Failed to fetch available slots')
      }
    }
  )
}

export const useCheckAvailability = () => {
  return useMutation(
    (params) => bookingAPI.checkAvailability(params),
    {
      onError: (error) => {
        toast.error(error.message || 'Failed to check availability')
      }
    }
  )
}

export const useBookingForm = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [selectedStudio, setSelectedStudio] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))
  
  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const resetForm = () => {
    setCurrentStep(1)
    setFormData({})
    setSelectedStudio(null)
    setSelectedSlot(null)
  }

  return {
    currentStep,
    formData,
    selectedStudio,
    selectedSlot,
    nextStep,
    prevStep,
    updateFormData,
    setSelectedStudio,
    setSelectedSlot,
    resetForm
  }
}