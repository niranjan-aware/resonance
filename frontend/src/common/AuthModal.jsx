import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Phone, Mail, Lock, User, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import Modal from './Modal'
import Input from './Input'
import Button from './Button'
import { useAuthStore } from '../../context/AuthContext'
import { validateEmail, validatePhone, validatePassword, validateOTP } from '../../utils/apiUtils'

export default function AuthModal() {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    authStep, 
    setAuthStep,
    sendOTP, 
    verifyOTP, 
    login, 
    register,
    resendOTP,
    isLoading,
    error,
    clearError
  } = useAuthStore()

  const [authMode, setAuthMode] = useState('whatsapp') // whatsapp, email, register
  const [showPassword, setShowPassword] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [phoneNumber, setPhoneNumber] = useState('')
  
  const { register: registerField, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm()

  // Clear errors when modal opens/closes
  useEffect(() => {
    if (showAuthModal) {
      clearError()
    }
  }, [showAuthModal, clearError])

  // OTP Timer
  useEffect(() => {
    let interval
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [otpTimer])

  const handleClose = () => {
    setShowAuthModal(false)
    setAuthStep('phone')
    setAuthMode('whatsapp')
    setOtpTimer(0)
    setPhoneNumber('')
    reset()
    clearError()
  }

  const onSendOTP = async (data) => {
    try {
      await sendOTP(data.phone)
      setPhoneNumber(data.phone)
      setOtpTimer(60) // 1 minute timer
    } catch (error) {
      // Error is already handled by the store
    }
  }

  const onVerifyOTP = async (data) => {
    try {
      await verifyOTP({
        phone: phoneNumber,
        otp: data.otp,
        name: data.name,
        email: data.email
      })
      handleClose()
    } catch (error) {
      // Error is already handled by the store
    }
  }

  const onLogin = async (data) => {
    try {
      await login(data)
      handleClose()
    } catch (error) {
      // Error is already handled by the store
    }
  }

  const onRegister = async (data) => {
    try {
      await register(data)
      handleClose()
    } catch (error) {
      // Error is already handled by the store
    }
  }

  const onResendOTP = async () => {
    try {
      await resendOTP(phoneNumber)
      setOtpTimer(60)
    } catch (error) {
      // Error is already handled by the store
    }
  }

  const renderWhatsAppAuth = () => (
    <AnimatePresence mode="wait">
      {authStep === 'phone' ? (
        <motion.div
          key="phone"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
              Welcome to Resonance
            </h3>
            <p className="text-light-text-muted dark:text-dark-text-muted">
              Enter your phone number to get started with WhatsApp verification
            </p>
          </div>

          <form onSubmit={handleSubmit(onSendOTP)} className="space-y-4">
            <Input
              label="Phone Number"
              icon={Phone}
              placeholder="+91 9876543210"
              {...registerField('phone', {
                required: 'Phone number is required',
                validate: (value) => validatePhone(value) || 'Please enter a valid phone number'
              })}
              error={errors.phone?.message}
            />

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                'Send OTP'
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <button
              onClick={() => setAuthMode('email')}
              className="text-light-primary dark:text-dark-primary hover:underline text-sm"
              disabled={isLoading}
            >
              Use email instead
            </button>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="otp"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAuthStep('phone')
                clearError()
              }}
              className="mb-4"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="w-16 h-16 bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
              Enter Verification Code
            </h3>
            <p className="text-light-text-muted dark:text-dark-text-muted">
              We sent a 6-digit code to {phoneNumber}
            </p>
          </div>

          <form onSubmit={handleSubmit(onVerifyOTP)} className="space-y-4">
            <Input
              label="Verification Code"
              placeholder="123456"
              maxLength={6}
              {...registerField('otp', {
                required: 'OTP is required',
                validate: (value) => validateOTP(value) || 'OTP must be 6 digits'
              })}
              error={errors.otp?.message}
            />

            <Input
              label="Your Name"
              icon={User}
              placeholder="Enter your full name"
              {...registerField('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              error={errors.name?.message}
            />

            <Input
              label="Email Address"
              icon={Mail}
              type="email"
              placeholder="your@email.com"
              {...registerField('email', {
                required: 'Email is required',
                validate: (value) => validateEmail(value) || 'Please enter a valid email'
              })}
              error={errors.email?.message}
            />

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                'Verify & Continue'
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            {otpTimer > 0 ? (
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                Resend OTP in {otpTimer} seconds
              </p>
            ) : (
              <button
                onClick={onResendOTP}
                className="text-light-primary dark:text-dark-primary hover:underline text-sm"
                disabled={isLoading}
              >
                Resend OTP
              </button>
            )}
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const renderEmailAuth = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
          Sign In
        </h3>
        <p className="text-light-text-muted dark:text-dark-text-muted">
          Welcome back to Resonance Studio
        </p>
      </div>

      <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
        <Input
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="your@email.com"
          {...registerField('email', {
            required: 'Email is required',
            validate: (value) => validateEmail(value) || 'Please enter a valid email'
          })}
          error={errors.email?.message}
        />

        <div className="relative">
          <Input
            label="Password"
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            {...registerField('password', {
              required: 'Password is required'
            })}
            error={errors.password?.message}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <button
          onClick={() => setAuthMode('register')}
          className="text-light-primary dark:text-dark-primary hover:underline text-sm"
          disabled={isLoading}
        >
          Don't have an account? Register
        </button>
        <br />
        <button
          onClick={() => setAuthMode('whatsapp')}
          className="text-light-primary dark:text-dark-primary hover:underline text-sm"
          disabled={isLoading}
        >
          Use WhatsApp instead
        </button>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </div>
    </div>
  )

  const renderRegister = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
          Create Account
        </h3>
        <p className="text-light-text-muted dark:text-dark-text-muted">
          Join Resonance Studio today
        </p>
      </div>

      <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
        <Input
          label="Full Name"
          icon={User}
          placeholder="Enter your full name"
          {...registerField('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' }
          })}
          error={errors.name?.message}
        />

        <Input
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="your@email.com"
          {...registerField('email', {
            required: 'Email is required',
            validate: (value) => validateEmail(value) || 'Please enter a valid email'
          })}
          error={errors.email?.message}
        />

        <Input
          label="Phone Number"
          icon={Phone}
          placeholder="+91 9876543210"
          {...registerField('phone', {
            required: 'Phone number is required',
            validate: (value) => validatePhone(value) || 'Please enter a valid phone number'
          })}
          error={errors.phone?.message}
        />

        <div className="relative">
          <Input
            label="Password"
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            {...registerField('password', {
              required: 'Password is required',
              validate: (value) => validatePassword(value) || 'Password must be at least 6 characters'
            })}
            error={errors.password?.message}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <button
          onClick={() => setAuthMode('email')}
          className="text-light-primary dark:text-dark-primary hover:underline text-sm"
          disabled={isLoading}
        >
          Already have an account? Sign In
        </button>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={showAuthModal}
      onClose={handleClose}
      size="sm"
      closeOnOverlayClick={!isLoading}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={authMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {authMode === 'whatsapp' && renderWhatsAppAuth()}
          {authMode === 'email' && renderEmailAuth()}
          {authMode === 'register' && renderRegister()}
        </motion.div>
      </AnimatePresence>
    </Modal>
  )
}