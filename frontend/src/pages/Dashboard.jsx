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
  MapPin,
  Phone
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useBookingStore } from '../store/useBookingStore'
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
  const { user } = useAuthStore()
  const { bookings, isLoading, fetchUserBookings } = useBookingStore()
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState({})

  useEffect(() => {
    if (user) {
      const params = filter !== 'all' ? { status: filter } : {}
      fetchUserBookings(params)
    }
  }, [filter, user, fetchUserBookings])

  useEffect(() => {
    if (bookings.length > 0) {
      // Calculate stats
      const totalBookings = bookings.length
      const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
      const totalSpent = bookings
        .filter(b => b.status !== 'cancelled')
        .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0)
      
      setStats({
        totalBookings,
        confirmedBookings,
        totalSpent,
        favoriteStudio: 'Studio A' // This would come from backend analysis
      })
    }
  }, [bookings])

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date)
    const now = new Date()
    return bookingDate >= now && ['confirmed', 'checked-in'].includes(booking.status)
  })

  const recentBookings = bookings.slice(0, 5)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Loading size="lg" text="Loading your dashboard..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 🎵
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's what's happening with your bookings
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalBookings || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.confirmedBookings || 0}
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{stats.totalSpent?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Favorite Studio</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.favoriteStudio || 'N/A'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
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
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
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
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {booking.studio?.name || 'Studio'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {format(new Date(booking.date), 'MMM d, yyyy')} • {booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {booking.sessionType?.replace('-', ' ') || 'Session'}
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
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Bookings
                  </h2>
                  
                  <div className="flex gap-2">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                              <Music className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {booking.studio?.name || 'Studio'}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {booking.bookingId || booking._id}
                              </p>
                            </div>
                          </div>
                          
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Date:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              {format(new Date(booking.date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Time:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              {booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Session:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              {booking.sessionType?.replace('-', ' ') || 'Session'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                            <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
                              ₹{booking.pricing?.totalAmount || 0}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No bookings yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
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
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Info
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Visit Us</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Sinhgad Road, Pune<br />
                        Maharashtra 411041
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Call Us</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        +91 98765 43210
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
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
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                
                <div className="space-y-3 text-sm">
                  {recentBookings.slice(0, 3).map((booking) => (
                    <div key={booking._id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 dark:text-blue-400 rounded-full" />
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white">
                          Booked {booking.studio?.name || 'Studio'}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {format(new Date(booking.createdAt || booking.date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {recentBookings.length === 0 && (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}