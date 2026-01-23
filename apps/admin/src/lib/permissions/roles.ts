/**
 * Role definitions and mapping for permission system
 *
 * Maps database user_role enum to application permission roles.
 * The database has: admin, manager, inspector, client
 * The permission system uses: Admin, Client, Tech
 */

import type { Database } from '@/types/database'

/**
 * Database role type from Supabase enum
 */
export type DatabaseRole = Database['public']['Enums']['user_role']

/**
 * Application permission roles
 * - Admin: Full access to all pages and features
 * - Client: Limited access to client-facing pages only
 * - Tech: Staff access (inspectors, managers) - most pages except dashboard
 */
export type PermissionRole = 'Admin' | 'Client' | 'Tech'

/**
 * Map database roles to permission roles
 *
 * admin -> Admin (full access)
 * client -> Client (limited access)
 * manager, inspector -> Tech (staff access)
 */
export function mapDatabaseRoleToPermissionRole(
  dbRole: DatabaseRole | null | undefined
): PermissionRole {
  if (!dbRole) {
    return 'Client' // Default to most restrictive
  }

  switch (dbRole) {
    case 'admin':
      return 'Admin'
    case 'client':
      return 'Client'
    case 'manager':
    case 'inspector':
      return 'Tech'
    default:
      return 'Client' // Default to most restrictive for unknown roles
  }
}

/**
 * Check if a role has admin privileges
 */
export function isAdmin(role: PermissionRole): boolean {
  return role === 'Admin'
}

/**
 * Check if a role is a staff member (Admin or Tech)
 */
export function isStaff(role: PermissionRole): boolean {
  return role === 'Admin' || role === 'Tech'
}

/**
 * Check if a role is a client
 */
export function isClient(role: PermissionRole): boolean {
  return role === 'Client'
}
