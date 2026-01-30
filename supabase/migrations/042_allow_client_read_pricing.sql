-- Allow clients to read pricing config for self-service plan editor
-- The existing policy blocks clients: get_user_role() != 'client'
-- We need clients to see pricing to use the plan editor

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their org pricing config" ON pricing_config;

-- Create new policy that allows all authenticated users in the org to read pricing
-- Pricing is not sensitive - it's just the price list
CREATE POLICY "Users can view their org pricing config"
  ON pricing_config FOR SELECT
  USING (organization_id = get_user_organization_id());
