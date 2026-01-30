# Phase 3 Plan 02: Portal Hooks View Migration Summary

## One-liner

Replaced N+1 query anti-pattern in usePortalProperties with single view query, and optimized usePortalDashboard with parallel Promise.all fetching.

## What Was Built

### Task 1: Add View Query Key to Registry

Added `propertySummaries` key factory to `portalKeys` in `keys.ts`:

```typescript
propertySummaries: () => [...portalKeys.all, 'property-summaries'] as const,
```

This enables the new view-based query to have its own cache entry for targeted invalidation.

### Task 2: Rewrite usePortalProperties to Use View

Replaced the N+1 query pattern with a single view query:

**Before (N+1 pattern):**
- Query properties table
- For each property (Promise.all...map):
  - Query equipment count
  - Query work orders count
  - Query recommendations count
  - Query last inspection
  - Query next inspection
- Result: 1 + (N * 5) = 51+ queries for 10 properties

**After (single view query):**
- Query user_property_assignments (1)
- Query portal_property_summaries view (1)
- Result: 2 queries total regardless of property count

Key changes:
- Uses `portalKeys.propertySummaries()` for cache key
- Queries `portal_property_summaries` view with all pre-aggregated counts
- Maps view columns directly to `PortalProperty` type
- Uses `??` for null coalescing on count fields
- Added `staleTime: STALE_STANDARD` for consistent caching

### Task 3: Optimize usePortalDashboard for Parallel Fetching

Converted 5 sequential count queries into parallel execution:

**Before (sequential):**
```typescript
const { count: propertiesCount } = await supabase...
const { count: upcomingInspections } = await supabase...
const { count: openRequests } = await supabase...
const { count: pendingApprovals } = await supabase...
const { data: invoices } = await supabase...
```

**After (parallel):**
```typescript
const [
  propertiesResult,
  inspectionsResult,
  requestsResult,
  approvalsResult,
  invoicesResult,
] = await Promise.all([...])
```

This reduces latency from 5 sequential round-trips to 1 parallel batch.

## Key Decisions

1. **View mapping with null coalescing**: Used `s.equipment_count ?? 0` instead of `|| 0` for more explicit null handling
2. **Separate cache key for view query**: Created `propertySummaries()` key factory distinct from `properties()` to allow independent caching
3. **Preserved getClientPropertyIds helper**: Kept the existing multi-strategy property ID lookup (assignments, user_id, email) for backward compatibility

## Verification Results

- TypeScript compilation: PASSED (no errors)
- Production build: PASSED (1m 59s)
- No N+1 pattern: `Promise.all...map` removed from usePortalProperties
- View query: `portal_property_summaries` used for property fetching
- Parallel fetching: Promise.all used for 5 dashboard counts

## Files Modified

| File | Changes |
|------|---------|
| `apps/admin/src/lib/queries/keys.ts` | Added portalKeys.propertySummaries() factory |
| `apps/admin/src/hooks/use-portal-dashboard.ts` | Rewrote usePortalProperties to use view, optimized usePortalDashboard with Promise.all |

## Commits

| Hash | Description |
|------|-------------|
| `ea62366` | feat(03-02): add propertySummaries key factory to portalKeys |
| `26e9fc8` | feat(03-02): rewrite usePortalProperties to use database view |
| `6fa7f8a` | feat(03-02): optimize usePortalDashboard for parallel fetching |

## Duration

Total: ~5 minutes

## Deviations from Plan

None - plan executed exactly as written.

## Performance Impact

| Metric | Before | After |
|--------|--------|-------|
| Queries for 10 properties | 51+ | 2 |
| Dashboard queries | 5 sequential | 5 parallel |
| Network round-trips (properties) | 51+ | 2 |
| Network round-trips (dashboard) | 6 | 2 (1 for IDs + 1 parallel batch) |

## Next Steps

Plan 03-02 completes the portal hook optimization. Continue with remaining Phase 3 plans or verify phase completion.
