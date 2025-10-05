import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  isPast
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';
import Button from '../common/Button';

export default function AdminCalendar({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const { dateRangeBookings, fetchBookingsByDateRange } = useAdminStore();

  useEffect(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    fetchBookingsByDateRange(monthStart, monthEnd);
  }, [currentMonth, fetchBookingsByDateRange]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBookingCount = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dateRangeBookings[dateStr]?.count || 0;
  };

  const getBookingColor = (date) => {
    const count = getBookingCount(date);
    
    if (isPast(date) && !isToday(date)) {
      return 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600';
    }
    
    if (count === 0) {
      return 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600';
    }
    
    if (count >= 10) {
      return 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300 border-red-200 dark:border-red-800';
    } else if (count >= 5) {
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    } else if (count >= 2) {
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    } else {
      return 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300 border-green-200 dark:border-green-800';
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDateClick = (date) => {
    if (!isPast(date) || isToday(date)) {
      onDateSelect(date);
    }
  };

  return (
    <div className="space-y-3 xs:space-y-4">
      <div className="flex items-center justify-between mb-3 xs:mb-4">
        <h3 className="text-base xs:text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        
        <div className="flex gap-1 xs:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="!p-1.5 xs:!p-2"
          >
            <ChevronLeft className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="!p-1.5 xs:!p-2"
          >
            <ChevronRight className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-700 rounded-lg xs:rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-600">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="py-2 xs:py-3 text-center text-[10px] xs:text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"
            >
              <span className="hidden xs:inline">{day}</span>
              <span className="xs:hidden">{day[0]}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const bookingCount = getBookingCount(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isCurrentDay = isToday(date);
            const isPastDate = isPast(date) && !isToday(date);
            const colorClass = getBookingColor(date);

            return (
              <motion.button
                key={index}
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={isPastDate}
                whileHover={!isPastDate ? { scale: 1.05 } : {}}
                whileTap={!isPastDate ? { scale: 0.95 } : {}}
                className={`
                  relative aspect-square border-r border-b border-gray-200 dark:border-gray-600
                  transition-all duration-200 ${colorClass}
                  ${isSelected ? 'ring-2 ring-inset ring-blue-500 dark:ring-blue-400 z-10' : ''}
                  ${isPastDate ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                  ${!isSameMonth(date, currentMonth) ? 'opacity-40' : ''}
                `}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-0.5 xs:p-1">
                  <div className={`
                    text-[10px] xs:text-xs md:text-sm font-medium mb-0.5 xs:mb-1
                    ${isCurrentDay ? 'w-5 h-5 xs:w-6 xs:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] xs:text-[10px]' : ''}
                  `}>
                    {format(date, 'd')}
                  </div>
                  
                  {bookingCount > 0 && (
                    <div className="text-[8px] xs:text-[9px] font-semibold">
                      {bookingCount}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 xs:gap-3 text-[9px] xs:text-[10px] md:text-xs">
        <div className="flex items-center gap-1 xs:gap-1.5">
          <div className="w-3 h-3 xs:w-4 xs:h-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Low (1-2)</span>
        </div>
        <div className="flex items-center gap-1 xs:gap-1.5">
          <div className="w-3 h-3 xs:w-4 xs:h-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Medium (2-5)</span>
        </div>
        <div className="flex items-center gap-1 xs:gap-1.5">
          <div className="w-3 h-3 xs:w-4 xs:h-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded" />
          <span className="text-gray-600 dark:text-gray-400">High (5-10)</span>
        </div>
        <div className="flex items-center gap-1 xs:gap-1.5">
          <div className="w-3 h-3 xs:w-4 xs:h-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Very High (10+)</span>
        </div>
      </div>
    </div>
  );
}