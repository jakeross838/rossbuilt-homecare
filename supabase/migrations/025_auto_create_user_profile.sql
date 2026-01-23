-- 025_auto_create_user_profile.sql
-- Auto-create user profile in users table when a new auth user signs up
-- Assigns to demo organization by default for development

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    organization_id,
    email,
    first_name,
    last_name,
    role,
    is_active
  )
  VALUES (
    NEW.id,
    '00000000-0000-0000-0000-000000000001', -- Demo organization
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'admin', -- Default role for new users
    true
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Also create profiles for any existing auth users who don't have one
INSERT INTO public.users (id, organization_id, email, first_name, role, is_active)
SELECT
  au.id,
  '00000000-0000-0000-0000-000000000001',
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)),
  'admin',
  true
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL;
