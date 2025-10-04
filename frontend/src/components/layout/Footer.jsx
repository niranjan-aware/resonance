import { motion } from 'framer-motion'
import { Music, MapPin, Phone, Mail, Instagram, Facebook, Youtube, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'

const footerLinks = {
  services: [
    { name: 'Studio Booking', href: '/booking' },
    { name: 'Band Practice', href: '/booking?type=band' },
    { name: 'Audio Recording', href: '/booking?type=recording' },
    { name: 'Live Streaming', href: '/booking?type=streaming' }
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Studios', href: '/#studios' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' }
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Support', href: '/support' },
    { name: 'Booking Policy', href: '/policy' },
    { name: 'FAQ', href: '/faq' }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Link to="/" className="flex items-center space-x-2 group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="relative"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-xl flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur" />
                </motion.div>
                <div>
                  <div className="text-xl font-bold text-light-text dark:text-dark-text">
                    Resonance
                  </div>
                  <div className="text-xs text-light-text-muted dark:text-dark-text-muted -mt-1">
                    Sinhgad Road
                  </div>
                </div>
              </Link>

              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                Premium music studios in Pune offering world-class recording facilities.
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-light-text-muted dark:text-dark-text-muted">
                  <MapPin className="w-4 h-4 text-light-primary dark:text-dark-primary flex-shrink-0" />
                  <span>Sinhgad Road, Pune 411041</span>
                </div>
                <div className="flex items-center gap-2 text-light-text-muted dark:text-dark-text-muted">
                  <Phone className="w-4 h-4 text-light-primary dark:text-dark-primary flex-shrink-0" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2 text-light-text-muted dark:text-dark-text-muted">
                  <Mail className="w-4 h-4 text-light-primary dark:text-dark-primary flex-shrink-0" />
                  <span>hello@resonancestudio.com</span>
                </div>
              </div>

              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-9 h-9 glass rounded-xl flex items-center justify-center text-light-text-muted dark:text-dark-text-muted transition-colors duration-200 ${social.color}`}
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-base font-semibold text-light-text dark:text-dark-text mb-3">
                Services
              </h3>
              <ul className="space-y-2">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-light-text-muted dark:text-dark-text-muted hover:text-light-primary dark:hover:text-dark-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-base font-semibold text-light-text dark:text-dark-text mb-3">
                Company
              </h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-light-text-muted dark:text-dark-text-muted hover:text-light-primary dark:hover:text-dark-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-base font-semibold text-light-text dark:text-dark-text mb-3">
                Support
              </h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-light-text-muted dark:text-dark-text-muted hover:text-light-primary dark:hover:text-dark-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        <div className="pt-6 border-t border-light-border dark:border-dark-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-light-text-muted dark:text-dark-text-muted">
            <p>© 2024 Resonance Studio. All rights reserved.</p>
            <p className="text-xs">Built with ❤️ for musicians</p>
          </div>
        </div>
      </div>
    </footer>
  )
}