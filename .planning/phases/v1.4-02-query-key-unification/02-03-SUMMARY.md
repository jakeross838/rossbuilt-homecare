---
phase: v1.4-02-query-key-unification
plan: 03
subsystem: hooks
tags: [query-keys, react-query, migration, billing, work-orders, notifications]

dependency-graph:
  requires:
    - 02-01 (Query Key Registry)
  provides:
    - Billing hooks using centralized keys
    - Work order/vendor hooks using centralized keys
    - Notification/activity hooks using centralized keys
    - Service request hooks using centralized keys
  affects:
    - 02-05 (Final verification)

tech-stack:
  patterns:
    - Centralized query key imports from @/lib/queries
    - Removed local key factory definitions
    - Cross-file imports now use centralized registry

file-tracking:
  modified:
    - apps/admin/src/hooks/use-work-orders.ts
    - apps/admin/src/hooks/use-vendors.ts
    - apps/admin/src/hooks/use-invoices.ts
    - apps/admin/src/hooks/use-payments.ts
    - apps/admin/src/hooks/use-notifications.ts
    - apps/admin/src/hooks/use-notification-preferences.ts
    - apps/admin/src/hooks/use-activity-log.ts
    - apps/admin/src/hooks/use-service-requests.ts

decisions:
  - key: billing-keys-import
    choice: Import invoiceKeys, paymentKeys from @/lib/queries
    rationale: Centralizes billing-related cache invalidation
  - key: work-order-keys-import
    choice: Import workOrderKeys, vendorKeys, recommendationKeys from @/lib/queries
    rationale: Enables consistent cross-entity invalidation
  - key: notification-keys-import
    choice: Import notificationKeys, preferencesKeys, activityKeys from @/lib/queries
    rationale: Unifies notification subsystem cache management
  - key: service-request-keys-import
    choice: Import serviceRequestKeys, portalKeys from @/lib/queries
    rationale: Centralizes portal-related key management

metrics:
  duration: 12m
  completed: 2026-01-28
---

# Phase v1.4-02 Plan 03: Billing & Operations Hook Migration Summary

**One-liner:** Migrated 8 hooks (billing, work orders, vendors, notifications, service requests) to centralized query key registry.

## What Was Built

### Task 1: Work Order and Vendor Hooks Migration

**Files Modified:**
- `apps/admin/src/hooks/use-work-orders.ts`
- `apps/admin/src/hooks/use-vendors.ts`

**Changes:**
- Removed local `workOrderKeys` definition (lines 21-30)
- Removed local `vendorKeys` definition (lines 23-32)
- Added import: `import { workOrderKeys, vendorKeys, recommendationKeys } from '@/lib/queries'`
- Updated inline key usages:
  - `['recommendations']` -> `recommendationKeys.all`
  - `['vendors']` -> `vendorKeys.all`

### Task 2: Billing Hooks Migration

**Files Modified:**
- `apps/admin/src/hooks/use-invoices.ts`
- `apps/admin/src/hooks/use-payments.ts`

**Changes:**
- Removed local `invoiceKeys` definition from use-invoices.ts (lines 27-35)
- Removed local `paymentKeys` definition from use-payments.ts (lines 30-36)
- Updated import in use-payments.ts from `import { invoiceKeys } from './use-invoices'` to `import { paymentKeys, invoiceKeys } from '@/lib/queries'`

### Task 3: Notification and Service Request Hooks Migration

**Files Modified:**
- `apps/admin/src/hooks/use-notifications.ts`
- `apps/admin/src/hooks/use-notification-preferences.ts`
- `apps/admin/src/hooks/use-activity-log.ts`
- `apps/admin/src/hooks/use-service-requests.ts`

**Changes:**
- Removed local `notificationKeys` definition (lines 17-25)
- Removed local `preferencesKeys` definition (lines 11-14)
- Removed local `activityKeys` definition (lines 14-22)
- Removed local `serviceRequestKeys` definition (lines 12-21)
- Updated portalKeys import from `import { portalKeys } from './use-portal-dashboard'` to `import { serviceRequestKeys, portalKeys } from '@/lib/queries'`

## Verification Results

| Check | Status |
|-------|--------|
| TypeScript compilation | PASSED |
| No local key definitions in migrated hooks | PASSED |
| Production build | PASSED (2m 1s) |
| All 8 hooks import from @/lib/queries | PASSED |

## Commits

| Hash | Description |
|------|-------------|
| 6853d16 | feat(02-03): migrate work order and vendor hooks to centralized keys |
| ca43ea4 | feat(02-03): migrate billing hooks to centralized keys |
| 4a8d1d1 | feat(02-03): migrate notification and service request hooks to centralized keys |

## Lines Changed

- **Removed:** ~101 lines (local key factory definitions)
- **Added:** ~14 lines (centralized import statements)
- **Net reduction:** ~87 lines

## Deviations from Plan

None - plan executed exactly as written.

## Success Criteria Verification

- [x] 8 hooks updated with centralized imports
- [x] No local `xxxKeys = { ... }` definitions in migrated hooks
- [x] All inline key strings replaced with factory calls
- [x] TypeScript compiles without errors
- [x] Production build succeeds

## Next Phase Readiness

**Ready for:** Plan 02-04/02-05 verification and any remaining hook migrations.

**Dependencies satisfied:**
- Plan 02-01 query key registry is fully utilized
- All billing/work order/notification hooks now use centralized keys
