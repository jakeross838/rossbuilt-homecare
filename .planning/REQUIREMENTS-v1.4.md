# Requirements: Home Care OS v1.4 - Sync Infrastructure Overhaul

**Milestone:** v1.4 Sync Infrastructure Overhaul
**Created:** 2026-01-28
**Status:** Active

## Overview

Overhaul the sync/data infrastructure to eliminate hardcoded values, fix inconsistent patterns, and implement "big dog" architecture principles used by Netflix, Stripe, and Airbnb.

## Core Problem

The current sync infrastructure has:
- Hardcoded staleTime values scattered across 15+ hooks
- Query key mismatches between hooks and realtime subscriptions
- N+1 query problems in portal (31-61 queries per page load)
- Inconsistent mutation patterns
- No centralized configuration

## Success Criteria

When this milestone is complete:
- [ ] All configuration values centralized (zero hardcoded magic numbers)
- [ ] Query keys unified in single registry
- [ ] Realtime sync covers ALL query keys (no missed invalidations)
- [ ] Portal pages use single aggregated queries (no N+1)
- [ ] Mutations follow optimistic UI pattern with rollback
- [ ] All buttons have loading/disabled states
- [ ] Two-tab sync test passes (change in Tab 1 appears in Tab 2 < 5 seconds)

---

## Requirements

### SYNC-01: Centralized Query Configuration ✅
**Priority:** HIGH
**Validation:** All staleTime/cacheTime values come from config file
**Status:** COMPLETE (2026-01-28)

- [x] SYNC-01.1: Create `src/lib/queries/config.ts` with all cache strategies
- [x] SYNC-01.2: Define constants: `STALE_REALTIME` (0ms), `STALE_FAST` (30s), `STALE_STANDARD` (5min)
- [x] SYNC-01.3: Remove all hardcoded `staleTime: 1000 * 60 * 5` from hooks
- [x] SYNC-01.4: Apply `staleTime: 0` to all realtime-synced tables
- [x] SYNC-01.5: Polling (refetchInterval) only for non-realtime data

### SYNC-02: Unified Query Key Registry ✅
**Priority:** HIGH
**Validation:** All query keys defined in single file
**Status:** COMPLETE (2026-01-28)

- [x] SYNC-02.1: Create `src/lib/queries/keys.ts` with all query key factories
- [x] SYNC-02.2: Migrate all hook-local keys to central registry
- [x] SYNC-02.3: Fix mismatched keys (`service-requests` vs `serviceRequests`)
- [x] SYNC-02.4: Add missing keys to realtime map (`calendar-inspections`, `property-inspections`)
- [x] SYNC-02.5: Export typed `QueryKeys` object for autocomplete

### SYNC-03: Realtime Subscription Alignment ✅
**Priority:** HIGH
**Validation:** Every query key has matching realtime invalidation
**Status:** COMPLETE (2026-01-28)

- [x] SYNC-03.1: Audit all 45 hooks for query keys used
- [x] SYNC-03.2: Update `queryKeyMap` in `use-realtime-sync.ts` to include ALL keys
- [x] SYNC-03.3: Add `inspector-workload`, `calendar-inspections`, `property-inspections`
- [x] SYNC-03.4: Verify realtime invalidation fires for each table change
- [x] SYNC-03.5: Add console logging for realtime events (toggleable via config)

### SYNC-04: Portal Query Optimization
**Priority:** HIGH
**Validation:** Portal properties page makes < 5 queries total

- [ ] SYNC-04.1: Create database view `portal_property_summaries` with counts pre-aggregated
- [ ] SYNC-04.2: Replace N+1 pattern in `usePortalProperties()` with single view query
- [ ] SYNC-04.3: Dashboard data fetched in parallel, not waterfall
- [ ] SYNC-04.4: Remove `Promise.all(properties.map(...))` anti-pattern
- [ ] SYNC-04.5: Verify < 5 queries per portal page load

### SYNC-05: Base Hook Templates
**Priority:** MEDIUM
**Validation:** All new hooks use base templates

- [ ] SYNC-05.1: Create `src/hooks/use-base-query.ts` with standard query pattern
- [ ] SYNC-05.2: Create `src/hooks/use-base-mutation.ts` with optimistic update pattern
- [ ] SYNC-05.3: Include automatic realtime subscription in base query
- [ ] SYNC-05.4: Include rollback on error in base mutation
- [ ] SYNC-05.5: Document pattern in code comments

### SYNC-06: Optimistic UI with Rollback
**Priority:** MEDIUM
**Validation:** Save operations show instant feedback

