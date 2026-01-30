-- Link Patrick Gavin's client record to his auth user
-- This is required for RLS policies that use get_user_client_id()

-- Update Patrick's client record with his auth user_id
UPDATE clients
SET user_id = (
  SELECT id FROM auth.users WHERE email = 'patrick@gavin.com'
)
WHERE email = 'patrick@gavin.com'
  AND user_id IS NULL;

-- Also update any client with matching email that doesn't have user_id set
UPDATE clients c
SET user_id = u.id
FROM auth.users u
WHERE c.email = u.email
  AND c.user_id IS NULL;
