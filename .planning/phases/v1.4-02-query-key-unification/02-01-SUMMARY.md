---
phase: v1.4-02-query-key-unification
plan: 01
subsystem: queries
tags: [react-query, cache, keys, typescript]

dependency-graph:
  requires: [v1.4-01-query-configuration]
  provides: [centralized-query-keys, query-keys-registry]
  affects: [v1.4-02-02-hook-migration, realtime-sync]

tech-stack:
  added: []
  patterns:
    - Hierarchical query key factories
    - Kebab-case root key naming
    - Type-safe QueryKeys export

key-files:
  created:
    - apps/admin/src/lib/queries/keys.ts
    - apps/admin/src/lib/queries/index.ts
  modified: []

decisions:
  - id: query-key-naming
    choice: "Kebab-case for root keys (e.g., 'service-requests', 'work-orders')"
    reason: "Consistent with URL patterns and prevents camelCase/dash confusion"
  - id: individual-exports
    choice: "Export each key factory individually plus combined queryKeys object"
    reason: "Enables gradual migration while preserving backwards compatibility"
  - id: type-export
    choice: "Export QueryKeys type for autocomplete"
    reason: "Enables IDE autocomplete like queryKeys.clients.list({})"

metrics:
  duration: 5 min
  completed: 2026-01-28
---

# Phase v1.4-02 Plan 01: Query Key Registry Summary

Centralized query key registry with 30+ key factories for type-safe cache management.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create centralized query key registry | 3002b7c | keys.ts (497 lines) |
| 2 | Create barrel export for queries module | 2604733 | index.ts |

## What Was Built

### Query Key Registry (`keys.ts`)

Created comprehensive query key registry containing all key factories:

**Core Entities (4):**
- `clientKeys` - clients list, detail, search
- `propertyKeys` - properties list, detail, filters
- `equipmentKeys` - equipment by property, detail
- `userKeys` - users list, detail, profile

**Inspections (5):**
- `inspectionKeys` - calendar, detail, property inspections
- `inspectorKeys` - inspector list, workload, schedule
- `inspectorScheduleKeys` - mobile PWA schedule queries
- `templateKeys` - inspection templates
- `checklistKeys` - generated checklists

**Reports & Metrics (6):**
- `reportKeys` - inspection report data
- `recommendationKeys` - recommendations by inspection/property
- `inspectionMetricKeys` - inspection analytics
- `workOrderMetricKeys` - work order analytics
- `revenueMetricKeys` - revenue analytics
- `dashboardKeys` - dashboard overview

**Work Orders & Vendors (2):**
- `workOrderKeys` - work orders with comprehensive filters
- `vendorKeys` - vendors, compliance, search

**Billing (2):**
- `invoiceKeys` - invoices, summary, billable items
- `paymentKeys` - payments by invoice/client

**Programs & Pricing (2):**
- `programKeys` - programs by property
- `pricingKeys` - pricing configuration

**Notifications & Activity (3):**
- `notificationKeys` - notifications, unread count, summary
- `preferencesKeys` - user notification preferences
- `activityKeys` - activity log, entity activity

**Portal (2):**
- `portalKeys` - client portal dashboard, properties, inspections
- `serviceRequestKeys` - service requests with comments

**Misc (4):**
- `organizationKeys` - organization data
- `profileKeys` - user profile
- `assignmentKeys` - property assignments
- `photoKeys` - offline photo storage

### Barrel Export (`index.ts`)

Clean re-export enabling:
```typescript
import { queryKeys, STALE_STANDARD, getCacheConfig } from '@/lib/queries'
```

## Key Design Decisions

### Kebab-Case Root Keys

All root keys use kebab-case for consistency:
- `['service-requests']` not `['serviceRequests']`
- `['work-orders']` not `['workOrders']`
- `['activity-log']` not `['activityLog']`

### Factory Pattern

Each key factory follows consistent structure:
```typescript
export const entityKeys = {
  all: ['entity'] as const,
  lists: () => [...entityKeys.all, 'list'] as const,
  list: (filters) => [...entityKeys.lists(), filters] as const,
  details: () => [...entityKeys.all, 'detail'] as const,
  detail: (id: string) => [...entityKeys.details(), id] as const,
}
```

### Type Safety

- All factories use `as const` for literal types
- `QueryKeys` type export enables autocomplete
- Filter objects typed appropriately per entity

## Verification Results

- [x] TypeScript compiles without errors
- [x] keys.ts has 497 lines (exceeds 150 minimum)
- [x] 30 individual key factories exported
- [x] Combined `queryKeys` object exported
- [x] `QueryKeys` type exported
- [x] Production build successful

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Ready for Plan 02-02: Hook Migration to centralized keys.

### Migration Impact

All hooks currently define their own key factories locally. Plan 02-02 will:
1. Update hooks to import from `@/lib/queries`
2. Remove local key factory definitions
3. Ensure cache invalidation uses imported factories

### No Blockers

All prerequisites complete from Phase 1 (Query Configuration).
