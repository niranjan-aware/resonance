import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Star, Quote, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Vikram Singh',
    role: 'Content Creator',
    band: 'YouTube Channel',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "I use Resonance for my music covers and original compositions. The video recording setup is professional, and the final output always exceeds expectations.",
    sessionType: 'Video Recording',
    location: 'Pune'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Solo Artist',
    band: 'Independent',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "I've been using Studio C for my acoustic sessions, and it's been a game-changer. The intimate setting and warm sound make every recording feel special.",
    sessionType: 'Solo Acoustic',
    location: 'Pune'
  },
  {
    id: 3,
    name: 'Rajesh Kumar',
    role: 'Music Producer',
    band: 'Sound Factory Studios',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "As a producer, I've worked in studios across India, but Resonance stands out for its professional setup and attention to detail. The sound isolation is exceptional!",
    sessionType: 'Production & Mixing',
    location: 'Mumbai'
  },
  {
    id: 4,
    name: 'Sneha Patel',
    role: 'Drummer',
    band: 'Rhythm Section',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "The drum setup at Studio A is absolutely phenomenal! The Pearl kit sounds amazing, and the room acoustics make every beat feel alive.",
    sessionType: 'Live Band Session',
    location: 'Pune'
  },
  {
    id: 5,
    name: 'Arjun Mehta',
    role: 'Lead Vocalist',
    band: 'Mumbai Vibes',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "Resonance Studio A is absolutely incredible! The acoustics are perfect, and the equipment quality is top-notch. Our band recorded our debut album here.",
    sessionType: 'Band Recording',
    location: 'Pune'
  },
  {
    id: 6,
    name: 'Ananya Desai',
    role: 'Classical Vocalist',
    band: 'Solo Artist',
    image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "For classical music recording, the acoustics need to be perfect, and Studio C delivers exactly that. The natural reverb and clarity is unmatched.",
    sessionType: 'Classical Recording',
    location: 'Pune'
  }
]

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  useEffect(() => {
    if (!isAutoPlaying || !inView) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, inView])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-8 md:py-12 tablet:py-16 lg:py-20 bg-gradient-to-br from-light-surface via-light-bg to-light-surface dark:from-dark-surface dark:via-dark-bg dark:to-dark-surface">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-10 tablet:mb-12"
        >
          <div className="inline-flex items-center gap-2 glass px-3 md:px-4 tablet:px-6 py-1.5 md:py-2 tablet:py-3 rounded-full mb-3 md:mb-4 tablet:mb-6">
            <Quote className="w-4 md:w-5 text-light-primary dark:text-dark-primary" />
            <span className="text-light-text dark:text-dark-text font-medium text-sm md:text-base">Testimonials</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl tablet:text-4xl lg:text-5xl font-bold text-light-text dark:text-dark-text mb-3 md:mb-4">
            What Musicians Say
            <br />
            <span className="bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent bg-clip-text text-transparent">
              About Resonance
            </span>
          </h2>
          
          <p className="text-sm md:text-base tablet:text-lg text-light-text-muted dark:text-dark-text-muted max-w-2xl mx-auto px-2">
            Musicians from across India share their experience at Resonance Studio
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="glass-strong rounded-2xl md:rounded-3xl p-4 md:p-6 tablet:p-8 backdrop-blur-xl border border-light-border dark:border-dark-border shadow-glow"
            >
              {/* Mobile Compact Layout */}
              <div className="flex flex-col gap-4">
                {/* Header with Image and Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-light-primary dark:border-dark-primary flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base md:text-lg font-bold text-light-text dark:text-dark-text truncate">
                        {currentTestimonial.name}
                      </h4>
                      <p className="text-xs md:text-sm text-light-text-muted dark:text-dark-text-muted truncate">
                        {currentTestimonial.role}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-light-text-muted dark:text-dark-text-muted flex-shrink-0" />
                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted truncate">
                          {currentTestimonial.location}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 md:px-3 py-1 md:py-1.5 bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">
                    {currentTestimonial.sessionType}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-sm md:text-base tablet:text-lg text-light-text dark:text-dark-text leading-relaxed">
                  "{currentTestimonial.text}"
                </blockquote>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              prevTestimonial()
            }}
            type="button"
            className="absolute left-0 md:left-2 top-1/2 transform -translate-y-1/2 -translate-x-3 md:translate-x-0 w-8 h-8 md:w-10 md:h-10 glass-strong rounded-full flex items-center justify-center text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition-colors backdrop-blur-xl border border-light-border dark:border-dark-border z-10 cursor-pointer"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              nextTestimonial()
            }}
            type="button"
            className="absolute right-0 md:right-2 top-1/2 transform -translate-y-1/2 translate-x-3 md:translate-x-0 w-8 h-8 md:w-10 md:h-10 glass-strong rounded-full flex items-center justify-center text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition-colors backdrop-blur-xl border border-light-border dark:border-dark-border z-10 cursor-pointer"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </motion.div>

        {/* Compact Progress Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center gap-1.5 md:gap-2 mt-6 md:mt-8"
        >
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative group"
            >
              <div className={`w-8 md:w-10 h-1 md:h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-light-primary dark:bg-dark-primary' 
                  : 'bg-light-border dark:bg-dark-border group-hover:bg-light-primary/50 dark:group-hover:bg-dark-primary/50'
              }`} />
              
              {index === currentIndex && isAutoPlaying && (
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="absolute top-0 left-0 h-full bg-light-accent dark:bg-dark-accent rounded-full"
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-3 md:gap-6 max-w-3xl mx-auto mt-8 md:mt-12"
        >
          <div className="text-center glass rounded-xl md:rounded-2xl p-3 md:p-4">
            <div className="text-2xl md:text-3xl tablet:text-4xl font-bold text-light-primary dark:text-dark-primary mb-1">
              4.9
            </div>
            <div className="text-xs md:text-sm text-light-text-muted dark:text-dark-text-muted">
              Rating
            </div>
          </div>
          
          <div className="text-center glass rounded-xl md:rounded-2xl p-3 md:p-4">
            <div className="text-2xl md:text-3xl tablet:text-4xl font-bold text-light-primary dark:text-dark-primary mb-1">
              500+
            </div>
            <div className="text-xs md:text-sm text-light-text-muted dark:text-dark-text-muted">
              Musicians
            </div>
          </div>
          
          <div className="text-center glass rounded-xl md:rounded-2xl p-3 md:p-4">
            <div className="text-2xl md:text-3xl tablet:text-4xl font-bold text-light-primary dark:text-dark-primary mb-1">
              1000+
            </div>
            <div className="text-xs md:text-sm text-light-text-muted dark:text-dark-text-muted">
              Sessions
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}