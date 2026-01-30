import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { usePortalAuth } from '@/hooks/use-portal-auth'

interface PortalAuthGuardProps {
  children: React.ReactNode
}

export function PortalAuthGuard({ children }: PortalAuthGuardProps) {
  const { isAuthenticated, isClient, isLoading, isInitialized } = usePortalAuth()
  const location = useLocation()

  // Show loading while checking auth
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // Redirect to unified login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect to admin if not a client
  if (!isClient) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
