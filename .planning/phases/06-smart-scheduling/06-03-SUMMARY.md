# 06-03 Summary: Inspection React Query Hooks

## Completed Tasks

### Task 1: Created Inspection Query Hooks
- **useCalendarInspections(startDate, endDate)**: Fetches inspections for a date range with property and inspector joins, transforms to CalendarInspection type
- **useInspection(id)**: Fetches single inspection by ID with full details including property, inspector, and program relations; handles PGRST116 gracefully
- **usePropertyInspections(propertyId)**: Fetches recent inspections for a property with inspector info, limited to 10 results

### Task 2: Created Inspection Mutation Hooks
- **useScheduleInspection()**: Creates new inspection with organization context, all required fields, and defaults status to 'scheduled'
- **useRescheduleInspection()**: Updates date/time/inspector and sets status to 'rescheduled'
- **useCancelInspection()**: Sets inspection status to 'cancelled'
- **useAssignInspector()**: Assigns or unassigns an inspector to an inspection

## Files Created
- `apps/admin/src/hooks/use-inspections.ts` - Complete inspection CRUD hooks

## Key Implementation Details

### Type Safety
- Uses `CalendarInspection` type from `@/lib/types/scheduling`
- Uses `ScheduleInspectionInput` and `RescheduleInspectionInput` from `@/lib/validations/inspection`
- Type assertion via `unknown` for joined tables (per project pattern from 03-03)

### Query Key Structure
```typescript
export const inspectionKeys = {
  all: ['inspections'] as const,
  calendar: (startDate, endDate) => ['calendar-inspections', startDate, endDate],
  detail: (id) => ['inspection', id],
  property: (propertyId) => ['property-inspections', propertyId],
  inspectorWorkload: () => ['inspector-workload'],
}
```

### Cache Invalidation Strategy
All mutations invalidate relevant queries:
- `calendar-inspections` - Updated on all mutations
- `property-inspections` - Updated on schedule/reschedule/cancel
- `inspection` (detail) - Updated on reschedule/cancel/assign
- `inspector-workload` - Updated on all mutations for workload recalculation

## Verification
- TypeScript compilation: PASSED (`npx tsc --noEmit`)
- All hooks follow existing patterns from `use-programs.ts`
- PGRST116 error handling implemented for missing records

## Dependencies
- Depends on 06-01 (types and validation schemas)
- Consumed by calendar components (06-04, 06-05)

## Next Steps
This file provides the data layer for:
- Calendar view fetching inspections by date range
- Scheduling modal for creating new inspections
- Reschedule/cancel operations from calendar UI
- Inspector assignment functionality
