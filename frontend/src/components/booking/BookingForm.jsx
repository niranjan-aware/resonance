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
  }
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
    setCurrentStep,
    nextStep,
    prevStep,
    updateFormData,
    setSelectedStudio,
    setSelectedSlot,
    resetForm,
    fetchStudios,
    fetchAvailableSlots,
    createBooking,
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

  useEffect(() => {
    // Scroll to top when step changes
    const scrollOptions = {
      top: 0,
      left: 0,
      behavior: 'smooth'
    }
    
    // Try multiple methods to ensure scroll works
    window.scrollTo(scrollOptions)
    
    // Fallback for some browsers
    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
    
    // Additional fallback
    if (document.body) {
      document.body.scrollTop = 0
    }
  }, [currentStep])

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
    const watchedData = watch()
    updateFormData(watchedData)
    
    const isFormValid = await trigger()
    const isStepValid = validateCurrentStep(currentStep)
    
    if (isFormValid && isStepValid) {
      nextStep()
    } else {
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
      setShowAuthModal(true);
      return;
    }

    try {
      if (!selectedStudio?._id) {
        toast.error('Please select a studio');
        return;
      }

      if (!selectedSlot) {
        toast.error('Please select a time slot');
        return;
      }

      if (!data.date) {
        toast.error('Please select a date');
        return;
      }

      const bookingPayload = {
        studioId: selectedStudio._id,
        date: data.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        sessionType: data.sessionType,
        sessionDetails: {
          participants: data.participants ? parseInt(data.participants) : undefined,
          musicians: data.musicians ? parseInt(data.musicians) : undefined,
          equipment: data.equipment || [],
          specialRequirements: data.specialRequirements || ''
        }
      };

      await createBooking(bookingPayload);
      setCurrentStep(6);
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.message ||
                          error.message || 
                          'Failed to create booking';
      toast.error(errorMessage);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 xs:space-y-6"
          >
            <div className="text-center">
              <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-light-text dark:text-dark-text mb-2 xs:mb-4">
                Choose Your Session Type
              </h2>
              <p className="text-xs xs:text-sm md:text-base text-light-text-muted dark:text-dark-text-muted">
                What type of session are you planning?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4">
              {sessionTypes.map((type) => (
                <motion.label
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative flex items-center p-3 xs:p-4 rounded-xl border-2 cursor-pointer transition-all
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
                  
                  <type.icon className="w-6 h-6 xs:w-7 xs:h-7 md:w-8 md:h-8 text-light-primary dark:text-dark-primary mr-3 xs:mr-4 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-light-text dark:text-dark-text text-sm xs:text-base">
                      {type.name}
                    </h3>
                    <p className="text-xs xs:text-sm text-light-text-muted dark:text-dark-text-muted line-clamp-1">
                      {type.description}
                    </p>
                  </div>

                  {selectedSessionType === type.id && (
                    <CheckCircle className="w-5 h-5 xs:w-6 xs:h-6 text-light-primary dark:text-dark-primary flex-shrink-0 ml-2" />
                  )}
                </motion.label>
              ))}
            </div>

            {errors.sessionType && (
              <p className="text-red-500 text-xs xs:text-sm">{errors.sessionType.message}</p>
            )}
          </motion.div>
        )

      case 2:
        const currentType = sessionTypes.find(t => t.id === selectedSessionType)
        
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 xs:space-y-6"
          >
            <div className="text-center">
              <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-light-text dark:text-dark-text mb-2 xs:mb-4">
                Session Details
              </h2>
              <p className="text-xs xs:text-sm md:text-base text-light-text-muted dark:text-dark-text-muted">
                Tell us more about your {currentType?.name.toLowerCase()} session
              </p>
            </div>

            <div className="space-y-3 xs:space-y-4">
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
                  }}
                />
              )}

              {currentType?.fields.includes('equipment') && (
                <div>
                  <label className="block text-xs xs:text-sm font-medium text-light-text dark:text-dark-text mb-2 xs:mb-3">
                    Required Equipment
                  </label>
                  <div className="grid grid-cols-2 gap-2 xs:gap-3">
                    {equipment.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center p-2 xs:p-3 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={item.id}
                          {...register('equipment')}
                          className="mr-2 xs:mr-3 text-light-primary dark:text-dark-primary flex-shrink-0"
                        />
                        <span className="mr-1 xs:mr-2 text-sm xs:text-base">{item.icon}</span>
                        <span className="text-xs xs:text-sm text-light-text dark:text-dark-text truncate">
                          {item.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs xs:text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  Special Requirements (Optional)
                </label>
                <textarea
                  {...register('specialRequirements')}
                  rows={3}
                  className="w-full px-3 xs:px-4 py-2 xs:py-3 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text placeholder-light-text-muted dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary text-xs xs:text-sm md:text-base"
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
            className="space-y-4 xs:space-y-6"
          >
            <div className="text-center">
              <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-light-text dark:text-dark-text mb-2 xs:mb-4">
                Select Date & Time
              </h2>
              <p className="text-xs xs:text-sm md:text-base text-light-text-muted dark:text-dark-text-muted">
                Choose your preferred date and time slot
              </p>
            </div>

            <div className="space-y-4 xs:space-y-6">
              <Input
                label="Date"
                type="date"
                icon={Calendar}
                min={(() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  return tomorrow.toISOString().split('T')[0];
                })()}
                max={(() => {
                  const maxDate = new Date();
                  maxDate.setMonth(maxDate.getMonth() + 4);
                  return maxDate.toISOString().split('T')[0];
                })()}
                {...register('date', {
                  required: 'Please select a date',
                  validate: (value) => {
                    const selectedDate = new Date(value);
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(0, 0, 0, 0);
                    
                    if (selectedDate < tomorrow) {
                      return 'Please select a date from tomorrow onwards';
                    }
                    return true;
                  }
                })}
                error={errors.date?.message}
                onChange={(e) => {
                  updateFormData({ date: e.target.value });
                  setSelectedSlot(null);
                }}
              />

              {selectedDate && isLoading && (
                <div className="text-center p-6 xs:p-8">
                  <div className="animate-spin rounded-full h-10 w-10 xs:h-12 xs:w-12 border-b-2 border-light-primary dark:border-dark-primary mx-auto"></div>
                  <p className="mt-3 xs:mt-4 text-xs xs:text-sm text-light-text-muted dark:text-dark-text-muted">
                    Loading available slots...
                  </p>
                </div>
              )}

              {selectedDate && availableSlots.length > 0 && (
                <TimeSlots
                  slots={availableSlots}
                  selectedSlot={selectedSlot}
                  onSlotSelect={(slot) => {
                    if (!slot.isBooked) {
                      setSelectedSlot(slot);
                      setValue('timeSlot', slot);
                    }
                  }}
                />
              )}

              {selectedDate && availableSlots.length === 0 && !isLoading && (
                <div className="text-center p-6 xs:p-8 bg-light-surface-variant dark:bg-dark-surface-variant rounded-xl">
                  <Clock className="w-10 h-10 xs:w-12 xs:h-12 text-light-text-muted dark:text-dark-text-muted mx-auto mb-3 xs:mb-4" />
                  <h3 className="text-base xs:text-lg font-semibold text-light-text dark:text-dark-text mb-1 xs:mb-2">
                    No Available Slots
                  </h3>
                  <p className="text-xs xs:text-sm text-light-text-muted dark:text-dark-text-muted">
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
            className="space-y-4 xs:space-y-6"
          >
            <div className="text-center">
              <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-light-text dark:text-dark-text mb-2 xs:mb-4">
                Confirm Your Booking
              </h2>
              <p className="text-xs xs:text-sm md:text-base text-light-text-muted dark:text-dark-text-muted">
                Review your booking details before confirming
              </p>
            </div>

            {bookingSummary && (
              <div className="glass p-4 xs:p-6 rounded-xl xs:rounded-2xl space-y-3 xs:space-y-4">
                <h3 className="text-base xs:text-lg font-semibold text-light-text dark:text-dark-text">
                  Booking Summary
                </h3>
                
                <div className="space-y-2 xs:space-y-3 text-xs xs:text-sm md:text-base">
                  <div className="flex justify-between gap-2">
                    <span className="text-light-text-muted dark:text-dark-text-muted">Studio:</span>
                    <span className="font-medium text-light-text dark:text-dark-text text-right">{bookingSummary.studio}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-light-text-muted dark:text-dark-text-muted">Date & Time:</span>
                    <span className="font-medium text-light-text dark:text-dark-text text-right">{bookingSummary.date} • {bookingSummary.time}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-light-text-muted dark:text-dark-text-muted">Duration:</span>
                    <span className="font-medium text-light-text dark:text-dark-text">{bookingSummary.duration} hours</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-light-text-muted dark:text-dark-text-muted">Session Type:</span>
                    <span className="font-medium text-light-text dark:text-dark-text text-right">{bookingSummary.sessionType.replace('-', ' ')}</span>
                  </div>
                  
                  <div className="border-t border-light-border dark:border-dark-border pt-2 xs:pt-3 mt-2 xs:mt-3">
                    <div className="flex justify-between gap-2">
                      <span className="text-light-text-muted dark:text-dark-text-muted">Base Price:</span>
                      <span className="text-light-text dark:text-dark-text">₹{bookingSummary.basePrice}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-light-text-muted dark:text-dark-text-muted">Taxes (18%):</span>
                      <span className="text-light-text dark:text-dark-text">₹{bookingSummary.taxes}</span>
                    </div>
                    <div className="flex justify-between gap-2 text-base xs:text-lg font-bold text-light-primary dark:text-dark-primary mt-2">
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
            className="text-center space-y-4 xs:space-y-6"
          >
            <div className="w-16 h-16 xs:w-20 xs:h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 xs:w-12 xs:h-12 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-light-text dark:text-dark-text mb-2 xs:mb-4">
                Booking Created!
              </h2>
              <p className="text-xs xs:text-sm md:text-base text-light-text-muted dark:text-dark-text-muted">
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
    <div className="w-full max-w-4xl mx-auto py-4 xs:py-6 md:py-8 overflow-visible">
      <div className="mb-6 xs:mb-8">
        <StepIndicator currentStep={currentStep} totalSteps={5} />
      </div>
      
      <div className="w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <AnimatePresence mode="wait">
            <div className="w-full">
              {renderStep()}
            </div>
          </AnimatePresence>

          <div className="flex justify-between mt-6 xs:mt-8 gap-2 xs:gap-3">
            {currentStep > 1 && currentStep < 6 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                className="!px-3 xs:!px-4 md:!px-6 !text-xs xs:!text-sm md:!text-base"
              >
                <ArrowLeft className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
                <span className="whitespace-nowrap">Previous</span>
              </Button>
            )}

            {currentStep < 5 && (
              <Button
                type="button"
                onClick={handleNextStep}
                className="ml-auto !px-3 xs:!px-4 md:!px-6 !text-xs xs:!text-sm md:!text-base"
                disabled={isLoading}
                loading={isLoading}
              >
                <span className="whitespace-nowrap">Next</span>
                <ArrowRight className="w-3 h-3 xs:w-4 xs:h-4 ml-1 xs:ml-2" />
              </Button>
            )}

            {currentStep === 5 && (
              <Button
                type="submit"
                loading={isLoading}
                className="ml-auto !px-3 xs:!px-4 md:!px-6 !text-xs xs:!text-sm md:!text-base"
              >
                <span className="whitespace-nowrap">Confirm Booking</span>
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}