import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  Calendar, 
  Clock, 
  Users, 
  Music, 
  Mic,
  // Guitar,
  // Drum,
  Radio,
  Video,
  ArrowRight,
  ArrowLeft,
  CheckCircle
} from 'lucide-react'

import Button from '../common/Button'
import Input from '../common/Input'
import StepIndicator from './StepIndicator'
import StudioSelector from './StudioSelector'
import TimeSlots from './TimeSlots'
import { useAuthStore } from '../../store/useAuthStore'
import { useBookingStore } from '../../store/useBookingStore'

const sessionTypes = [
  { 
    id: 'karaoke', 
    name: 'Karaoke', 
    icon: Mic, 
    description: 'Sing your heart out with friends',
    fields: ['participants']
  },
  { 
    id: 'live-musicians', 
    name: 'Live with Musicians', 
    icon: Music, 
    description: 'Jam session with live musicians',
    fields: ['musicians']
  },
  // { 
  //   id: 'band', 
  //   name: 'Band Practice', 
  //   icon: Guitar, 
  //   description: 'Full band setup with all equipment',
  //   fields: ['musicians', 'equipment']
  // },
  { 
    id: 'audio-recording', 
    name: 'Audio Recording', 
    icon: Mic, 
    description: 'Professional audio recording session',
    fields: ['musicians']
  },
  { 
    id: 'video-recording', 
    name: 'Video Recording', 
    icon: Video, 
    description: 'Video production with professional setup',
    fields: ['participants']
  },
  { 
    id: 'fb-live', 
    name: 'Live Streaming', 
    icon: Radio, 
    description: 'Live stream your performance',
    fields: ['participants']
  },
  // { 
  //   id: 'show', 
  //   name: 'Performance Show', 
  //   icon: Drum, 
  //   description: 'Live performance for audience',
  //   fields: ['musicians', 'equipment']
  // }
]

const equipment = [
  { id: 'drum', name: 'Drum Kit', icon: '🥁' },
  { id: 'electric-guitar', name: 'Electric Guitar', icon: '🎸' },
  { id: 'keyboard', name: 'Keyboard', icon: '🎹' },
  { id: 'guitar-amp-laney', name: 'Guitar Amp (Laney)', icon: '🔊' },
  { id: 'guitar-amp-marshall', name: 'Guitar Amp (Marshall)', icon: '🔊' },
  { id: 'bass-amp-ampeg', name: 'Bass Amp (Ampeg)', icon: '🔊' }
]

