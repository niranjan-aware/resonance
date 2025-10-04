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
  { name: 'Studios', path: '/studios' },
  { name: 'Booking', path: '/booking' },
  { name: 'Calendar', path: '/calendar' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact', path: '/contact' }
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isHeroSection, setIsHeroSection] = useState(true)
  
  const location = useLocation()
  const { user, logout, setShowAuthModal } = useAuthStore()

  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/'

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
      const scrollPosition = window.scrollY
      setScrolled(scrollPosition > 50)
      
      // On landing page, check if we're still in hero section (approx first 80vh)
      if (isLandingPage) {
        setIsHeroSection(scrollPosition < window.innerHeight * 0.8)
      }
    }
    
    handleScroll() // Check on mount
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLandingPage])

  // Reset isHeroSection when navigating away from landing page
  useEffect(() => {
    if (!isLandingPage) {
      setIsHeroSection(false)
    } else {
      setIsHeroSection(window.scrollY < window.innerHeight * 0.8)
    }
  }, [isLandingPage])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

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

  // Determine text color based on position and theme
  const getTextColor = () => {
    if (isDark) {
      // Dark mode - always use light text
      return 'text-white'
    } else {
      // Light mode - use light text on hero, dark text elsewhere
      if (isLandingPage && isHeroSection) {
        return 'text-white'
      } else {
        return 'text-gray-900'
      }
    }
  }

  const getBgColor = () => {
    if (scrolled) {
      return 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200 dark:border-gray-700'
    } else if (isLandingPage && isHeroSection) {
      return 'bg-transparent'
    } else {
      return 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'
    }
  }

  const textColorClass = getTextColor()
  const mutedTextClass = isDark ? 'text-gray-300' : (isLandingPage && isHeroSection ? 'text-white/80' : 'text-gray-600')

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getBgColor()}`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group" onClick={() => setIsOpen(false)}>
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="relative flex-shrink-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Music className="w-5 h-5 sm:w-5 sm:h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur"></div>
            </motion.div>
            <div className="hidden sm:block">
              <div className={`text-base sm:text-lg md:text-xl font-bold ${textColorClass} leading-none`}>
                Resonance
              </div>
              <div className={`text-xs ${mutedTextClass}`}>
                Sinhgad Road
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`relative px-3 py-2 text-sm font-medium transition-colors group ${
                  location.pathname === item.path
                    ? 'text-blue-600 dark:text-blue-400'
                    : `${mutedTextClass} hover:text-blue-600 dark:hover:text-blue-400`
                }`}
              >
                {item.name}
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 ${
                scrolled || (!isLandingPage || !isHeroSection)
                  ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              ) : (
                <Moon className={`w-4 h-4 sm:w-5 sm:h-5 ${isLandingPage && isHeroSection ? 'text-white' : 'text-gray-600'}`} />
              )}
            </motion.button>

            {user ? (
              <div className="relative flex-shrink-0">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-colors ${
                    scrolled || (!isLandingPage || !isHeroSection)
                      ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
                  }`}
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                  </div>
                  <span className={`hidden sm:block text-xs md:text-sm font-medium ${textColorClass} truncate max-w-[60px] md:max-w-[100px]`}>
                    {user.name}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                    >
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {user.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                          {user.email}
                        </div>
                      </div>
                      
                      <Link
                        to="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                      
                      <Link
                        to="/calendar"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Calendar className="w-4 h-4 mr-3" />
                        My Bookings
                      </Link>
                      
                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </button>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
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
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 text-white px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors text-xs sm:text-sm md:text-base min-h-[36px] sm:min-h-[40px]"
              >
                Sign In
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                scrolled || (!isLandingPage || !isHeroSection)
                  ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
              }`}
            >
              {isOpen ? (
                <X className={`w-5 h-5 sm:w-6 sm:h-6 ${textColorClass}`} />
              ) : (
                <Menu className={`w-5 h-5 sm:w-6 sm:h-6 ${textColorClass}`} />
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
            className="fixed top-16 sm:top-20 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="space-y-2 sm:space-y-4">
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
                      className={`block px-4 py-3 text-base sm:text-lg font-medium rounded-xl transition-colors ${
                        location.pathname === item.path
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
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
                    className="pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <button
                      onClick={() => {
                        setShowAuthModal(true)
                        setIsOpen(false)
                      }}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
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