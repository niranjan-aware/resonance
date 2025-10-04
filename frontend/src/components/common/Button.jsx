import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-light-primary dark:bg-dark-primary text-white hover:opacity-90 active:opacity-95',
  secondary: 'bg-light-secondary dark:bg-dark-secondary text-white hover:opacity-90 active:opacity-95',
  accent: 'bg-light-accent dark:bg-dark-accent text-white hover:opacity-90 active:opacity-95',
  outline: 'border-2 border-light-primary dark:border-dark-primary text-light-primary dark:text-dark-primary hover:bg-light-primary dark:hover:bg-dark-primary hover:text-white active:scale-95',
  ghost: 'text-light-text dark:text-dark-text hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant active:scale-95',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
}

const sizes = {
  sm: 'px-3 sm:px-4 py-2 text-sm min-h-[36px]',
  md: 'px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]',
  lg: 'px-6 sm:px-8 py-3 sm:py-3.5 text-base sm:text-lg min-h-[44px] sm:min-h-[48px]',
  xl: 'px-8 sm:px-10 py-4 text-lg sm:text-xl min-h-[52px] sm:min-h-[56px]'
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
  ...props 
}) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-medium rounded-xl 
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    focus:ring-light-primary dark:focus:ring-dark-primary disabled:opacity-50 
    disabled:cursor-not-allowed transform-gpu touch-manipulation select-none
    ${fullWidth ? 'w-full' : ''}
  `

  const variantClasses = variants[variant] || variants.primary
  const sizeClasses = sizes[size] || sizes.md

  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  )
}