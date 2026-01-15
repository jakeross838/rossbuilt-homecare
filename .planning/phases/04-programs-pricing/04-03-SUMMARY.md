---
phase: 04-programs-pricing
plan: 03
subsystem: programs
tags: [react, typescript, react-hook-form, radix-ui, wizard, pricing]

# Dependency graph
requires:
  - phase: 04-01
    provides: Pricing constants and schemas
  - phase: 04-02
    provides: Pricing and program hooks
provides:
  - ProgramBuilder 4-step wizard component
  - RadioGroup UI component
affects: [04-05]

# Tech tracking
tech-stack:
  added:
    - "@radix-ui/react-radio-group"
  patterns:
    - Form wizard pattern with step indicators
    - Real-time pricing calculation on selection change
    - RadioGroup with visual card selection pattern

key-files:
  created:
    - apps/admin/src/components/programs/program-builder.tsx
    - apps/admin/src/components/ui/radio-group.tsx
  modified:
    - apps/admin/src/components/programs/index.ts

key-decisions:
  - "Used Resolver type cast for zod v4 compatibility with react-hook-form"
  - "Embedded inspector query in component vs separate useUsers hook"
  - "RadioGroup with sr-only items for card-based visual selection"

patterns-established:
  - "Program wizard pattern: 4-step card-based form with real-time pricing"
  - "Visual selection pattern: RadioGroup items hidden, Label styled as selectable card"

# Metrics
duration: 7min
completed: 2026-01-15
---

# Phase 4 Plan 03: Program Builder UI Summary

**4-step wizard component for creating home care programs with real-time pricing calculation and visual selection cards**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-15T00:15:00Z
- **Completed:** 2026-01-15T00:22:00Z
- **Tasks:** 2
- **Files created:** 2
- **Files modified:** 1

## Accomplishments

- Built 4-step Program Builder wizard with visual card selection
- Step 1: Frequency selection with 5 options in grid layout
- Step 2: Tier selection with feature details and expandable view
- Step 3: Add-on services with toggleable checkbox cards
- Step 4: Scheduling preferences (day, time, inspector)
- Real-time pricing summary that updates on selection changes
- Added RadioGroup UI component following shadcn/ui patterns

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Program Builder component** - `8e94139` (feat)
2. **Task 2: Add barrel export** - `f1fb764` (feat)

## Files Created/Modified

- `apps/admin/src/components/programs/program-builder.tsx` - 4-step wizard with pricing calculation
- `apps/admin/src/components/ui/radio-group.tsx` - RadioGroup component (shadcn/ui pattern)
- `apps/admin/src/components/programs/index.ts` - Added ProgramBuilder export

## Decisions Made

- Used `Resolver<ProgramFormData>` type cast to resolve zod v4 compatibility issue with react-hook-form (following existing property-form.tsx pattern)
- Embedded inspector query directly in component using useQuery rather than creating separate useUsers hook (simpler for single use case)
- RadioGroup items use sr-only class to hide radio circle, allowing Label to act as full visual card selector

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added RadioGroup UI component**
- **Found during:** Task 1 (Program Builder implementation)
- **Issue:** RadioGroup component did not exist in the UI library but was required for frequency/tier selection
- **Fix:** Created radio-group.tsx following shadcn/ui patterns, added @radix-ui/react-radio-group dependency
- **Files modified:** apps/admin/src/components/ui/radio-group.tsx, package.json
- **Verification:** Build compiles successfully
- **Committed in:** 8e94139 (Task 1 commit)

**2. [Rule 3 - Blocking] Fixed zod v4 resolver type incompatibility**
- **Found during:** Task 1 (Build verification)
- **Issue:** TypeScript error with zodResolver due to zod v4 type changes
- **Fix:** Added type cast `as Resolver<ProgramFormData>` following existing pattern in property-form.tsx
- **Files modified:** apps/admin/src/components/programs/program-builder.tsx
- **Verification:** Build compiles successfully
- **Committed in:** 8e94139 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes necessary to unblock task completion. No scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ProgramBuilder ready for integration into property detail page (04-05)
- Component can be used with propertyId, clientId, propertyName props
- Real-time pricing works with usePricingConfig hook

---
*Phase: 04-programs-pricing*
*Completed: 2026-01-15*