- [ ] SYNC-06.1: Implement `onMutate` for optimistic cache updates
- [ ] SYNC-06.2: Implement `onError` rollback to previous state
- [ ] SYNC-06.3: Implement `onSettled` to always refetch
- [ ] SYNC-06.4: Apply to all CRUD mutations (create/update/delete)
- [ ] SYNC-06.5: Show toast on success/error

### SYNC-07: Consistent Button States
**Priority:** MEDIUM
**Validation:** Every action button has loading state

- [ ] SYNC-07.1: Create `ActionButton` component with `isPending` prop
- [ ] SYNC-07.2: All mutation buttons use `disabled={isPending}`
- [ ] SYNC-07.3: All mutation buttons show loading text while pending
- [ ] SYNC-07.4: Audit portal pages for missing loading states
- [ ] SYNC-07.5: Audit admin pages for missing loading states

### SYNC-08: Standard Data States
**Priority:** MEDIUM
**Validation:** Every data page has loading/error/empty states

- [ ] SYNC-08.1: Create `LoadingState` component
- [ ] SYNC-08.2: Create `ErrorState` component with retry button
- [ ] SYNC-08.3: Create `EmptyState` component with action slot
- [ ] SYNC-08.4: Apply 3-state pattern to all portal pages
- [ ] SYNC-08.5: Apply 3-state pattern to all admin list pages

### SYNC-09: App Config Centralization ✅
**Priority:** LOW
**Validation:** Zero hardcoded business values in components
**Status:** COMPLETE (2026-01-28)

- [x] SYNC-09.1: Create `src/config/app-config.ts` for business rules
- [x] SYNC-09.2: Move pricing markup (20%) to config
- [x] SYNC-09.3: Move status labels/colors to config
- [x] SYNC-09.4: Move tier definitions to config
- [x] SYNC-09.5: Export helper functions (`calculatePrice`, `getStatusInfo`)

### SYNC-10: Error Boundary Enhancement
**Priority:** LOW
**Validation:** Errors caught and displayed gracefully

- [ ] SYNC-10.1: Wrap QueryClientProvider with error boundary
- [ ] SYNC-10.2: Add mutation error logging to console
- [ ] SYNC-10.3: Display user-friendly error messages
- [ ] SYNC-10.4: Add retry mechanism for failed queries
- [ ] SYNC-10.5: Never silently fail (fail loud principle)

---

## Out of Scope (v1.5+)

- Offline sync for portal users (currently inspector-only)
- Service worker caching strategies
- React Native mobile app sync
- Multi-region database replication
- GraphQL subscriptions

---

## Architecture Reference

The "Big Dog" 7 Principles to follow:

1. **Single Source of Truth (SSOT)** - Database → React Query → UI (never useState for server data)
2. **Unidirectional Data Flow** - User action → Database → Realtime → Cache → UI
3. **Optimistic UI with Rollback** - Show change immediately, rollback on error
4. **Defensive Programming** - Check before using, handle loading/error/empty
5. **Separation of Concerns** - Hooks fetch, components render, config stores values
6. **Consistent Patterns** - Same problem = same solution everywhere
7. **Fail Fast, Fail Loud** - Catch immediately, show clearly, log everything

---

## Testing Checklist

Before marking complete:
- [ ] Open app in 2 browser tabs
- [ ] Make change in Tab 1
- [ ] Verify change appears in Tab 2 (< 5 seconds)
- [ ] Make change, then refresh - change persists
- [ ] Console shows no red errors
- [ ] Every button has loading state
- [ ] Every page has loading/error/empty states

---

## Checkpoints

| Checkpoint | Criteria | Target |
|------------|----------|--------|
| Config Complete | SYNC-01 + SYNC-09 done | Phase 1 |
| Keys Unified | SYNC-02 + SYNC-03 done | Phase 2 |
| Portal Optimized | SYNC-04 done | Phase 3 |
| Patterns Applied | SYNC-05 + SYNC-06 + SYNC-07 + SYNC-08 done | Phase 4 |
| Polish | SYNC-10 done + testing passes | Phase 5 |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SYNC-01 | Phase 1 | ✅ Complete |
| SYNC-02 | Phase 2 | ✅ Complete |
| SYNC-03 | Phase 2 | ✅ Complete |
| SYNC-04 | Phase 3 | Pending |
| SYNC-05 | Phase 4 | Pending |
| SYNC-06 | Phase 4 | Pending |
| SYNC-07 | Phase 4 | Pending |
| SYNC-08 | Phase 4 | Pending |
| SYNC-09 | Phase 1 | ✅ Complete |
| SYNC-10 | Phase 5 | Pending |

**Coverage:**
- v1.4 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0 ✓

---

*Last updated: 2026-01-28*
