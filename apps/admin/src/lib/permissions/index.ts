/**
 * Permission system exports
 */

// Role utilities
export {
  type DatabaseRole,
  type PermissionRole,
  mapDatabaseRoleToPermissionRole,
  isAdmin,
  isStaff,
  isClient,
} from './roles'

// Permission matrix
export {
  type PageSubject,
  permissionMatrix,
  getAllowedPages,
  canAccessPage,
  getDefaultPageForRole,
  routeToPageSubject,
} from './matrix'

// CASL ability
export {
  type PermissionAction,
  type PermissionSubject,
  type AppAbility,
  AppAbilityClass,
  createAbilityForRole,
  createEmptyAbility,
} from './ability'
