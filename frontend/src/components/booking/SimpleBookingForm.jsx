import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { 
  Calendar,
  Clock,
  Users,
  Music,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Info,
  XCircle
} from 'lucide-react'

import Button from '../common/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { useBookingStore } from '../../store/useBookingStore'
import { studioAPI, bookingAPI } from '../../services/booking'

const sessionTypes = [
  { value: 'karaoke', label: 'Karaoke', groupSizes: ['1-5', '6-10', '11-15'] },
  { value: 'live-musicians', label: 'Live with Musicians', groupSizes: ['1-3', '4-6', '7-10'] },
  { value: 'audio-recording', label: 'Audio Recording', groupSizes: ['1-2', '3-5', '6-8'] },
  { value: 'video-recording', label: 'Video Recording', groupSizes: ['1-5', '6-10', '11-15'] },
  { value: 'fb-live', label: 'Live Streaming', groupSizes: ['1-5', '6-10', '11-15'] }
]

const generateTimeSlots = () => {
  const slots = []
  for (let hour = 8; hour <= 22; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`
    const display = hour < 12 ? `${hour}:00 AM` : 
                    hour === 12 ? '12:00 PM' : 
                    `${hour - 12}:00 PM`
    slots.push({ value: time, label: display, hour })
  }
  return slots
}

const timeSlots = generateTimeSlots()

export default function SimpleBookingForm() {
  const { user, setShowAuthModal } = useAuthStore()
  const { createBooking, isLoading } = useBookingStore()
  
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [studios, setStudios] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [availableStartTimes, setAvailableStartTimes] = useState([])
  const [availableEndTimes, setAvailableEndTimes] = useState([])
  const [bookingSummary, setBookingSummary] = useState(null)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [bookedSlots, setBookedSlots] = useState([])
  const [availabilityChecked, setAvailabilityChecked] = useState(false)

  const { register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm({
    defaultValues: {
      sessionType: '',
      groupSize: '',
      studioId: '',
      date: '',
      startTime: '',
      endTime: '',
      specialRequirements: ''
    }
  })

  const watchSessionType = watch('sessionType')
  const watchGroupSize = watch('groupSize')
  const watchStudioId = watch('studioId')
  const watchDate = watch('date')
  const watchStartTime = watch('startTime')
  const watchEndTime = watch('endTime')

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        const response = await studioAPI.getStudios()
        setStudios(response.studios || [])
      } catch (error) {
        console.error('Failed to fetch studios:', error)
      }
    }
    fetchStudios()
  }, [])

  useEffect(() => {
    if (watchSessionType && watchGroupSize && studios.length > 0) {
      const groupNum = parseInt(watchGroupSize.split('-')[1] || watchGroupSize.split('-')[0])
      
      const suitable = studios
        .filter(studio => 
          studio.capacity >= groupNum && 
          studio.suitableFor?.includes(watchSessionType)
        )
        .map(studio => ({
          ...studio,
          pricePerHour: studio.pricing?.basePrice || 0
        }))
        .sort((a, b) => a.pricePerHour - b.pricePerHour)

      setRecommendations(suitable)
      
      if (suitable.length > 0 && !watchStudioId) {
        setValue('studioId', suitable[0]._id)
      }
    }
  }, [watchSessionType, watchGroupSize, studios, watchStudioId, setValue])

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (watchStudioId && watchDate) {
        setIsCheckingAvailability(true)
        setAvailabilityChecked(false)
        try {
          const response = await bookingAPI.getAvailableSlots(
            watchStudioId,
            format(new Date(watchDate), 'yyyy-MM-dd')
          )
          
          const slots = response.slots || []
          
          const booked = slots
            .filter(slot => slot.isBooked || !slot.available)
            .map(slot => ({
              start: parseInt(slot.startTime.split(':')[0]),
              end: parseInt(slot.endTime.split(':')[0])
            }))
          
          setBookedSlots(booked)
          
          const available = slots
            .filter(slot => slot.available && !slot.isBooked)
            .map(slot => ({
              value: slot.startTime,
              label: formatTimeLabel(parseInt(slot.startTime.split(':')[0])),
              hour: parseInt(slot.startTime.split(':')[0])
            }))
          
          setAvailableStartTimes(available)
          setAvailabilityChecked(true)
          
          setValue('startTime', '')
          setValue('endTime', '')
          
        } catch (error) {
          console.error('Failed to fetch availability:', error)
          toast.error('Failed to check availability')
        } finally {
          setIsCheckingAvailability(false)
        }
      }
    }
    
    fetchAvailableSlots()
  }, [watchStudioId, watchDate, setValue])

  const formatTimeLabel = (hour) => {
    return hour < 12 ? `${hour}:00 AM` : 
           hour === 12 ? '12:00 PM' : 
           `${hour - 12}:00 PM`
  }

  useEffect(() => {
    if (watchStartTime && bookedSlots.length >= 0) {
      const startHour = parseInt(watchStartTime.split(':')[0])
      const endTimes = []
      
      let nextBookedHour = 22
      for (const booking of bookedSlots) {
        if (booking.start > startHour && booking.start < nextBookedHour) {
          nextBookedHour = booking.start
        }
      }
      
      for (let hour = startHour + 1; hour <= nextBookedHour && hour <= 22; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`
        const display = hour < 12 ? `${hour}:00 AM` : 
                      hour === 12 ? '12:00 PM' : 
                      `${hour - 12}:00 PM`
        endTimes.push({ value: time, label: display, hour })
      }
      
      setAvailableEndTimes(endTimes)
      
      if (endTimes.length > 0 && !watchEndTime) {
        setValue('endTime', endTimes[0].value)
      }
      else if (watchEndTime && !endTimes.some(t => t.value === watchEndTime)) {
        setValue('endTime', endTimes.length > 0 ? endTimes[0].value : '')
      }
    }
  }, [watchStartTime, bookedSlots, watchEndTime, setValue])

  const calculateBookingSummary = (data) => {
    const studio = studios.find(s => s._id === data.studioId)
    if (!studio) return null

    const startHour = parseInt(data.startTime.split(':')[0])
    const endHour = parseInt(data.endTime.split(':')[0])
    const duration = endHour - startHour

    const baseRate = studio.pricing?.basePrice || 0
    const subtotal = baseRate * duration
    const taxes = Math.round(subtotal * 0.18)
    const total = subtotal + taxes

    return {
      studio: studio.name,
      date: format(new Date(data.date), 'MMM dd, yyyy'),
      startTime: timeSlots.find(t => t.value === data.startTime)?.label || data.startTime,
      endTime: timeSlots.find(t => t.value === data.endTime)?.label || data.endTime,
      duration,
      sessionType: sessionTypes.find(t => t.value === data.sessionType)?.label,
      groupSize: data.groupSize,
      ratePerHour: baseRate,
      subtotal,
      taxes,
      totalAmount: total
    }
  }

  const onPreview = (data) => {
    if (!user) {
      setShowAuthModal(true)
      toast.error('Please sign in to continue')
      return
    }

    const summary = calculateBookingSummary(data)
    setBookingSummary(summary)
    setShowConfirmation(true)
  }

  const onSubmit = async (data) => {
    try {
      const bookingPayload = {
        studioId: data.studioId,
        date: format(new Date(data.date), 'yyyy-MM-dd'),
        startTime: data.startTime,
        endTime: data.endTime,
        sessionType: data.sessionType,
        sessionDetails: {
          participants: parseInt(data.groupSize.split('-')[1] || data.groupSize.split('-')[0]),
          specialRequirements: data.specialRequirements || ''
        }
      }

      await createBooking(bookingPayload)
      
      toast.success('Booking created successfully!')
      reset()
      setShowConfirmation(false)
      setRecommendations([])
      setAvailableStartTimes([])
      setAvailableEndTimes([])
      setBookedSlots([])
      setAvailabilityChecked(false)
      
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(error.message || 'Failed to create booking')
    }
  }

  const handleBack = () => {
    setShowConfirmation(false)
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all fields?')) {
      reset()
      setRecommendations([])
      setAvailableStartTimes([])
      setAvailableEndTimes([])
      setBookedSlots([])
      setShowConfirmation(false)
      setAvailabilityChecked(false)
    }
  }

  const selectedSessionType = sessionTypes.find(t => t.value === watchSessionType)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = format(tomorrow, 'yyyy-MM-dd')

  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 4)
  const maxDateStr = format(maxDate, 'yyyy-MM-dd')

  const formatTimeRange = (start, end) => {
    const startLabel = timeSlots.find(t => t.hour === start)?.label || `${start}:00`
    const endLabel = timeSlots.find(t => t.hour === end)?.label || `${end}:00`
    return `${startLabel} - ${endLabel}`
  }

  const getAvailableRanges = () => {
    if (availableStartTimes.length === 0) {
      return []
    }

    const ranges = []
    let currentRange = {
      start: availableStartTimes[0].hour,
      end: availableStartTimes[0].hour + 1
    }

    for (let i = 1; i < availableStartTimes.length; i++) {
      const currentHour = availableStartTimes[i].hour
      
      if (currentHour === currentRange.end) {
        currentRange.end = currentHour + 1
      } else {
        ranges.push({ ...currentRange })
        currentRange = {
          start: currentHour,
          end: currentHour + 1
        }
      }
    }

    ranges.push(currentRange)
    
    return ranges
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!showConfirmation ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 xs:p-6 md:p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Resonance - Sinhgad Road
              </h1>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                Booking Request Form
              </p>
            </div>

            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                className="!text-xs md:!text-sm"
                onClick={handleClear}
              >
                Clear Form
              </Button>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 text-center">
                New Booking Request Form
              </h2>
            </div>

            <form onSubmit={handleSubmit(onPreview)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session type
                </label>
                <select
                  {...register('sessionType', { required: 'Session type is required' })}
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="">Select an option</option>
                  {sessionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.sessionType && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.sessionType.message}
                  </p>
                )}
              </div>

              {watchSessionType && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Group size
                  </label>
                  <select
                    {...register('groupSize', { required: 'Group size is required' })}
                    className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  >
                    <option value="">Select group size</option>
                    {selectedSessionType?.groupSizes.map(size => (
                      <option key={size} value={size}>
                        {size} participants
                      </option>
                    ))}
                  </select>
                  {errors.groupSize && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.groupSize.message}
                    </p>
                  )}
                </motion.div>
              )}

              {recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
                    <Info className="w-4 h-4" />
                    We recommend:
                  </div>
                  <div className="space-y-2">
                    {recommendations.map((studio, index) => (
                      <div key={studio._id} className="flex justify-between items-center text-sm">
                        <span className="text-yellow-900 dark:text-yellow-200 font-medium">
                          {studio.name}
                        </span>
                        <span className="text-yellow-800 dark:text-yellow-300 font-semibold">
                          Rs {studio.pricePerHour} per hour
                        </span>
                      </div>
                    ))}
                  </div>
                  {recommendations.length > 0 && (
                    <div className="mt-3 text-sm text-yellow-900 dark:text-yellow-200">
                      Our top recommendation for you is <strong>{recommendations[0].name}</strong>.
                    </div>
                  )}
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select a Studio
                </label>
                <select
                  {...register('studioId', { required: 'Studio selection is required' })}
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  disabled={!watchSessionType || !watchGroupSize}
                >
                  <option value="">Choose a studio</option>
                  {recommendations.length > 0 ? (
                    recommendations.map(studio => (
                      <option key={studio._id} value={studio._id}>
                        {studio.name} - Rs {studio.pricePerHour}/hr
                      </option>
                    ))
                  ) : (
                    studios.map(studio => (
                      <option key={studio._id} value={studio._id}>
                        {studio.name} - Rs {studio.pricing?.basePrice || 0}/hr
                      </option>
                    ))
                  )}
                </select>
                {errors.studioId && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.studioId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    min={minDate}
                    max={maxDateStr}
                    className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white appearance-none"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  />
                </div>
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.date.message}
                  </p>
                )}
              </div>

              {isCheckingAvailability && watchDate && watchStudioId && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Checking availability...</span>
                </div>
              )}

              {availabilityChecked && watchDate && watchStudioId && (
                <div className="space-y-3">
                  {bookedSlots.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <div className="flex items-start gap-2 text-sm text-red-800 dark:text-red-300">
                        <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium mb-1">Already Booked Time Slots:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {bookedSlots.map((slot, idx) => (
                              <li key={idx}>{formatTimeRange(slot.start, slot.end)}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {availableStartTimes.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <div className="flex items-start gap-2 text-sm text-green-800 dark:text-green-300">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium mb-1">Available Time Ranges:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {getAvailableRanges().map((range, idx) => (
                              <li key={idx}>{formatTimeRange(range.start, range.end)}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {availableStartTimes.length === 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-300">
                        <AlertCircle className="w-4 h-4" />
                        <p className="font-medium">No available time slots for this date. Please choose another date.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time <span className="text-gray-500 text-xs">(We operate from 08:00 AM to 10:00 PM)</span>
                </label>
                <select
                  {...register('startTime', { required: 'Start time is required' })}
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  disabled={!watchDate || !watchStudioId || isCheckingAvailability || availableStartTimes.length === 0}
                >
                  <option value="">
                    {!watchDate ? 'Choose a date first' :
                     !watchStudioId ? 'Choose a studio first' :
                     isCheckingAvailability ? 'Checking availability...' :
                     availableStartTimes.length === 0 ? 'No available slots' :
                     'Choose a start time'}
                  </option>
                  {availableStartTimes.map(slot => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                {errors.startTime && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time <span className="text-gray-500 text-xs">(Minimum 1 hour session)</span>
                </label>
                <select
                  {...register('endTime', { required: 'End time is required' })}
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  disabled={!watchStartTime}
                >
                  <option value="">
                    {!watchStartTime ? 'Choose a start time first' :
                     availableEndTimes.length === 0 ? 'No available end times' :
                     'Choose an end time'}
                  </option>
                  {availableEndTimes.map(slot => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                {errors.endTime && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.endTime.message}
                  </p>
                )}
                {watchStartTime && watchEndTime && (
                  <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Duration: {parseInt(watchEndTime.split(':')[0]) - parseInt(watchStartTime.split(':')[0])} hour(s)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Special Requirements (Optional)
                </label>
                <textarea
                  {...register('specialRequirements')}
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                  placeholder="Any special requirements or requests..."
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || isCheckingAvailability || availableStartTimes.length === 0}
              >
                Review Booking
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 xs:p-6 md:p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Resonance - Sinhgad Road
              </h1>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                Booking Request Form
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 text-center">
                Confirm Your Booking
              </h2>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Booking Summary
              </h3>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Please review your booking details before confirming:
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-900 dark:text-white min-w-[130px]">
                      Studio:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {bookingSummary?.studio}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-900 dark:text-white min-w-[130px]">
                      Date:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {bookingSummary?.date}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-900 dark:text-white min-w-[130px]">
                      Time:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {bookingSummary?.startTime} - {bookingSummary?.endTime}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-900 dark:text-white min-w-[130px]">
                      Duration:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {bookingSummary?.duration} hour(s)
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-900 dark:text-white min-w-[130px]">
                      Session Type:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {bookingSummary?.sessionType}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-900 dark:text-white min-w-[130px]">
                      Participants:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {bookingSummary?.groupSize} participants
                    </span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Rate per hour:
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        Rs {bookingSummary?.ratePerHour}
                      </span>
                    </div>

                    <div className="flex items-start justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Subtotal:
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        Rs {bookingSummary?.subtotal}
                      </span>
                    </div>

                    <div className="flex items-start justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Taxes (18% GST):
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        Rs {bookingSummary?.taxes}
                      </span>
                    </div>

                    <div className="flex items-start justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        Total Amount:
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        Rs {bookingSummary?.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Booking...' : 'Confirm Booking'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}