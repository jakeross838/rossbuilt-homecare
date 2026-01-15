---
phase: 04-programs-pricing
plan: 01
subsystem: pricing
tags: [zod, typescript, constants, validation, programs]

# Dependency graph
requires:
  - phase: 03-equipment-ai
    provides: Equipment constants and validation patterns
provides:
  - Pricing constants for frequencies, tiers, addons
  - PricingConfig Zod schema for pricing configuration
  - ProgramFormData Zod schema for program forms
affects: [04-02, 04-03, 04-04, 04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Constants with as const for type inference
    - Nested Zod schemas with z.coerce for form handling
    - Type exports inferred from schemas

key-files:
  created:
    - apps/admin/src/lib/constants/pricing.ts
    - apps/admin/src/lib/validations/pricing.ts
    - apps/admin/src/lib/validations/program.ts
  modified: []

key-decisions:
  - "Used as const for all constant arrays to enable type inference"
  - "Used z.coerce.number() for all numeric fields to handle form string inputs"

patterns-established:
  - "Pricing constants pattern: value/label/description objects with type exports"
  - "Tier progression pattern: each tier includes previous tier features"

# Metrics
duration: 3min
completed: 2026-01-15
---

# Phase 4 Plan 01: Pricing Foundation Summary

**Zod schemas and constants for inspection frequencies, tiers, addons, and program configuration with type-safe validation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-15T00:00:00Z
- **Completed:** 2026-01-15T00:03:00Z
- **Tasks:** 3
- **Files created:** 3

## Accomplishments

- Created comprehensive pricing constants with 5 frequencies, 4 tiers, 4 addons
- Established Zod schema for pricing configuration with nested objects
- Built program validation schema matching database structure

## Task Commits

Each task was committed atomically:

1. **Task 1: Create pricing constants** - `4b9f08c` (feat)
2. **Task 2: Create pricing configuration schema** - `ae46cf3` (feat)
3. **Task 3: Create program validation schema** - `c180f28` (feat)

## Files Created/Modified

- `apps/admin/src/lib/constants/pricing.ts` - Inspection frequencies, tiers, addons, days, time slots with type exports
- `apps/admin/src/lib/validations/pricing.ts` - PricingConfig Zod schema with nested objects for frequency/tier/addon/service pricing
- `apps/admin/src/lib/validations/program.ts` - ProgramFormData Zod schema with scheduling preferences and billing fields

## Decisions Made

- Used `as const` for all constant arrays to enable TypeScript literal type inference
- Used `z.coerce.number()` for all numeric fields to handle HTML form string inputs
- Added helper functions (defaults, transform) following equipment validation patterns
- Included `doesNotInclude` arrays for tier clarity in UI display

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Constants and schemas ready for hooks (04-02)
- Type exports available for form components (04-03)
- Validation ready for pricing settings page (04-05)

---
*Phase: 04-programs-pricing*
*Completed: 2026-01-15*
