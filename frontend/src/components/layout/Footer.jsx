import { motion } from 'framer-motion'
import { Music, MapPin, Phone, Mail, Instagram, Facebook, Youtube, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'

const footerLinks = {
  services: [
    { name: 'Studio Booking', href: '/booking' },
    { name: 'Band Practice', href: '/booking?type=band' },
    { name: 'Audio Recording', href: '/booking?type=recording' },
    { name: 'Live Streaming', href: '/booking?type=streaming' },
    { name: 'Equipment Rental', href: '/equipment' }
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Studios', href: '/#studios' },
    { name: 'Testimonials', href: '/#testimonials' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Careers', href: '/careers' }
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Support', href: '/support' },
    { name: 'Booking Policy', href: '/policy' },
    { name: 'Cancellation', href: '/cancellation' },
    { name: 'FAQ', href: '/faq' }
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Refund Policy', href: '/refunds' }
  ]
}

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/resonancestudio', color: 'hover:text-pink-500' },
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/resonancestudio', color: 'hover:text-blue-500' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/resonancestudio', color: 'hover:text-red-500' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/resonancestudio', color: 'hover:text-blue-400' }
]

export default function Footer() {
  return (
    <footer className="bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border">
      <div className="max-width-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Link to="/" className="flex items-center space-x-3 group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="relative"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-xl flex items-center justify-center">
                    <Music className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur" />
                </motion.div>
                <div>
                  <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                    Resonance
                  </div>
                  <div className="text-sm text-light-text-muted dark:text-dark-text-muted -mt-1">
                    Sinhgad Road
                  </div>
                </div>
              </Link>

              <p className="text-light-text-muted dark:text-dark-text-muted max-w-sm">
                Premium music studios in Pune offering world-class recording facilities, 
                professional equipment, and exceptional acoustic environments for all your musical needs.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-light-text-muted dark:text-dark-text-muted">
                  <MapPin className="w-5 h-5 text-light-primary dark:text-dark-primary" />
                  <span>Sinhgad Road, Pune, Maharashtra 411041</span>
                </div>
                <div className="flex items-center gap-3 text-light-text-muted dark:text-dark-text-muted">
                  <Phone className="w-5 h-5 text-light-primary dark:text-dark-primary" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3 text-light-text-muted dark:text-dark-text-muted">
                  <Mail className="w-5 h-5 text-light-primary dark:text-dark-primary" />
                  <span>hello@resonancestudio.com</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      w-10 h-10 glass rounded-xl flex items-center justify-center
                      text-light-text-muted dark:text-dark-text-muted
                      transition-colors duration-200 ${social.color}
                    `}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Services */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-6">
                Services
              </h3>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-light-text-muted dark:text-dark-text-muted hover:text-light-primary dark:hover:text-dark-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Company */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-6">
                Company
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-light-text-muted dark:text-dark-text-muted hover:text-light-primary dark:hover:text-dark-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Support */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-6">
                Support
              </h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-light-text-muted dark:text-dark-text-muted hover:text-light-primary dark:hover:text-dark-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Legal */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-6">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-light-text-muted dark:text-dark-text-muted hover:text-light-primary dark:hover:text-dark-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-light-border dark:border-dark-border"
        >
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
              Stay Updated
            </h3>
            <p className="text-light-text-muted dark:text-dark-text-muted mb-6">
              Get the latest updates on new studios, special offers, and music events.
            </p>
            
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text placeholder-light-text-muted dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-light-primary dark:bg-dark-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-light-border dark:border-dark-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-light-text-muted dark:text-dark-text-muted text-sm">
              © 2024 Resonance Studio. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6 text-sm text-light-text-muted dark:text-dark-text-muted">
              <span>Built with ❤️ for musicians</span>
              <div className="flex items-center gap-2">
                <span>Powered by</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-light-primary dark:text-dark-primary">React</span>
                  <span>&</span>
                  <span className="font-medium text-light-primary dark:text-dark-primary">Node.js</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}