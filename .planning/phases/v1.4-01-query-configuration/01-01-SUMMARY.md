---
phase: v1.4-01-query-configuration
plan: 01
subsystem: infra
tags: [react-query, cache, config, typescript]

# Dependency graph
requires: []
provides:
  - Query cache timing constants (STALE_REALTIME, STALE_FAST, STALE_STANDARD, STALE_ACTIVITY)
  - getCacheConfig helper for consistent cache strategy selection
  - DEFAULT_QUERY_OPTIONS for QueryClient initialization
  - Centralized business configuration (BUILDER_MARKUP, VENDOR_MARKUP)
  - Price calculation helpers (calculateClientPrice, calculateVendorMarkup)
  - Re-exports for WORK_ORDER_STATUS, PRIORITY_LEVELS (SYNC-09.3)
  - Re-exports for INSPECTION_TIERS, INSPECTION_FREQUENCIES (SYNC-09.4)
  - Feature flags, pagination defaults, timeout constants
affects: [01-02, 01-03, all-hooks-using-react-query, pricing-components]

# Tech tracking
tech-stack:
  added: []
  patterns: [centralized-config, cache-strategy-helper, re-export-aggregation]

key-files:
  created:
    - apps/admin/src/lib/queries/config.ts
    - apps/admin/src/config/app-config.ts
  modified: []

key-decisions:
  - "Cache timing constants follow semantic naming (STALE_REALTIME for realtime-synced, STALE_STANDARD for 5min default)"
  - "getCacheConfig helper provides consistent cache strategy application across hooks"
  - "app-config.ts re-exports status/tier constants for centralized access pattern"
  - "BUILDER_MARKUP (20%) and VENDOR_MARKUP (15%) centralized for consistency"

patterns-established:
  - "Cache strategy pattern: Use getCacheConfig('realtime'|'fast'|'activity'|'standard') in hooks"
  - "Config re-export pattern: Import from app-config.ts for centralized access"
  - "Business constant pattern: Named exports with calculation helpers"

# Metrics
duration: 5min
completed: 2026-01-28
---

# Phase v1.4-01 Plan 01: Query Cache and App Configuration Summary

**Centralized cache timing constants (STALE_REALTIME/FAST/ACTIVITY/STANDARD) with getCacheConfig helper, plus business config with BUILDER_MARKUP (20%), VENDOR_MARKUP (15%), and status/tier re-exports**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-28T08:25:00Z
- **Completed:** 2026-01-28T08:30:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created query cache configuration with semantic timing constants for React Query
- Created app configuration centralizing business rules and markup percentages
- Established re-export pattern for status configs (SYNC-09.3) and tier definitions (SYNC-09.4)
- Added helper functions for consistent cache strategy selection and price calculations

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Query Cache Configuration** - `0a6ce6e` (feat)
2. **Task 2: Create App Configuration File** - `d3a77f8` (feat)

## Files Created/Modified
- `apps/admin/src/lib/queries/config.ts` - Cache timing constants and getCacheConfig helper
- `apps/admin/src/config/app-config.ts` - Business config, markup values, re-exports

## Decisions Made
- Used semantic naming for cache constants (STALE_REALTIME, STALE_FAST, STALE_ACTIVITY, STALE_STANDARD)
- Set default staleTime to 5 minutes for standard data, 0 for realtime-synced
- Used re-export pattern in app-config.ts to aggregate constants from specialized files
- BUILDER_MARKUP at 20% and VENDOR_MARKUP at 15% as decimal values (0.20, 0.15)

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Query cache configuration ready for hook integration in Plan 01-02
- App configuration ready for component consumption
- All exports compile cleanly and are importable

---
*Phase: v1.4-01-query-configuration*
*Completed: 2026-01-28*
