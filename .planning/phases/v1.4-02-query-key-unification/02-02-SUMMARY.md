---
phase: v1.4-02-query-key-unification
plan: 02
subsystem: api
tags: [react-query, hooks, cache-invalidation, query-keys]

# Dependency graph
requires:
  - phase: v1.4-02-query-key-unification
    provides: Centralized query key registry at src/lib/queries/keys.ts
provides:
  - 13 hooks migrated to use centralized query keys
  - Consistent cache invalidation patterns across hooks
  - Single source of truth for query key factories
affects: [v1.4-02-03, v1.4-02-04, realtime-subscriptions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Import query keys from @/lib/queries (not local definitions)
    - Use factory methods for cache invalidation (e.g., clientKeys.all instead of ['clients'])

key-files:
  created: []
  modified:
    - apps/admin/src/hooks/use-clients.ts
    - apps/admin/src/hooks/use-properties.ts
    - apps/admin/src/hooks/use-equipment.ts
    - apps/admin/src/hooks/use-users.ts
    - apps/admin/src/hooks/use-inspections.ts
    - apps/admin/src/hooks/use-inspectors.ts
    - apps/admin/src/hooks/use-inspection-templates.ts
    - apps/admin/src/hooks/use-checklist.ts
    - apps/admin/src/hooks/use-programs.ts
    - apps/admin/src/hooks/use-pricing.ts
    - apps/admin/src/hooks/use-organization.ts
    - apps/admin/src/hooks/use-profile.ts
    - apps/admin/src/hooks/use-property-assignments.ts

key-decisions:
  - "templateKeys used for inspection templates (centralized registry uses 'templates' root key)"
  - "Inline key strings replaced with factory calls for consistency"
  - "Cross-hook key imports consolidated to @/lib/queries"

patterns-established:
  - "Query key imports always from @/lib/queries, never local definitions"
  - "Use factory methods for invalidation (inspectionKeys.detail(id) instead of ['inspection', id])"

# Metrics
duration: 15min
completed: 2026-01-28
---

# Phase v1.4-02 Plan 02: Hook Migration Summary

**Migrated 13 core hooks to use centralized query keys from @/lib/queries, removing 143 lines of local key definitions**

## Performance

- **Duration:** 15 min
- **Started:** 2026-01-28T14:54:02Z
- **Completed:** 2026-01-28T15:09:32Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments
- Migrated all core entity hooks (clients, properties, equipment, users) to centralized keys
- Migrated all inspection-related hooks to centralized keys
- Migrated all program/config hooks to centralized keys
- Replaced inline key strings with factory method calls
- Consolidated cross-hook key imports to single import statement

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate core entity hooks** - `21fc80b` (feat)
2. **Task 2: Migrate inspection-related hooks** - `b4de120` (feat)
3. **Task 3: Migrate program/config hooks** - `1d5840f` (feat)

## Files Created/Modified

### Task 1: Core Entity Hooks
- `apps/admin/src/hooks/use-clients.ts` - Import clientKeys from @/lib/queries
- `apps/admin/src/hooks/use-properties.ts` - Import clientKeys, propertyKeys from @/lib/queries
- `apps/admin/src/hooks/use-equipment.ts` - Import equipmentKeys from @/lib/queries
- `apps/admin/src/hooks/use-users.ts` - Import userKeys, clientKeys from @/lib/queries

### Task 2: Inspection-Related Hooks
- `apps/admin/src/hooks/use-inspections.ts` - Import inspectionKeys, replace inline keys
- `apps/admin/src/hooks/use-inspectors.ts` - Import inspectorKeys from @/lib/queries
- `apps/admin/src/hooks/use-inspection-templates.ts` - Import templateKeys from @/lib/queries
- `apps/admin/src/hooks/use-checklist.ts` - Import checklistKeys from @/lib/queries

### Task 3: Program/Config Hooks
- `apps/admin/src/hooks/use-programs.ts` - Import programKeys, invoiceKeys, portalKeys, propertyKeys
- `apps/admin/src/hooks/use-pricing.ts` - Import pricingKeys from @/lib/queries
- `apps/admin/src/hooks/use-organization.ts` - Import organizationKeys from @/lib/queries
- `apps/admin/src/hooks/use-profile.ts` - Import profileKeys from @/lib/queries
- `apps/admin/src/hooks/use-property-assignments.ts` - Import assignmentKeys, userKeys

## Decisions Made

1. **templateKeys naming:** The centralized registry uses `templateKeys` with root `['templates']` instead of the local `inspectionTemplateKeys` with root `['inspection_templates']`. This is a valid change as it aligns with the centralized naming convention.

2. **Inline key replacement:** Replaced inline key arrays like `['calendar-inspections']` with factory calls like `inspectionKeys.calendar()` for consistency, even when the key structure is identical.

3. **Cross-hook imports:** Hooks that previously imported from sibling hooks (e.g., `use-properties.ts` importing `clientKeys` from `./use-clients`) now import from `@/lib/queries`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all migrations completed successfully with no type errors.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 13 core hooks migrated and verified
- 36 total hooks now import from `@/lib/queries`
- TypeScript compiles without errors
- Production build successful
- Ready for remaining hook migrations in plans 02-03 and 02-04

---
*Phase: v1.4-02-query-key-unification*
*Completed: 2026-01-28*
