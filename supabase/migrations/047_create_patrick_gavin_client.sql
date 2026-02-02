-- Create Patrick Gavin client record
-- This client was referenced in migrations 039-045 but never actually created
-- Client ID: 22222222-2222-2222-2222-222222222204

-- First, check if any duplicate "Patrick Gavin" exists with a different ID and remove it
-- (Keep only the canonical one with the expected ID)
DELETE FROM clients
WHERE first_name = 'Patrick'
  AND last_name = 'Gavin'
  AND id != '22222222-2222-2222-2222-222222222204'
  AND organization_id = '00000000-0000-0000-0000-000000000001';

-- Insert Patrick Gavin with the correct ID (if not exists)
INSERT INTO clients (
  id,
  organization_id,
  first_name,
  last_name,
  email,
  phone,
  billing_address_line1,
  billing_city,
  billing_state,
  billing_zip,
  notes,
  is_active
) VALUES (
  '22222222-2222-2222-2222-222222222204',
  '00000000-0000-0000-0000-000000000001',
  'Patrick',
  'Gavin',
  'patrick@gavin.com',
  '941-555-4567',
  '123 Luxury Lane',
  'Sarasota',
  'FL',
  '34236',
  'Demo client for testing. Linked to Gavin Home property.',
  true
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- Now re-link the user_id if the auth user exists
UPDATE clients
SET user_id = (
  SELECT id FROM auth.users WHERE email = 'patrick@gavin.com' LIMIT 1
)
WHERE id = '22222222-2222-2222-2222-222222222204'
  AND EXISTS (SELECT 1 FROM auth.users WHERE email = 'patrick@gavin.com');
