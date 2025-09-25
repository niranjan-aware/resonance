import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Star, Quote, ChevronLeft, ChevronRight, Play, Music } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Arjun Mehta',
    role: 'Lead Vocalist',
    band: 'Mumbai Vibes',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "Resonance Studio A is absolutely incredible! The acoustics are perfect, and the equipment quality is top-notch. Our band recorded our debut album here, and the sound engineers were phenomenal. The atmosphere really helps you get into the creative flow.",
    sessionType: 'Band Recording',
    location: 'Pune',
    highlight: 'Perfect acoustics and professional equipment'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Solo Artist',
    band: 'Independent',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "I've been using Studio C for my acoustic sessions, and it's been a game-changer. The intimate setting and warm sound make every recording feel special. The booking process is so smooth, and the staff is incredibly supportive.",
    sessionType: 'Solo Acoustic',
    location: 'Pune',
    highlight: 'Intimate setting perfect for acoustic recordings'
  },
  {
    id: 3,
    name: 'Rajesh Kumar',
    role: 'Music Producer',
    band: 'Sound Factory Studios',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "As a producer, I've worked in studios across India, but Resonance stands out for its professional setup and attention to detail. Studio B has become my go-to for mixing and mastering. The sound isolation is exceptional!",
    sessionType: 'Production & Mixing',
    location: 'Mumbai',
    highlight: 'Exceptional sound isolation and mixing capabilities'
  },
  {
    id: 4,
    name: 'Sneha Patel',
    role: 'Drummer',
    band: 'Rhythm Section',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "The drum setup at Studio A is absolutely phenomenal! The Pearl kit sounds amazing, and the room acoustics make every beat feel alive. Our live sessions here always turn out incredible. Highly recommend for any band!",
    sessionType: 'Live Band Session',
    location: 'Pune',
    highlight: 'Amazing drum setup and live room acoustics'
  },
  {
    id: 5,
    name: 'Vikram Singh',
    role: 'Content Creator',
    band: 'YouTube Channel',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "I use Resonance for my music covers and original compositions. The video recording setup is professional, and the final output always exceeds expectations. The team understands content creators' needs perfectly.",
    sessionType: 'Video Recording',
    location: 'Pune',
    highlight: 'Professional video recording capabilities'
  },
  {
    id: 6,
    name: 'Ananya Desai',
    role: 'Classical Vocalist',
    band: 'Solo Artist',
    image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: "For classical music recording, the acoustics need to be perfect, and Studio C delivers exactly that. The natural reverb and clarity I get here is unmatched. It's my preferred choice for all my classical recordings.",
    sessionType: 'Classical Recording',
    location: 'Pune',
    highlight: 'Perfect acoustics for classical music'
  }
]

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  // Auto-play functionality
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
    <section className="py-20 bg-gradient-to-br from-light-surface via-light-bg to-light-surface dark:from-dark-surface dark:via-dark-bg dark:to-dark-surface">
      <div className="max-width-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full mb-6">
            <Quote className="w-5 h-5 text-light-primary dark:text-dark-primary" />
            <span className="text-light-text dark:text-dark-text font-medium">Testimonials</span>
          </div>
          
          <h2 className="text-display-md font-bold text-light-text dark:text-dark-text mb-6">
            What Musicians Say
            <br />
            <span className="bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent bg-clip-text text-transparent">
              About Resonance
            </span>
          </h2>
          
          <p className="text-lg text-light-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">
            Don't just take our word for it. Here's what musicians from across India say about their experience at Resonance Studio.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Main Testimonial Card */}
          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="glass-strong rounded-3xl p-8 md:p-12 backdrop-blur-xl border border-light-border dark:border-dark-border shadow-glow"
              >
                {/* Quote Icon */}
                <div className="absolute -top-6 left-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-full flex items-center justify-center shadow-lg">
                    <Quote className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Session Type Badge */}
                <div className="flex justify-end mb-6">
                  <span className="px-4 py-2 bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary rounded-full text-sm font-medium">
                    {currentTestimonial.sessionType}
                  </span>
                </div>

                {/* Testimonial Text */}
                <motion.blockquote
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl md:text-2xl text-light-text dark:text-dark-text leading-relaxed mb-8 italic"
                >
                  "{currentTestimonial.text}"
                </motion.blockquote>

                {/* Highlight */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8 p-4 bg-light-accent/10 dark:bg-dark-accent/10 rounded-xl border-l-4 border-light-accent dark:border-dark-accent"
                >
                  <p className="text-light-accent dark:text-dark-accent font-medium">
                    💡 {currentTestimonial.highlight}
                  </p>
                </motion.div>

                {/* Author Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-3 border-light-primary dark:border-dark-primary shadow-lg"
                    />
                    <div>
                      <h4 className="text-xl font-bold text-light-text dark:text-dark-text">
                        {currentTestimonial.name}
                      </h4>
                      <p className="text-light-text-muted dark:text-dark-text-muted">
                        {currentTestimonial.role} • {currentTestimonial.band}
                      </p>
                      <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                        📍 {currentTestimonial.location}
                      </p>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 glass-strong rounded-full flex items-center justify-center text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition-colors backdrop-blur-xl border border-light-border dark:border-dark-border"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 glass-strong rounded-full flex items-center justify-center text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition-colors backdrop-blur-xl border border-light-border dark:border-dark-border"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Thumbnail Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-4 mt-12 overflow-x-auto pb-4"
          >
            {testimonials.map((testimonial, index) => (
              <motion.button
                key={testimonial.id}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 relative group ${
                  index === currentIndex ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                } transition-opacity`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`w-16 h-16 rounded-full overflow-hidden border-3 transition-colors ${
                  index === currentIndex 
                    ? 'border-light-primary dark:border-dark-primary' 
                    : 'border-light-border dark:border-dark-border'
                }`}>
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Active Indicator */}
                {index === currentIndex && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-light-primary dark:bg-dark-primary rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Progress Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center gap-2 mt-8"
          >
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="relative"
              >
                <div className={`w-12 h-1 rounded-full transition-colors ${
                  index === currentIndex 
                    ? 'bg-light-primary dark:bg-dark-primary' 
                    : 'bg-light-border dark:bg-dark-border'
                }`} />
                
                {/* Auto-play progress */}
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

          {/* Auto-play Control */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-6"
          >
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-light-text-muted dark:text-dark-text-muted hover:text-light-primary dark:hover:text-dark-primary transition-colors"
            >
              {isAutoPlaying ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Auto-playing
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start auto-play
                </>
              )}
            </button>
          </motion.div>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto mt-16"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-light-primary dark:text-dark-primary mb-2">
              4.9
            </div>
            <div className="text-light-text-muted dark:text-dark-text-muted">
              Average Rating
            </div>
            <div className="flex justify-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-light-primary dark:text-dark-primary mb-2">
              500+
            </div>
            <div className="text-light-text-muted dark:text-dark-text-muted">
              Happy Musicians
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-light-primary dark:text-dark-primary mb-2">
              1000+
            </div>
            <div className="text-light-text-muted dark:text-dark-text-muted">
              Successful Sessions
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}