# Plan 02-01: RLS Policy Audit and Client UPDATE Policy

## Status: COMPLETE

## Objective
Audit existing RLS policies and add client UPDATE policy for self-service plan management.

## What Was Done

### 1. RLS Policy Audit
Reviewed `018_rls_policies.sql` containing 811 lines of comprehensive RLS policies:

**Tables with RLS enabled (32 tables):**
- organizations, users, clients, properties, programs, program_history
- equipment, equipment_service_log, inspection_templates, recommendation_templates
- inspections, inspection_photos, recommendations, vendors, work_orders
- service_requests, service_request_comments, invoices, invoice_line_items
- payments, calendar_events, reminders, documents, home_manuals
- notifications, activity_log, settings, pricing_config

**Helper Functions:**
- `get_user_organization_id()` - Returns user's org ID
- `get_user_role()` - Returns user's role
- `is_admin_or_manager()` - Boolean check for admin/manager
- `get_user_client_id()` - Returns client ID for client users

**Client SELECT Policies (working correctly):**
- Clients: Can view self
- Properties: Can view their properties (client_id match)
- Programs: Can view their programs (client_id match)
- Work Orders: Can view their work orders
- Inspections: Can view their inspections
- Invoices: Can view their invoices
- Equipment: Can view their equipment
- Calendar Events: Can view their calendar events

### 2. Gap Identified
**Missing: UPDATE policy for clients on programs table**

Clients need to update their own programs for Phase 5 (self-service plan editor).

### 3. Migration Created
Created `027_client_program_update_policy.sql`:

```sql
CREATE POLICY "Clients can update their programs"
  ON programs FOR UPDATE
  USING (client_id = get_user_client_id())
  WITH CHECK (
    client_id = get_user_client_id() AND
    -- Ownership fields are immutable
    client_id = (SELECT client_id FROM programs WHERE id = programs.id) AND
    property_id = (SELECT property_id FROM programs WHERE id = programs.id) AND
    organization_id = (SELECT organization_id FROM programs WHERE id = programs.id)
  );
```

Also added policies for clients to view/insert program_history for change tracking.

## Artifacts
- `supabase/migrations/027_client_program_update_policy.sql`

## Security Notes
- Clients can only update programs they own (client_id match)
- Ownership fields (client_id, property_id, organization_id) are immutable
- WITH CHECK clause prevents changing ownership during update
