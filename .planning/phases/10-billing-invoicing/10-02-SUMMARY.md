# Plan 10-02 Summary: Invoice Hooks

## Status: Complete

**Duration:** ~6 minutes
**Date:** 2026-01-15

## What Was Built

Created React Query hooks for invoice CRUD operations in `apps/admin/src/hooks/use-invoices.ts`.

### Hooks Implemented

| Hook | Purpose |
|------|---------|
| `invoiceKeys` | Query key factory for cache management |
| `useInvoices` | List invoices with filters (status, client, date range, overdue, search) |
| `useInvoice` | Single invoice with full relations (client, line_items, payments) |
| `useInvoiceSummary` | Dashboard metrics (outstanding, overdue, paid this month) |
| `useClientInvoices` | Client-specific invoice filtering |
| `useCreateInvoice` | Create invoice with line items, auto-numbering |
| `useUpdateInvoice` | Update draft invoices only |
| `useSendInvoice` | Mark invoice as sent with email and timestamp |
| `useVoidInvoice` | Mark invoice as void |
| `useDeleteInvoice` | Delete draft invoices only |
| `useMarkInvoiceViewed` | Track when invoice is viewed |

### File Created

- `apps/admin/src/hooks/use-invoices.ts` (535 lines)

## Technical Decisions

1. **Query key factory pattern** - Hierarchical keys for targeted cache invalidation (consistent with work orders/vendors)
2. **Sequence-based invoice numbers** - Uses `nextval` RPC with timestamp fallback
3. **Draft-only editing** - Update and delete operations restricted to draft status
4. **Type assertions via `unknown`** - For JSONB and relation fields from database
5. **Organization-scoped queries** - All list queries filter by `profile.organization_id`

## Dependencies Used

- `@tanstack/react-query` - Query/mutation management
- `@/lib/types/billing` - Invoice types from 10-01
- `@/lib/helpers/billing` - Calculation helpers from 10-01
- `@/stores/auth-store` - Organization context

## Commit

```
feat(billing): add invoice hooks - CRUD, send, void, summary
```

## Next Steps

Continue with Wave 2 plans in parallel:
- 10-03: Payment Hooks
- 10-04: Stripe Integration Edge Function
