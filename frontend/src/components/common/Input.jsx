import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  type = 'text',
  ...props 
}, ref) => {
  const baseClasses = `
    w-full px-4 py-3 rounded-xl border transition-all duration-200
    bg-light-surface dark:bg-dark-surface
    text-light-text dark:text-dark-text
    placeholder-light-text-muted dark:placeholder-dark-text-muted
    focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const borderClasses = error
    ? 'border-red-500 focus:border-red-500'
    : 'border-light-border dark:border-dark-border focus:border-light-primary dark:focus:border-dark-primary'

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-light-text dark:text-dark-text">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />
          </div>
        )}
        
        <motion.input
          ref={ref}
          type={type}
          className={`
            ${baseClasses} 
            ${borderClasses}
            ${Icon ? 'pl-12' : 'pl-4'}
            ${className}
          `}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input