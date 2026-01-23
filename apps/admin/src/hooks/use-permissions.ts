/**
 * Permission checking hook
 *
 * Provides convenient methods for checking permissions throughout the app.
 * Uses CASL ability from PermissionProvider context.
 */

import { useAbility } from '@casl/react'
import { usePermissionContext } from '@/components/providers/permission-provider'
import { type AppAbility } from '@/lib/permissions/ability'
import { type PageSubject, canAccessPage, getDefaultPageForRole, routeToPageSubject } from '@/lib/permissions/matrix'
import { type PermissionRole, isAdmin, isStaff, isClient } from '@/lib/permissions/roles'

/**
 * Hook return type
 */
interface UsePermissionsReturn {
  /** Current user's permission role */
  role: PermissionRole | null
  /** Whether permissions are still loading */
  isLoading: boolean
  /** CASL ability instance */
  ability: AppAbility
  /** Check if user can access a specific page */
  canAccess: (page: PageSubject) => boolean
  /** Check if current route is accessible */
  canAccessRoute: (pathname: string) => boolean
  /** Get appropriate redirect for unauthorized access */
  getRedirectPath: () => string
  /** Check if user is admin */
  isAdmin: boolean
  /** Check if user is staff (Admin or Tech) */
  isStaff: boolean
  /** Check if user is client */
  isClient: boolean
}

/**
 * Permission checking hook
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { canAccess, isAdmin, role } = usePermissions()
 *
 *   if (!canAccess('dashboard')) {
 *     return <Navigate to="/calendar" />
 *   }
 *
 *   return <Dashboard />
 * }
 * ```
 */
export function usePermissions(): UsePermissionsReturn {
  const { role, isLoading, ability } = usePermissionContext()

  return {
    role,
    isLoading,
    ability,
    canAccess: (page: PageSubject) => {
      if (!role) return false
      return canAccessPage(role, page)
    },
    canAccessRoute: (pathname: string) => {
      if (!role) return false
      const page = routeToPageSubject(pathname)
      if (!page) return true // Unknown routes handled by router
      return canAccessPage(role, page)
    },
    getRedirectPath: () => {
      if (!role) return '/login'
      return getDefaultPageForRole(role)
    },
    isAdmin: role ? isAdmin(role) : false,
    isStaff: role ? isStaff(role) : false,
    isClient: role ? isClient(role) : false,
  }
}

/**
 * Re-export CASL useAbility for direct ability access
 */
export { useAbility }

export default usePermissions
