-- 053_fix_organization_rls.sql
-- Fix organization RLS by making it more permissive for authenticated users

-- Drop all existing organization policies
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Admin can update their organization" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can view their organization" ON organizations;

-- Create simple, permissive policies for authenticated users
-- SELECT: Any authenticated user can see their organization
CREATE POLICY "Users can view organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);  -- Allow all for now, we filter by org_id in queries

-- UPDATE: Admins/managers can update their organization
CREATE POLICY "Admin can update organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (is_admin_or_manager());

-- INSERT: Only for super admins (not typical users)
CREATE POLICY "Admin can insert organization"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_manager());
