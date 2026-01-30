-- 035_fix_user_self_select.sql (renamed from 030)
-- Allow users to always read their own profile (needed for login to work)

-- Users must be able to read their own record for auth to work
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Clients must be able to read their own client record
DROP POLICY IF EXISTS "Clients can view own client record" ON clients;
CREATE POLICY "Clients can view own client record"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

-- Clients can view properties belonging to their client record
DROP POLICY IF EXISTS "Clients can view own properties" ON properties;
CREATE POLICY "Clients can view own properties"
  ON properties FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));
