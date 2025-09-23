import { useState, useEffect, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns'
import { useQuery } from 'react-query'
import { bookingAPI, studioAPI } from '../services/booking'

export const useCalendar = (initialDate = new Date()) => {
  const [currentMonth, setCurrentMonth] = useState(initialDate)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedStudio, setSelectedStudio] = useState(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))
  const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1))
  
  const goToMonth = (date) => setCurrentMonth(date)
  const selectDate = (date) => setSelectedDate(date)

  return {
    currentMonth,
    selectedDate,
    selectedStudio,
    calendarDays,
    monthStart,
    monthEnd,
    nextMonth,
    prevMonth,
    goToMonth,
    selectDate,
    setSelectedStudio
  }
}

export const useCalendarAvailability = (studioId, month) => {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  return useQuery(
    ['calendarAvailability', studioId, format(month, 'yyyy-MM')],
    async () => {
      if (!studioId) return {}

      const availabilityPromises = days.map(async (day) => {
        try {
          const response = await bookingAPI.getAvailableSlots(
            studioId, 
            format(day, 'yyyy-MM-dd')
          )
          return {
            date: format(day, 'yyyy-MM-dd'),
            availableSlots: response.slots.length,
            totalSlots: 12, // Configurable
            slots: response.slots
          }
        } catch (error) {
          return {
            date: format(day, 'yyyy-MM-dd'),
            availableSlots: 0,
            totalSlots: 12,
            slots: []
          }
        }
      })

      const availabilityData = await Promise.all(availabilityPromises)
      
      return availabilityData.reduce((acc, data) => {
        acc[data.date] = data
        return acc
      }, {})
    },
    {
      enabled: !!studioId,
      staleTime: 2 * 60 * 1000,
      keepPreviousData: true
    }
  )
}

export const useCalendarBookings = (date) => {
  return useQuery(
    ['calendarBookings', format(date, 'yyyy-MM-dd')],
    () => bookingAPI.getUserBookings({
      date: format(date, 'yyyy-MM-dd')
    }),
    {
      enabled: !!date,
      staleTime: 1 * 60 * 1000
    }
  )
}

export const useStudioCalendar = () => {
  const [selectedStudio, setSelectedStudio] = useState(null)
  const calendar = useCalendar()
  
  const { data: studios = [], isLoading: studiosLoading } = useQuery(
    'studios',
    () => studioAPI.getStudios(),
    {
      staleTime: 10 * 60 * 1000,
      onSuccess: (data) => {
        if (!selectedStudio && data.studios?.length > 0) {
          setSelectedStudio(data.studios[0])
        }
      }
    }
  )

  const { data: availability = {}, isLoading: availabilityLoading } = useCalendarAvailability(
    selectedStudio?._id,
    calendar.currentMonth
  )

  const { data: daySlots = [], isLoading: slotsLoading } = useQuery(
    ['daySlots', selectedStudio?._id, calendar.selectedDate],
    () => bookingAPI.getAvailableSlots(
      selectedStudio._id,
      format(calendar.selectedDate, 'yyyy-MM-dd')
    ),
    {
      enabled: !!(selectedStudio?._id && calendar.selectedDate),
      staleTime: 1 * 60 * 1000
    }
  )

  const getDateAvailability = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return availability[dateStr] || { availableSlots: 0, totalSlots: 12 }
  }

  const getAvailabilityColor = (date) => {
    const dateAvailability = getDateAvailability(date)
    const ratio = dateAvailability.availableSlots / dateAvailability.totalSlots

    if (ratio === 0) return 'red'
    if (ratio < 0.3) return 'orange'
    if (ratio < 0.7) return 'yellow'
    return 'green'
  }

  return {
    ...calendar,
    studios: studios.studios || [],
    selectedStudio,
    setSelectedStudio,
    availability,
    daySlots: daySlots.slots || [],
    getDateAvailability,
    getAvailabilityColor,
    isLoading: studiosLoading || availabilityLoading || slotsLoading
  }
}