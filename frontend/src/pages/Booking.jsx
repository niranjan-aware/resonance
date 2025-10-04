// Updated Booking.jsx - Main Page Wrapper
import { motion } from 'framer-motion'
import BookingForm from '../components/booking/BookingForm'

export default function Booking() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 xs:pt-18 md:pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-4 xs:py-6 md:py-8 lg:py-12"
      >
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 xs:mb-6 md:mb-8 lg:mb-12">
            <h1 className="text-xl xs:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 xs:mb-3 md:mb-4 px-2">
              Book Your Studio Session
            </h1>
            <p className="text-xs xs:text-sm md:text-base lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
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