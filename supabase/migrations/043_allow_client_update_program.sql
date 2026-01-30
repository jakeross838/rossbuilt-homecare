-- Allow clients to update their own programs for self-service plan editor
-- Currently only Admin/Manager can update programs

-- Add policy for clients to update their own programs
CREATE POLICY "Clients can update their own programs"
  ON programs FOR UPDATE
  USING (client_id = get_user_client_id())
  WITH CHECK (client_id = get_user_client_id());
