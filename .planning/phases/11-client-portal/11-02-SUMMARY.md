# Summary: 11-02 Client Portal Hooks

## Completed

All 5 tasks executed and committed atomically:

### Task 1: Portal Auth Hook
- Created `apps/admin/src/hooks/use-portal-auth.ts`
- Hook to check if current user is a client role
- Exposes user, profile, isClient, isAuthenticated, isLoading, isInitialized

### Task 2: Portal Dashboard Hook
- Created `apps/admin/src/hooks/use-portal-dashboard.ts`
- Added `portalKeys` factory for hierarchical cache invalidation
- `usePortalDashboard` - fetches dashboard summary (properties count, upcoming inspections, open requests, pending approvals, outstanding balance)
- `usePortalProperties` - fetches properties list with program info and status counts

### Task 3: Portal Property Detail Hook
- Created `apps/admin/src/hooks/use-portal-property.ts`
- `usePortalProperty` - fetches detailed property info including:
  - Property details with program information
  - Equipment list with condition and service dates
  - Recent inspections with findings summary
  - Active work orders
  - Pending recommendations awaiting approval

### Task 4: Portal Inspections Hook
- Created `apps/admin/src/hooks/use-portal-inspections.ts`
- `usePortalInspections` - fetches inspections list with property filtering support
- `usePortalInspection` - fetches single inspection detail with photos

### Task 5: Portal Invoices Hook
- Created `apps/admin/src/hooks/use-portal-invoices.ts`
- `usePortalInvoices` - fetches invoices list with line items
- `usePortalInvoice` - fetches single invoice detail with Stripe payment URL

## Files Created

```
apps/admin/src/hooks/use-portal-auth.ts
apps/admin/src/hooks/use-portal-dashboard.ts
apps/admin/src/hooks/use-portal-property.ts
apps/admin/src/hooks/use-portal-inspections.ts
apps/admin/src/hooks/use-portal-invoices.ts
```

## Commits

1. `feat(portal): add portal auth hook` - Task 1
2. `feat(portal): add portal dashboard and properties hooks` - Task 2
3. `feat(portal): add portal property detail hook` - Task 3
4. `feat(portal): add portal inspections hooks` - Task 4
5. `feat(portal): add portal invoices hooks` - Task 5

## Dependencies Used

- Plan 11-01: Portal types (`PortalDashboardSummary`, `PortalProperty`, `PortalPropertyDetail`, `PortalInspection`, `PortalInvoice`, etc.)
- Existing `useAuthStore` from `@/stores/auth-store`
- Existing Supabase client from `@/lib/supabase`
- React Query patterns from existing hooks

## Key Decisions

- **portalKeys factory pattern**: Hierarchical query keys for targeted cache invalidation (consistent with other hooks)
- **Type assertions via unknown**: For JSONB fields like findings, line_items (consistent with 08-02, 10-02)
- **Client role check**: All hooks enabled only when `profile?.role === 'client'`
- **RLS dependency**: Hooks rely on existing RLS policies to filter data by client's properties

## Verification

- TypeScript compilation: PASSED (`npx tsc --noEmit`)
- All 5 hook files created successfully
- Imports resolve correctly

## Duration

~8 minutes
