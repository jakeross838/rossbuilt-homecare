# Plan 10-03 Summary: Payment Hooks

## Execution Time

- Started: 2026-01-15
- Duration: ~4 minutes
- Status: **Complete**

## What Was Built

### Payment React Query Hooks

Created `apps/admin/src/hooks/use-payments.ts` with:

1. **paymentKeys** - Query key factory for cache management
   - `paymentKeys.all` - Base key for all payment queries
   - `paymentKeys.lists()` - Payment list queries
   - `paymentKeys.list(filters)` - Filtered payment lists
   - `paymentKeys.invoice(id)` - Payments for specific invoice
   - `paymentKeys.client(id)` - Payments for specific client

2. **usePayments(filters)** - Fetch payments with optional filters
   - Supports invoice_id, client_id, payment_method, date_from, date_to filters
   - Returns payments with invoice relation (invoice_number, total, client_id)
   - Ordered by payment_date descending

3. **useInvoicePayments(invoiceId)** - Payments for specific invoice
   - Simple query for all payments linked to an invoice
   - Used in invoice detail view

4. **useClientPayments(clientId)** - Payments for specific client
   - Wrapper around usePayments with client_id filter

5. **useRecordPayment()** - Record manual payment
   - Fetches invoice to get client_id and current balance
   - Creates payment record with recorded_by tracking
   - Automatically updates invoice:
     - Calculates new amount_paid and balance_due
     - Sets status to 'paid' when balance reaches 0
     - Sets status to 'partial' for partial payments
     - Sets paid_at timestamp when fully paid
   - Invalidates payment and invoice caches

6. **useDeletePayment()** - Delete payment (admin only)
   - Fetches payment to find invoice
   - Deletes payment record
   - Recalculates invoice balance
   - Reverts invoice status appropriately:
     - 'paid' -> 'sent' if no payments remain
     - Updates balance_due based on remaining payments
   - Invalidates payment and invoice caches

7. **usePaymentSummary(period)** - Dashboard aggregations
   - Supports 'week', 'month', 'year' periods
   - Returns:
     - totalPayments - Count of payments in period
     - totalAmount - Sum of payment amounts
     - byMethod - Breakdown by payment method (count, total)
     - period and startDate for context

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Import invoiceKeys from use-invoices | Plan 10-02 runs in parallel, invoiceKeys already exists for cache invalidation |
| Profile from auth store for organization_id | Consistent with existing hooks pattern |
| Payment recorded_by tracks who recorded | Audit trail for manual payments |
| Auto-status updates on payment | Reduces manual steps, keeps data consistent |
| Delete recalculates balance | Maintains data integrity when payments removed |

## Commits

1. `feat(billing): add payment hooks - record, delete, summary` (cf3394f)

## Files Created

- `apps/admin/src/hooks/use-payments.ts` (245 lines)

## Dependencies Used

- 10-01: Billing types (Payment, RecordPaymentData, InvoiceStatus)
- use-invoices.ts: invoiceKeys for cache invalidation

## Verification Checklist

- [x] Payment hooks compile without TypeScript errors
- [x] Recording payment updates invoice balance and status
- [x] Deleting payment recalculates invoice
- [x] Payment summary provides dashboard data by period
- [x] Query keys follow factory pattern

## Notes

- Payments automatically update invoice status based on balance
- Invoice status flow: sent -> partial -> paid (based on payments)
- Delete payment can revert status from paid to sent
- Summary aggregates by payment method for reporting
