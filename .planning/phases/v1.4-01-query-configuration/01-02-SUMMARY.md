---
phase: v1.4-01-query-configuration
plan: 02
subsystem: infra
tags: [react-query, cache, config, pricing, typescript]

# Dependency graph
requires:
  - 01-01 (Query Cache and App Configuration)
provides:
  - All hooks using centralized cache timing (STALE_STANDARD, STALE_FAST, STALE_ACTIVITY)
  - App.tsx QueryClient using DEFAULT_QUERY_OPTIONS
  - plan-editor.tsx using BUILDER_MARKUP from app-config
  - All validation/constants files using VENDOR_MARKUP from app-config
affects: [01-03, portal-components, work-order-components, billing-components]

# Tech tracking
tech-stack:
  added: []
  patterns: [centralized-config-consumption, config-derived-defaults]

key-files:
  created: []
  modified:
    - apps/admin/src/App.tsx
    - apps/admin/src/hooks/use-portal-dashboard.ts
    - apps/admin/src/hooks/use-activity-log.ts
    - apps/admin/src/hooks/use-notifications.ts
    - apps/admin/src/hooks/use-notification-preferences.ts
    - apps/admin/src/hooks/use-inspector-schedule.ts
    - apps/admin/src/hooks/use-checklist.ts
    - apps/admin/src/hooks/use-dashboard-overview.ts
    - apps/admin/src/hooks/use-dashboard-activity.ts
    - apps/admin/src/hooks/use-inspection-metrics.ts
    - apps/admin/src/hooks/use-work-order-metrics.ts
    - apps/admin/src/hooks/use-revenue-metrics.ts
    - apps/admin/src/components/portal/plan-editor/plan-editor.tsx
    - apps/admin/src/lib/constants/work-order.ts
    - apps/admin/src/components/billing/create-invoice-dialog.tsx
    - apps/admin/src/lib/validations/pricing.ts
    - apps/admin/src/lib/validations/program.ts
    - apps/admin/src/lib/validations/work-order.ts

key-decisions:
  - "All hooks import cache timing from @/lib/queries/config"
  - "BUILDER_MARKUP imported from app-config (not duplicated in plan-editor)"
  - "VENDOR_MARKUP used via VENDOR_MARKUP * 100 for percent-based defaults"
  - "DEFAULT_MARKUP_PERCENT in work-order.ts derived from VENDOR_MARKUP"

patterns-established:
  - "Hook cache config pattern: import STALE_* constants, use in staleTime option"
  - "Derived config pattern: DEFAULT_MARKUP_PERCENT = VENDOR_MARKUP * 100"
  - "Centralized import pattern: pricing components import from app-config.ts"

# Metrics
duration: 17min
completed: 2026-01-28
---

# Phase v1.4-01 Plan 02: Migrate to Centralized Configuration Summary

**Migrated all hooks (11) and components (6) to use centralized cache timing and pricing configuration, eliminating all hardcoded staleTime values and markup percentages**

## Performance

- **Duration:** 17 min
- **Started:** 2026-01-28T13:38:46Z
- **Completed:** 2026-01-28T13:55:45Z
- **Tasks:** 4
- **Files modified:** 18

## Accomplishments

- Updated App.tsx to use DEFAULT_QUERY_OPTIONS from centralized config
- Migrated 11 hooks to import cache timing constants (STALE_STANDARD, STALE_FAST, STALE_ACTIVITY)
- Updated plan-editor.tsx to use BUILDER_MARKUP from app-config.ts
- Migrated 5 files using vendor markup to use VENDOR_MARKUP from app-config.ts
- Zero hardcoded staleTime values remain in hooks
- Zero hardcoded 15% vendor markup values remain in validation/billing files

## Task Commits

Each task was committed atomically:

1. **Task 1: Update App.tsx QueryClient Configuration** - `9cae71b` (feat)
2. **Task 2: Update All Hooks with Hardcoded staleTime** - `ce0d511` (feat)
3. **Task 3: Update Plan Editor to Use Centralized Markup** - `633678a` (feat)
4. **Task 4: Migrate Hardcoded Vendor Markup to Config** - `c7ccd3d` (feat)

## Files Modified

### Task 1: App.tsx
- `apps/admin/src/App.tsx` - Import DEFAULT_QUERY_OPTIONS, use in QueryClient

### Task 2: Hooks (11 files)
- `apps/admin/src/hooks/use-portal-dashboard.ts` - STALE_STANDARD
- `apps/admin/src/hooks/use-activity-log.ts` - STALE_ACTIVITY
- `apps/admin/src/hooks/use-notifications.ts` - STALE_FAST (3 occurrences)
- `apps/admin/src/hooks/use-notification-preferences.ts` - STALE_STANDARD
- `apps/admin/src/hooks/use-inspector-schedule.ts` - STALE_STANDARD
- `apps/admin/src/hooks/use-checklist.ts` - STALE_STANDARD
- `apps/admin/src/hooks/use-dashboard-overview.ts` - STALE_STANDARD
- `apps/admin/src/hooks/use-dashboard-activity.ts` - STALE_ACTIVITY + STALE_STANDARD (3 occurrences)
- `apps/admin/src/hooks/use-inspection-metrics.ts` - STALE_STANDARD (4 occurrences)
- `apps/admin/src/hooks/use-work-order-metrics.ts` - STALE_STANDARD (4 occurrences)
- `apps/admin/src/hooks/use-revenue-metrics.ts` - STALE_STANDARD (3 occurrences)

### Task 3: Plan Editor
- `apps/admin/src/components/portal/plan-editor/plan-editor.tsx` - Import BUILDER_MARKUP from app-config

### Task 4: Vendor Markup (5 files)
- `apps/admin/src/lib/constants/work-order.ts` - DEFAULT_MARKUP_PERCENT = VENDOR_MARKUP * 100
- `apps/admin/src/components/billing/create-invoice-dialog.tsx` - useState default
- `apps/admin/src/lib/validations/pricing.ts` - pricingConfigDefaults
- `apps/admin/src/lib/validations/program.ts` - schema default + programDefaults
- `apps/admin/src/lib/validations/work-order.ts` - completeWorkOrderSchema default

## Decisions Made

1. **Hook imports use named constants** - Each hook imports only the specific STALE_* constant it needs
2. **VENDOR_MARKUP conversion** - Decimal (0.15) converted to percent (15) via `VENDOR_MARKUP * 100`
3. **DEFAULT_MARKUP_PERCENT derived** - In work-order.ts, derived from VENDOR_MARKUP for backward compatibility
4. **Preserved existing behavior** - All calculations produce identical results, just sourced from config

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Verification Results

All verification checks passed:

1. TypeScript compilation: PASS
2. No hardcoded staleTime in hooks: PASS
3. No hardcoded staleTime in App.tsx: PASS
4. No local BUILDER_MARKUP in plan-editor: PASS
5. No hardcoded vendor markup (0.15 or 15): PASS
6. Production build: PASS (built in 2m 23s)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All hooks now use centralized cache configuration
- Ready for Plan 01-03: Hook Standardization
- Config files established and consumed across codebase

---
*Phase: v1.4-01-query-configuration*
*Completed: 2026-01-28*
