---
phase: 01-database-auth
plan: 03
subsystem: database
tags: [invoices, billing, calendar, documents, notifications, settings, pricing, triggers, functions]

# Dependency graph
requires:
  - phase: 01-02
    provides: Domain schema (programs, equipment, inspections, work orders, service requests)
provides:
  - Invoices and payment tracking tables
  - Calendar events with RRULE recurrence
  - Documents and home manuals storage
  - Notifications with multi-channel delivery
  - Activity log for audit trail
  - Settings and pricing configuration
  - Auto-numbering functions for work orders, invoices, service requests
  - Pricing calculation function
  - Inspection duration calculation function
affects: [02-ui, 03-inspections, billing, reporting]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - JSONB for flexible configuration (pricing, time estimates)
    - RRULE format for calendar recurrence
    - Partial indexes for optimized queries
    - Trigger-based auto-numbering with sequences

key-files:
  created:
    - supabase/migrations/012_invoices.sql
    - supabase/migrations/013_calendar_reminders.sql
    - supabase/migrations/014_documents.sql
    - supabase/migrations/015_notifications_activity.sql
    - supabase/migrations/016_settings.sql
    - supabase/migrations/017_functions_triggers.sql
  modified: []

key-decisions:
  - "Used JSONB for pricing config to allow flexible tier/addon structure"
  - "Excluded documents and payments from updated_at trigger (insert-only tables)"
  - "Home manuals have UNIQUE constraint on property_id (one per property)"

# Metrics
duration: 3min
completed: 2026-01-14
---

# Phase 01 Plan 03: Billing & Supporting Schema Summary

**Invoices, calendar, documents, notifications, settings, and database functions/triggers completing the supporting infrastructure**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-14T17:06:00Z
- **Completed:** 2026-01-14T17:09:00Z
- **Tasks:** 6
- **Files modified:** 6

## Accomplishments

- Complete billing infrastructure with invoices, line items, and payments
- Calendar events supporting RRULE recurrence and Google Calendar sync
- Documents table with flexible entity associations
- Home manuals with one-per-property constraint and share token
- Notifications with multi-channel delivery tracking (email, push, SMS)
- Activity log for full audit trail
- Configurable pricing with JSONB structure
- Auto-numbering triggers for WO-, INV-, SR- prefixes
- Pricing and duration calculation functions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create invoices and billing schema migration** - `ddea417` (feat)
2. **Task 2: Create calendar and reminders schema migration** - `046edf9` (feat)
3. **Task 3: Create documents and home manuals schema migration** - `8f7d229` (feat)
4. **Task 4: Create notifications and activity log schema migration** - `9ddda62` (feat)
5. **Task 5: Create settings and pricing config schema migration** - `6683bb4` (feat)
6. **Task 6: Create functions and triggers migration** - `5cbdaa2` (feat)

## Files Created/Modified

- `supabase/migrations/012_invoices.sql` - Invoices, line items, payments tables with invoice_seq
- `supabase/migrations/013_calendar_reminders.sql` - Calendar events with RRULE, reminders
- `supabase/migrations/014_documents.sql` - Documents with flexible associations, home manuals
- `supabase/migrations/015_notifications_activity.sql` - Notifications, activity_log tables
- `supabase/migrations/016_settings.sql` - Settings key-value store, pricing_config
- `supabase/migrations/017_functions_triggers.sql` - Triggers and calculation functions

## Decisions Made

- Used JSONB for pricing configuration to allow flexible structure without schema changes
- Excluded certain tables from updated_at trigger (activity_log, notifications, documents - insert-only or no updates needed)
- Home manuals have UNIQUE constraint on property_id ensuring one manual per property
- Share token on home_manuals enables unauthenticated access for client sharing

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 17 schema migrations complete (001-017)
- Ready for 01-04 (RLS, Auth & Types)
- Tables support:
  - Full billing workflow (invoices, payments)
  - Calendar with recurrence
  - Document management
  - Activity tracking
  - Configurable pricing

---
*Phase: 01-database-auth*
*Completed: 2026-01-14*
