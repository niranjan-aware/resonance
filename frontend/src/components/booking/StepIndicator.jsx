import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

const steps = [
  { id: 1, name: 'Session Type', description: 'Choose your session' },
  { id: 2, name: 'Details', description: 'Session requirements' },
  { id: 3, name: 'Studio', description: 'Select studio' },
  { id: 4, name: 'Date & Time', description: 'Pick schedule' },
  { id: 5, name: 'Confirm', description: 'Review booking' }
]

export default function StepIndicator({ currentStep, totalSteps = 5 }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                className={`
                  w-12 h-12 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 relative
                  ${currentStep >= step.id
                    ? 'bg-light-primary dark:bg-dark-primary border-light-primary dark:border-dark-primary text-white'
                    : currentStep === step.id - 1
                    ? 'border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary animate-pulse'
                    : 'border-light-border dark:border-dark-border text-light-text-muted dark:text-dark-text-muted'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  scale: currentStep === step.id ? 1.1 : 1,
                  boxShadow: currentStep === step.id ? '0 0 20px rgba(37, 99, 235, 0.3)' : 'none'
                }}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}

                {currentStep === step.id && (
                  <motion.div
                    className="absolute -inset-1 bg-light-primary dark:bg-dark-primary rounded-full opacity-20 blur-sm"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              <div className="mt-3 text-center">
                <p className={`
                  text-sm font-medium
                  ${currentStep >= step.id
                    ? 'text-light-primary dark:text-dark-primary'
                    : 'text-light-text-muted dark:text-dark-text-muted'
                  }
                `}>
                  {step.name}
                </p>
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 h-px bg-light-border dark:bg-dark-border mx-4 relative">
                <motion.div
                  className="h-full bg-light-primary dark:bg-dark-primary"
                  initial={{ width: '0%' }}
                  animate={{
                    width: currentStep > step.id ? '100%' : '0%'
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="bg-light-surface-variant dark:bg-dark-surface-variant rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-light-text-muted dark:text-dark-text-muted">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
      </div>
    </div>
  )
}