import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Users, 
  DollarSign,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useAdminStore } from '../store/useAdminStore';
import { useNavigate } from 'react-router-dom';
import AdminCalendar from '../components/admin/AdminCalendar';
import BookingCard from '../components/admin/BookingCard';
import StatsCards from '../components/admin/StatsCards';
import FiltersPanel from '../components/admin/FiltersPanel';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    bookings,
    selectedDate,
    stats,
    isLoading,
    pagination,
    filters,
    setSelectedDate,
    fetchBookingsByDate,
    fetchDashboardStats,
    setPage,
    refresh
  } = useAdminStore();

  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch initial data
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardStats();
      fetchBookingsByDate();
    }
  }, [user]);

  // Fetch bookings when date or filters change
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchBookingsByDate();
    }
  }, [selectedDate, filters.page, filters.status, filters.studioId, filters.sessionType, filters.sortBy, filters.order]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const handlePrevDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const handleRefresh = () => {
    refresh();
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 xs:pt-18 md:pt-20">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 xs:mb-6 md:mb-8"
        >
          <h1 className="text-xl xs:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-xs xs:text-sm md:text-base text-gray-600 dark:text-gray-400">
            Manage bookings, users, and view studio analytics
          </p>
        </motion.div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Date Selection & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-3 xs:p-4 md:p-6 border border-gray-200 dark:border-gray-700 mb-4 xs:mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-base xs:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
              Bookings for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Date Navigation */}
              <div className="flex items-center gap-1 xs:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevDay}
                  className="!p-1.5 xs:!p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="!px-2 xs:!px-3 !py-1.5 xs:!py-2"
                >
                  <CalendarIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                  <span className="text-xs xs:text-sm">{format(selectedDate, 'MMM d')}</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextDay}
                  className="!p-1.5 xs:!p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="!px-2 xs:!px-3 !py-1.5 xs:!py-2"
              >
                <Filter className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                <span className="text-xs xs:text-sm">Filters</span>
              </Button>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="!p-1.5 xs:!p-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Calendar Dropdown */}
          {showCalendar && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4"
            >
              <AdminCalendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </motion.div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 dark:border-gray-700 pt-4"
            >
              <FiltersPanel />
            </motion.div>
          )}

          {/* Day Stats Summary */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3 md:gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center p-2 xs:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-lg xs:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalBookings || 0}
                </div>
                <div className="text-[10px] xs:text-xs text-gray-600 dark:text-gray-400">Total</div>
              </div>
              <div className="text-center p-2 xs:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-lg xs:text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.confirmedBookings || 0}
                </div>
                <div className="text-[10px] xs:text-xs text-gray-600 dark:text-gray-400">Confirmed</div>
              </div>
              <div className="text-center p-2 xs:p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-lg xs:text-xl md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pendingBookings || 0}
                </div>
                <div className="text-[10px] xs:text-xs text-gray-600 dark:text-gray-400">Pending</div>
              </div>
              <div className="text-center p-2 xs:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-lg xs:text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ₹{stats.totalRevenue?.toLocaleString() || 0}
                </div>
                <div className="text-[10px] xs:text-xs text-gray-600 dark:text-gray-400">Revenue</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loading text="Loading bookings..." />
            </div>
          ) : bookings.length > 0 ? (
            <>
              <div className="space-y-3 xs:space-y-4">
                {bookings.map((booking, index) => (
                  <BookingCard 
                    key={booking._id} 
                    booking={booking}
                    index={index}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.current - 1)}
                    disabled={!pagination.hasPrev}
                    className="!px-3 !py-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1 xs:gap-2">
                    {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                      const pageNum = pagination.current <= 3 
                        ? i + 1 
                        : Math.min(pagination.current - 2 + i, pagination.pages - 4 + i);
                      
                      if (pageNum > pagination.pages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.current === pageNum ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="!w-8 !h-8 xs:!w-10 xs:!h-10 !p-0 text-xs xs:text-sm"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.current + 1)}
                    disabled={!pagination.hasNext}
                    className="!px-3 !py-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <CalendarIcon className="w-12 h-12 xs:w-16 xs:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base xs:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No bookings found
              </h3>
              <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400">
                There are no bookings for {format(selectedDate, 'MMMM d, yyyy')}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}