/**
 * Permission matrix defining page access by role
 *
 * This matrix is the single source of truth for route permissions.
 * Used by both route guards and sidebar navigation filtering.
 */

import type { PermissionRole } from './roles'

/**
 * Page identifiers matching route paths
 * These are the "subjects" in CASL terminology
 */
export type PageSubject =
  | 'dashboard'
  | 'billing'
  | 'work-orders'
  | 'inspections'
  | 'calendar'
  | 'clients'
  | 'properties'
  | 'vendors'
  | 'inspector'
  | 'activity'
  | 'notifications'
  | 'settings'
  | 'reports'
  | 'users'
  | 'permissions'

/**
 * Permission matrix configuration
 * true = allowed, false = denied
 *
 * From requirements:
 * | Page | Admin | Client | Tech |
 * |------|-------|--------|------|
 * | dashboard | Y | N | N |
 * | billing | Y | Y | Y |
 * | work-orders | Y | Y | Y |
 * | inspections | Y | Y | Y |
 * | calendar | Y | Y | Y |
 * | clients | Y | N | Y |
 * | properties | Y | N | Y |
 * | vendors | Y | N | Y |
 * | inspector | Y | N | Y |
 * | activity | Y | N | Y |
 * | notifications | Y | N | Y |
 * | settings | Y | N | Y |
 */
export const permissionMatrix: Record<PageSubject, Record<PermissionRole, boolean>> = {
  dashboard: {
    Admin: true,
    Client: false,
    Tech: false,
  },
  billing: {
    Admin: true,
    Client: true,
    Tech: true,
  },
  'work-orders': {
    Admin: true,
    Client: true,
    Tech: true,
  },
  inspections: {
    Admin: true,
    Client: true,
    Tech: true,
  },
  calendar: {
    Admin: true,
    Client: true,
    Tech: true,
  },
  clients: {
    Admin: true,
    Client: false,
    Tech: true,
  },
  properties: {
    Admin: true,
    Client: false,
    Tech: true,
  },
  vendors: {
    Admin: true,
    Client: false,
    Tech: true,
  },
  inspector: {
    Admin: true,
    Client: false,
    Tech: true,
  },
  activity: {
    Admin: true,
    Client: false,
    Tech: true,
  },
  notifications: {
    Admin: true,
    Client: false,
    Tech: true,
  },
  settings: {
    Admin: true,
    Client: false,
    Tech: true,
  },
  reports: {
    Admin: true,
    Client: false,
    Tech: true,
  },
  users: {
    Admin: true,
    Client: false,
    Tech: false,
  },
  permissions: {
    Admin: true,
    Client: false,
    Tech: false,
  },
}

/**
 * Get allowed pages for a role
 */
export function getAllowedPages(role: PermissionRole): PageSubject[] {
  return (Object.keys(permissionMatrix) as PageSubject[]).filter(
    (page) => permissionMatrix[page][role]
  )
}

/**
 * Check if a role can access a page
 */
export function canAccessPage(role: PermissionRole, page: PageSubject): boolean {
  return permissionMatrix[page]?.[role] ?? false
}

/**
 * Get the default redirect page for a role when accessing unauthorized content
 */
export function getDefaultPageForRole(role: PermissionRole): string {
  switch (role) {
    case 'Admin':
      return '/dashboard'
    case 'Client':
      return '/portal' // Clients go to the client portal
    case 'Tech':
      return '/calendar' // Tech staff start with calendar
    default:
      return '/login'
  }
}

/**
 * Route to page subject mapping
 * Maps URL paths to permission subjects
 */
export function routeToPageSubject(pathname: string): PageSubject | null {
  // Remove leading slash and get segments
  const segments = pathname.replace(/^\//, '').split('/')
  const firstSegment = segments[0]
  const secondSegment = segments[1]

  // Handle special sub-routes that have their own permissions
  if (firstSegment === 'settings') {
    if (secondSegment === 'users') return 'users'
    if (secondSegment === 'permissions') return 'permissions'
    return 'settings'
  }

  // Map route segments to page subjects
  const routeMap: Record<string, PageSubject> = {
    dashboard: 'dashboard',
    billing: 'billing',
    'work-orders': 'work-orders',
    inspections: 'inspections',
    calendar: 'calendar',
    clients: 'clients',
    properties: 'properties',
    vendors: 'vendors',
    inspector: 'inspector',
    activity: 'activity',
    notifications: 'notifications',
    settings: 'settings',
    reports: 'reports',
  }

  return routeMap[firstSegment] ?? null
}
