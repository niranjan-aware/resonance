import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Clock, 
  User, 
  Music, 
  Phone, 
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  confirmed: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  'checked-in': 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  completed: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  cancelled: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  'no-show': 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
};

const statusIcons = {
  pending: AlertCircle,
  confirmed: CheckCircle,
  'checked-in': CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle,
  'no-show': XCircle
};

export default function BookingCard({ booking, index }) {
  const StatusIcon = statusIcons[booking.status] || AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-3 xs:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg xs:rounded-xl flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm xs:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                {booking.studio?.name || 'Studio'}
              </h3>
              <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 truncate">
                Booking ID: {booking.bookingId || booking._id?.slice(-8)}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full border text-xs xs:text-sm font-medium ${statusColors[booking.status]} flex-shrink-0`}>
            <StatusIcon className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
            <span className="capitalize">{booking.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 mb-4">
          <div className="flex items-center gap-2 text-xs xs:text-sm">
            <Clock className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-gray-600 dark:text-gray-400">Time:</span>
              <span className="ml-1.5 font-medium text-gray-900 dark:text-white">
                {booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs xs:text-sm">
            <Calendar className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-gray-600 dark:text-gray-400">Date:</span>
              <span className="ml-1.5 font-medium text-gray-900 dark:text-white">
                {format(new Date(booking.date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs xs:text-sm">
            <Music className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <span className="ml-1.5 font-medium text-gray-900 dark:text-white capitalize truncate">
                {booking.sessionType?.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs xs:text-sm">
            <DollarSign className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-gray-600 dark:text-gray-400">Amount:</span>
              <span className="ml-1.5 font-medium text-gray-900 dark:text-white">
                ₹{booking.pricing?.totalAmount?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 xs:pt-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-500 flex-shrink-0" />
            <span className="text-xs xs:text-sm font-medium text-gray-900 dark:text-white">
              Customer Details
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-3 pl-6 xs:pl-7">
            <div className="flex items-center gap-2 text-xs">
              <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400 truncate">
                {booking.user?.name || 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400 truncate">
                {booking.user?.phone || 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs sm:col-span-2">
              <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400 truncate">
                {booking.user?.email || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {booking.sessionDetails?.participants && (
          <div className="mt-3 xs:mt-4 pt-3 xs:pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs xs:text-sm">
              <Users className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400">Participants:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {booking.sessionDetails.participants}
              </span>
            </div>
          </div>
        )}

        {booking.sessionDetails?.musicians && (
          <div className="mt-2 xs:mt-3">
            <div className="flex items-center gap-2 text-xs xs:text-sm">
              <Music className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400">Musicians:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {booking.sessionDetails.musicians}
              </span>
            </div>
          </div>
        )}

        {booking.sessionDetails?.specialRequirements && (
          <div className="mt-3 xs:mt-4 pt-3 xs:pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Special Requirements:</p>
            <p className="text-xs xs:text-sm text-gray-900 dark:text-white line-clamp-2">
              {booking.sessionDetails.specialRequirements}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}