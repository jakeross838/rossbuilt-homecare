-- 018_rls_policies.sql
-- Row Level Security policies for multi-tenant access control

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_service_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- =============================================================================

-- Get user's organization ID
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is admin or manager
CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin', 'manager') FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get client_id for current user (if client role)
CREATE OR REPLACE FUNCTION get_user_client_id()
RETURNS UUID AS $$
  SELECT id FROM clients WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- ORGANIZATIONS POLICIES
-- =============================================================================

CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (id = get_user_organization_id());

CREATE POLICY "Admin can update their organization"
  ON organizations FOR UPDATE
  USING (id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- USERS POLICIES
-- =============================================================================

CREATE POLICY "Users can view same org users"
  ON users FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Admin/Manager can insert users"
  ON users FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can update users"
  ON users FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin can delete users"
  ON users FOR DELETE
  USING (organization_id = get_user_organization_id() AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- =============================================================================
-- CLIENTS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all clients"
  ON clients FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Clients can view self"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin/Manager can insert clients"
  ON clients FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can update clients"
  ON clients FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can delete clients"
  ON clients FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- PROPERTIES POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all properties"
  ON properties FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Clients can view their properties"
  ON properties FOR SELECT
  USING (client_id = get_user_client_id());

CREATE POLICY "Admin/Manager can insert properties"
  ON properties FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can update properties"
  ON properties FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can delete properties"
  ON properties FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- PROGRAMS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all programs"
  ON programs FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Clients can view their programs"
  ON programs FOR SELECT
  USING (client_id = get_user_client_id());

CREATE POLICY "Admin/Manager can insert programs"
  ON programs FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can update programs"
  ON programs FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can delete programs"
  ON programs FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- PROGRAM HISTORY POLICIES
-- =============================================================================

CREATE POLICY "Staff can view program history"
  ON program_history FOR SELECT
  USING (
    program_id IN (
      SELECT id FROM programs WHERE organization_id = get_user_organization_id()
    ) AND get_user_role() != 'client'
  );

CREATE POLICY "System can insert program history"
  ON program_history FOR INSERT
  WITH CHECK (
    program_id IN (
      SELECT id FROM programs WHERE organization_id = get_user_organization_id()
    )
  );

-- =============================================================================
-- EQUIPMENT POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all equipment"
  ON equipment FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE organization_id = get_user_organization_id()
    ) AND get_user_role() != 'client'
  );

CREATE POLICY "Clients can view their equipment"
  ON equipment FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE client_id = get_user_client_id()
    )
  );

CREATE POLICY "Admin/Manager can insert equipment"
  ON equipment FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE organization_id = get_user_organization_id()
    ) AND is_admin_or_manager()
  );

CREATE POLICY "Admin/Manager can update equipment"
  ON equipment FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE organization_id = get_user_organization_id()
    ) AND is_admin_or_manager()
  );

CREATE POLICY "Admin/Manager can delete equipment"
  ON equipment FOR DELETE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE organization_id = get_user_organization_id()
    ) AND is_admin_or_manager()
  );

-- =============================================================================
-- EQUIPMENT SERVICE LOG POLICIES
-- =============================================================================

CREATE POLICY "Staff can view equipment service logs"
  ON equipment_service_log FOR SELECT
  USING (
    equipment_id IN (
      SELECT e.id FROM equipment e
      JOIN properties p ON e.property_id = p.id
      WHERE p.organization_id = get_user_organization_id()
    ) AND get_user_role() != 'client'
  );

CREATE POLICY "Clients can view their equipment service logs"
  ON equipment_service_log FOR SELECT
  USING (
    equipment_id IN (
      SELECT e.id FROM equipment e
      JOIN properties p ON e.property_id = p.id
      WHERE p.client_id = get_user_client_id()
    )
  );

CREATE POLICY "Admin/Manager can insert equipment service logs"
  ON equipment_service_log FOR INSERT
  WITH CHECK (
    equipment_id IN (
      SELECT e.id FROM equipment e
      JOIN properties p ON e.property_id = p.id
      WHERE p.organization_id = get_user_organization_id()
    ) AND is_admin_or_manager()
  );

-- =============================================================================
-- INSPECTION TEMPLATES POLICIES
-- =============================================================================

CREATE POLICY "Staff can view inspection templates"
  ON inspection_templates FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Admin/Manager can insert inspection templates"
  ON inspection_templates FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can update inspection templates"
  ON inspection_templates FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can delete inspection templates"
  ON inspection_templates FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- RECOMMENDATION TEMPLATES POLICIES
-- =============================================================================

CREATE POLICY "Staff can view recommendation templates"
  ON recommendation_templates FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Admin/Manager can insert recommendation templates"
  ON recommendation_templates FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can update recommendation templates"
  ON recommendation_templates FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can delete recommendation templates"
  ON recommendation_templates FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- INSPECTIONS POLICIES
-- =============================================================================

CREATE POLICY "Admin/Manager can view all inspections"
  ON inspections FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Inspectors can view assigned inspections"
  ON inspections FOR SELECT
  USING (organization_id = get_user_organization_id() AND inspector_id = auth.uid());

