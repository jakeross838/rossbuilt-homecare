# Phase 6: Cascading Updates

## Status: COMPLETE

## Objective
Create RPC functions for cascading plan changes to billing, schedules, and checklists with transaction integrity.

## What Was Built

### 1. Cascade RPC Function
`supabase/migrations/028_program_cascade_function.sql`

PostgreSQL function `cascade_program_update()` that handles all cascading updates atomically:

**Parameters:**
- `p_program_id` - Program being updated
- `p_old_frequency` - Previous inspection frequency
- `p_new_frequency` - New inspection frequency
- `p_old_addons` - Previous addon settings (JSONB)
- `p_new_addons` - New addon settings (JSONB)
- `p_price_difference` - Price increase amount (for invoicing)
- `p_new_monthly_total` - New monthly total

**Cascade Operations:**

1. **Schedule Cascade**
   - Cancels future scheduled inspections if frequency changed
   - Creates new inspections based on new frequency
   - Adds notes explaining automatic changes

2. **Billing Cascade**
   - Creates invoice for price increases (upgrades)
   - Generates unique invoice number
   - Creates corresponding line item
   - Sets 30-day due date

3. **Notification Cascade**
   - Notifies all admin/manager users
   - Includes property name, old/new frequency, price change
   - Notification type: 'plan_change'

4. **Activity Log**
   - Records the change in activity_log table
   - Includes full change details as JSONB

**Returns:**
```json
{
  "success": true,
  "inspections_rescheduled": 3,
  "invoice_created": true,
  "invoice_id": "uuid",
  "notification_sent": true
}
```

### 2. Plan Editor Integration
Updated `plan-editor.tsx` to call the cascade function after saving:

```typescript
const { error: cascadeError } = await supabase.rpc('cascade_program_update', {
  p_program_id: program.id,
  p_old_frequency: program.inspection_frequency,
  p_new_frequency: frequency,
  // ... other params
})
```

### 3. Transaction Integrity
The RPC function runs as a single transaction:
- All operations succeed together or none are applied
- Uses `SECURITY DEFINER` for proper permissions
- Error handling with `RAISE EXCEPTION`

## Files Created/Modified

**Created:**
- `supabase/migrations/028_program_cascade_function.sql`

**Modified:**
- `components/portal/plan-editor/plan-editor.tsx`

## Success Criteria Met

- [x] Billing/invoice automatically updates when plan changes
- [x] Inspection schedule adjusts when frequency changes
- [x] Changes take effect immediately
- [x] All cascades complete or all roll back (transaction)
- [x] Admin notifications sent on plan changes
- [x] Activity logged for audit trail
