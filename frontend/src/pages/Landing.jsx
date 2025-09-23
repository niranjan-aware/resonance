import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Music, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react'
import HeroSection from '../components/landing/HeroSection'
import StudioShowcase from '../components/landing/StudioShowcase'
import TestimonialCarousel from '../components/landing/TestimonialCarousel'
import ContactSection from '../components/landing/ContactSection'

const stats = [
  { number: '500+', label: 'Happy Musicians', icon: Users },
  { number: '3', label: 'Premium Studios', icon: Music },
  { number: '4.9', label: 'Average Rating', icon: Star },
  { number: '24/7', label: 'Support Available', icon: Clock }
]

const features = [
  {
    title: 'Professional Equipment',
    description: 'State-of-the-art recording equipment and instruments',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop'
  },
  {
    title: 'Acoustic Treatment',
    description: 'Premium soundproofing and acoustic design',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
  },
  {
    title: 'Flexible Booking',
    description: 'Easy online booking with instant confirmation',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop'
  }
]

const sessionTypes = [
  { 
    name: 'Band Practice', 
    icon: '🎸', 
    price: 'From ₹2,000/hr',
    features: ['Full drum kit', 'Amps & guitars', 'Mixing console']
  },
  { 
    name: 'Solo Recording', 
    icon: '🎤', 
    price: 'From ₹1,500/hr',
    features: ['Studio monitors', 'Audio interface', 'Professional mics']
  },
  { 
    name: 'Live Streaming', 
    icon: '📺', 
    price: 'From ₹2,500/hr',
    features: ['Multi-camera setup', 'Live streaming tools', 'Professional lighting']
  },
  { 
    name: 'Karaoke Party', 
    icon: '🎉', 
    price: 'From ₹1,200/hr',
    features: ['Party atmosphere', 'Group sessions', 'Refreshments available']
  }
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      <section className="py-20 bg-light-surface dark:bg-dark-surface">
        <div className="max-width-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-display-md font-bold text-light-text dark:text-dark-text mb-6">
              Why Choose Resonance?
            </h2>
            <p className="text-lg text-light-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">
              Experience music creation in our world-class studios with professional equipment and perfect acoustics
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass rounded-2xl p-8 text-center group hover:scale-105 transition-all duration-300"
              >
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-light-primary dark:text-dark-primary group-hover:scale-110 transition-transform" />
                <div className="text-4xl font-bold text-light-text dark:text-dark-text mb-2">
                  {stat.number}
                </div>
                <div className="text-light-text-muted dark:text-dark-text-muted">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass rounded-2xl overflow-hidden group hover:scale-105 transition-all duration-300"
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-light-text-muted dark:text-dark-text-muted">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <StudioShowcase />

      <section className="py-20 bg-light-bg dark:bg-dark-bg">
        <div className="max-width-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-display-md font-bold text-light-text dark:text-dark-text mb-6">
              Session Types
            </h2>
            <p className="text-lg text-light-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">
              Whether you're recording, practicing, or performing, we have the perfect setup for your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sessionTypes.map((session, index) => (
              <motion.div
                key={session.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass rounded-2xl p-6 text-center group hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {session.icon}
                </div>
                <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
                  {session.name}
                </h3>
                <div className="text-light-primary dark:text-dark-primary font-semibold text-lg mb-4">
                  {session.price}
                </div>
                <ul className="text-sm text-light-text-muted dark:text-dark-text-muted space-y-2">
                  {session.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 bg-light-primary dark:bg-dark-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Book Now
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialCarousel />

      <section className="py-20 bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent">
        <div className="max-width-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <h2 className="text-display-md font-bold mb-6">
              Ready to Create Something Amazing?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join hundreds of musicians who trust Resonance Studio for their creative journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-light-primary px-8 py-4 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-shadow"
                >
                  Book Your Session
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/calendar">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-light-primary transition-colors"
                >
                  View Calendar
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <ContactSection />
    </div>
  )
}