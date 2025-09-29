import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  User,
  MessageSquare,
  Calendar,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  ExternalLink,
  CheckCircle
} from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Our Studio',
    details: ['Sinhgad Road, Pune', 'Maharashtra 411041, India'],
    action: 'Get Directions',
    link: 'https://maps.google.com/?q=Sinhgad+Road+Pune',
    color: 'text-red-500'
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+91 98765 43210', '+91 87654 32109'],
    action: 'Call Now',
    link: 'tel:+919876543210',
    color: 'text-green-500'
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: ['hello@resonancestudio.com', 'booking@resonancestudio.com'],
    action: 'Send Email',
    link: 'mailto:hello@resonancestudio.com',
    color: 'text-blue-500'
  },
  {
    icon: Clock,
    title: 'Studio Hours',
    details: ['Mon - Sun: 9:00 AM - 10:00 PM', 'Online Booking: 24/7'],
    action: 'Book Online',
    link: '/booking',
    color: 'text-purple-500'
  }
]

const socialLinks = [
  {
    name: 'Instagram',
    icon: Instagram,
    href: 'https://instagram.com/resonancestudio',
    color: 'hover:text-pink-500',
    followers: '12K'
  },
  {
    name: 'YouTube',
    icon: Youtube,
    href: 'https://youtube.com/resonancestudio',
    color: 'hover:text-red-500',
    followers: '8.5K'
  },
  {
    name: 'Facebook',
    icon: Facebook,
    href: 'https://facebook.com/resonancestudio',
    color: 'hover:text-blue-500',
    followers: '15K'
  },
  {
    name: 'Twitter',
    icon: Twitter,
    href: 'https://twitter.com/resonancestudio',
    color: 'hover:text-blue-400',
    followers: '5.2K'
  }
]

