import { format, formatDistanceToNow, isToday, isTomorrow, isPast, differenceInHours } from 'date-fns'

export const formatPrice = (amount, currency = '₹') => {
  return `${currency}${amount.toLocaleString('en-IN')}`
}

export const formatDateTime = (date, timeFormat = 'h:mm a') => {
  const dateObj = new Date(date)
  
  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, timeFormat)}`
  }
  
  if (isTomorrow(dateObj)) {
    return `Tomorrow, ${format(dateObj, timeFormat)}`
  }
  
  return format(dateObj, `MMM d, yyyy ${timeFormat}`)
}

export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const formatDuration = (startTime, endTime) => {
  const start = new Date(`1970-01-01T${startTime}:00`)
  const end = new Date(`1970-01-01T${endTime}:00`)
  const hours = (end - start) / (1000 * 60 * 60)
  
  if (hours === 1) return '1 hour'
  if (hours < 1) return `${hours * 60} minutes`
  return `${hours} hours`
}

export const getBookingStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    confirmed: 'green', 
    'checked-in': 'blue',
    completed: 'purple',
    cancelled: 'red',
    'no-show': 'gray'
  }
  return colors[status] || 'gray'
}

export const getStudioSizeLabel = (size) => {
  const labels = {
    small: 'Small (1-5 people)',
    medium: 'Medium (6-10 people)', 
    large: 'Large (10+ people)'
  }
  return labels[size] || size
}

export const calculateBookingTotal = (basePrice, duration, equipment = [], peakHourMultiplier = 1) => {
  const baseAmount = basePrice * duration * peakHourMultiplier
  const equipmentCost = equipment.reduce((sum, item) => sum + (item.price || 0), 0)
  const subtotal = baseAmount + equipmentCost
  const taxes = subtotal * 0.18 // 18% GST
  
  return {
    baseAmount: Math.round(baseAmount),
    equipmentCost: Math.round(equipmentCost),
    subtotal: Math.round(subtotal),
    taxes: Math.round(taxes),
    total: Math.round(subtotal + taxes)
  }
}

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone)
}

export const validateEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/
  return emailRegex.test(email)
}

export const generateBookingId = () => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `RES-${timestamp}-${random}`
}

export const formatSessionType = (type) => {
  const formatted = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  return formatted
}

export const getTimeSlots = (startTime = '09:00', endTime = '22:00', interval = 60) => {
  const slots = []
  const start = new Date(`1970-01-01T${startTime}:00`)
  const end = new Date(`1970-01-01T${endTime}:00`)
  
  let current = new Date(start)
  
  while (current < end) {
    const next = new Date(current.getTime() + interval * 60 * 1000)
    
    slots.push({
      startTime: format(current, 'HH:mm'),
      endTime: format(next, 'HH:mm'),
      label: `${format(current, 'h:mm a')} - ${format(next, 'h:mm a')}`
    })
    
    current = next
  }
  
  return slots
}

export const isBusinessHours = (time, startTime = '09:00', endTime = '22:00') => {
  return time >= startTime && time <= endTime
}

export const canCancelBooking = (booking) => {
  if (!booking || booking.status !== 'confirmed') return false
  
  const bookingDateTime = new Date(booking.date)
  const [hours, minutes] = booking.timeSlot.startTime.split(':')
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes))
  
  const hoursUntilBooking = differenceInHours(bookingDateTime, new Date())
  return hoursUntilBooking >= 24
}

export const calculateRefundAmount = (booking) => {
  if (!canCancelBooking(booking)) return 0
  
  const bookingDateTime = new Date(booking.date)
  const [hours, minutes] = booking.timeSlot.startTime.split(':')
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes))
  
  const hoursUntilBooking = differenceInHours(bookingDateTime, new Date())
  
  if (hoursUntilBooking >= 48) return booking.pricing.totalAmount * 0.9
  if (hoursUntilBooking >= 24) return booking.pricing.totalAmount * 0.7
  if (hoursUntilBooking >= 6) return booking.pricing.totalAmount * 0.5
  
  return 0
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

export const downloadFile = (data, filename, type = 'text/plain') => {
  const file = new Blob([data], { type })
  const a = document.createElement('a')
  const url = URL.createObjectURL(file)
  
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  
  setTimeout(() => {
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, 0)
}

export const getImageUrl = (image, size = 'medium') => {
  if (!image?.url) return null
  
  if (image.url.includes('cloudinary.com')) {
    const sizeMap = {
      thumbnail: 'c_thumb,w_150,h_150',
      small: 'c_fill,w_300,h_200',
      medium: 'c_fill,w_600,h_400', 
      large: 'c_fill,w_1200,h_800'
    }
    
    const transform = sizeMap[size] || sizeMap.medium
    return image.url.replace('/upload/', `/upload/${transform}/`)
  }
  
  return image.url
}

export const generateAvatarUrl = (name, size = 40) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
  return `https://ui-avatars.com/api/?name=${initials}&size=${size}&background=2563eb&color=fff&format=svg`
}

export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId)
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    })
  }
}

export const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

export const setQueryParam = (param, value) => {
  const url = new URL(window.location)
  url.searchParams.set(param, value)
  window.history.pushState({}, '', url)
}

export const removeQueryParam = (param) => {
  const url = new URL(window.location)
  url.searchParams.delete(param)
  window.history.pushState({}, '', url)
}