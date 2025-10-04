import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Clock, 
  MapPin, 
  Star, 
  ArrowRight,
  Music,
  Volume2,
  Headphones,
  Radio,
  CheckCircle,
  Eye,
  Calendar
} from 'lucide-react'

const studios = [
  {
    id: 'studio-a',
    name: 'Studio A - The Arena',
    size: 'large',
    capacity: 15,
    basePrice: 2500,
    description: 'Our flagship studio featuring premium acoustics, professional-grade equipment, and spacious recording area. Perfect for bands, orchestras, and large group sessions.',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop&auto=format'
    ],
    features: [
      'Professional acoustic treatment',
      'Climate controlled environment', 
      'Premium monitoring system',
      'Isolated control room',
      'Natural lighting',
      'Spacious live room'
    ],
    equipment: ['Drum Kit', 'Electric Guitar', 'Guitar Amp (Marshall)', 'Bass Amp (Ampeg)', 'Keyboard'],
    suitableFor: ['Band Practice', 'Live Recording', 'Video Production', 'Live Streaming'],
    rating: 4.9,
    reviews: 127,
    area: '400 sq ft',
    hours: '9 AM - 10 PM'
  },
  {
    id: 'studio-b',  
    name: 'Studio B - The Booth',
    size: 'medium',
    capacity: 8,
    basePrice: 1800,
    description: 'Perfect for smaller bands, duos, and solo artists. Features excellent acoustics and professional equipment in a cozy environment.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1519508234439-4f23643125c1?w=800&h=600&fit=crop&auto=format'
    ],
    features: [
      'Intimate recording space',
      'Professional monitors',
      'Vocal booth',
      'Digital mixing console', 
      'Comfortable seating area',
      'Ambient lighting'
    ],
    equipment: ['Drum Kit', 'Electric Guitar', 'Guitar Amp (Marshall)', 'Bass Guitar', 'Bass Amp'],
    suitableFor: ['Small Bands', 'Duos', 'Solo Recording', 'Karaoke'],
    rating: 4.8,
    reviews: 89,
    area: '250 sq ft', 
    hours: '10 AM - 10 PM'
  },
  {
    id: 'studio-c',
    name: 'Studio C - The Corner',
    size: 'small',
    capacity: 5,
    basePrice: 1200,
    description: 'Intimate space ideal for solo artists, acoustic sessions, and small group recordings. Features warm acoustics and essential equipment.',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&auto=format'
    ],
    features: [
      'Warm acoustic environment',
      'Perfect for acoustic sessions',
      'Professional microphones',
      'Compact mixing setup',
      'Comfortable atmosphere', 
      'Great for demos'
    ],
    equipment: ['Acoustic Guitar', 'Electric Guitar', 'Guitar Amp (Laney)', 'Keyboard'],
    suitableFor: ['Solo Artists', 'Acoustic Sessions', 'Karaoke', 'Demo Recording'],
    rating: 4.7,
    reviews: 64,
    area: '150 sq ft',
    hours: '9 AM - 9 PM'
  }
]

const sizeColors = {
  small: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300', 
  large: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
}

