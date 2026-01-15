---
phase: 04-programs-pricing
plan: 02
subsystem: programs
tags: [react-query, typescript, hooks, supabase, pricing, programs]

# Dependency graph
requires:
  - phase: 04-01
    provides: Pricing and program validation schemas
provides:
  - usePricingConfig hook for fetching current pricing
  - useUpdatePricingConfig mutation with version control
  - calculateProgramPrice pure function for price breakdown
  - usePropertyProgram hook for property-specific program fetch
  - useCreateProgram mutation with fee calculation
  - Program lifecycle hooks (pause, resume, cancel)
affects: [04-03, 04-04, 04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Query key factory pattern for cache management
    - JSONB field casting through unknown for type safety
    - Lifecycle mutation hooks with timestamp management

key-files:
  created:
    - apps/admin/src/hooks/use-pricing.ts
    - apps/admin/src/hooks/use-programs.ts
  modified: []

key-decisions:
  - "Used InsertTables type helper for type-safe Supabase inserts"
  - "Cast JSONB fields through unknown to PricingConfig structure"
  - "Handle PGRST116 (no rows) gracefully in usePropertyProgram"

patterns-established:
  - "Pricing hook pattern: query, mutation, pure calculate function"
  - "Program lifecycle pattern: separate hooks for pause/resume/cancel"

# Metrics
duration: 4min
completed: 2026-01-15
---

# Phase 4 Plan 02: Program & Pricing Hooks Summary

**React Query hooks for pricing configuration CRUD and program lifecycle management with type-safe Supabase integration**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-15T00:05:00Z
- **Completed:** 2026-01-15T00:09:00Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments

- Created pricing hooks with query, mutation, and calculate function
- Built program CRUD hooks with full lifecycle management
- Established query key factory pattern for cache invalidation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create pricing hooks** - `cfeb479` (feat)
2. **Task 2: Create program hooks** - `752bf72` (feat)

## Files Created/Modified

- `apps/admin/src/hooks/use-pricing.ts` - usePricingConfig query, useUpdatePricingConfig mutation, calculateProgramPrice function
- `apps/admin/src/hooks/use-programs.ts` - usePropertyProgram, useCreateProgram, useUpdateProgram, usePauseProgram, useResumeProgram, useCancelProgram

## Decisions Made

- Used `InsertTables` type helper from supabase.ts for type-safe inserts
- Cast JSONB pricing fields through `unknown` to PricingConfig structure (following equipment pattern)
- Handle PGRST116 error code gracefully (no rows found) in usePropertyProgram
- Included organization_id from auth store for multi-tenant support

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Hooks ready for Program Builder UI (04-03)
- Hooks ready for Program Status Card (04-04)
- calculateProgramPrice available for real-time pricing display

---
*Phase: 04-programs-pricing*
*Completed: 2026-01-15*
