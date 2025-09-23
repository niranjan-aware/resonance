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
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-12"
      >
        <div className="max-width-container">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-light-text dark:text-dark-text mb-4">
              Studio Availability Calendar
            </h1>
            <p className="text-xl text-light-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">
              Check real-time availability across all our studios and find the perfect time for your session.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Calendar Section */}
            <div className="xl:col-span-2">
              <div className="glass rounded-2xl p-6">
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
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-light-primary dark:text-dark-primary" />
                    Selected Date
                  </h3>
                  
                  <div className="text-center p-4 bg-light-primary/5 dark:bg-dark-primary/5 rounded-xl">
                    <div className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                      {format(selectedDate, 'MMM')}
                    </div>
                    <div className="text-3xl font-bold text-light-text dark:text-dark-text">
                      {format(selectedDate, 'd')}
                    </div>
                    <div className="text-light-text-muted dark:text-dark-text-muted">
                      {format(selectedDate, 'EEEE, yyyy')}
                    </div>
                  </div>

                  {selectedStudio && (
                    <div className="mt-4 p-4 bg-light-surface-variant dark:bg-dark-surface-variant rounded-xl">
                      <h4 className="font-medium text-light-text dark:text-dark-text mb-2">
                        Studio: {selectedStudio.name}
                      </h4>
                      <div className="text-sm text-light-text-muted dark:text-dark-text-muted">
                        Base Price: ₹{selectedStudio.pricing.basePrice}/hour
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
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-light-primary dark:text-dark-primary" />
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
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
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
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                  Availability Legend
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded" />
                    <span className="text-light-text-muted dark:text-dark-text-muted">
                      High Availability (7+ slots)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded" />
                    <span className="text-light-text-muted dark:text-dark-text-muted">
                      Medium Availability (3-6 slots)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded" />
                    <span className="text-light-text-muted dark:text-dark-text-muted">
                      Low Availability (1-2 slots)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded" />
                    <span className="text-light-text-muted dark:text-dark-text-muted">
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