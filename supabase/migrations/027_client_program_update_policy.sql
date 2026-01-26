-- 027_client_program_update_policy.sql
-- Add UPDATE policy for clients to modify their own programs (self-service plan management)

-- Allow clients to update their own programs
-- Restricts which fields can be updated to prevent security issues
CREATE POLICY "Clients can update their programs"
  ON programs FOR UPDATE
  USING (client_id = get_user_client_id())
  WITH CHECK (
    -- Ensure client can only update their own programs
    client_id = get_user_client_id() AND
    -- Prevent changing ownership fields
    client_id = (SELECT client_id FROM programs WHERE id = programs.id) AND
    property_id = (SELECT property_id FROM programs WHERE id = programs.id) AND
    organization_id = (SELECT organization_id FROM programs WHERE id = programs.id)
  );

-- Allow clients to insert into program_history (for tracking their changes)
CREATE POLICY "Clients can insert their program history"
  ON program_history FOR INSERT
  WITH CHECK (
    program_id IN (
      SELECT id FROM programs WHERE client_id = get_user_client_id()
    )
  );

-- Allow clients to view their program history
CREATE POLICY "Clients can view their program history"
  ON program_history FOR SELECT
  USING (
    program_id IN (
      SELECT id FROM programs WHERE client_id = get_user_client_id()
    )
  );

COMMENT ON POLICY "Clients can update their programs" ON programs IS
  'Allows clients to update their own service plans for self-service plan management.
   Ownership fields (client_id, property_id, organization_id) are immutable.';
