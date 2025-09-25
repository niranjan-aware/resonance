import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import Loading from './Loading'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, token, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <Loading size="lg" text="Checking authentication..." />
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to="/" replace />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}