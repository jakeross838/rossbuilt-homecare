/**
 * CASL ability factory
 *
 * Creates CASL Ability instances based on user role.
 * Integrates with the permission matrix for consistent enforcement.
 */

import { PureAbility, AbilityBuilder } from '@casl/ability'
import { permissionMatrix, type PageSubject } from './matrix'
import { type PermissionRole } from './roles'

/**
 * CASL action types
 * - 'access' is used for page/route access
 * - Additional actions can be added for fine-grained permissions
 */
export type PermissionAction = 'access' | 'manage' | 'read' | 'create' | 'update' | 'delete'

/**
 * CASL subject types
 */
export type PermissionSubject = PageSubject | 'all'

/**
 * Application ability type
 */
export type AppAbility = PureAbility<[PermissionAction, PermissionSubject]>

/**
 * Create a CASL ability based on user role
 *
 * @param role - The user's permission role
 * @returns CASL Ability instance with appropriate permissions
 */
export function createAbilityForRole(role: PermissionRole | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility)

  if (!role) {
    // No role = no permissions
    cannot('access', 'all')
    return build()
  }

  // Apply permissions from matrix
  for (const [page, permissions] of Object.entries(permissionMatrix)) {
    if (permissions[role]) {
      can('access', page as PageSubject)
    } else {
      cannot('access', page as PageSubject)
    }
  }

  // Admin gets full management capabilities
  if (role === 'Admin') {
    can('manage', 'all')
  }

  // Tech staff can read and update most things
  if (role === 'Tech') {
    can(['read', 'create', 'update'], 'all')
  }

  // Clients have limited capabilities
  if (role === 'Client') {
    can('read', 'all') // Can read their own data
  }

  return build()
}

/**
 * Create an empty ability (no permissions)
 * Used during loading states
 */
export function createEmptyAbility(): AppAbility {
  return new PureAbility<[PermissionAction, PermissionSubject]>([])
}
