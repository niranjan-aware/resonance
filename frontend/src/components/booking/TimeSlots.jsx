import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap, CheckCircle, X, AlertCircle } from 'lucide-react'

export default function TimeSlots({ slots, selectedSlot, onSlotSelect }) {
  const [selectedSlots, setSelectedSlots] = useState([])

  // Sync with parent's selectedSlot prop
  useEffect(() => {
    // If parent passes a combined slot with .slots array, use that
    if (selectedSlot?.slots && Array.isArray(selectedSlot.slots)) {
      setSelectedSlots(selectedSlot.slots)
    } 
    // If parent passes a single slot
    else if (selectedSlot && !Array.isArray(selectedSlot)) {
      setSelectedSlots([selectedSlot])
    } 
    // If parent clears selection
    else if (!selectedSlot) {
      setSelectedSlots([])
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

  const calculateTotalDuration = (slotsList) => {
    if (slotsList.length === 0) return '0 hours'
    
    const sorted = [...slotsList].sort((a, b) => a.startTime.localeCompare(b.startTime))
    const start = new Date(`1970-01-01T${sorted[0].startTime}:00`)
    const end = new Date(`1970-01-01T${sorted[sorted.length - 1].endTime}:00`)
    const diffHours = (end - start) / (1000 * 60 * 60)
    
    return diffHours === 1 ? '1 hour' : `${diffHours} hours`
  }

  const calculateTotalPrice = (slotsList) => {
    return slotsList.reduce((sum, slot) => sum + slot.price, 0)
  }

  // Check if a specific slot is in the selected array
  const isSlotInSelection = (slot) => {
    return selectedSlots.some(s => 
      s.startTime === slot.startTime && s.endTime === slot.endTime
    )
  }

  // Check if slots form a continuous sequence
  const areContinuous = (slotsList) => {
    if (slotsList.length <= 1) return true
    
    const sorted = [...slotsList].sort((a, b) => a.startTime.localeCompare(b.startTime))
    
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].endTime !== sorted[i + 1].startTime) {
        return false
      }
    }
    
    return true
  }

  // Check if a slot can be added to current selection
  const canAddSlot = (slot, currentSelections) => {
    if (currentSelections.length === 0) return true
    const testSelection = [...currentSelections, slot]
    return areContinuous(testSelection)
  }

  // Create combined slot object for parent
  const createCombinedSlot = (slotsList) => {
    if (slotsList.length === 0) return null
    if (slotsList.length === 1) return slotsList[0]
    
    const sorted = [...slotsList].sort((a, b) => a.startTime.localeCompare(b.startTime))
    
    return {
      startTime: sorted[0].startTime,
      endTime: sorted[sorted.length - 1].endTime,
      price: calculateTotalPrice(sorted),
      slots: sorted, // Keep individual slots for reference
      available: true,
      isPeakHour: sorted.some(s => s.isPeakHour)
    }
  }

  const handleSlotClick = (slot) => {
    if (slot.isBooked || !slot.available) return

    const isCurrentlySelected = isSlotInSelection(slot)

    if (isCurrentlySelected) {
      // Deselect the slot
      const newSelections = selectedSlots.filter(s => 
        !(s.startTime === slot.startTime && s.endTime === slot.endTime)
      )
      
      setSelectedSlots(newSelections)

      if (newSelections.length === 0) {
        onSlotSelect(null)
      } else if (areContinuous(newSelections)) {
        const combinedSlot = createCombinedSlot(newSelections)
        onSlotSelect(combinedSlot)
      } else {
        // If deselecting breaks continuity, reset
        setSelectedSlots([])
        onSlotSelect(null)
      }
    } else {
      // Add the slot
      const newSelections = [...selectedSlots, slot]
      
      if (areContinuous(newSelections)) {
        setSelectedSlots(newSelections)
        const combinedSlot = createCombinedSlot(newSelections)
        onSlotSelect(combinedSlot)
      }
      // If not continuous, ignore the click
    }
  }

  const getSlotStatus = (slot) => {
    if (slot.isBooked || !slot.available) return 'unavailable'
    if (isSlotInSelection(slot)) return 'selected'
    if (selectedSlots.length === 0) return 'available'
    if (canAddSlot(slot, selectedSlots)) return 'extendable'
    return 'blocked'
  }

  const availableSlots = slots.filter(slot => slot.available && !slot.isBooked)
  const bookedSlots = slots.filter(slot => slot.isBooked || !slot.available)

  return (
    <div className="space-y-6">
      {selectedSlots.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 rounded-xl border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                {selectedSlots.length} Consecutive Hours Selected
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {formatTime(selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime))[0].startTime)} - {formatTime(selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime))[selectedSlots.length - 1].endTime)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{calculateTotalPrice(selectedSlots)}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">
                Total for {calculateTotalDuration(selectedSlots)}
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
                type="button"
                onClick={() => {
                  setSelectedSlots([])
                  onSlotSelect(null)
                }}
                className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear Selection
              </button>
            )}
          </div>

          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">How to Book Multiple Hours</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Click any slot to start your booking</li>
                  <li>Click consecutive slots to extend (e.g., 10-11 AM, then 11 AM-12 PM)</li>
                  <li>All selected slots will show with blue borders</li>
                  <li>Click a selected slot again to remove it</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableSlots.map((slot, index) => {
              const status = getSlotStatus(slot)
              const isSelected = status === 'selected'
              const isExtendable = status === 'extendable'
              const isBlocked = status === 'blocked'

              return (
                <motion.div
                  key={`${slot.startTime}-${slot.endTime}`}
                  whileHover={!isBlocked ? { scale: 1.02 } : {}}
                  whileTap={!isBlocked ? { scale: 0.98 } : {}}
                  onClick={() => !isBlocked && handleSlotClick(slot)}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
                    ${isSelected
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg ring-2 ring-blue-300 dark:ring-blue-700'
                      : isExtendable
                      ? 'border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                      : isBlocked
                      ? 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 opacity-40 cursor-not-allowed'
                      : 'border-light-border dark:border-dark-border hover:border-light-primary/50 dark:hover:border-dark-primary/50 hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant'
                    }
                    ${slot.isPeakHour ? 'ring-1 ring-yellow-400/30 dark:ring-yellow-600/30' : ''}
                  `}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  {slot.isPeakHour && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-yellow-500 dark:bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Zap className="w-3 h-3" />
                        Peak
                      </div>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-blue-500 dark:bg-blue-400 text-white rounded-full p-1 shadow-md">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  {isExtendable && (
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-green-500 text-white rounded-full p-1 shadow-md animate-pulse">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className={`w-5 h-5 ${
                        isSelected ? 'text-blue-600 dark:text-blue-400' :
                        isExtendable ? 'text-green-600 dark:text-green-400' :
                        isBlocked ? 'text-gray-400 dark:text-gray-600' :
                        'text-light-text dark:text-dark-text'
                      }`} />
                      <span className={`font-semibold ${
                        isSelected ? 'text-blue-900 dark:text-blue-100' :
                        isBlocked ? 'text-gray-400 dark:text-gray-600' : 
                        'text-light-text dark:text-dark-text'
                      }`}>
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                    </div>
                    
                    <div className={`text-sm ${
                      isSelected ? 'text-blue-700 dark:text-blue-300' :
                      isBlocked ? 'text-gray-400 dark:text-gray-600' : 
                      'text-light-text-muted dark:text-dark-text-muted'
                    }`}>
                      Duration: {getDuration(slot.startTime, slot.endTime)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${
                        isSelected ? 'text-blue-600 dark:text-blue-400' :
                        isBlocked ? 'text-gray-400 dark:text-gray-600' :
                        slot.isPeakHour 
                          ? 'text-yellow-600 dark:text-yellow-400' 
                          : 'text-light-primary dark:text-dark-primary'
                      }`}>
                        ₹{slot.price}
                      </span>
                      
                      {isExtendable && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium animate-pulse">
                          Extend
                        </span>
                      )}
                      
                      {isBlocked && selectedSlots.length > 0 && (
                        <span className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                          Not Next
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {bookedSlots.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
            Already Booked ({bookedSlots.length})
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
                  
                  <div className="text-sm text-gray-500">
                    Duration: {getDuration(slot.startTime, slot.endTime)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-500">
                      ₹{slot.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSlots.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-5 rounded-xl border-2 border-blue-500/30 dark:border-blue-400/30 bg-blue-50/50 dark:bg-blue-900/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                {selectedSlots.length === 1 ? 'Selected Time Slot' : `${selectedSlots.length} Slots Selected`}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {formatTime(selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime))[0].startTime)} - {formatTime(selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime))[selectedSlots.length - 1].endTime)}
                {selectedSlots.some(s => s.isPeakHour) && (
                  <span className="ml-2 text-yellow-600 dark:text-yellow-400 font-medium">
                    (Peak Hours)
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{calculateTotalPrice(selectedSlots)}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">
                Total for {calculateTotalDuration(selectedSlots)}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}