-- Update admin user email and name from demo to jakeross
-- Updates both auth.users (login email) and public.users (profile)

-- Update auth.users email (the login credential)
UPDATE auth.users
SET
  email = 'jakeross@rossbuilt.com',
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{first_name}',
    '"Jake"'
  ) || jsonb_build_object('last_name', 'Ross'),
  updated_at = NOW()
WHERE email = 'demo@rossbuilt.com';

-- Update public.users profile to match
UPDATE public.users
SET
  email = 'jakeross@rossbuilt.com',
  first_name = 'Jake',
  last_name = 'Ross',
  updated_at = NOW()
WHERE email = 'demo@rossbuilt.com';
