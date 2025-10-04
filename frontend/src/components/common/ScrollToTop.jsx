import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Multiple scroll methods to ensure it works across all browsers
    const scrollToTop = () => {
      // Method 1: Standard scroll
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      })
      
      // Method 2: Document element scroll (fallback)
      if (document.documentElement) {
        document.documentElement.scrollTop = 0
      }
      
      // Method 3: Body scroll (additional fallback)
      if (document.body) {
        document.body.scrollTop = 0
      }
      
      // Method 4: For iOS Safari
      if (window.pageYOffset !== 0) {
        window.scrollTo(0, 0)
      }
    }
    
    // Execute immediately
    scrollToTop()
    
    // Also execute after a tiny delay to catch any layout shifts
    const timeoutId = setTimeout(scrollToTop, 10)
    
    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
}