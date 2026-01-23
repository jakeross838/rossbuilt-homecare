---
phase: 1
plan: 2
subsystem: permissions
tags: [permissions, guards, routing, sidebar, CASL]
dependency-graph:
  requires: [01-01]
  provides: [route-protection, sidebar-filtering, permission-guards]
  affects: [01-03, 01-04]
tech-stack:
  added: []
  patterns: [permission-guard-component, sidebar-permission-filtering, provider-wrapping]
key-files:
  created:
    - apps/admin/src/components/guards/permission-guard.tsx
    - apps/admin/src/components/guards/index.ts
  modified:
    - apps/admin/src/App.tsx
    - apps/admin/src/components/layout/app-layout.tsx
    - apps/admin/src/components/layout/sidebar.tsx
    - apps/admin/src/components/providers/index.ts
decisions:
  - Permission checking centralized in AppLayout (single enforcement point)
  - Sidebar filters navigation dynamically using useMemo and canAccess
  - Clients redirected to /portal from admin layout
  - Console warnings for unauthorized access attempts
metrics:
  duration: 9 min
  completed: 2026-01-23
---

# Phase 1 Plan 2: Route Protection and UI Guards Summary

**One-liner:** Permission guards and sidebar filtering using CASL hooks from Plan 01-01

## Changes Made

### Task 1: Create Permission Guard Component
- Created `apps/admin/src/components/guards/permission-guard.tsx`
- PermissionGuard component wraps protected content
- Shows loading state while permissions are checked
- Redirects unauthorized users to role-based fallback page
- Includes `withPermissionGuard` HOC for route element wrapping
- Logs unauthorized access attempts for debugging

### Task 2: Create Guards Index Export
- Created `apps/admin/src/components/guards/index.ts`
- Exports PermissionGuard and withPermissionGuard

### Task 3: Update App Layout with Permission Check
- Modified `apps/admin/src/components/layout/app-layout.tsx`
- Added usePermissions hook and routeToPageSubject imports
- Combined auth and permission loading states
- Added client redirect to /portal (clients use separate layout)
- Added route permission checking with redirect for unauthorized access
- Logs unauthorized access attempts for debugging

### Task 4: Update Sidebar with Permission Filtering
- Modified `apps/admin/src/components/layout/sidebar.tsx`
- Added usePermissions hook and PageSubject type imports
- Extended NavItem interface with `permission` property
- Renamed static navItems to allNavItems/allBottomNavItems
- Filter navigation items using useMemo and canAccess function
- Shows empty nav while permissions are loading
- Each nav item mapped to its corresponding permission subject

### Task 5: Update App.tsx with Permission Provider
- Modified `apps/admin/src/App.tsx`
- Added PermissionProvider import from providers
- Wrapped application with PermissionProvider inside AuthProvider
- Provider order: QueryClient > Auth > Permission > ErrorBoundary > Router
- Permission checking delegated to AppLayout for protected routes

### Task 6: Update Provider Index Export
- Modified `apps/admin/src/components/providers/index.ts`
- Added exports for PermissionProvider, Can, and usePermissionContext
- Enables centralized provider imports

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed formatCurrency import path**
- **Found during:** Build verification
- **Issue:** `apps/admin/src/pages/portal/plans/index.tsx` imported `formatCurrency` from `@/lib/utils` but function is in `@/lib/helpers/billing`
- **Fix:** Changed import to `@/lib/helpers/billing`
- **Files modified:** apps/admin/src/pages/portal/plans/index.tsx
- **Commit:** bbdcfa3

## Verification Results

- [x] Build succeeds: `npm run build` completed successfully
- [x] TypeScript compiles (warning about AbilityClass import is benign)
- [x] All 6 tasks executed
- [x] PermissionGuard component created
- [x] App.tsx wrapped with PermissionProvider
- [x] AppLayout checks permissions
- [x] Sidebar filters nav items by permission
- [x] Each task committed individually

## Commits

| Hash | Type | Description |
|------|------|-------------|
| ef431c6 | feat | create permission guard component |
| d98b0fc | feat | create guards index export |
| e36baf1 | feat | add permission checking to app layout |
| 4516506 | feat | filter sidebar navigation by permissions |
| 56f86a1 | feat | wrap app with permission provider |
| a41fad6 | feat | add permission provider to exports |
| bbdcfa3 | fix | correct formatCurrency import path |

## Technical Notes

### Permission Flow
1. User authenticates via AuthProvider
2. PermissionProvider maps database role to permission role
3. AppLayout checks if user can access current route
4. Sidebar filters nav items based on permission matrix
5. Unauthorized access redirects to role-specific default page

### Role-Based Behavior
- **Admin**: Full access to all pages, redirects to /dashboard
- **Tech**: Cannot access dashboard, redirects to /calendar
- **Client**: Redirected to /portal (separate client portal layout)

### Key Integration Points
- usePermissions hook provides canAccess, canAccessRoute, getRedirectPath
- routeToPageSubject maps URL paths to permission subjects
- Permission matrix from 01-01 defines access rules

## Next Phase Readiness

- [x] Route protection in place
- [x] Sidebar filtering functional
- [x] Permission provider integrated
- [ ] Ready for Plan 01-03 (if applicable)
- [ ] Ready for Plan 01-04 integration checkpoint

## Files Summary

**Created:**
- `apps/admin/src/components/guards/permission-guard.tsx` - Route protection guard
- `apps/admin/src/components/guards/index.ts` - Guard exports

**Modified:**
- `apps/admin/src/App.tsx` - Added PermissionProvider wrapper
- `apps/admin/src/components/layout/app-layout.tsx` - Added permission checking
- `apps/admin/src/components/layout/sidebar.tsx` - Added nav filtering
- `apps/admin/src/components/providers/index.ts` - Added permission exports
- `apps/admin/src/pages/portal/plans/index.tsx` - Fixed formatCurrency import