export default function BookingForm() {
  const { user, setShowAuthModal } = useAuthStore()
  const { 
    currentStep,
    formData,
    selectedStudio,
    selectedSlot,
    studios,
    availableSlots,
    isLoading,
    error,
    // Actions
    setCurrentStep,
    nextStep,
    prevStep,
    updateFormData,
    setSelectedStudio,
    setSelectedSlot,
    resetForm,
    // API calls
    fetchStudios,
    fetchAvailableSlots,
    createBooking,
    // Validation
    validateStep,
    getBookingSummary
  } = useBookingStore()

  const { register, handleSubmit, watch, formState: { errors }, setValue, trigger } = useForm({
    defaultValues: formData
  })

  const selectedSessionType = watch('sessionType') || formData.sessionType
  const selectedDate = watch('date') || formData.date
  const selectedTime = watch('timeSlot') || formData.timeSlot

  useEffect(() => {
    fetchStudios()
  }, [fetchStudios])

  useEffect(() => {
    if (selectedSessionType) {
      fetchStudios({ sessionType: selectedSessionType })
    }
  }, [selectedSessionType, fetchStudios])

  useEffect(() => {
    if (selectedStudio && selectedDate) {
      fetchAvailableSlots(selectedStudio._id, selectedDate)
    }
  }, [selectedStudio, selectedDate, fetchAvailableSlots])

  // Fixed validation function
  const validateCurrentStep = (step) => {
    const watchedData = watch()
    
    switch (step) {
      case 1:
        return !!watchedData.sessionType
      
      case 2:
        const currentType = sessionTypes.find(t => t.id === watchedData.sessionType)
        if (!currentType) return false
        
        if (currentType.fields.includes('participants')) {
          const participants = parseInt(watchedData.participants)
          return !isNaN(participants) && participants > 0
        }
        
        if (currentType.fields.includes('musicians')) {
          const musicians = parseInt(watchedData.musicians)
          return !isNaN(musicians) && musicians > 0
        }
        
        return true
      
      case 3:
        return !!selectedStudio
      
      case 4:
        return !!watchedData.date && !!selectedSlot
      
      case 5:
        return true
      
      default:
        return false
    }
  }

  const handleNextStep = async () => {
    console.log('=== DEBUGGING NEXT STEP ===')
    console.log('Current step:', currentStep)
    console.log('Form data:', watch())
    console.log('Selected session type:', selectedSessionType)
    
    // Update form data in store first
    const watchedData = watch()
    updateFormData(watchedData)
    console.log('Updated form data in store:', watchedData)
    
    // Check form validation
    const isFormValid = await trigger()
    console.log('Form validation result:', isFormValid)
    console.log('Form errors:', errors)
    
    // Check step validation
    const isStepValid = validateCurrentStep(currentStep)
    console.log('Step validation result:', isStepValid)
    
    if (isFormValid && isStepValid) {
      console.log('✅ Validation passed - proceeding to next step')
      nextStep()
    } else {
      console.log('❌ Validation failed:', { isFormValid, isStepValid })
      
      // Show specific error messages
      if (!isFormValid) {
        toast.error('Please fill in all required fields correctly')
      } else if (!isStepValid) {
        if (currentStep === 2) {
          toast.error('Please enter valid participant/musician count')
        } else {
          toast.error('Please complete all step requirements')
        }
      }
    }
  }

  const handlePrevStep = () => {
    const watchedData = watch()
    updateFormData(watchedData)
    prevStep()
  }

  const onSubmit = async (data) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    try {
      const bookingPayload = {
        studioId: selectedStudio._id,
        date: data.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        sessionType: data.sessionType,
        sessionDetails: {
          participants: data.participants,
          musicians: data.musicians,
          equipment: data.equipment || [],
          specialRequirements: data.specialRequirements
        }
      }

      await createBooking(bookingPayload)
      setCurrentStep(6) // Success step
    } catch (error) {
      // Error is handled by the store
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
                Choose Your Session Type
              </h2>
              <p className="text-light-text-muted dark:text-dark-text-muted">
                What type of session are you planning?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessionTypes.map((type) => (
                <motion.label
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${selectedSessionType === type.id 
                      ? 'border-light-primary dark:border-dark-primary bg-light-primary/5 dark:bg-dark-primary/5' 
                      : 'border-light-border dark:border-dark-border hover:border-light-primary/50 dark:hover:border-dark-primary/50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    value={type.id}
                    {...register('sessionType', { required: 'Please select a session type' })}
                    className="sr-only"
                    onChange={(e) => updateFormData({ sessionType: e.target.value })}
                  />
                  
                  <type.icon className="w-8 h-8 text-light-primary dark:text-dark-primary mr-4" />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-light-text dark:text-dark-text">
                      {type.name}
                    </h3>
                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                      {type.description}
                    </p>
                  </div>

                  {selectedSessionType === type.id && (
                    <CheckCircle className="w-6 h-6 text-light-primary dark:text-dark-primary" />
                  )}
                </motion.label>
              ))}
            </div>

            {errors.sessionType && (
              <p className="text-red-500 text-sm">{errors.sessionType.message}</p>
            )}
          </motion.div>
        )

      case 2:
        const currentType = sessionTypes.find(t => t.id === selectedSessionType)
        
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
                Session Details
              </h2>
              <p className="text-light-text-muted dark:text-dark-text-muted">
                Tell us more about your {currentType?.name.toLowerCase()} session
              </p>
            </div>

            <div className="space-y-4">
              {currentType?.fields.includes('participants') && (
                <Input
                  label="Number of Participants"
                  type="number"
                  min="1"
                  max="50"
                  icon={Users}
                  placeholder="How many people?"
                  {...register('participants', {
                    required: 'Number of participants is required',
                    min: { value: 1, message: 'At least 1 participant required' },
                    max: { value: 50, message: 'Maximum 50 participants allowed' },
                    valueAsNumber: true
                  })}
                  error={errors.participants?.message}
                  onChange={(e) => {
                    updateFormData({ participants: e.target.value })
                    console.log('Participants updated:', e.target.value)
                  }}
                />
              )}

              {currentType?.fields.includes('musicians') && (
                <Input
                  label="Number of Musicians"
                  type="number"
                  min="1"
                  max="20"
                  icon={Music}
                  placeholder="How many musicians?"
                  {...register('musicians', {
                    required: 'Number of musicians is required',
                    min: { value: 1, message: 'At least 1 musician required' },
                    max: { value: 20, message: 'Maximum 20 musicians allowed' },
                    valueAsNumber: true
                  })}
                  error={errors.musicians?.message}
                  onChange={(e) => {
                    updateFormData({ musicians: e.target.value })
                    console.log('Musicians updated:', e.target.value)
                  }}
                />
              )}

              {currentType?.fields.includes('equipment') && (
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-3">
                    Required Equipment
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {equipment.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center p-3 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={item.id}
                          {...register('equipment')}
                          className="mr-3 text-light-primary dark:text-dark-primary"
                        />
                        <span className="mr-2">{item.icon}</span>
                        <span className="text-sm text-light-text dark:text-dark-text">
                          {item.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  Special Requirements (Optional)
                </label>
                <textarea
                  {...register('specialRequirements')}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text placeholder-light-text-muted dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
                  placeholder="Any special requirements or requests..."
                  onChange={(e) => updateFormData({ specialRequirements: e.target.value })}
                />
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <StudioSelector
            studios={studios}
            selectedStudio={selectedStudio}
            onStudioSelect={setSelectedStudio}
            sessionType={selectedSessionType}
          />
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
                Select Date & Time
              </h2>
              <p className="text-light-text-muted dark:text-dark-text-muted">
                Choose your preferred date and time slot
              </p>
            </div>

            <div className="space-y-6">
              <Input
                label="Date"
                type="date"
                icon={Calendar}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                max={new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0]}
                {...register('date', {
                  required: 'Please select a date'
                })}
                error={errors.date?.message}
                onChange={(e) => updateFormData({ date: e.target.value })}
              />

              {selectedDate && availableSlots.length > 0 && (
                <TimeSlots
                  slots={availableSlots}
                  selectedSlot={selectedSlot}
                  onSlotSelect={(slot) => {
                    setSelectedSlot(slot)
                    setValue('timeSlot', slot)
                  }}
                />
              )}

              {selectedDate && availableSlots.length === 0 && !isLoading && (
                <div className="text-center p-8 bg-light-surface-variant dark:bg-dark-surface-variant rounded-xl">
                  <Clock className="w-12 h-12 text-light-text-muted dark:text-dark-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
                    No Available Slots
                  </h3>
                  <p className="text-light-text-muted dark:text-dark-text-muted">
                    Try selecting a different date or studio
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )

      case 5:
        const bookingSummary = getBookingSummary()
        
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
                Confirm Your Booking
              </h2>
              <p className="text-light-text-muted dark:text-dark-text-muted">
                Review your booking details before confirming
              </p>
            </div>

            {bookingSummary && (
              <div className="glass p-6 rounded-2xl space-y-4">
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
                  Booking Summary
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-light-text-muted dark:text-dark-text-muted">Studio:</span>
                    <span className="font-medium text-light-text dark:text-dark-text">{bookingSummary.studio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light-text-muted dark:text-dark-text-muted">Date & Time:</span>
                    <span className="font-medium text-light-text dark:text-dark-text">{bookingSummary.date} • {bookingSummary.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light-text-muted dark:text-dark-text-muted">Duration:</span>
                    <span className="font-medium text-light-text dark:text-dark-text">{bookingSummary.duration} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light-text-muted dark:text-dark-text-muted">Session Type:</span>
                    <span className="font-medium text-light-text dark:text-dark-text">{bookingSummary.sessionType.replace('-', ' ')}</span>
                  </div>
                  
                  <div className="border-t border-light-border dark:border-dark-border pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-light-text-muted dark:text-dark-text-muted">Base Price:</span>
                      <span className="text-light-text dark:text-dark-text">₹{bookingSummary.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-light-text-muted dark:text-dark-text-muted">Taxes (18%):</span>
                      <span className="text-light-text dark:text-dark-text">₹{bookingSummary.taxes}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-light-primary dark:text-dark-primary">
                      <span>Total:</span>
                      <span>₹{bookingSummary.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
                Booking Created!
              </h2>
              <p className="text-light-text-muted dark:text-dark-text-muted">
                Your booking has been created successfully. You'll receive a confirmation email shortly.
              </p>
            </div>

            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full"
              size="lg"
            >
              View My Bookings
            </Button>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <StepIndicator currentStep={currentStep} totalSteps={5} />
      
      <div className="mt-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            {currentStep > 1 && currentStep < 6 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}

            {currentStep < 5 && (
              <Button
                type="button"
                onClick={handleNextStep}
                className="ml-auto"
                disabled={isLoading}
                loading={isLoading}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {currentStep === 5 && (
              <Button
                type="submit"
                loading={isLoading}
                className="ml-auto"
              >
                Confirm Booking
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}