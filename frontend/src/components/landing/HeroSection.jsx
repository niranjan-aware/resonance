import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Play, ArrowRight, Music, Star, Users, Calendar } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import Button from '../common/Button'

export default function HeroSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 z-10" />
        <img
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&h=1080&fit=crop"
          alt="Recording Studio"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute top-1/4 left-1/4 w-16 h-16 bg-light-primary/20 dark:bg-dark-primary/20 rounded-full backdrop-blur-sm border border-white/10"
        />
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/3 right-1/3 w-24 h-24 bg-light-accent/20 dark:bg-dark-accent/20 rounded-full backdrop-blur-sm border border-white/10"
        />
        <motion.div
          animate={{ 
            y: [0, -25, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/3 left-1/5 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm border border-white/20"
        />
      </div>

      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="relative z-30 max-width-container text-center"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full mb-8 text-white/90 backdrop-blur-xl border border-white/20"
        >
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">4.9 Rating</span>
          </div>
          <div className="w-1 h-1 bg-white/40 rounded-full" />
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">500+ Musicians</span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Create Music in
          <br />
          <span className="bg-gradient-to-r from-light-primary via-light-accent to-light-primary dark:from-dark-primary dark:via-dark-accent dark:to-dark-primary bg-clip-text text-transparent animate-glow">
            Premium Studios
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Experience world-class recording facilities with professional equipment, 
          perfect acoustics, and seamless booking on Sinhgad Road, Pune.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <Link to="/booking">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
              <button className="relative bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 hover:shadow-glow transition-all duration-300">
                <Calendar className="w-6 h-6" />
                Book Your Session
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass-strong backdrop-blur-xl border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 hover:bg-white/10 transition-all duration-300"
            onClick={() => {
              const video = document.getElementById('studio-tour-video')
              if (video) video.play()
            }}
          >
            <Play className="w-6 h-6" />
            Virtual Studio Tour
          </motion.button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          <div className="glass-strong backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">3</div>
            <div className="text-white/70">Premium Studios</div>
          </div>
          <div className="glass-strong backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">24/7</div>
            <div className="text-white/70">Online Booking</div>
          </div>
          <div className="glass-strong backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">₹1200</div>
            <div className="text-white/70">Starting From</div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Hidden Video Element for Virtual Tour */}
      <video
        id="studio-tour-video"
        className="hidden"
        controls
        poster="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop"
      >
        <source src="/videos/studio-tour.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Ambient Music Visualization */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-light-primary to-transparent opacity-30">
        <motion.div
          animate={{ 
            scaleX: [1, 1.2, 0.8, 1.5, 1],
            opacity: [0.3, 0.6, 0.4, 0.8, 0.3]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="h-full bg-gradient-to-r from-light-primary to-light-accent"
        />
      </div>
    </section>
  )
}