const inquiryTypes = [
  'Studio Booking',
  'Pricing Information',
  'Equipment Rental',
  'Group Sessions',
  'Technical Support',
  'Partnership',
  'Other'
]

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.inquiryType,
        message: data.message,
        preferredContact: data.preferredContact
      }

      const response = await axios.post(`${API_URL}/contact/send`, payload)
      
      if (response.data.success) {
        setSubmitSuccess(true)
        toast.success('Thank you! We\'ll get back to you within 24 hours.')
        reset()
        
        setTimeout(() => setSubmitSuccess(false), 3000)
      } else {
        toast.error(response.data.message || 'Something went wrong.')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to send message. Please try again.'
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
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
    <section id="contact" className="py-20 bg-light-surface dark:bg-dark-surface">
      <div className="max-width-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full mb-6">
            <MessageSquare className="w-5 h-5 text-light-primary dark:text-dark-primary" />
            <span className="text-light-text dark:text-dark-text font-medium">Contact Us</span>
          </div>
          
          <h2 className="text-display-md font-bold text-light-text dark:text-dark-text mb-6">
            Let's Make Music
            <br />
            <span className="bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent bg-clip-text text-transparent">
              Together
            </span>
          </h2>
          
          <p className="text-lg text-light-text-muted dark:text-dark-text-muted max-w-2xl mx-auto">
            Have questions about our studios, equipment, or booking process? 
            We're here to help you create the perfect recording experience.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-3 gap-12"
        >
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-8">
            <div className="glass rounded-3xl p-8 backdrop-blur-xl border border-light-border dark:border-dark-border">
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-8">
                Get In Touch
              </h3>
              
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      if (item.link.startsWith('http') || item.link.startsWith('tel:') || item.link.startsWith('mailto:')) {
                        window.open(item.link, '_blank')
                      } else {
                        window.location.href = item.link
                      }
                    }}
                  >
                    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors">
                      <div className={`w-12 h-12 rounded-xl bg-light-surface-variant dark:bg-dark-surface-variant flex items-center justify-center group-hover:scale-110 transition-transform ${item.color}`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-light-text dark:text-dark-text mb-1 group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors">
                          {item.title}
                        </h4>
                        {item.details.map((detail, idx) => (
                          <p key={idx} className="text-sm text-light-text-muted dark:text-dark-text-muted">
                            {detail}
                          </p>
                        ))}
                        <div className="flex items-center gap-1 mt-2 text-light-primary dark:text-dark-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>{item.action}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              variants={itemVariants}
              className="glass rounded-3xl p-8 backdrop-blur-xl border border-light-border dark:border-dark-border"
            >
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">
                Follow Us
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-3 p-4 bg-light-surface-variant dark:bg-dark-surface-variant rounded-xl hover:shadow-lg transition-all duration-300 ${social.color}`}
                  >
                    <social.icon className="w-6 h-6" />
                    <div>
                      <div className="font-medium text-light-text dark:text-dark-text text-sm">
                        {social.name}
                      </div>
                      <div className="text-xs text-light-text-muted dark:text-dark-text-muted">
                        {social.followers} followers
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="glass rounded-3xl p-8 backdrop-blur-xl border border-light-border dark:border-dark-border"
            >
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/booking'}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book a Studio Session
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/calendar'}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Check Availability
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => window.open('tel:+919876543210')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="glass rounded-3xl p-8 md:p-12 backdrop-blur-xl border border-light-border dark:border-dark-border">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">
                  Send Us a Message
                </h3>
                
                {submitSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-green-600 bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-full"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Message sent!</span>
                  </motion.div>
                )}
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    icon={User}
                    placeholder="Enter your name"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                    error={errors.name?.message}
                  />
                  
                  <Input
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    placeholder="your@email.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Please enter a valid email'
                      }
                    })}
                    error={errors.email?.message}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Phone Number"
                    icon={Phone}
                    placeholder="+91 9876543210"
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^\+?[1-9]\d{1,14}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                    error={errors.phone?.message}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                      Inquiry Type
                    </label>
                    <select
                      {...register('inquiryType', {
                        required: 'Please select an inquiry type'
                      })}
                      className="w-full px-4 py-3 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary transition-all"
                    >
                      <option value="">Select inquiry type</option>
                      {inquiryTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.inquiryType && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        {errors.inquiryType.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                    Message
                  </label>
                  <textarea
                    {...register('message', {
                      required: 'Message is required',
                      minLength: {
                        value: 10,
                        message: 'Message must be at least 10 characters'
                      }
                    })}
                    rows={6}
                    placeholder="Tell us about your project, questions, or requirements..."
                    className="w-full px-4 py-3 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text placeholder-light-text-muted dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary transition-all resize-none"
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-3">
                    Preferred Contact Method
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['Email', 'Phone', 'WhatsApp'].map((method) => (
                      <label key={method} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value={method.toLowerCase()}
                          {...register('preferredContact', {
                            required: 'Please select a contact method'
                          })}
                          className="text-light-primary dark:text-dark-primary focus:ring-light-primary dark:focus:ring-dark-primary"
                        />
                        <span className="text-light-text dark:text-dark-text">{method}</span>
                      </label>
                    ))}
                  </div>
                  {errors.preferredContact && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.preferredContact.message}
                    </p>
                  )}
                </div>

                <div className="glass p-4 rounded-xl">
                  <h4 className="font-medium text-light-text dark:text-dark-text mb-2">
                    📞 Response Time
                  </h4>
                  <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                    We typically respond to inquiries within 2-4 hours during business hours 
                    (9 AM - 10 PM). For urgent booking requests, please call us directly.
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={submitSuccess}
                    className="w-full py-4 text-lg"
                    size="lg"
                  >
                    {submitSuccess ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Message Sent Successfully!
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        {isSubmitting ? 'Sending Message...' : 'Send Message'}
                      </>
                    )}
                  </Button>
                </motion.div>

                <div className="text-center text-sm text-light-text-muted dark:text-dark-text-muted">
                  By submitting this form, you agree to our privacy policy and terms of service.
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>

        {/* Rest of the component remains the same... */}
      </div>
    </section>
  )
}