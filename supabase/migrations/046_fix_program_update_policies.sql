-- Fix: Remove duplicate/broken program update policy for clients
-- There are two policies:
--   1. "Clients can update their own programs" (correct - from migration 043)
--   2. "Clients can update their programs" (broken - has buggy WITH CHECK)
-- Drop the broken one and keep the correct one

DROP POLICY IF EXISTS "Clients can update their programs" ON programs;

-- Also ensure the update query in use-programs.ts will work
-- The SELECT policy needs to allow clients to read programs they own
-- Add a policy that allows clients to SELECT their programs too

DROP POLICY IF EXISTS "Clients can view their own programs" ON programs;
CREATE POLICY "Clients can view their own programs"
  ON programs FOR SELECT
  USING (client_id = get_user_client_id());
