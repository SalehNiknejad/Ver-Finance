import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/ui/status'
import { useAuthStore } from '@/store/auth-store'

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const location = useLocation()
  if (loading) return <main className="grid min-h-dvh place-items-center"><LoadingState /></main>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
