import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap, CheckCircle, X, AlertCircle } from 'lucide-react'

export default function TimeSlots({ slots, selectedSlot, onSlotSelect }) {
  const [selectedSlots, setSelectedSlots] = useState([])
  const [hoveredSlot, setHoveredSlot] = useState(null)

  useEffect(() => {
    if (selectedSlot && !Array.isArray(selectedSlot)) {
      setSelectedSlots([selectedSlot])
    } else if (Array.isArray(selectedSlot)) {
      setSelectedSlots(selectedSlot)
    }
  }, [selectedSlot])

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-light-text-muted dark:text-dark-text-muted mx-auto mb-4" />
        <p className="text-light-text-muted dark:text-dark-text-muted">
          No available time slots for this date
        </p>
      </div>
    )
  }

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':')
    const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours) === 0 ? 12 : parseInt(hours)
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minutes} ${ampm}`
  }

  const getDuration = (startTime, endTime) => {
    const start = new Date(`1970-01-01T${startTime}:00`)
    const end = new Date(`1970-01-01T${endTime}:00`)
    const diffHours = (end - start) / (1000 * 60 * 60)
    return diffHours === 1 ? '1 hour' : `${diffHours} hours`
  }

  const calculateTotalDuration = (slots) => {
    if (slots.length === 0) return '0 hours'
    const totalHours = slots.length
    return totalHours === 1 ? '1 hour' : `${totalHours} hours`
  }

  const calculateTotalPrice = (slots) => {
    return slots.reduce((sum, slot) => sum + slot.price, 0)
  }

  const isSlotSelected = (slot) => {
    return selectedSlots.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime)
  }

  const areSlotsConsecutive = (slot1, slot2) => {
    return slot1.endTime === slot2.startTime || slot2.endTime === slot1.startTime
  }

  const canAddSlot = (slot, currentSelections) => {
    if (currentSelections.length === 0) return true

    const sortedSelections = [...currentSelections].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    )

    const firstSlot = sortedSelections[0]
    const lastSlot = sortedSelections[sortedSelections.length - 1]

    if (slot.endTime === firstSlot.startTime) {
      return true
    }
    
    if (slot.startTime === lastSlot.endTime) {
      return true
    }

    return false
  }

  const findContinuousRange = (selections) => {
    if (selections.length === 0) return null
    
    const sorted = [...selections].sort((a, b) => a.startTime.localeCompare(b.startTime))
    
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].endTime !== sorted[i + 1].startTime) {
        return null
      }
    }
    
    return {
      startTime: sorted[0].startTime,
      endTime: sorted[sorted.length - 1].endTime
    }
  }

  const handleSlotClick = (slot) => {
    if (slot.isBooked) return

    const isCurrentlySelected = isSlotSelected(slot)

    if (isCurrentlySelected) {
      const newSelections = selectedSlots.filter(s => 
        !(s.startTime === slot.startTime && s.endTime === slot.endTime)
      )
      
      if (newSelections.length === 0) {
        setSelectedSlots([])
        onSlotSelect(null)
        return
      }

      const range = findContinuousRange(newSelections)
      if (range) {
        setSelectedSlots(newSelections)
        const combinedSlot = {
          ...newSelections[0],
          startTime: range.startTime,
          endTime: range.endTime,
          slots: newSelections
        }
        onSlotSelect(combinedSlot)
      } else {
        setSelectedSlots([])
        onSlotSelect(null)
      }
    } else {
      if (selectedSlots.length === 0) {
        setSelectedSlots([slot])
        onSlotSelect(slot)
      } else {
        if (canAddSlot(slot, selectedSlots)) {
          const newSelections = [...selectedSlots, slot]
          const range = findContinuousRange(newSelections)
          
          if (range) {
            setSelectedSlots(newSelections)
            const combinedSlot = {
              ...newSelections[0],
              startTime: range.startTime,
              endTime: range.endTime,
              slots: newSelections
            }
            onSlotSelect(combinedSlot)
          }
        }
      }
    }
  }

  const getSlotPreview = (slot) => {
    if (selectedSlots.length === 0) return 'selectable'
    if (isSlotSelected(slot)) return 'selected'
    if (canAddSlot(slot, selectedSlots)) return 'extendable'
    return 'disabled'
  }

  const availableSlots = slots.filter(slot => slot.available)
  const bookedSlots = slots.filter(slot => slot.isBooked)

  return (
    <div className="space-y-6">
      {selectedSlots.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 rounded-xl border-2 border-light-primary dark:border-dark-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Multi-Hour Booking
              </h4>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                {formatTime(selectedSlots[0].startTime)} - {formatTime(selectedSlots[selectedSlots.length - 1].endTime)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                ₹{calculateTotalPrice(selectedSlots)}
              </div>
              <div className="text-xs text-light-text-muted dark:text-dark-text-muted">
                {calculateTotalDuration(selectedSlots)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {availableSlots.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
              Available Time Slots ({availableSlots.length})
            </h3>
            {selectedSlots.length > 0 && (
              <button
                onClick={() => {
                  setSelectedSlots([])
                  onSlotSelect(null)
                }}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Multi-Hour Booking</p>
                <p className="text-xs">Select consecutive time slots to book multiple hours. You can only book continuous slots (e.g., 2-3 PM + 3-4 PM). Non-continuous slots must be booked separately.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableSlots.map((slot, index) => {
              const slotStatus = getSlotPreview(slot)
              const isSelected = isSlotSelected(slot)
              const isExtendable = slotStatus === 'extendable'
              const isDisabled = slotStatus === 'disabled'

              return (
                <motion.button
                  key={`${slot.startTime}-${slot.endTime}`}
                  type="button"
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                  onClick={() => handleSlotClick(slot)}
                  onMouseEnter={() => setHoveredSlot(slot)}
                  onMouseLeave={() => setHoveredSlot(null)}
                  disabled={slot.isBooked || isDisabled}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all duration-300
                    ${isSelected
                      ? 'border-light-primary dark:border-dark-primary bg-light-primary/10 dark:bg-dark-primary/10'
                      : isExtendable
                      ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/10'
                      : isDisabled
                      ? 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/10 opacity-50 cursor-not-allowed'
                      : 'border-light-border dark:border-dark-border hover:border-light-primary/50 dark:hover:border-dark-primary/50'
                    }
                    ${slot.isPeakHour ? 'ring-2 ring-light-accent/20 dark:ring-dark-accent/20' : ''}
                    ${slot.isBooked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {slot.isPeakHour && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-light-accent dark:bg-dark-accent text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Peak
                      </div>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute -top-2 -left-2">
                      <div className="bg-light-primary dark:bg-dark-primary text-white rounded-full p-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  {isExtendable && !isSelected && (
                    <div className="absolute -top-2 -left-2">
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className={`w-5 h-5 ${
                        isSelected ? 'text-light-primary dark:text-dark-primary' :
                        isExtendable ? 'text-green-600 dark:text-green-400' :
                        'text-light-primary dark:text-dark-primary'
                      }`} />
                      <span className="font-semibold text-light-text dark:text-dark-text">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-light-text-muted dark:text-dark-text-muted">
                      Duration: {getDuration(slot.startTime, slot.endTime)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${
                        slot.isPeakHour 
                          ? 'text-light-accent dark:text-dark-accent' 
                          : 'text-light-primary dark:text-dark-primary'
                      }`}>
                        ₹{slot.price}
                      </span>
                      
                      {isExtendable && !isSelected && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                          Extend
                        </span>
                      )}
                      
                      {slot.isPeakHour && (
                        <span className="text-xs bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent px-2 py-1 rounded-full">
                          Peak
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {bookedSlots.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
            Already Booked Slots ({bookedSlots.length})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bookedSlots.map((slot) => (
              <div
                key={`booked-${slot.startTime}-${slot.endTime}`}
                className="relative p-4 rounded-xl border-2 border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 opacity-60"
              >
                <div className="absolute top-2 right-2">
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Booked
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    Duration: {getDuration(slot.startTime, slot.endTime)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-500">
                      ₹{slot.price}
                    </span>
                    <span className="text-xs text-red-600 dark:text-red-400">
                      Not Available
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {availableSlots.length === 0 && bookedSlots.length > 0 && (
        <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            All Slots Booked
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            All time slots for this date are already booked. Please try a different date.
          </p>
        </div>
      )}

      {selectedSlots.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-light-text dark:text-dark-text">
                Selected Time {selectedSlots.length > 1 ? 'Slots' : 'Slot'}
              </h4>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                {formatTime(selectedSlots[0].startTime)} - {formatTime(selectedSlots[selectedSlots.length - 1].endTime)}
                {selectedSlots.some(s => s.isPeakHour) && (
                  <span className="ml-2 text-light-accent dark:text-dark-accent font-medium">
                    (Includes Peak Hours)
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-light-primary dark:text-dark-primary">
                ₹{calculateTotalPrice(selectedSlots)}
              </div>
              <div className="text-xs text-light-text-muted dark:text-dark-text-muted">
                {calculateTotalDuration(selectedSlots)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {slots.some(slot => slot.isPeakHour) && (
        <div className="glass p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-light-accent dark:text-dark-accent mt-0.5" />
            <div>
              <h4 className="font-medium text-light-text dark:text-dark-text mb-1">
                Peak Hours Pricing
              </h4>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                Peak hours are high-demand time slots with premium pricing. 
                These typically include evenings, weekends, and popular recording times.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}