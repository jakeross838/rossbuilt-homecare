---
phase: v1.4-04-pattern-templates
plan: 01
subsystem: hooks
tags: [react-query, realtime, optimistic-ui, typescript]

dependency_graph:
  requires: [v1.4-01-query-configuration, v1.4-02-query-key-unification]
  provides: [base-hook-templates, optimistic-mutation-pattern]
  affects: [v1.5-migration]

tech_stack:
  added: []
  patterns:
    - useBaseQuery hook factory with automatic realtime subscription
    - useOptimisticMutation with rollback pattern
    - Hooks barrel export for convenient imports

key_files:
  created:
    - apps/admin/src/hooks/use-base-query.ts
    - apps/admin/src/hooks/use-base-mutation.ts
    - apps/admin/src/hooks/index.ts
  modified:
    - apps/admin/src/hooks/use-clients.ts

decisions:
  - id: "04-01-01"
    description: "TableName type duplicated in use-base-query.ts for type-safety"
    rationale: "Avoid circular dependency with use-realtime-sync.ts while maintaining type-safety"
  - id: "04-01-02"
    description: "useBaseList and useBaseDetail default to 'realtime' cache strategy"
    rationale: "List and detail views benefit from live updates by default"
  - id: "04-01-03"
    description: "useOptimisticMutation always refetches on settled"
    rationale: "Ensures server state consistency even after optimistic updates"
  - id: "04-01-04"
    description: "Only useUpdateClient migrated as proof-of-concept"
    rationale: "Full migration deferred to v1.5 to minimize risk in this phase"

metrics:
  duration: "7 minutes"
  completed: "2026-02-02"
---

# Phase v1.4-04 Plan 01: Base Hook Templates Summary

**One-liner:** Created base hook templates with standardized cache timing, automatic realtime subscription, and optimistic UI with rollback pattern.

## What Was Built

### 1. Base Query Hook (use-base-query.ts)

Created a standardized query hook factory that provides:

- **useBaseQuery**: Core query hook with cache strategy selection and optional realtime subscription
- **useBaseList**: Specialized for list queries, defaults to realtime cache strategy
- **useBaseDetail**: Specialized for detail queries with automatic id-based enabling

Key features:
- Integrates `getCacheConfig()` for consistent cache timing
- Automatic realtime subscription via `realtimeTable` option (SYNC-05.3)
- Full JSDoc documentation with usage examples
- Type-safe with proper generics

### 2. Base Mutation Hook (use-base-mutation.ts)

Created an optimistic mutation hook factory that provides:

- **useBaseMutation**: Standard mutation with toast notifications
- **useOptimisticMutation**: Full optimistic UI pattern implementation

Optimistic UI pattern (SYNC-06):
1. **onMutate**: Snapshot current cache and apply optimistic update (SYNC-06.1)
2. **onError**: Automatic rollback to previous state (SYNC-06.2)
3. **onSettled**: Always refetch to ensure consistency (SYNC-06.3)
4. **Toast notifications**: Success/error feedback (SYNC-06.5)

### 3. Hooks Barrel Export (index.ts)

Created barrel export for convenient imports:
```typescript
import { useBaseQuery, useOptimisticMutation } from '@/hooks'
```

### 4. Proof-of-Concept Migration

Migrated `useUpdateClient` in use-clients.ts to demonstrate the optimistic mutation pattern:
- Replaced raw `useMutation` with `useOptimisticMutation`
- Added `updateCache` function for optimistic list updates
- Added success/error toast messages

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 233a422 | feat | create base query hook with realtime subscription |
| 3ca4c7c | feat | create base mutation hook with optimistic UI |
| a10ea44 | chore | create hooks barrel export |
| f696278 | feat | migrate useUpdateClient to optimistic mutation |

## Files Changed

**Created:**
- `apps/admin/src/hooks/use-base-query.ts` (143 lines)
- `apps/admin/src/hooks/use-base-mutation.ts` (196 lines)
- `apps/admin/src/hooks/index.ts` (14 lines)

**Modified:**
- `apps/admin/src/hooks/use-clients.ts` (+22, -13 lines)

## Verification Results

- [x] use-base-query.ts exists with useBaseQuery, useBaseList, useBaseDetail exports
- [x] use-base-query.ts includes automatic realtime subscription via realtimeTable option (SYNC-05.3)
- [x] use-base-mutation.ts exists with useBaseMutation, useOptimisticMutation exports
- [x] Optimistic mutation implements onMutate, onError (rollback), onSettled (refetch)
- [x] Toast notifications fire on success/error
- [x] useUpdateClient migrated to useOptimisticMutation as proof-of-concept (SYNC-06.4)
- [x] TypeScript compiles without errors
- [x] Production build succeeds (1m 39s)

## Deviations from Plan

None - plan executed exactly as written.

## Usage Examples

### Base Query with Realtime

```typescript
const { data: clients, isLoading } = useBaseQuery({
  queryKey: clientKeys.list({}),
  queryFn: () => fetchClients(),
  cacheStrategy: 'realtime',
  realtimeTable: 'clients',
})
```

### Optimistic Mutation

```typescript
const updateClient = useOptimisticMutation<Client, Error, UpdateVars, Client[]>({
  mutationFn: ({ id, data }) => updateClientInDb(id, data),
  queryKey: clientKeys.list({}),
  updateCache: (oldData, { id, data }) =>
    oldData?.map(c => c.id === id ? { ...c, ...data } : c) ?? [],
  successMessage: 'Client updated successfully',
})
```

## Next Phase Readiness

Phase 4 Plan 01 complete. Base hook templates are ready for:
- v1.5: Full migration of all CRUD hooks to use base patterns
- Additional domain hooks can now use standardized patterns

No blockers or concerns for next steps.
