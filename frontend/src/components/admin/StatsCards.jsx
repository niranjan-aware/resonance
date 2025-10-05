import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3
} from 'lucide-react';

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const statsData = [
    {
      title: 'Total Revenue',
      value: `₹${stats.overview?.totalRevenue?.toLocaleString() || 0}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      period: `Last ${stats.period?.days || 30} days`
    },
    {
      title: 'Total Bookings',
      value: stats.overview?.totalBookings || 0,
      change: '+8.2%',
      changeType: 'positive',
      icon: Calendar,
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      period: `Last ${stats.period?.days || 30} days`
    },
    {
      title: "Today's Bookings",
      value: stats.today?.bookings || 0,
      subtitle: `₹${stats.today?.revenue?.toLocaleString() || 0}`,
      icon: CheckCircle,
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      period: 'Today'
    },
    {
      title: 'Avg Booking Value',
      value: `₹${stats.overview?.averageBookingValue?.toLocaleString() || 0}`,
      change: '+5.1%',
      changeType: 'positive',
      icon: BarChart3,
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      period: 'Per booking'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 md:gap-6 mb-4 xs:mb-6">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-3 xs:p-4 md:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-2 xs:mb-3">
            <div className={`w-10 h-10 xs:w-12 xs:h-12 rounded-lg xs:rounded-xl ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 xs:w-6 xs:h-6 ${stat.iconColor}`} />
            </div>
            
            {stat.change && (
              <div className={`flex items-center gap-1 px-2 py-0.5 xs:py-1 rounded-full text-[10px] xs:text-xs font-medium ${
                stat.changeType === 'positive' 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}>
                <TrendingUp className={`w-2.5 h-2.5 xs:w-3 xs:h-3 ${stat.changeType === 'negative' ? 'rotate-180' : ''}`} />
                {stat.change}
              </div>
            )}
          </div>

          <div className="space-y-0.5 xs:space-y-1">
            <h3 className="text-[10px] xs:text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
              {stat.title}
            </h3>
            <p className="text-lg xs:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
              {stat.value}
            </p>
            {stat.subtitle && (
              <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 truncate">
                {stat.subtitle}
              </p>
            )}
            <p className="text-[9px] xs:text-[10px] md:text-xs text-gray-500 dark:text-gray-500 truncate">
              {stat.period}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}