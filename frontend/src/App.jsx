// Updated App.jsx to include Gallery
import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Landing from './pages/Landing'
import Booking from './pages/Booking'
import Calendar from './pages/Calendar'
import Dashboard from './pages/Dashboard'
import Gallery from './pages/Gallery' // Add this import
import AuthModal from './components/common/AuthModal'
import ProtectedRoute from './components/common/ProtectedRoute'
import ContactSection from './components/landing/ContactSection'
import StudioShowcase from './components/landing/StudioShowcase'
import { useAuthStore } from './store/useAuthStore'

function App() {
  const location = useLocation()
  const { showAuthModal, checkAuth } = useAuthStore()

  // Check authentication status on app load
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/health`)
      .catch(err => console.error("Health check failed:", err))
  }, [])

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <Header />
      
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="min-h-screen"
        >
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/gallery" element={<Gallery />} /> {/* Add this route */}
            <Route path="/contact" element={<ContactSection />} />
            <Route path="/studios" element={<StudioShowcase />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </motion.main>
      </AnimatePresence>

      <Footer />
      
      <AnimatePresence>
        {showAuthModal && <AuthModal />}
      </AnimatePresence>
    </div>
  )
}

export default App