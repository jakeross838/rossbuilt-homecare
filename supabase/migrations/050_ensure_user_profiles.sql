-- 050_ensure_user_profiles.sql
-- Ensure all auth users have a profile in the users table
-- This fixes RLS policies that depend on get_user_organization_id()

-- Insert missing user profiles for any auth users who don't have one
INSERT INTO public.users (id, organization_id, email, first_name, last_name, role, is_active)
SELECT
  au.id,
  '00000000-0000-0000-0000-000000000001', -- Demo organization
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  'admin',
  true
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL;

-- Also ensure any existing user profiles have the correct organization_id
-- (in case they were created without one)
UPDATE public.users
SET organization_id = '00000000-0000-0000-0000-000000000001'
WHERE organization_id IS NULL;
