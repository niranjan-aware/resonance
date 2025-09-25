import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import Loading from './Loading'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, token, isLoading } = useAuthStore()

  if (isLoading) {
    return <Loading />
  }

  if (!token || !user) {
    return <Navigate to="/" replace />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}