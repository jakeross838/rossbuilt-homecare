-- 030_fix_assignment_rls.sql
-- Fix RLS policy to allow users to read their own property assignments

-- Drop the restrictive staff-only policy
DROP POLICY IF EXISTS "Staff can view property assignments" ON user_property_assignments;

-- Create new policy: Users can view their OWN assignments (any role)
CREATE POLICY "Users can view own assignments"
  ON user_property_assignments FOR SELECT
  USING (user_id = auth.uid());

-- Keep the staff policy for viewing ALL assignments (admin use)
CREATE POLICY "Staff can view all assignments"
  ON user_property_assignments FOR SELECT
  USING (
    organization_id = get_user_organization_id()
    AND get_user_role() IN ('admin', 'manager', 'inspector')
  );
