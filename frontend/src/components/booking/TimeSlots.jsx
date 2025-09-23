import { motion } from 'framer-motion'
import { Clock, Zap, CheckCircle } from 'lucide-react'

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
    const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours)
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minutes} ${ampm}`
  }

  const getDuration = (startTime, endTime) => {
    const start = new Date(`1970-01-01T${startTime}:00`)
    const end = new Date(`1970-01-01T${endTime}:00`)
    const diffHours = (end - start) / (1000 * 60 * 60)
    return diffHours === 1 ? '1 hour' : `${diffHours} hours`
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
        Available Time Slots
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {slots.map((slot, index) => (
          <motion.button
            key={`${slot.startTime}-${slot.endTime}`}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSlotSelect(slot)}
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
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Peak Hour Badge */}
            {slot.isPeakHour && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-light-accent dark:bg-dark-accent text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Peak
                </div>
              </div>
            )}

            {/* Selected Badge */}
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

            {/* Hover Effect */}
            <motion.div
              className={`
                absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
                ${selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime
                  ? 'bg-light-primary/5 dark:bg-dark-primary/5 opacity-100'
                  : 'hover:bg-light-primary/5 dark:hover:bg-dark-primary/5 hover:opacity-100'
                }
              `}
              whileHover={{ opacity: 0.1 }}
            />
          </motion.button>
        ))}
      </div>

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