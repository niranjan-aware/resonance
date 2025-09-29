import { motion } from 'framer-motion'
import { CheckCircle, Users, MapPin, Star, Clock, Wifi, Car, Snowflake } from 'lucide-react'

const iconMap = {
  'Professional acoustic treatment': '🔊',
  'Climate controlled environment': <Snowflake className="w-4 h-4" />,
  'Premium monitoring system': '🎧',
  'Isolated control room': '🏠',
  'Natural lighting': '💡',
  'Spacious live room': '🏛️',
  'Intimate recording space': '🏠',
  'Professional monitors': '🔊',
  'Vocal booth': '🎤',
  'Digital mixing console': '🎛️',
  'Comfortable seating area': '🪑',
  'Ambient lighting': '✨',
  'Warm acoustic environment': '🔥',
  'Perfect for acoustic sessions': '🎸',
  'Professional microphones': '🎤',
  'Compact mixing setup': '🎛️',
  'Comfortable atmosphere': '😌',
  'Great for demos': '🎵'
}

const sizeColors = {
  small: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
  large: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
}

export default function StudioSelector({ 
  studios, 
  selectedStudio, 
  onStudioSelect,
  sessionType 
}) {
  if (!studios || studios.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-light-surface-variant dark:bg-dark-surface-variant rounded-full flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-10 h-10 text-light-text-muted dark:text-dark-text-muted" />
        </div>
        <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
          No Studios Available
        </h3>
        <p className="text-light-text-muted dark:text-dark-text-muted">
          No studios are available for the selected session type. Please try a different option.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
          Choose Your Studio
        </h2>
        <p className="text-light-text-muted dark:text-dark-text-muted">
          Select the perfect studio for your {sessionType?.replace('-', ' ')} session
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {studios.map((studio) => (
          <motion.div
            key={studio._id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStudioSelect(studio)}
            className={`
              relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300
              ${selectedStudio?._id === studio._id
                ? 'border-light-primary dark:border-dark-primary shadow-lg'
                : 'border-light-border dark:border-dark-border hover:border-light-primary/50 dark:hover:border-dark-primary/50'
              }
            `}
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={studio.primaryImage?.url || studio.images?.[0]?.url || 'https://via.placeholder.com/800x600?text=Studio'}
                alt={studio.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${sizeColors[studio.size]}`}>
                  {studio.size}
                </span>
              </div>

              {selectedStudio?._id === studio._id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-8 h-8 bg-light-primary dark:bg-dark-primary rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </div>

            <div className="p-6 bg-light-surface dark:bg-dark-surface">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-1">
                    {studio.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-light-text-muted dark:text-dark-text-muted">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>Up to {studio.capacity} people</span>
                    </div>
                    {studio.ratings?.count > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{studio.ratings.average}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-light-primary dark:text-dark-primary">
                    ₹{studio.pricing?.basePrice || 0}
                  </div>
                  <div className="text-sm text-light-text-muted dark:text-dark-text-muted">
                    per hour
                  </div>
                </div>
              </div>

              <p className="text-light-text-muted dark:text-dark-text-muted text-sm mb-4 line-clamp-2">
                {studio.description}
              </p>

              <div className="space-y-3">
                {studio.features && studio.features.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-light-text dark:text-dark-text mb-2">
                      Key Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {studio.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-light-surface-variant dark:bg-dark-surface-variant rounded-full text-xs text-light-text dark:text-dark-text"
                        >
                          {iconMap[feature] || '✨'}
                          <span>{feature}</span>
                        </span>
                      ))}
                      {studio.features.length > 3 && (
                        <span className="px-3 py-1 bg-light-surface-variant dark:bg-dark-surface-variant rounded-full text-xs text-light-text-muted dark:text-dark-text-muted">
                          +{studio.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-light-text-muted dark:text-dark-text-muted flex-wrap">
                  {studio.availability?.startTime && studio.availability?.endTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{studio.availability.startTime} - {studio.availability.endTime}</span>
                    </div>
                  )}
                  
                  {studio.specifications?.wifi && (
                    <div className="flex items-center gap-1">
                      <Wifi className="w-4 h-4" />
                      <span>WiFi</span>
                    </div>
                  )}
                  
                  {studio.specifications?.parking && (
                    <div className="flex items-center gap-1">
                      <Car className="w-4 h-4" />
                      <span>Parking</span>
                    </div>
                  )}
                  
                  {studio.specifications?.airConditioning && (
                    <div className="flex items-center gap-1">
                      <Snowflake className="w-4 h-4" />
                      <span>AC</span>
                    </div>
                  )}
                </div>

                {studio.equipment && studio.equipment.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-light-text dark:text-dark-text mb-2">
                      Available Equipment
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {studio.equipment.slice(0, 4).map((item, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary rounded text-xs font-medium"
                        >
                          {item.name}
                        </span>
                      ))}
                      {studio.equipment.length > 4 && (
                        <span className="px-2 py-1 bg-light-surface-variant dark:bg-dark-surface-variant text-light-text-muted dark:text-dark-text-muted rounded text-xs">
                          +{studio.equipment.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <motion.div
                className={`
                  mt-4 p-3 rounded-lg border transition-all duration-300
                  ${selectedStudio?._id === studio._id
                    ? 'bg-light-primary/5 dark:bg-dark-primary/5 border-light-primary dark:border-dark-primary'
                    : 'border-transparent'
                  }
                `}
              >
                {selectedStudio?._id === studio._id ? (
                  <div className="flex items-center justify-center gap-2 text-light-primary dark:text-dark-primary font-medium">
                    <CheckCircle className="w-5 h-5" />
                    <span>Selected Studio</span>
                  </div>
                ) : (
                  <div className="text-center text-light-text-muted dark:text-dark-text-muted">
                    Click to select this studio
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedStudio && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl"
        >
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
            Selected: {selectedStudio.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-light-text-muted dark:text-dark-text-muted">Capacity:</span>
              <span className="ml-2 font-medium text-light-text dark:text-dark-text">
                {selectedStudio.capacity} people
              </span>
            </div>
            {selectedStudio.specifications?.area && (
              <div>
                <span className="text-light-text-muted dark:text-dark-text-muted">Area:</span>
                <span className="ml-2 font-medium text-light-text dark:text-dark-text">
                  {selectedStudio.specifications.area}
                </span>
              </div>
            )}
            <div>
              <span className="text-light-text-muted dark:text-dark-text-muted">Base Price:</span>
              <span className="ml-2 font-medium text-light-primary dark:text-dark-primary">
                ₹{selectedStudio.pricing?.basePrice || 0}/hour
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}