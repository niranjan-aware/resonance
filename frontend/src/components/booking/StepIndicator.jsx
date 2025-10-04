import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

const steps = [
  { id: 1, name: 'Session Type', shortName: 'Type', description: 'Choose your session' },
  { id: 2, name: 'Details', shortName: 'Details', description: 'Session requirements' },
  { id: 3, name: 'Studio', shortName: 'Studio', description: 'Select studio' },
  { id: 4, name: 'Date & Time', shortName: 'Time', description: 'Pick schedule' },
  { id: 5, name: 'Confirm', shortName: 'Confirm', description: 'Review booking' }
]

export default function StepIndicator({ currentStep, totalSteps = 5 }) {
  return (
    <div className="w-full overflow-visible">
      {/* Mobile Version - Compact horizontal scroll */}
      <div className="block lg:hidden">
        <div className="flex items-center justify-between gap-1 xs:gap-1.5 md:gap-2 mb-4 xs:mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center flex-1 min-w-0">
              {/* Step Circle */}
              <motion.div
                className={`
                  w-7 h-7 xs:w-8 xs:h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 relative mb-1 xs:mb-1.5 flex-shrink-0
                  ${currentStep >= step.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : currentStep === step.id - 1
                    ? 'border-blue-600 text-blue-600 animate-pulse'
                    : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  scale: currentStep === step.id ? 1.1 : 1,
                }}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5" />
                ) : (
                  <span className="text-[10px] xs:text-xs md:text-sm font-semibold">{step.id}</span>
                )}

                {currentStep === step.id && (
                  <motion.div
                    className="absolute -inset-1 bg-blue-600 rounded-full opacity-20 blur-sm"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Step Name - Responsive */}
              <div className="text-center w-full">
                <p className={`
                  text-[9px] xs:text-[10px] md:text-xs font-medium truncate leading-tight
                  ${currentStep >= step.id
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  <span className="hidden xs:inline">{step.shortName}</span>
                  <span className="xs:hidden">{step.id}</span>
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden xs:block absolute top-4 md:top-5 left-1/2 w-full h-px bg-gray-300 dark:bg-gray-600 -z-10" style={{ left: '50%' }}>
                  <motion.div
                    className="h-full bg-blue-600"
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

        {/* Progress Bar */}
        <div className="mb-4 xs:mb-6">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 xs:h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          
          <div className="flex justify-between mt-1.5 xs:mt-2 text-[9px] xs:text-[10px] text-gray-500 dark:text-gray-400">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
        </div>
      </div>

      {/* Desktop Version - Full width with details */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  className={`
                    w-12 h-12 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300 relative
                    ${currentStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : currentStep === step.id - 1
                      ? 'border-blue-600 text-blue-600 animate-pulse'
                      : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
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
                      className="absolute -inset-1 bg-blue-600 rounded-full opacity-20 blur-sm"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                <div className="mt-3 text-center">
                  <p className={`
                    text-sm font-medium
                    ${currentStep >= step.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 mx-4 relative">
                  <motion.div
                    className="h-full bg-blue-600"
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

        <div className="mb-6">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
        </div>
      </div>
    </div>
  )
}