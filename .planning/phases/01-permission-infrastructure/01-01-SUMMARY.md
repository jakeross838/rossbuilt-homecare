# Phase 1 Plan 01: Permission System Setup Summary

## One-liner

CASL-based permission infrastructure with role mapping (Admin/Client/Tech), permission matrix for 13 pages, and React hooks/provider for consuming permissions.

## What Was Built

### Role System (`lib/permissions/roles.ts`)
- `DatabaseRole` type mapping from Supabase enum (admin, manager, inspector, client)
- `PermissionRole` type for application use (Admin, Client, Tech)
- `mapDatabaseRoleToPermissionRole()` function for role conversion
- Helper functions: `isAdmin()`, `isStaff()`, `isClient()`

### Permission Matrix (`lib/permissions/matrix.ts`)
- `PageSubject` type for 13 protected pages
- `permissionMatrix` configuration defining access per role
- `getAllowedPages()` function for role-based page lists
- `canAccessPage()` function for access checking
- `getDefaultPageForRole()` for role-appropriate redirects
- `routeToPageSubject()` for URL to subject mapping

### CASL Ability Factory (`lib/permissions/ability.ts`)
- `PermissionAction` type (access, manage, read, create, update, delete)
- `AppAbility` type for typed ability instances
- `createAbilityForRole()` factory function
- `createEmptyAbility()` for loading states

### Permission Provider (`components/providers/permission-provider.tsx`)
- `PermissionContext` with ability, role, and loading state
- `PermissionProvider` component wrapping React context
- `Can` component from @casl/react for declarative checks
- `usePermissionContext()` hook for context access

### Permission Hook (`hooks/use-permissions.ts`)
- `usePermissions()` hook consolidating all permission logic
- `canAccess()` function for page checks
- `canAccessRoute()` function for URL-based checks
- `getRedirectPath()` for unauthorized redirects
- Boolean helpers: `isAdmin`, `isStaff`, `isClient`

## Commits

| Task | Type | Commit | Description |
|------|------|--------|-------------|
| 1 | chore | dd8b9a8 | Install CASL and jwt-decode dependencies |
| 2 | feat | 15a1b9b | Create role type definitions |
| 3 | feat | 0144622 | Create permission matrix |
| 4 | feat | 45062c4 | Create CASL ability factory |
| 5 | feat | 730f4c3 | Create permission provider |
| 6 | feat | 97bc5ce | Create permission hook |
| 7 | feat | c2b9cc0 | Create permission index exports |

## Files Created

```
apps/admin/src/lib/permissions/
├── ability.ts     # CASL ability factory
├── index.ts       # Module exports
├── matrix.ts      # Permission matrix configuration
└── roles.ts       # Role type definitions and mapping

apps/admin/src/hooks/
└── use-permissions.ts   # Permission checking hook

apps/admin/src/components/providers/
└── permission-provider.tsx   # CASL context provider
```

## Files Modified

```
apps/admin/package.json        # Added @casl/ability, @casl/react, jwt-decode
apps/admin/package-lock.json   # Updated lockfile
```

## Permission Matrix

| Page | Admin | Client | Tech |
|------|-------|--------|------|
| dashboard | Y | N | N |
| billing | Y | Y | Y |
| work-orders | Y | Y | Y |
| inspections | Y | Y | Y |
| calendar | Y | Y | Y |
| clients | Y | N | Y |
| properties | Y | N | Y |
| vendors | Y | N | Y |
| inspector | Y | N | Y |
| activity | Y | N | Y |
| notifications | Y | N | Y |
| settings | Y | N | Y |
| reports | Y | N | Y |

## Role Mapping

| Database Role | Permission Role |
|---------------|-----------------|
| admin | Admin |
| client | Client |
| manager | Tech |
| inspector | Tech |

## Dependencies Added

- `@casl/ability@6.8.0` - Core CASL permission library
- `@casl/react@5.0.1` - React bindings for CASL
- `jwt-decode@4.0.0` - Decode Supabase JWT for custom claims

## Verification

- [x] Dependencies installed and verified via `npm list`
- [x] TypeScript compiles without errors (`npx tsc --noEmit`)
- [x] All 6 files created in correct locations
- [x] Permission matrix matches requirements specification
- [x] Role mapping correctly handles all 4 database roles

## Deviations from Plan

None - plan executed exactly as written.

## Next Steps

Plan 01-02 will integrate this permission infrastructure:
1. Add `PermissionProvider` to application root
2. Create `ProtectedRoute` component using `usePermissions()`
3. Add permission guards to existing routes
4. Filter sidebar navigation by role
