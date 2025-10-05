import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';
import { studioAPI } from '../../services/booking';
import Button from '../common/Button';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked-in', label: 'Checked In' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' }
];

const sessionTypeOptions = [
  { value: '', label: 'All Session Types' },
  { value: 'karaoke', label: 'Karaoke' },
  { value: 'live-musicians', label: 'Live with Musicians' },
  { value: 'audio-recording', label: 'Audio Recording' },
  { value: 'video-recording', label: 'Video Recording' },
  { value: 'fb-live', label: 'Live Streaming' }
];

const sortOptions = [
  { value: 'timeSlot.startTime', label: 'Time (Earliest First)', order: 'asc' },
  { value: 'timeSlot.startTime', label: 'Time (Latest First)', order: 'desc' },
  { value: 'createdAt', label: 'Booking Date (Newest)', order: 'desc' },
  { value: 'createdAt', label: 'Booking Date (Oldest)', order: 'asc' },
  { value: 'pricing.totalAmount', label: 'Amount (High to Low)', order: 'desc' },
  { value: 'pricing.totalAmount', label: 'Amount (Low to High)', order: 'asc' }
];

export default function FiltersPanel() {
  const { filters, updateFilters, clearFilters } = useAdminStore();
  const [studios, setStudios] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        const response = await studioAPI.getStudios();
        setStudios(response.studios || []);
      } catch (error) {
        console.error('Failed to fetch studios:', error);
      }
    };
    fetchStudios();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (value) => {
    const [sortBy, order] = value.split('|');
    setLocalFilters(prev => ({ ...prev, sortBy, order }));
  };

  const handleApplyFilters = () => {
    updateFilters(localFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
    setLocalFilters({
      status: '',
      studioId: '',
      sessionType: '',
      sortBy: 'timeSlot.startTime',
      order: 'asc'
    });
  };

  const hasActiveFilters = localFilters.status || localFilters.studioId || localFilters.sessionType;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3 xs:space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4">
        <div>
          <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 xs:mb-2">
            Status
          </label>
          <select
            value={localFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 xs:px-4 py-2 xs:py-2.5 text-xs xs:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 xs:mb-2">
            Studio
          </label>
          <select
            value={localFilters.studioId}
            onChange={(e) => handleFilterChange('studioId', e.target.value)}
            className="w-full px-3 xs:px-4 py-2 xs:py-2.5 text-xs xs:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="">All Studios</option>
            {studios.map(studio => (
              <option key={studio._id} value={studio._id}>
                {studio.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 xs:mb-2">
            Session Type
          </label>
          <select
            value={localFilters.sessionType}
            onChange={(e) => handleFilterChange('sessionType', e.target.value)}
            className="w-full px-3 xs:px-4 py-2 xs:py-2.5 text-xs xs:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            {sessionTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 xs:mb-2">
            Sort By
          </label>
          <select
            value={`${localFilters.sortBy}|${localFilters.order}`}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-3 xs:px-4 py-2 xs:py-2.5 text-xs xs:text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            {sortOptions.map((option, index) => (
              <option key={index} value={`${option.value}|${option.order}`}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
        <Button
          onClick={handleApplyFilters}
          className="!px-4 xs:!px-6 !py-2 xs:!py-2.5 !text-xs xs:!text-sm"
        >
          <Filter className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1.5 xs:mr-2" />
          Apply Filters
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="!px-4 xs:!px-6 !py-2 xs:!py-2.5 !text-xs xs:!text-sm"
          >
            <X className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1.5 xs:mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {localFilters.status && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
              Status: {statusOptions.find(o => o.value === localFilters.status)?.label}
              <button
                onClick={() => handleFilterChange('status', '')}
                className="hover:text-blue-900 dark:hover:text-blue-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {localFilters.studioId && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
              Studio: {studios.find(s => s._id === localFilters.studioId)?.name}
              <button
                onClick={() => handleFilterChange('studioId', '')}
                className="hover:text-green-900 dark:hover:text-green-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {localFilters.sessionType && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
              Type: {sessionTypeOptions.find(o => o.value === localFilters.sessionType)?.label}
              <button
                onClick={() => handleFilterChange('sessionType', '')}
                className="hover:text-purple-900 dark:hover:text-purple-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}