import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function ProtectedRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const { user, profile, isLoading } = useAuthStore()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (profile && !allowedRoles.includes(profile.role)) {
    // Redirect to their respective portal if they don't have access to this one
    return <Navigate to={`/${profile.role}/dashboard`} replace />
  }

  return <Outlet />
}