CREATE POLICY "Clients can view their inspections"
  ON inspections FOR SELECT
  USING (
    property_id IN (SELECT id FROM properties WHERE client_id = get_user_client_id())
  );

CREATE POLICY "Admin/Manager can insert inspections"
  ON inspections FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can update inspections"
  ON inspections FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Inspectors can update assigned inspections"
  ON inspections FOR UPDATE
  USING (
    inspector_id = auth.uid() AND
    status IN ('scheduled', 'in_progress') AND
    organization_id = get_user_organization_id()
  );

CREATE POLICY "Admin/Manager can delete inspections"
  ON inspections FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- INSPECTION PHOTOS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view inspection photos"
  ON inspection_photos FOR SELECT
  USING (
    inspection_id IN (
      SELECT id FROM inspections WHERE organization_id = get_user_organization_id()
    ) AND get_user_role() != 'client'
  );

CREATE POLICY "Clients can view their inspection photos"
  ON inspection_photos FOR SELECT
  USING (
    inspection_id IN (
      SELECT i.id FROM inspections i
      JOIN properties p ON i.property_id = p.id
      WHERE p.client_id = get_user_client_id()
    )
  );

CREATE POLICY "Staff can insert inspection photos"
  ON inspection_photos FOR INSERT
  WITH CHECK (
    inspection_id IN (
      SELECT id FROM inspections WHERE organization_id = get_user_organization_id()
    ) AND get_user_role() != 'client'
  );

CREATE POLICY "Admin/Manager can delete inspection photos"
  ON inspection_photos FOR DELETE
  USING (
    inspection_id IN (
      SELECT id FROM inspections WHERE organization_id = get_user_organization_id()
    ) AND is_admin_or_manager()
  );

-- =============================================================================
-- RECOMMENDATIONS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all recommendations"
  ON recommendations FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Clients can view their recommendations"
  ON recommendations FOR SELECT
  USING (
    property_id IN (SELECT id FROM properties WHERE client_id = get_user_client_id())
  );

CREATE POLICY "Admin/Manager can insert recommendations"
  ON recommendations FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Inspectors can insert recommendations"
  ON recommendations FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    get_user_role() = 'inspector' AND
    inspection_id IN (SELECT id FROM inspections WHERE inspector_id = auth.uid())
  );

CREATE POLICY "Admin/Manager can update recommendations"
  ON recommendations FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Clients can respond to recommendations"
  ON recommendations FOR UPDATE
  USING (
    property_id IN (SELECT id FROM properties WHERE client_id = get_user_client_id()) AND
    status = 'pending'
  );

CREATE POLICY "Admin/Manager can delete recommendations"
  ON recommendations FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- VENDORS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all vendors"
  ON vendors FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Admin/Manager can insert vendors"
  ON vendors FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can update vendors"
  ON vendors FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can delete vendors"
  ON vendors FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- WORK ORDERS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all work orders"
  ON work_orders FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Clients can view their work orders"
  ON work_orders FOR SELECT
  USING (client_id = get_user_client_id());

CREATE POLICY "Admin/Manager can insert work orders"
  ON work_orders FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can update work orders"
  ON work_orders FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can delete work orders"
  ON work_orders FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- SERVICE REQUESTS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all service requests"
  ON service_requests FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Clients can view their service requests"
  ON service_requests FOR SELECT
  USING (client_id = get_user_client_id());

CREATE POLICY "Staff can insert service requests"
  ON service_requests FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Clients can insert service requests"
  ON service_requests FOR INSERT
  WITH CHECK (client_id = get_user_client_id());

CREATE POLICY "Admin/Manager can update service requests"
  ON service_requests FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Assigned staff can update service requests"
  ON service_requests FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    assigned_to = auth.uid()
  );

-- =============================================================================
-- SERVICE REQUEST COMMENTS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all comments"
  ON service_request_comments FOR SELECT
  USING (
    service_request_id IN (
      SELECT id FROM service_requests WHERE organization_id = get_user_organization_id()
    ) AND get_user_role() != 'client'
  );

CREATE POLICY "Clients can view non-internal comments"
  ON service_request_comments FOR SELECT
  USING (
    service_request_id IN (
      SELECT id FROM service_requests WHERE client_id = get_user_client_id()
    ) AND is_internal = false
  );

CREATE POLICY "Staff can insert comments"
  ON service_request_comments FOR INSERT
  WITH CHECK (
    service_request_id IN (
      SELECT id FROM service_requests WHERE organization_id = get_user_organization_id()
    ) AND get_user_role() != 'client'
  );

CREATE POLICY "Clients can insert comments"
  ON service_request_comments FOR INSERT
  WITH CHECK (
    service_request_id IN (
      SELECT id FROM service_requests WHERE client_id = get_user_client_id()
    ) AND is_internal = false
  );

-- =============================================================================
-- INVOICES POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all invoices"
  ON invoices FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Clients can view their invoices"
  ON invoices FOR SELECT
  USING (client_id = get_user_client_id());

