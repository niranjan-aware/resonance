// src/pages/Booking.jsx
import { motion } from 'framer-motion'
import BookingForm from '../components/booking/BookingForm'

export default function Booking() {
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Book Your Studio Session
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Reserve your perfect studio space with our easy booking process. 
              Get instant confirmation and start creating music today.
            </p>
          </div>

          <BookingForm />
        </div>
      </motion.div>
    </div>
  )
}

// src/pages/Calendar.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import Calendar from '../components/calendar/Calendar'
import TimeSlots from '../components/booking/TimeSlots'
import Button from '../components/common/Button'
import { Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedStudio, setSelectedStudio] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const navigate = useNavigate()

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  const handleBookNow = () => {
    if (selectedSlot && selectedDate && selectedStudio) {
      const bookingParams = new URLSearchParams({
        studioId: selectedStudio._id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      })
      
      navigate(`/booking?${bookingParams.toString()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
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
            {/* Calendar Section */}
            <div className="xl:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <Calendar
                  selectedStudio={selectedStudio}
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                  onStudioChange={setSelectedStudio}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selected Date Info */}
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

              {/* Time Slots */}
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
                  
                  <TimeSlots
                    slots={availableSlots}
                    selectedSlot={selectedSlot}
                    onSlotSelect={setSelectedSlot}
                  />
                </motion.div>
              )}

              {/* Quick Actions */}
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

              {/* Legend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Availability Legend
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded" />
                    <span className="text-gray-600 dark:text-gray-400">
                      High Availability (7+ slots)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Medium Availability (3-6 slots)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Low Availability (1-2 slots)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Fully Booked (0 slots)
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}