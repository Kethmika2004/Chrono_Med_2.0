import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute({ allowedRoles }: { allowedRoles: string[] }) {
  // TODO: implement auth check
  const isAuth = true
  return isAuth ? <Outlet /> : <Navigate to="/auth/login" />
}