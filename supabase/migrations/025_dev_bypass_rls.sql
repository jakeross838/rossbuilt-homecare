-- 025_dev_bypass_rls.sql
-- DEVELOPMENT ONLY: Bypass RLS policies for testing without authentication
-- WARNING: Remove this migration before deploying to production!

-- Allow anonymous read access to invoices for testing
CREATE POLICY "DEV: Allow anonymous invoice read"
  ON invoices FOR SELECT
  USING (true);

-- Allow anonymous insert for invoices
CREATE POLICY "DEV: Allow anonymous invoice insert"
  ON invoices FOR INSERT
  WITH CHECK (true);

-- Allow anonymous update for invoices
CREATE POLICY "DEV: Allow anonymous invoice update"
  ON invoices FOR UPDATE
  USING (true);

-- Allow anonymous read for invoice line items
CREATE POLICY "DEV: Allow anonymous invoice_line_items read"
  ON invoice_line_items FOR SELECT
  USING (true);

-- Allow anonymous insert for invoice line items
CREATE POLICY "DEV: Allow anonymous invoice_line_items insert"
  ON invoice_line_items FOR INSERT
  WITH CHECK (true);

-- Allow anonymous read for clients (needed for invoice creation)
CREATE POLICY "DEV: Allow anonymous clients read"
  ON clients FOR SELECT
  USING (true);

-- Allow anonymous read for properties (needed for invoice line items)
CREATE POLICY "DEV: Allow anonymous properties read"
  ON properties FOR SELECT
  USING (true);

-- Allow anonymous read for work_orders (needed for billable items)
CREATE POLICY "DEV: Allow anonymous work_orders read"
  ON work_orders FOR SELECT
  USING (true);

-- Allow anonymous read for programs (needed for billable items)
CREATE POLICY "DEV: Allow anonymous programs read"
  ON programs FOR SELECT
  USING (true);