// Individual Studio Card Component
const StudioCard = ({ studio, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-800 rounded-2xl xs:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-gray-200 dark:border-gray-700 flex flex-col h-full"
    >
      {/* Studio Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={studio.image}
          alt={studio.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Overlay with studio type */}
        <div className="absolute top-2 xs:top-3 md:top-4 left-2 xs:left-3 md:left-4">
          <span className={`px-2 xs:px-2.5 md:px-3 py-0.5 xs:py-1 rounded-full text-[10px] xs:text-xs font-medium capitalize ${sizeColors[studio.size]}`}>
            {studio.size} Studio
          </span>
        </div>

        {/* Rating overlay */}
        <div className="absolute top-2 xs:top-3 md:top-4 right-2 xs:right-3 md:right-4 bg-black/50 backdrop-blur-sm rounded-full px-2 xs:px-2.5 md:px-3 py-0.5 xs:py-1">
          <div className="flex items-center gap-1 text-white text-[10px] xs:text-xs md:text-sm">
            <Star className="w-2.5 h-2.5 xs:w-3 xs:h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{studio.rating}</span>
            <span className="text-white/70">({studio.reviews})</span>
          </div>
        </div>
      </div>

      {/* Studio Details */}
      <div className="p-3 xs:p-4 md:p-5 lg:p-6 space-y-3 xs:space-y-3.5 md:space-y-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="space-y-1.5 xs:space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm xs:text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {studio.name}
            </h3>
            <div className="text-right flex-shrink-0">
              <div className="text-base xs:text-lg md:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                ₹{studio.basePrice.toLocaleString()}
              </div>
              <div className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400">per hour</div>
            </div>
          </div>

          <p className="text-[11px] xs:text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
            {studio.description}
          </p>
        </div>

        {/* Studio Info Grid */}
        <div className="grid grid-cols-2 gap-2 xs:gap-2.5 md:gap-3 text-[10px] xs:text-xs md:text-sm">
          <div className="flex items-center gap-1 xs:gap-1.5 md:gap-2 text-gray-600 dark:text-gray-400">
            <Users className="w-3 h-3 xs:w-3.5 xs:h-3.5 md:w-4 md:h-4 text-blue-500 flex-shrink-0" />
            <span className="truncate">Up to {studio.capacity}</span>
          </div>
          <div className="flex items-center gap-1 xs:gap-1.5 md:gap-2 text-gray-600 dark:text-gray-400">
            <MapPin className="w-3 h-3 xs:w-3.5 xs:h-3.5 md:w-4 md:h-4 text-blue-500 flex-shrink-0" />
            <span className="truncate">{studio.area}</span>
          </div>
          <div className="flex items-center gap-1 xs:gap-1.5 md:gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-3 h-3 xs:w-3.5 xs:h-3.5 md:w-4 md:h-4 text-blue-500 flex-shrink-0" />
            <span className="truncate">{studio.hours}</span>
          </div>
          <div className="flex items-center gap-1 xs:gap-1.5 md:gap-2 text-gray-600 dark:text-gray-400">
            <Volume2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 md:w-4 md:h-4 text-blue-500 flex-shrink-0" />
            <span className="truncate">Pro Audio</span>
          </div>
        </div>

        {/* Key Features */}
        <div className="space-y-1.5 xs:space-y-2">
          <h4 className="text-[11px] xs:text-xs md:text-sm font-semibold text-gray-900 dark:text-white">Key Features</h4>
          <div className="flex flex-wrap gap-1 xs:gap-1.5">
            {studio.features.slice(0, 3).map((feature, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 xs:gap-1 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-[9px] xs:text-[10px] md:text-xs font-medium"
              >
                <CheckCircle className="w-2 h-2 xs:w-2.5 xs:h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                <span className="truncate">{feature}</span>
              </span>
            ))}
            {studio.features.length > 3 && (
              <span className="px-1.5 xs:px-2 py-0.5 xs:py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-[9px] xs:text-[10px] md:text-xs">
                +{studio.features.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Equipment Preview */}
        <div className="space-y-1.5 xs:space-y-2">
          <h4 className="text-[11px] xs:text-xs md:text-sm font-semibold text-gray-900 dark:text-white">Available Equipment</h4>
          <div className="flex flex-wrap gap-1 xs:gap-1.5">
            {studio.equipment.slice(0, 4).map((item, idx) => (
              <span
                key={idx}
                className="px-1.5 xs:px-2 py-0.5 xs:py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-[9px] xs:text-[10px] md:text-xs font-medium truncate"
              >
                {item}
              </span>
            ))}
            {studio.equipment.length > 4 && (
              <span className="px-1.5 xs:px-2 py-0.5 xs:py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-[9px] xs:text-[10px] md:text-xs">
                +{studio.equipment.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Suitable For */}
        <div className="space-y-1.5 xs:space-y-2">
          <h4 className="text-[11px] xs:text-xs md:text-sm font-semibold text-gray-900 dark:text-white">Perfect For</h4>
          <div className="flex flex-wrap gap-1 xs:gap-1.5">
            {studio.suitableFor.map((type, idx) => (
              <span
                key={idx}
                className="px-1.5 xs:px-2 py-0.5 xs:py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-[9px] xs:text-[10px] md:text-xs font-medium"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons - Fixed height container */}
        <div className="flex gap-2 xs:gap-2.5 md:gap-3 pt-2 xs:pt-3 mt-auto">
          <Link to="/booking" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 xs:px-4 py-2 xs:py-2.5 md:py-3 rounded-lg xs:rounded-xl font-semibold flex items-center justify-center gap-1.5 xs:gap-2 transition-colors text-[11px] xs:text-xs md:text-sm lg:text-base"
            >
              <Music className="w-3 h-3 xs:w-3.5 xs:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Book Now</span>
              <ArrowRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            </motion.button>
          </Link>
          
          <Link to={`/studios/${studio.id}`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-full px-3 xs:px-3.5 md:px-4 py-2 xs:py-2.5 md:py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg xs:rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5" />
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// Main StudioShowcase Component
export default function StudioShowcase() {
  return (
    <section id="studios" className="py-8 xs:py-10 md:py-12 lg:py-16 xl:py-20 bg-gray-50 dark:bg-gray-900/50 px-3 xs:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 xs:mb-10 md:mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-1.5 xs:py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] xs:text-xs md:text-sm font-medium mb-3 xs:mb-4">
            <Music className="w-3 h-3 xs:w-3.5 xs:h-3.5 md:w-4 md:h-4" />
            Our Studios
          </div>
          
          <h2 className="text-xl xs:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-3 xs:mb-4 md:mb-6 leading-tight">
            Choose Your Perfect
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Creative Space
            </span>
          </h2>
          
          <p className="text-xs xs:text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            From intimate solo sessions to full band recordings, our three uniquely designed studios 
            offer professional-grade equipment and perfect acoustics for every musical vision.
          </p>
        </motion.div>

        {/* Studios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 md:gap-6 lg:gap-8">
          {studios.map((studio, index) => (
            <StudioCard key={studio.id} studio={studio} index={index} />
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-8 xs:mt-10 md:mt-12 lg:mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl xs:rounded-2xl p-4 xs:p-6 md:p-8 text-white">
            <h3 className="text-base xs:text-lg md:text-xl lg:text-2xl font-bold mb-2 xs:mb-3 md:mb-4">
              Not sure which studio is right for you?
            </h3>
            <p className="text-xs xs:text-sm md:text-base text-blue-100 mb-4 xs:mb-5 md:mb-6 max-w-2xl mx-auto leading-relaxed">
              Our team can help you choose the perfect studio based on your project needs, 
              group size, and musical style.
            </p>
            
            <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 md:gap-4 justify-center max-w-lg mx-auto">
              <Link to="/calendar" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-white text-blue-600 px-4 xs:px-6 md:px-8 py-2.5 xs:py-3 rounded-lg xs:rounded-xl font-semibold flex items-center gap-1.5 xs:gap-2 hover:shadow-lg transition-shadow justify-center text-xs xs:text-sm md:text-base"
                >
                  <Calendar className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">View Availability</span>
                </motion.button>
              </Link>
              
              <Link to="/contact" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full border-2 border-white text-white px-4 xs:px-6 md:px-8 py-2.5 xs:py-3 rounded-lg xs:rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center gap-1.5 xs:gap-2 justify-center text-xs xs:text-sm md:text-base"
                >
                  <Headphones className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">Contact Us</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}