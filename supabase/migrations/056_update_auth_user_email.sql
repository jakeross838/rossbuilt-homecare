-- Update auth.users email from demo to jakeross
-- Migration 055 only updated public.users; this updates the auth login email

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

-- Also update any identities linked to this email
UPDATE auth.identities
SET
  identity_data = jsonb_set(
    identity_data,
    '{email}',
    '"jakeross@rossbuilt.com"'
  ),
  updated_at = NOW()
WHERE provider_id = 'demo@rossbuilt.com'
   OR identity_data->>'email' = 'demo@rossbuilt.com';
