-- 031_fix_properties_rls_for_assignments.sql
-- Update properties RLS to use user_property_assignments instead of client linking

-- Drop the old client-based policy
DROP POLICY IF EXISTS "Clients can view their properties" ON properties;

-- Create new policy: Users can view properties assigned to them
DROP POLICY IF EXISTS "Users can view assigned properties" ON properties;
CREATE POLICY "Users can view assigned properties"
  ON properties FOR SELECT
  USING (
    id IN (
      SELECT property_id
      FROM user_property_assignments
      WHERE user_id = auth.uid()
    )
  );

-- Also fix programs table - clients need to see programs for their assigned properties
DROP POLICY IF EXISTS "Clients can view their programs" ON programs;

DROP POLICY IF EXISTS "Users can view programs for assigned properties" ON programs;
CREATE POLICY "Users can view programs for assigned properties"
  ON programs FOR SELECT
  USING (
    property_id IN (
      SELECT property_id
      FROM user_property_assignments
      WHERE user_id = auth.uid()
    )
  );