CREATE POLICY "Admin/Manager can insert invoices"
  ON invoices FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can update invoices"
  ON invoices FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can delete invoices"
  ON invoices FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- INVOICE LINE ITEMS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view invoice line items"
  ON invoice_line_items FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id = get_user_organization_id()
    ) AND get_user_role() != 'client'
  );

CREATE POLICY "Clients can view their invoice line items"
  ON invoice_line_items FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE client_id = get_user_client_id()
    )
  );

CREATE POLICY "Admin/Manager can insert invoice line items"
  ON invoice_line_items FOR INSERT
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id = get_user_organization_id()
    ) AND is_admin_or_manager()
  );

CREATE POLICY "Admin/Manager can update invoice line items"
  ON invoice_line_items FOR UPDATE
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id = get_user_organization_id()
    ) AND is_admin_or_manager()
  );

CREATE POLICY "Admin/Manager can delete invoice line items"
  ON invoice_line_items FOR DELETE
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id = get_user_organization_id()
    ) AND is_admin_or_manager()
  );

-- =============================================================================
-- PAYMENTS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all payments"
  ON payments FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Clients can view their payments"
  ON payments FOR SELECT
  USING (client_id = get_user_client_id());

CREATE POLICY "Admin/Manager can insert payments"
  ON payments FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can update payments"
  ON payments FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- CALENDAR EVENTS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all calendar events"
  ON calendar_events FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Clients can view their calendar events"
  ON calendar_events FOR SELECT
  USING (
    property_id IN (SELECT id FROM properties WHERE client_id = get_user_client_id())
  );

CREATE POLICY "Admin/Manager can insert calendar events"
  ON calendar_events FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Staff can insert their own calendar events"
  ON calendar_events FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id() AND
    assigned_to = auth.uid()
  );

CREATE POLICY "Admin/Manager can update calendar events"
  ON calendar_events FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Assigned staff can update their calendar events"
  ON calendar_events FOR UPDATE
  USING (
    organization_id = get_user_organization_id() AND
    assigned_to = auth.uid()
  );

CREATE POLICY "Admin/Manager can delete calendar events"
  ON calendar_events FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- REMINDERS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all reminders"
  ON reminders FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Clients can view their reminders"
  ON reminders FOR SELECT
  USING (
    property_id IN (SELECT id FROM properties WHERE client_id = get_user_client_id())
  );

CREATE POLICY "Admin/Manager can insert reminders"
  ON reminders FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can update reminders"
  ON reminders FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can delete reminders"
  ON reminders FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- DOCUMENTS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all documents"
  ON documents FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Clients can view their documents"
  ON documents FOR SELECT
  USING (
    (client_id = get_user_client_id() OR
     property_id IN (SELECT id FROM properties WHERE client_id = get_user_client_id()))
    AND is_client_visible = true
  );

CREATE POLICY "Staff can insert documents"
  ON documents FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Admin/Manager can update documents"
  ON documents FOR UPDATE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "Admin/Manager can delete documents"
  ON documents FOR DELETE
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

-- =============================================================================
-- HOME MANUALS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view all home manuals"
  ON home_manuals FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE organization_id = get_user_organization_id()
    ) AND get_user_role() != 'client'
  );

CREATE POLICY "Clients can view their home manuals"
  ON home_manuals FOR SELECT
  USING (
    property_id IN (SELECT id FROM properties WHERE client_id = get_user_client_id())
  );

CREATE POLICY "Admin/Manager can insert home manuals"
  ON home_manuals FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE organization_id = get_user_organization_id()
    ) AND is_admin_or_manager()
  );

CREATE POLICY "Admin/Manager can update home manuals"
  ON home_manuals FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE organization_id = get_user_organization_id()
    ) AND is_admin_or_manager()
  );

CREATE POLICY "Admin/Manager can delete home manuals"
  ON home_manuals FOR DELETE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE organization_id = get_user_organization_id()
    ) AND is_admin_or_manager()
  );

-- =============================================================================
-- NOTIFICATIONS POLICIES
-- =============================================================================

CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- =============================================================================
-- ACTIVITY LOG POLICIES
-- =============================================================================

CREATE POLICY "Admin/Manager can view activity"
  ON activity_log FOR SELECT
  USING (organization_id = get_user_organization_id() AND is_admin_or_manager());

CREATE POLICY "System can insert activity"
  ON activity_log FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id());

-- =============================================================================
-- SETTINGS POLICIES
-- =============================================================================

CREATE POLICY "Staff can view settings"
  ON settings FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Admin can manage settings"
  ON settings FOR ALL
  USING (organization_id = get_user_organization_id() AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- =============================================================================
-- PRICING CONFIG POLICIES
-- =============================================================================

CREATE POLICY "Staff can view pricing config"
  ON pricing_config FOR SELECT
  USING (organization_id = get_user_organization_id() AND get_user_role() != 'client');

CREATE POLICY "Admin can manage pricing config"
  ON pricing_config FOR ALL
  USING (organization_id = get_user_organization_id() AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin');
