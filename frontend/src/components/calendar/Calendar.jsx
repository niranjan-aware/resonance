import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react'
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
  
  // Cache to prevent duplicate requests
  const fetchCacheRef = useRef({})
  const abortControllerRef = useRef(null)

  useEffect(() => {
    fetchStudios()
  }, [])

  useEffect(() => {
    if (activeStudio) {
      fetchMonthBookings()
    }
    
    // Cleanup function to abort ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
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

  const fetchMonthBookings = useCallback(async () => {
    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController()
    
    const monthKey = `${activeStudio._id}-${format(currentMonth, 'yyyy-MM')}`
    
    // Check if we already have this data cached
    if (fetchCacheRef.current[monthKey]) {
      setBookings(fetchCacheRef.current[monthKey])
      return
    }
    
    setIsLoading(true)
    try {
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)
      
      // Batch requests with delay to avoid rate limiting
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
      const bookingMap = {}
      
      // Process in batches of 5 days at a time with delays
      const batchSize = 5
      const delayBetweenBatches = 500 // 500ms delay between batches
      
      for (let i = 0; i < days.length; i += batchSize) {
        const batch = days.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (day) => {
          try {
            const response = await bookingAPI.getAvailableSlots(
              activeStudio._id, 
              format(day, 'yyyy-MM-dd')
            )
            return {
              date: format(day, 'yyyy-MM-dd'),
              summary: response.summary || {
                available: 0,
                total: 0,
                booked: 0,
                availabilityPercentage: 0,
                timeRanges: []
              },
              slots: response.slots || []
            }
          } catch (error) {
            // Handle rate limit errors gracefully
            if (error.response?.status === 429) {
              console.warn('Rate limit hit, using cached data')
            }
            return {
              date: format(day, 'yyyy-MM-dd'),
              summary: {
                available: 0,
                total: 0,
                booked: 0,
                availabilityPercentage: 0,
                timeRanges: []
              },
              slots: []
            }
          }
        })
        
        const batchResults = await Promise.all(batchPromises)
        
        // Update bookings incrementally
        batchResults.forEach(booking => {
          bookingMap[booking.date] = booking
        })
        
        // Update state after each batch for progressive loading
        setBookings({ ...bookingMap })
        
        // Add delay between batches (except for the last batch)
        if (i + batchSize < days.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
        }
      }
      
      // Cache the results
      fetchCacheRef.current[monthKey] = bookingMap
      setBookings(bookingMap)
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted')
        return
      }
      console.error('Failed to fetch bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentMonth, activeStudio])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getAvailabilityColor = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const booking = bookings[dateStr]
    
    if (isPast(date) && !isToday(date)) {
      return 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
    
    if (!booking || !booking.summary) {
      return 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
    }
    
    const availability = booking.summary.availabilityPercentage
    
    if (availability === 0) {
      return 'text-red-600 bg-red-50 dark:bg-red-900/20'
    } else if (availability < 30) {
      return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
    } else if (availability < 70) {
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
    <div className="space-y-3 xs:space-y-4 md:space-y-6">
      {/* Studio Selector - Mobile Optimized */}
      <div className="flex gap-1.5 xs:gap-2 overflow-x-auto pb-2 -mx-2 px-2 xs:mx-0 xs:px-0 scrollbar-hide">
        {studios.map((studio) => (
          <Button
            key={studio._id}
            variant={activeStudio?._id === studio._id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveStudio(studio)}
            className="flex-shrink-0 !px-2.5 xs:!px-3 md:!px-4 !py-1.5 xs:!py-2 !text-xs xs:!text-sm whitespace-nowrap"
          >
            <span className="hidden md:inline">{studio.name}</span>
            <span className="md:hidden">{studio.name.split(' - ')[1] || studio.name}</span>
          </Button>
        ))}
      </div>

      {/* Calendar Header - Compact */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-base xs:text-lg md:text-2xl font-bold text-light-text dark:text-dark-text truncate">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          {activeStudio && (
            <p className="text-[10px] xs:text-xs md:text-sm text-light-text-muted dark:text-dark-text-muted truncate">
              Showing availability for {activeStudio.name}
            </p>
          )}
        </div>
        
        <div className="flex gap-1 xs:gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            disabled={isLoading}
            className="!p-1.5 xs:!p-2 !min-h-0"
          >
            <ChevronLeft className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            disabled={isLoading}
            className="!p-1.5 xs:!p-2 !min-h-0"
          >
            <ChevronRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid - Responsive */}
      <div className="glass rounded-lg md:rounded-xl lg:rounded-2xl overflow-hidden relative border border-light-border dark:border-dark-border">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-light-border dark:border-dark-border bg-light-surface-variant dark:bg-dark-surface-variant">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div
              key={day}
              className="py-1.5 xs:py-2 md:py-3 lg:py-4 text-center text-[9px] xs:text-[10px] md:text-sm font-medium text-light-text-muted dark:text-dark-text-muted"
            >
              <span className="hidden tablet-portrait:inline">{day}</span>
              <span className="tablet-portrait:hidden">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days - Perfect Squares on Mobile */}
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
                transition={{ delay: index * 0.005 }}
                className={`
                  relative aspect-square md:min-h-[100px] lg:min-h-[120px] border-r border-b border-light-border dark:border-dark-border
                  cursor-pointer transition-all duration-200
                  ${getAvailabilityColor(date)}
                  ${isSelected ? 'ring-2 ring-inset ring-light-primary dark:ring-dark-primary z-10' : ''}
                  ${isPastDate ? 'cursor-not-allowed opacity-60' : 'hover:bg-opacity-80'}
                `}
                onClick={() => handleDateClick(date)}
                whileHover={!isPastDate ? { scale: 1.02 } : {}}
              >
                <div className="absolute inset-0 flex flex-col p-0.5 xs:p-1 md:p-2 lg:p-3">
                  {/* Date Number */}
                  <div className="flex items-start justify-between mb-0.5 xs:mb-1 md:mb-2">
                    <span className={`
                      text-[9px] xs:text-[10px] md:text-xs lg:text-sm font-medium leading-none
                      ${!isSameMonth(date, currentMonth) ? 'opacity-40' : ''}
                      ${isCurrentDay ? 'w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5 lg:w-7 lg:h-7 bg-light-primary dark:bg-dark-primary text-white rounded-full flex items-center justify-center text-[7px] xs:text-[8px] md:text-[10px] lg:text-xs' : ''}
                    `}>
                      {format(date, 'd')}
                    </span>
                    
                    {isSelected && (
                      <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 md:w-2 md:h-2 bg-light-primary dark:bg-dark-primary rounded-full flex-shrink-0" />
                    )}
                  </div>

                  {/* Booking Info - Scales with screen */}
                  {booking && !isPastDate && booking.summary && (
                    <div className="flex-1 flex flex-col justify-between min-h-0">
                      <div className="space-y-0.5 xs:space-y-1">
                        {/* Slot Count */}
                        <div className="flex items-center gap-0.5 xs:gap-1 text-[7px] xs:text-[8px] md:text-[10px] lg:text-xs">
                          <Clock className="w-1.5 h-1.5 xs:w-2 xs:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 flex-shrink-0" />
                          <span className="font-semibold">{booking.summary.available}</span>
                          <span className="opacity-70">/ {booking.summary.total}</span>
                        </div>
                        
                        {/* Time Range - Hidden on smallest screens */}
                        {booking.summary.timeRanges && booking.summary.timeRanges.length > 0 && (
                          <div className="hidden md:block text-[7px] lg:text-[10px] opacity-70 truncate leading-tight">
                            {booking.summary.timeRanges[0]}
                            {booking.summary.timeRanges.length > 1 && ` +${booking.summary.timeRanges.length - 1}`}
                          </div>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-0.5 xs:mt-1 md:mt-2">
                        <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-0.5 xs:h-1 md:h-1.5 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-current transition-all duration-300"
                            style={{ 
                              width: `${booking.summary.availabilityPercentage}%` 
                            }}
                          />
                        </div>
                        {/* Percentage */}
                        <div className="hidden xs:block text-[7px] md:text-[8px] lg:text-[10px] text-center mt-0.5 font-medium">
                          {booking.summary.availabilityPercentage}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Past Date Label */}
                  {isPastDate && (
                    <div className="text-[7px] xs:text-[8px] md:text-xs opacity-50 mt-auto">
                      Past
                    </div>
                  )}

                  {/* Empty States */}
                  {!booking && !isPastDate && !isLoading && (
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-[7px] xs:text-[8px] md:text-xs opacity-50">Closed</span>
                    </div>
                  )}
                  
                  {!booking && !isPastDate && isLoading && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-2 h-2 xs:w-3 xs:h-3 md:w-4 md:h-4 border border-current border-t-transparent rounded-full animate-spin opacity-50" />
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-light-bg/50 dark:bg-dark-bg/50 flex items-center justify-center rounded-lg md:rounded-xl lg:rounded-2xl backdrop-blur-sm z-20">
            <Loading text="Loading availability..." />
          </div>
        )}
      </div>

      {/* Legend - Compact for Mobile */}
      <div className="flex flex-wrap gap-1.5 xs:gap-2 md:gap-3 lg:gap-4 text-[9px] xs:text-[10px] md:text-xs lg:text-sm">
        <div className="flex items-center gap-1 xs:gap-1.5">
          <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded flex-shrink-0" />
          <span className="text-light-text-muted dark:text-dark-text-muted whitespace-nowrap">
            <span className="hidden md:inline">High (70%+)</span>
            <span className="md:hidden">High</span>
          </span>
        </div>
        <div className="flex items-center gap-1 xs:gap-1.5">
          <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded flex-shrink-0" />
          <span className="text-light-text-muted dark:text-dark-text-muted whitespace-nowrap">
            <span className="hidden md:inline">Medium (30-70%)</span>
            <span className="md:hidden">Med</span>
          </span>
        </div>
        <div className="flex items-center gap-1 xs:gap-1.5">
          <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded flex-shrink-0" />
          <span className="text-light-text-muted dark:text-dark-text-muted whitespace-nowrap">
            <span className="hidden md:inline">Low (&lt;30%)</span>
            <span className="md:hidden">Low</span>
          </span>
        </div>
        <div className="flex items-center gap-1 xs:gap-1.5">
          <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex-shrink-0" />
          <span className="text-light-text-muted dark:text-dark-text-muted whitespace-nowrap">
            <span className="hidden md:inline">Fully Booked</span>
            <span className="md:hidden">Full</span>
          </span>
        </div>
      </div>
    </div>
  )
}