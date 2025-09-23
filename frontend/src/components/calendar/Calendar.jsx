import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isPast } from 'date-fns'
import { bookingAPI, studioAPI } from '../../services/booking'
import Button from '../common/Button'
import Loading from '../common/Loading'

export default function Calendar({ selectedStudio, onDateSelect, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookings, setBookings] = useState({})
  const [studios, setStudios] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeStudio, setActiveStudio] = useState(selectedStudio)

  useEffect(() => {
    fetchStudios()
  }, [])

  useEffect(() => {
    if (activeStudio) {
      fetchMonthBookings()
    }
  }, [currentMonth, activeStudio])

  const fetchStudios = async () => {
    try {
      const response = await studioAPI.getStudios()
      setStudios(response.studios)
      if (!activeStudio && response.studios.length > 0) {
        setActiveStudio(response.studios[0])
      }
    } catch (error) {
      console.error('Failed to fetch studios:', error)
    }
  }

  const fetchMonthBookings = async () => {
    setIsLoading(true)
    try {
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
      
      const bookingPromises = days.map(async (day) => {
        try {
          const response = await bookingAPI.getAvailableSlots(
            activeStudio._id, 
            format(day, 'yyyy-MM-dd')
          )
          return {
            date: format(day, 'yyyy-MM-dd'),
            availableSlots: response.slots.length,
            totalSlots: 10 // Assuming 10 total slots per day
          }
        } catch (error) {
          return {
            date: format(day, 'yyyy-MM-dd'),
            availableSlots: 0,
            totalSlots: 10
          }
        }
      })

      const bookingData = await Promise.all(bookingPromises)
      const bookingMap = bookingData.reduce((acc, booking) => {
        acc[booking.date] = booking
        return acc
      }, {})
      
      setBookings(bookingMap)
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getAvailabilityColor = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const booking = bookings[dateStr]
    
    if (isPast(date) && !isToday(date)) {
      return 'text-light-text-muted dark:text-dark-text-muted bg-light-surface-variant/50 dark:bg-dark-surface-variant/50'
    }
    
    if (!booking) {
      return 'text-light-text dark:text-dark-text hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant'
    }
    
    const availability = booking.availableSlots / booking.totalSlots
    
    if (availability === 0) {
      return 'text-red-500 bg-red-50 dark:bg-red-900/20'
    } else if (availability < 0.3) {
      return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
    } else if (availability < 0.7) {
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    } else {
      return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    }
  }

  const handleDateClick = (date) => {
    if (isPast(date) && !isToday(date)) return
    onDateSelect?.(date)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  return (
    <div className="space-y-6">
      {/* Studio Selector */}
      <div className="flex flex-wrap gap-2">
        {studios.map((studio) => (
          <Button
            key={studio._id}
            variant={activeStudio?._id === studio._id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveStudio(studio)}
          >
            {studio.name}
          </Button>
        ))}
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          {activeStudio && (
            <p className="text-light-text-muted dark:text-dark-text-muted">
              Showing availability for {activeStudio.name}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-light-border dark:border-dark-border">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="p-4 text-center font-medium text-light-text-muted dark:text-dark-text-muted bg-light-surface-variant dark:bg-dark-surface-variant"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const dateStr = format(date, 'yyyy-MM-dd')
            const booking = bookings[dateStr]
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isCurrentDay = isToday(date)
            const isPastDate = isPast(date) && !isToday(date)
            
            return (
              <motion.div
                key={date.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`
                  relative h-24 border-r border-b border-light-border dark:border-dark-border
                  cursor-pointer transition-all duration-200
                  ${getAvailabilityColor(date)}
                  ${isSelected ? 'ring-2 ring-light-primary dark:ring-dark-primary ring-inset' : ''}
                  ${isPastDate ? 'cursor-not-allowed' : ''}
                `}
                onClick={() => handleDateClick(date)}
                whileHover={!isPastDate ? { scale: 1.02 } : {}}
              >
                <div className="p-2 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className={`
                      text-sm font-medium
                      ${!isSameMonth(date, currentMonth) ? 'opacity-50' : ''}
                      ${isCurrentDay ? 'text-white bg-light-primary dark:bg-dark-primary w-6 h-6 rounded-full flex items-center justify-center text-xs' : ''}
                    `}>
                      {format(date, 'd')}
                    </span>
                    
                    {isSelected && (
                      <div className="w-2 h-2 bg-light-primary dark:bg-dark-primary rounded-full" />
                    )}
                  </div>

                  {booking && !isPastDate && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{booking.availableSlots} slots</span>
                      </div>
                      
                      <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1">
                        <div 
                          className="h-full rounded-full bg-current transition-all duration-300"
                          style={{ 
                            width: `${(booking.availableSlots / booking.totalSlots) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {isPastDate && (
                    <div className="text-xs opacity-50">
                      Past
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded" />
          <span className="text-light-text-muted dark:text-dark-text-muted">High Availability</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded" />
          <span className="text-light-text-muted dark:text-dark-text-muted">Medium Availability</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded" />
          <span className="text-light-text-muted dark:text-dark-text-muted">Low Availability</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded" />
          <span className="text-light-text-muted dark:text-dark-text-muted">Fully Booked</span>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-light-bg/50 dark:bg-dark-bg/50 flex items-center justify-center rounded-2xl">
          <Loading text="Loading availability..." />
        </div>
      )}
    </div>
  )
}