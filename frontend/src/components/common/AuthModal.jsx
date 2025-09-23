import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Phone, Mail, Lock, User, ArrowLeft } from 'lucide-react'
import Modal from './Modal'
import Input from './Input'
import Button from './Button'
import { useAuthStore } from '../../context/AuthContext'

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
    isLoading 
  } = useAuthStore()

  const [authMode, setAuthMode] = useState('whatsapp')
  const { register: registerField, handleSubmit, watch, formState: { errors } } = useForm()

  const handleClose = () => {
    setShowAuthModal(false)
    setAuthStep('phone')
    setAuthMode('whatsapp')
  }

  const onSendOTP = async (data) => {
    try {
      await sendOTP(data.phone)
      toast.success('OTP sent successfully!')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onVerifyOTP = async (data) => {
    try {
      await verifyOTP(data)
      toast.success('Welcome to Resonance Studio!')
      handleClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onLogin = async (data) => {
    try {
      await login(data)
      toast.success('Welcome back!')
      handleClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onRegister = async (data) => {
    try {
      await register(data)
      toast.success('Account created successfully!')
      handleClose()
    } catch (error) {
      toast.error(error.message)
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
            <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
              Welcome to Resonance
            </h3>
            <p className="text-light-text-muted dark:text-dark-text-muted">
              Enter your phone number to get started
            </p>
          </div>

          <form onSubmit={handleSubmit(onSendOTP)} className="space-y-4">
            <Input
              label="Phone Number"
              icon={Phone}
              placeholder="+91 9876543210"
              {...registerField('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^\+?[1-9]\d{1,14}$/,
                  message: 'Please enter a valid phone number'
                }
              })}
              error={errors.phone?.message}
            />

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              Send OTP
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setAuthMode('email')}
              className="text-light-primary dark:text-dark-primary hover:underline text-sm"
            >
              Use email instead
            </button>
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
              onClick={() => setAuthStep('phone')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
              Enter Verification Code
            </h3>
            <p className="text-light-text-muted dark:text-dark-text-muted">
              We sent a 6-digit code to {watch('phone')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onVerifyOTP)} className="space-y-4">
            <Input
              label="Verification Code"
              placeholder="123456"
              maxLength={6}
              {...registerField('otp', {
                required: 'OTP is required',
                minLength: {
                  value: 6,
                  message: 'OTP must be 6 digits'
                }
              })}
              error={errors.otp?.message}
            />

            <Input
              label="Your Name"
              icon={User}
              placeholder="Enter your name"
              {...registerField('name', {
                required: 'Name is required'
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
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Please enter a valid email'
                }
              })}
              error={errors.email?.message}
            />

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              Verify & Continue
            </Button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const renderEmailAuth = () => (
    <div className="space-y-6">
      <div className="text-center">
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
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Please enter a valid email'
            }
          })}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          icon={Lock}
          type="password"
          placeholder="Enter your password"
          {...registerField('password', {
            required: 'Password is required'
          })}
          error={errors.password?.message}
        />

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          Sign In
        </Button>
      </form>

      <div className="text-center space-y-2">
        <button
          onClick={() => setAuthMode('register')}
          className="text-light-primary dark:text-dark-primary hover:underline text-sm"
        >
          Don't have an account? Register
        </button>
        <br />
        <button
          onClick={() => setAuthMode('whatsapp')}
          className="text-light-primary dark:text-dark-primary hover:underline text-sm"
        >
          Use WhatsApp instead
        </button>
      </div>
    </div>
  )

  const renderRegister = () => (
    <div className="space-y-6">
      <div className="text-center">
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
          placeholder="Enter your name"
          {...registerField('name', {
            required: 'Name is required'
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
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Please enter a valid email'
            }
          })}
          error={errors.email?.message}
        />

        <Input
          label="Phone Number"
          icon={Phone}
          placeholder="+91 9876543210"
          {...registerField('phone', {
            required: 'Phone number is required',
            pattern: {
              value: /^\+?[1-9]\d{1,14}$/,
              message: 'Please enter a valid phone number'
            }
          })}
          error={errors.phone?.message}
        />

        <Input
          label="Password"
          icon={Lock}
          type="password"
          placeholder="Create a password"
          {...registerField('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
          error={errors.password?.message}
        />

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          Create Account
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={() => setAuthMode('email')}
          className="text-light-primary dark:text-dark-primary hover:underline text-sm"
        >
          Already have an account? Sign In
        </button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={showAuthModal}
      onClose={handleClose}
      size="sm"
    >
      {authMode === 'whatsapp' && renderWhatsAppAuth()}
      {authMode === 'email' && renderEmailAuth()}
      {authMode === 'register' && renderRegister()}
    </Modal>
  )
}