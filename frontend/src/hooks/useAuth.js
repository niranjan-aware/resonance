// frontend/src/hooks/useAuth.js
import { useEffect } from 'react';
import useStore from '../store';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    authLoading,
    authError,
    login,
    register,
    sendOTP,
    verifyOTP,
    getProfile,
    updateProfile,
    logout,
    initializeAuth,
    clearAuthError
  } = useStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    user,
    isAuthenticated,
    authLoading,
    authError,
    login,
    register,
    sendOTP,
    verifyOTP,
    getProfile,
    updateProfile,
    logout,
    clearAuthError
  };
};

// frontend/src/hooks/useBooking.js
import useStore from '../store';

export const useBooking = () => {
  const {
    bookings,
    studios,
    selectedStudio,
    availableSlots,
    bookingLoading,
    bookingError,
    createBooking,
    getUserBookings,
    getStudios,
    getStudioById,
    getAvailableSlots,
    cancelBooking,
    clearBookingError,
    resetBookingState
  } = useStore();

  return {
    bookings,
    studios,
    selectedStudio,
    availableSlots,
    bookingLoading,
    bookingError,
    createBooking,
    getUserBookings,
    getStudios,
    getStudioById,
    getAvailableSlots,
    cancelBooking,
    clearBookingError,
    resetBookingState
  };
};

// frontend/src/hooks/usePayment.js
import useStore from '../store';

export const usePayment = () => {
  const { initiatePayment, bookingLoading, bookingError } = useStore();

  return {
    initiatePayment,
    paymentLoading: bookingLoading,
    paymentError: bookingError
  };
};

// frontend/src/hooks/useUI.js
import useStore from '../store';

export const useUI = () => {
  const {
    isModalOpen,
    modalType,
    modalData,
    notifications,
    openModal,
    closeModal,
    addNotification,
    removeNotification,
    clearNotifications
  } = useStore();

  return {
    isModalOpen,
    modalType,
    modalData,
    notifications,
    openModal,
    closeModal,
    addNotification,
    removeNotification,
    clearNotifications
  };
};