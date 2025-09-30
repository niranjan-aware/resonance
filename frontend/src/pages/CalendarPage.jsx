import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import Calendar from '../components/calendar/Calendar'
import TimeSlots from '../components/booking/TimeSlots'
import Button from '../components/common/Button'
import { Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react'
import { bookingAPI } from '../services/booking'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedStudio, setSelectedStudio] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const navigate = useNavigate()

  // Fetch slots when date and studio are selected
  useEffect(() => {
    if (!selectedDate || !selectedStudio) {
      setAvailableSlots([])
      return
    }

    let isMounted = true

    const fetchSlots = async () => {
      setIsLoadingSlots(true)
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        console.log('Fetching slots for:', selectedStudio._id, dateStr)
        const response = await bookingAPI.getAvailableSlots(selectedStudio._id, dateStr)
        
        console.log('Slots response:', response)
        
        if (isMounted) {
          setAvailableSlots(response.slots || [])
        }
      } catch (error) {
        console.error('Failed to fetch slots:', error)
        if (isMounted) {
          setAvailableSlots([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false)
        }
      }
    }

    fetchSlots()

    return () => {
      isMounted = false
    }
  }, [selectedDate, selectedStudio?._id])

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
  }, [])

  const handleStudioChange = useCallback((studio) => {
    setSelectedStudio(studio)
    setSelectedSlot(null)
  }, [])

  const handleSlotSelect = useCallback((slot) => {
    setSelectedSlot(slot)
  }, [])

  const handleBookNow = useCallback(() => {
    if (selectedSlot && selectedDate && selectedStudio) {
      const bookingParams = new URLSearchParams({
        studioId: selectedStudio._id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      })
      
      navigate(`/booking?${bookingParams.toString()}`)
    }
  }, [selectedSlot, selectedDate, selectedStudio, navigate])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Studio Availability Calendar
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Check real-time availability across all our studios and find the perfect time for your session.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <Calendar
                  selectedStudio={selectedStudio}
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                  onStudioChange={handleStudioChange}
                />
              </div>
            </div>

            <div className="space-y-6">
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Selected Date
                  </h3>
                  
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {format(selectedDate, 'MMM')}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {format(selectedDate, 'd')}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {format(selectedDate, 'EEEE, yyyy')}
                    </div>
                  </div>

                  {selectedStudio && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Studio: {selectedStudio.name}
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Base Price: ₹{selectedStudio.pricing?.basePrice || 0}/hour
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {selectedDate && selectedStudio && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Available Times
                  </h3>
                  
                  {isLoadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading slots...</p>
                    </div>
                  ) : (
                    <TimeSlots
                      slots={availableSlots}
                      selectedSlot={selectedSlot}
                      onSlotSelect={handleSlotSelect}
                    />
                  )}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  {selectedSlot && selectedDate && selectedStudio ? (
                    <Button
                      onClick={handleBookNow}
                      className="w-full"
                      size="lg"
                    >
                      Book This Slot
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate('/booking')}
                      variant="outline"
                      className="w-full"
                    >
                      Start New Booking
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="ghost"
                    className="w-full"
                  >
                    View My Bookings
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}