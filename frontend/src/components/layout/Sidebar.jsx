import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Calendar, 
  User, 
  Settings, 
  HelpCircle, 
  Music,
  BarChart3,
  Users,
  Building,
  X,
  LogOut
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import Button from '../common/Button'

const userMenuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'My Bookings', path: '/bookings', icon: Calendar },
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Help & Support', path: '/help', icon: HelpCircle }
]

const adminMenuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
  { name: 'Studios', path: '/admin/studios', icon: Building },
  { name: 'Bookings', path: '/admin/bookings', icon: Calendar },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Settings', path: '/admin/settings', icon: Settings }
]

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  if (!user) return null

  const menuItems = user.role === 'admin' ? adminMenuItems : userMenuItems

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: {
      x: '-100%',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  }

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed left-0 top-0 bottom-0 w-80 glass-strong backdrop-blur-xl z-50 lg:relative lg:translate-x-0"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
                <Link to="/" className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-xl flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-light-text dark:text-dark-text">
                      Resonance
                    </div>
                    <div className="text-xs text-light-text-muted dark:text-dark-text-muted -mt-1">
                      {user.role === 'admin' ? 'Admin Panel' : 'Studio'}
                    </div>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="lg:hidden"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* User Info */}
              <div className="p-6 border-b border-light-border dark:border-dark-border">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-light-text-muted dark:text-dark-text-muted truncate">
                      {user.email}
                    </p>
                    <span className={`
                      inline-block px-2 py-1 text-xs rounded-full mt-1
                      ${user.role === 'admin' 
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' 
                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      }
                    `}>
                      {user.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-6 space-y-2">
                {menuItems.map((item, index) => {
                  const isActive = location.pathname === item.path
                  
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className={`
                          flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                          ${isActive
                            ? 'bg-light-primary dark:bg-dark-primary text-white shadow-lg'
                            : 'text-light-text dark:text-dark-text hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant'
                          }
                        `}
                      >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-light-text-muted dark:text-dark-text-muted'}`} />
                        <span className="font-medium">{item.name}</span>
                        
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="ml-auto w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              {/* Bottom Actions */}
              <div className="p-6 border-t border-light-border dark:border-dark-border space-y-3">
                <Link
                  to="/help"
                  onClick={onClose}
                  className="flex items-center space-x-3 px-4 py-3 text-light-text dark:text-dark-text hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant rounded-xl transition-all duration-200"
                >
                  <HelpCircle className="w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />
                  <span>Help & Support</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}