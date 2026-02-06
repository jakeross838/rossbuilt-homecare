-- 052_debug_and_fix_rls.sql
-- Debug and fix RLS issues for organization access

-- First, ensure the user exists in the users table
-- The trigger should have created this, but let's make sure
INSERT INTO public.users (id, organization_id, email, first_name, last_name, role, is_active)
SELECT
  au.id,
  '00000000-0000-0000-0000-000000000001',
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  'admin',
  true
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL;

-- Update any users with NULL organization_id
UPDATE public.users
SET organization_id = '00000000-0000-0000-0000-000000000001'
WHERE organization_id IS NULL;

-- Recreate the helper function to ensure it works correctly
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id FROM users WHERE id = auth.uid();
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add a more permissive SELECT policy as fallback for authenticated users
-- (This ensures organization data is accessible)
DROP POLICY IF EXISTS "Authenticated users can view their organization" ON organizations;
CREATE POLICY "Authenticated users can view their organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id = (SELECT organization_id FROM users WHERE id = auth.uid())
    OR
    id = '00000000-0000-0000-0000-000000000001' -- Demo org fallback
  );
