/**
 * Permission Guard Component
 *
 * Protects routes by checking if the current user has permission to access them.
 * Redirects unauthorized users to appropriate fallback pages.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { usePermissions } from '@/hooks/use-permissions'
import { routeToPageSubject } from '@/lib/permissions/matrix'

interface PermissionGuardProps {
  children: React.ReactNode
  /** Optional fallback path. If not provided, uses role-based default redirect */
  fallback?: string
}

/**
 * Permission Guard
 *
 * Wraps protected content and checks if the user has permission to view it.
 * Shows loading state while permissions are being determined.
 * Redirects unauthorized users to the appropriate page.
 *
 * @example
 * ```tsx
 * <PermissionGuard>
 *   <DashboardPage />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({ children, fallback }: PermissionGuardProps) {
  const location = useLocation()
  const { isLoading, canAccessRoute, getRedirectPath, role } = usePermissions()

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // Check if user can access current route
  const pageSubject = routeToPageSubject(location.pathname)

  // If route doesn't map to a protected page, allow access
  // (let the router handle 404s for truly unknown routes)
  if (!pageSubject) {
    return <>{children}</>
  }

  // Check permission for the route
  if (!canAccessRoute(location.pathname)) {
    // Determine redirect path
    const redirectTo = fallback || getRedirectPath()

    // Log unauthorized access attempt (useful for debugging)
    console.warn(
      `[PermissionGuard] Unauthorized access attempt: ${location.pathname} by role: ${role}`
    )

    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <>{children}</>
}

/**
 * Higher-order component version for wrapping route elements
 *
 * @example
 * ```tsx
 * <Route path="/dashboard" element={withPermissionGuard(<DashboardPage />)} />
 * ```
 */
export function withPermissionGuard(
  element: React.ReactNode,
  fallback?: string
): React.ReactNode {
  return <PermissionGuard fallback={fallback}>{element}</PermissionGuard>
}

export default PermissionGuard
