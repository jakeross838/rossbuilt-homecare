-- Direct link: Patrick's client record to his auth user
-- The client ID is known: 22222222-2222-2222-2222-222222222204
-- The auth email is known: patrick@gavin.com

-- Update Patrick's client record directly by client ID
UPDATE clients
SET user_id = (
  SELECT id FROM auth.users WHERE email = 'patrick@gavin.com' LIMIT 1
)
WHERE id = '22222222-2222-2222-2222-222222222204';

-- Also update the client's email to match the auth email for consistency
UPDATE clients
SET email = 'patrick@gavin.com'
WHERE id = '22222222-2222-2222-2222-222222222204'
  AND email IS DISTINCT FROM 'patrick@gavin.com';
