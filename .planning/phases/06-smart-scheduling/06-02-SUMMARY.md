# 06-02 Summary: Inspector Availability Hooks

## Status: COMPLETE

## What Was Built

Created React Query hooks for fetching inspector data and availability information.

### File Created

**`apps/admin/src/hooks/use-inspectors.ts`**

Three hooks exported:

1. **`useInspectors()`** - Fetches all active users with role='inspector' from the organization
   - Filters by organization_id, role='inspector', is_active=true
   - Orders by last_name, then first_name
   - Returns full user objects

2. **`useInspectorWorkload(startDate, endDate)`** - Aggregates inspection counts by inspector and date
   - Queries inspections table with joins to users
   - Filters by date range and status (scheduled, in_progress)
   - Returns aggregated data: inspector_id, inspector_name, date, inspection_count, total_duration_minutes

3. **`useInspectorSchedule(inspectorId, date)`** - Gets inspections for a specific inspector on a date
   - Joins to properties table for location details
   - Returns inspection details including property information
   - Ordered by scheduled_time_start

### Patterns Followed

- Consistent with existing hooks (use-clients.ts, use-properties.ts, use-equipment.ts)
- Uses organization_id filtering from auth store
- Type assertion via unknown for joined tables (consistent with prior decisions)
- Query keys defined for cache management
- Proper enabled conditions to prevent unnecessary queries

## Verification

- [x] TypeScript compiles: `cd apps/admin && npx tsc --noEmit` passes
- [x] useInspectors hook fetches users with role='inspector'
- [x] useInspectorWorkload aggregates inspection counts by inspector/date
- [x] useInspectorSchedule fetches inspections for a specific inspector/date

## Integration Notes

These hooks enable the inspector assignment UI to:
- Display a list of available inspectors
- Show workload per inspector per day for capacity planning
- View an inspector's schedule for a specific date to avoid conflicts
