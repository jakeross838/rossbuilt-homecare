/**
 * Permission Provider
 *
 * Wraps the application with CASL ability context.
 * Creates and updates ability based on user role from auth store.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { createContextualCan } from '@casl/react'
import { useAuthStore } from '@/stores/auth-store'
import {
  createAbilityForRole,
  createEmptyAbility,
  type AppAbility,
} from '@/lib/permissions/ability'
import {
  mapDatabaseRoleToPermissionRole,
  type PermissionRole,
} from '@/lib/permissions/roles'

/**
 * Permission context value
 */
interface PermissionContextValue {
  ability: AppAbility
  role: PermissionRole | null
  isLoading: boolean
}

/**
 * Permission context
 */
const PermissionContext = createContext<PermissionContextValue>({
  ability: createEmptyAbility(),
  role: null,
  isLoading: true,
})

/**
 * CASL Can component bound to our context
 * Usage: <Can I="access" a="dashboard">...</Can>
 */
export const Can = createContextualCan(PermissionContext.Consumer)

/**
 * Permission provider props
 */
interface PermissionProviderProps {
  children: ReactNode
}

/**
 * Permission Provider component
 *
 * Provides CASL ability context based on user role from auth store.
 * Updates ability when user role changes.
 */
export function PermissionProvider({ children }: PermissionProviderProps) {
  const { profile, isLoading, isInitialized } = useAuthStore()

  // Map database role to permission role
  const role = useMemo(() => {
    if (!profile?.role) return null
    return mapDatabaseRoleToPermissionRole(profile.role)
  }, [profile?.role])

  // Create ability based on role
  const ability = useMemo(() => {
    if (!isInitialized || isLoading) {
      return createEmptyAbility()
    }
    return createAbilityForRole(role)
  }, [role, isInitialized, isLoading])

  const value = useMemo(
    () => ({
      ability,
      role,
      isLoading: !isInitialized || isLoading,
    }),
    [ability, role, isInitialized, isLoading]
  )

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

/**
 * Hook to access permission context
 */
export function usePermissionContext(): PermissionContextValue {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermissionContext must be used within PermissionProvider')
  }
  return context
}

export default PermissionProvider
