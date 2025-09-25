import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Music, 
  Sun, 
  Moon,
  User,
  Calendar,
  LogOut,
  Settings
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Studios', path: '/#studios' },
  { name: 'Booking', path: '/booking' },
  { name: 'Calendar', path: '/calendar' },
  { name: 'Gallery', path: '/#gallery' },
  { name: 'Contact', path: '/#contact' }
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const location = useLocation()
  const { user, logout, setShowAuthModal } = useAuthStore()

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleNavClick = (path) => {
    setIsOpen(false)
    if (path.includes('#')) {
      const element = document.getElementById(path.split('#')[1])
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'glass-strong backdrop-blur-xl shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <nav className="max-width-container flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-xl flex items-center justify-center">
                <Music className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur"></div>
            </motion.div>
            <div>
              <div className="text-xl font-bold text-light-text dark:text-dark-text">
                Resonance
              </div>
              <div className="text-xs text-light-text-muted dark:text-dark-text-muted -mt-1">
                Sinhgad Road
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`relative px-3 py-2 text-sm font-medium transition-colors group ${
                  location.pathname === item.path
                    ? 'text-light-primary dark:text-dark-primary'
                    : 'text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary'
                }`}
              >
                {item.name}
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-light-primary dark:bg-dark-primary"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg glass hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-light-accent" />
              ) : (
                <Moon className="w-5 h-5 text-light-primary" />
              )}
            </motion.button>

            {user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 glass px-4 py-2 rounded-xl hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-light-text dark:text-dark-text">
                    {user.name}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl shadow-lg py-2"
                    >
                      <div className="px-4 py-3 border-b border-light-border dark:border-dark-border">
                        <div className="font-medium text-light-text dark:text-dark-text">
                          {user.name}
                        </div>
                        <div className="text-sm text-light-text-muted dark:text-dark-text-muted">
                          {user.email}
                        </div>
                      </div>
                      
                      <Link
                        to="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center px-4 py-3 text-sm text-light-text dark:text-dark-text hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                      
                      <Link
                        to="/calendar"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center px-4 py-3 text-sm text-light-text dark:text-dark-text hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors"
                      >
                        <Calendar className="w-4 h-4 mr-3" />
                        My Bookings
                      </Link>
                      
                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center w-full px-4 py-3 text-sm text-light-text dark:text-dark-text hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </button>
                      
                      <div className="border-t border-light-border dark:border-dark-border mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAuthModal(true)}
                className="bg-light-primary dark:bg-dark-primary text-white px-6 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Sign In
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg glass hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-light-text dark:text-dark-text" />
              ) : (
                <Menu className="w-6 h-6 text-light-text dark:text-dark-text" />
              )}
            </motion.button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-20 left-0 right-0 z-40 lg:hidden glass-strong backdrop-blur-xl"
          >
            <div className="max-width-container py-6">
              <div className="space-y-4">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={`block px-4 py-3 text-lg font-medium rounded-xl transition-colors ${
                        location.pathname === item.path
                          ? 'bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary'
                          : 'text-light-text dark:text-dark-text hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                
                {!user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.1 }}
                    className="pt-4 border-t border-light-border dark:border-dark-border"
                  >
                    <button
                      onClick={() => {
                        setShowAuthModal(true)
                        setIsOpen(false)
                      }}
                      className="w-full bg-light-primary dark:bg-dark-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                      Sign In
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(isOpen || showUserMenu) && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => {
            setIsOpen(false)
            setShowUserMenu(false)
          }}
        />
      )}
    </>
  )
}