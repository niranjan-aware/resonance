import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Landing from './pages/Landing'
import Booking from './pages/Booking'
import Calendar from './pages/Calendar'
import Dashboard from './pages/Dashboard'
import Gallery from './pages/Gallery'
import AuthModal from './components/common/AuthModal'
import ProtectedRoute from './components/common/ProtectedRoute'
import ContactSection from './components/landing/ContactSection'
import StudioShowcase from './components/landing/StudioShowcase'
import ScrollToTop from './components/common/ScrollToTop'
import { useAuthStore } from './store/useAuthStore'

function App() {
  const location = useLocation()
  const { showAuthModal, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/health`)
      .catch(err => console.error("Health check failed:", err))
  }, [])

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <ScrollToTop />
      <Header />
      
      {/* Toast Notifications with Mobile-Optimized Configuration */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName="toast-container"
        containerStyle={{
          top: 80,
        }}
        toastOptions={{
          // Default options for all toasts
          className: '',
          duration: 4000,
          style: {
            maxWidth: '90vw',
            width: 'auto',
            minWidth: '250px',
            padding: '12px 16px',
            fontSize: '14px',
            borderRadius: '12px',
            background: 'var(--toast-bg)',
            color: 'var(--toast-text)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
          },
          // Success toast styling
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
            style: {
              background: '#10B981',
              color: '#FFFFFF',
            },
          },
          // Error toast styling
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
            style: {
              background: '#EF4444',
              color: '#FFFFFF',
            },
          },
          // Loading toast styling
          loading: {
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#FFFFFF',
            },
            style: {
              background: '#3B82F6',
              color: '#FFFFFF',
            },
          },
        }}
      />
      
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
            <Route path="/gallery" element={<Gallery />} />
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