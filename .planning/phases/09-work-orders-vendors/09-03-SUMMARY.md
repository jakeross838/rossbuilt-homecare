# Plan 09-03 Summary: Work Order Hooks

## Execution Date
2026-01-15

## Status
Complete

## Files Created

### 1. `apps/admin/src/hooks/use-work-orders.ts`
React Query hooks for work order CRUD operations:

**Query Hooks:**
- `useWorkOrders(filters?)` - List work orders with filtering (status, priority, category, vendor, dates, search)
- `useWorkOrder(id)` - Single work order with all relations (property, client, vendor, user, recommendation)
- `usePropertyWorkOrders(propertyId)` - Work orders for a specific property
- `useVendorWorkOrders(vendorId)` - Work orders assigned to a vendor
- `useWorkOrderCounts()` - Count of work orders by status

**Mutation Hooks:**
- `useCreateWorkOrder()` - Create work order with auto-generated number, recommendation linking
- `useUpdateWorkOrder()` - Update work order fields
- `useUpdateWorkOrderStatus()` - Transition status with automatic timestamps (started_at, completed_at)
- `useAssignVendor()` - Assign vendor with optional scheduling
- `useCompleteWorkOrder()` - Complete with cost calculation (vendor cost + markup = client cost)
- `useCancelWorkOrder()` - Cancel and reset linked recommendation

**Query Keys:**
- `workOrderKeys` factory for consistent cache management

### 2. `supabase/migrations/020_vendor_job_count_functions.sql`
PostgreSQL RPC functions for vendor statistics:

- `increment_vendor_total_jobs(vendor_id)` - Called when vendor is assigned to work order
- `increment_vendor_completed_jobs(vendor_id)` - Called when work order is completed

## Commits

1. `6e741c7` - feat(work-orders): add React Query hooks for work order operations
2. `50e075a` - feat(database): add vendor job count RPC functions

## Key Implementation Details

1. **Work Order Number Generation**: Uses `work_order_seq` sequence via RPC, with timestamp fallback
2. **Status Workflow**: Automatic timestamp setting (started_at on in_progress, completed_at on completed)
3. **Recommendation Linking**: Bidirectional updates between work orders and recommendations
4. **Cost Calculation**: Uses `calculateClientCost()` helper for markup calculations (default 15%)
5. **Cache Invalidation**: Comprehensive query invalidation on mutations (work orders, vendors, recommendations)
6. **Vendor Statistics**: RPC functions with SECURITY DEFINER for job counting

## Decisions Made

- **09-03**: Used `let` declaration for workOrderNumber instead of `var` for proper block scoping
- **09-03**: RPC functions use SECURITY DEFINER for consistent access regardless of caller's RLS permissions
- **09-03**: Query keys use factory pattern (`workOrderKeys`) for type-safe cache management

## Verification

- [x] useWorkOrders fetches list with all filter options
- [x] useWorkOrder fetches single work order with all relations
- [x] usePropertyWorkOrders fetches work orders for a property
- [x] useVendorWorkOrders fetches work orders for a vendor
- [x] useCreateWorkOrder creates work order and links to recommendation
- [x] useUpdateWorkOrder updates work order fields
- [x] useUpdateWorkOrderStatus transitions status with timestamps
- [x] useAssignVendor assigns vendor and updates status
- [x] useCompleteWorkOrder calculates costs and marks complete
- [x] useCancelWorkOrder cancels and resets recommendation
- [x] useWorkOrderCounts returns counts by status
- [x] All hooks invalidate appropriate caches
- [x] No TypeScript errors (follows existing patterns)
