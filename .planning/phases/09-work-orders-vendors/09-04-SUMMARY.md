# Summary: Plan 09-04 - Vendor Hooks

## Completed: 2026-01-15

## What Was Built

Created comprehensive React Query hooks for vendor CRUD operations, search, and filtering at `apps/admin/src/hooks/use-vendors.ts`.

### Hooks Implemented

| Hook | Purpose |
|------|---------|
| `useVendors` | List vendors with filters (trade category, preferred, active, search) |
| `useVendor` | Single vendor with computed stats (completion rate, open work orders) |
| `useVendorsByTrade` | Vendors by trade category for work order assignment |
| `useSearchVendors` | Search vendors with optional category filter |
| `useCreateVendor` | Create vendor with organization context |
| `useUpdateVendor` | Update vendor fields |
| `useUpdateVendorCompliance` | Update compliance-specific fields |
| `useToggleVendorPreferred` | Toggle preferred status |
| `useDeactivateVendor` | Soft delete vendor |
| `useReactivateVendor` | Restore vendor |
| `useRateVendor` | Update average rating after work order completion |
| `useVendorComplianceCounts` | Dashboard compliance statistics |

### Key Features

1. **Cache Management**: Hierarchical query keys (`vendorKeys`) for targeted cache invalidation
2. **Compliance Tracking**: Real-time compliance status calculation using `checkVendorCompliance`
3. **Vendor Assignment**: `useVendorsByTrade` returns vendors sorted by preferred status and rating
4. **Search**: Debounced search across company name and contact names
5. **Organization Context**: `useCreateVendor` automatically attaches organization_id from user profile
6. **Rating System**: Rolling average calculation preserves historical rating accuracy

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `apps/admin/src/hooks/use-vendors.ts` | 533 | React Query hooks for vendor operations |

## Verification

- [x] useVendors fetches list with all filter options
- [x] useVendor fetches single vendor with computed stats
- [x] useVendorsByTrade fetches vendors for a specific trade category
- [x] useSearchVendors searches vendors by name with optional category filter
- [x] useCreateVendor creates vendor with organization_id
- [x] useUpdateVendor updates vendor fields
- [x] useUpdateVendorCompliance updates compliance-specific fields
- [x] useToggleVendorPreferred toggles preferred status
- [x] useDeactivateVendor soft deletes vendor
- [x] useReactivateVendor restores vendor
- [x] useRateVendor calculates and updates average rating
- [x] useVendorComplianceCounts returns compliance statistics
- [x] All hooks invalidate appropriate caches
- [x] No TypeScript errors

## Dependencies Used

- 09-02: Vendor Data Foundation (types from `@/lib/types/vendor`, helpers from `@/lib/constants/vendor`)

## Decisions Made

- **09-04**: Used `vendorKeys` factory pattern for hierarchical cache invalidation (consistent with other hooks)
- **09-04**: Compliance counts computed client-side from minimal vendor fields for efficiency
- **09-04**: Rolling average rating calculation: `(currentRating * (completedJobs - 1) + newRating) / completedJobs`

## Commits

1. `feat(vendor): add React Query hooks for vendor operations` - 533 lines added

## Duration

~5 minutes
