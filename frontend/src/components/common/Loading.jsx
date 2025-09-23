import { motion } from 'framer-motion'
import { Music } from 'lucide-react'

export default function Loading({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className={`${sizeClasses[size]} mb-4`}
      >
        <div className="relative">
          <div className="w-full h-full bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-full flex items-center justify-center">
            <Music className="w-1/2 h-1/2 text-white" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-1 bg-gradient-to-br from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent rounded-full opacity-20 blur"
          />
        </div>
      </motion.div>
      
      {text && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={`${textSizes[size]} text-light-text-muted dark:text-dark-text-muted text-center`}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

export function FullPageLoading({ text = 'Loading Resonance Studio...' }) {
  return (
    <div className="fixed inset-0 bg-light-bg dark:bg-dark-bg flex items-center justify-center z-50">
      <Loading size="xl" text={text} />
    </div>
  )
}

export function InlineLoading({ size = 'sm' }) {
  return (
    <div className="inline-flex items-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizeClasses[size]} mr-2`}
      >
        <div className="w-full h-full border-2 border-light-primary dark:border-dark-primary border-t-transparent rounded-full"></div>
      </motion.div>
    </div>
  )
}