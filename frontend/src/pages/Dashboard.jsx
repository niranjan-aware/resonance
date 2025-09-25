import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Clock, 
  Music, 
  User, 
  TrendingUp, 
  Star,
  Plus,
  Filter,
  Search,
  MapPin,
  Phone
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { bookingAPI } from '../services/booking'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'
import { format } from 'date-fns'

const statusColors = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
  confirmed: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  completed: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  cancelled: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
}

export default function Dashboard() {
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { user } = useAuthStore()

  useEffect(() => {
    fetchDashboardData()
  }, [filter])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await bookingAPI.getUserBookings(params)
      setBookings(response.bookings)
      
      // Calculate stats
      const totalBookings = response.bookings.length
      const confirmedBookings = response.bookings.filter(b => b.status === 'confirmed').length
      const totalSpent = response.bookings
        .filter(b => b.status !== 'cancelled')
        .reduce((sum, b) => sum + b.pricing.totalAmount, 0)
      
      setStats({
        totalBookings,
        confirmedBookings,
        totalSpent,
        favoriteStudio: 'Studio A' // This would come from backend
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const upcomingBookings = bookings.filter(booking => 
    booking.isUpcoming && ['confirmed', 'checked-in'].includes(booking.status)
  )

  const recentBookings = bookings.slice(0, 5)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20">
        <div className="max-width-container py-12">
          <Loading size="lg" text="Loading your dashboard..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-8"
      >
        <div className="max-width-container">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 🎵
            </h1>
            <p className="text-light-text-muted dark:text-dark-text-muted">
              Here's what's happening with your bookings
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-light-text-muted dark:text-dark-text-muted text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold text-light-text dark:text-dark-text">
                    {stats.totalBookings}
                  </p>
                </div>
                <div className="w-12 h-12 bg-light-primary/10 dark:bg-dark-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-light-primary dark:text-dark-primary" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-light-text-muted dark:text-dark-text-muted text-sm">Confirmed</p>
                  <p className="text-2xl font-bold text-light-text dark:text-dark-text">
                    {stats.confirmedBookings}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-light-text-muted dark:text-dark-text-muted text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-light-text dark:text-dark-text">
                    ₹{stats.totalSpent?.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-light-accent/10 dark:bg-dark-accent/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-light-accent dark:text-dark-accent" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-light-text-muted dark:text-dark-text-muted text-sm">Favorite Studio</p>
                  <p className="text-lg font-bold text-light-text dark:text-dark-text">
                    {stats.favoriteStudio}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Bookings */}
              {upcomingBookings.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
                      Upcoming Sessions
                    </h2>
                    <Link to="/calendar">
                      <Button variant="outline" size="sm">
                        View Calendar
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="p-4 bg-light-surface-variant dark:bg-dark-surface-variant rounded-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-light-text dark:text-dark-text">
                              {booking.studio.name}
                            </h3>
                            <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                              {format(new Date(booking.date), 'MMM d, yyyy')} • {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                            </p>
                            <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                              {booking.sessionType.replace('-', ' ')}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Recent Bookings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
                    Recent Bookings
                  </h2>
                  
                  <div className="flex gap-2">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-3 py-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg text-sm text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <motion.div
                        key={booking._id}
                        whileHover={{ scale: 1.01 }}
                        className="p-4 bg-light-surface-variant dark:bg-dark-surface-variant rounded-xl border border-light-border dark:border-dark-border hover:border-light-primary dark:hover:border-dark-primary transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-xl flex items-center justify-center">
                              <Music className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-light-text dark:text-dark-text">
                                {booking.studio.name}
                              </h3>
                              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                                {booking.bookingId}
                              </p>
                            </div>
                          </div>
                          
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-light-text-muted dark:text-dark-text-muted">Date:</span>
                            <span className="ml-2 font-medium text-light-text dark:text-dark-text">
                              {format(new Date(booking.date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div>
                            <span className="text-light-text-muted dark:text-dark-text-muted">Time:</span>
                            <span className="ml-2 font-medium text-light-text dark:text-dark-text">
                              {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                            </span>
                          </div>
                          <div>
                            <span className="text-light-text-muted dark:text-dark-text-muted">Session:</span>
                            <span className="ml-2 font-medium text-light-text dark:text-dark-text">
                              {booking.sessionType.replace('-', ' ')}
                            </span>
                          </div>
                          <div>
                            <span className="text-light-text-muted dark:text-dark-text-muted">Amount:</span>
                            <span className="ml-2 font-medium text-light-primary dark:text-dark-primary">
                              ₹{booking.pricing.totalAmount}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 text-light-text-muted dark:text-dark-text-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-2">
                      No bookings yet
                    </h3>
                    <p className="text-light-text-muted dark:text-dark-text-muted mb-6">
                      Start by booking your first studio session
                    </p>
                    <Link to="/booking">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Book Now
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <Link to="/booking">
                    <Button className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      New Booking
                    </Button>
                  </Link>
                  
                  <Link to="/calendar">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Calendar
                    </Button>
                  </Link>
                  
                  <Link to="/profile">
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Studio Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                  Contact Info
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-light-primary dark:text-dark-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-light-text dark:text-dark-text">Visit Us</p>
                      <p className="text-light-text-muted dark:text-dark-text-muted">
                        Sinhgad Road, Pune<br />
                        Maharashtra 411041
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                    <div>
                      <p className="font-medium text-light-text dark:text-dark-text">Call Us</p>
                      <p className="text-light-text-muted dark:text-dark-text-muted">
                        +91 98765 43210
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-light-border dark:border-dark-border">
                    <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                      Studio Hours: 9:00 AM - 10:00 PM<br />
                      All Days of the Week
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                  Recent Activity
                </h3>
                
                <div className="space-y-3 text-sm">
                  {recentBookings.slice(0, 3).map((booking) => (
                    <div key={booking._id} className="flex items-center gap-3 p-2 bg-light-surface-variant dark:bg-dark-surface-variant rounded-lg">
                      <div className="w-2 h-2 bg-light-primary dark:bg-dark-primary rounded-full" />
                      <div className="flex-1">
                        <p className="text-light-text dark:text-dark-text">
                          Booked {booking.studio.name}
                        </p>
                        <p className="text-light-text-muted dark:text-dark-text-muted">
                          {format(new Date(booking.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}