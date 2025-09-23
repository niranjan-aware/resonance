import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Landing from './pages/Landing'
import Booking from './pages/Booking'
import Calendar from './pages/Calendar'
import Dashboard from './pages/Dashboard'
import AuthModal from './components/common/AuthModal'
import ProtectedRoute from './components/common/ProtectedRoute'
import { useAuthStore } from './context/AuthContext'

function App() {
  const location = useLocation()
  const { showAuthModal } = useAuthStore()

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