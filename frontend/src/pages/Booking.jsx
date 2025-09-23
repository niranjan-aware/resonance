import { motion } from 'framer-motion'
import BookingForm from '../components/booking/BookingForm'

export default function Booking() {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-12"
      >
        <div className="max-width-container">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-light-text dark:text-dark-text mb-4">
              Book Your Studio Session
            </h1>
            <p className="text-xl text-light-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">
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