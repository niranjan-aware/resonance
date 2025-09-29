import { motion } from 'framer-motion'
import { Clock, Zap, CheckCircle, X } from 'lucide-react'

export default function TimeSlots({ slots, selectedSlot, onSlotSelect }) {
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

  const availableSlots = slots.filter(slot => slot.available)
  const bookedSlots = slots.filter(slot => slot.isBooked)

  return (
    <div className="space-y-6">
      {availableSlots.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
            Available Time Slots ({availableSlots.length})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableSlots.map((slot, index) => (
              <motion.button
                key={`${slot.startTime}-${slot.endTime}`}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSlotSelect(slot)}
                disabled={slot.isBooked}
                className={`
                  relative p-4 rounded-xl border-2 text-left transition-all duration-300
                  ${selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime
                    ? 'border-light-primary dark:border-dark-primary bg-light-primary/5 dark:bg-dark-primary/5'
                    : 'border-light-border dark:border-dark-border hover:border-light-primary/50 dark:hover:border-dark-primary/50'
                  }
                  ${slot.isPeakHour 
                    ? 'ring-2 ring-light-accent/20 dark:ring-dark-accent/20' 
                    : ''
                  }
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

                {selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime && (
                  <div className="absolute -top-2 -left-2">
                    <div className="bg-light-primary dark:bg-dark-primary text-white rounded-full p-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-light-primary dark:text-dark-primary" />
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
                    
                    {slot.isPeakHour && (
                      <span className="text-xs bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent px-2 py-1 rounded-full">
                        Peak Hours
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {bookedSlots.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
            Already Booked Slots ({bookedSlots.length})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bookedSlots.map((slot, index) => (
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

      {selectedSlot && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-light-text dark:text-dark-text">
                Selected Time Slot
              </h4>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                {selectedSlot.isPeakHour && (
                  <span className="ml-2 text-light-accent dark:text-dark-accent font-medium">
                    (Peak Hours)
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-light-primary dark:text-dark-primary">
                ₹{selectedSlot.price}
              </div>
              <div className="text-xs text-light-text-muted dark:text-dark-text-muted">
                {getDuration(selectedSlot.startTime, selectedSlot.endTime)}
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