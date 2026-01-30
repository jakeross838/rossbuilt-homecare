-- 029_user_management.sql
-- User property assignments for tech scoping and user management

-- =============================================================================
-- JUNCTION TABLE: User Property Assignments
-- =============================================================================
-- Allows assigning techs (inspectors) to specific properties
-- Techs will only see properties they're assigned to

CREATE TABLE IF NOT EXISTS user_property_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

  -- Assignment metadata
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate assignments
  UNIQUE(user_id, property_id)
);

-- Add comment
COMMENT ON TABLE user_property_assignments IS 'Junction table linking tech users to specific properties they can access';

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_upa_organization ON user_property_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_upa_user ON user_property_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_upa_property ON user_property_assignments(property_id);
CREATE INDEX IF NOT EXISTS idx_upa_assigned_by ON user_property_assignments(assigned_by);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

ALTER TABLE user_property_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can view property assignments" ON user_property_assignments;
DROP POLICY IF EXISTS "Admin/Manager can insert property assignments" ON user_property_assignments;
DROP POLICY IF EXISTS "Admin/Manager can update property assignments" ON user_property_assignments;
DROP POLICY IF EXISTS "Admin/Manager can delete property assignments" ON user_property_assignments;

-- Staff (non-clients) can view all assignments in their org
CREATE POLICY "Staff can view property assignments"
  ON user_property_assignments FOR SELECT
  USING (
    organization_id = get_user_organization_id()
    AND get_user_role() != 'client'
  );

-- Admin/Manager can insert assignments
CREATE POLICY "Admin/Manager can insert property assignments"
  ON user_property_assignments FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND is_admin_or_manager()
  );

-- Admin/Manager can update assignments
CREATE POLICY "Admin/Manager can update property assignments"
  ON user_property_assignments FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND is_admin_or_manager()
  );

-- Admin/Manager can delete assignments
CREATE POLICY "Admin/Manager can delete property assignments"
  ON user_property_assignments FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND is_admin_or_manager()
  );

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get all property IDs assigned to the current user
CREATE OR REPLACE FUNCTION get_user_assigned_properties()
RETURNS SETOF UUID AS $$
  SELECT property_id
  FROM user_property_assignments
  WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if a user has assignment to a specific property
CREATE OR REPLACE FUNCTION user_has_property_assignment(check_user_id UUID, check_property_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_property_assignments
    WHERE user_id = check_user_id
    AND property_id = check_property_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get count of assigned properties for a user
CREATE OR REPLACE FUNCTION get_user_assignment_count(check_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM user_property_assignments
  WHERE user_id = check_user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- TRIGGER: Update timestamps
-- =============================================================================

DROP TRIGGER IF EXISTS update_user_property_assignments_updated_at ON user_property_assignments;
CREATE TRIGGER update_user_property_assignments_updated_at
  BEFORE UPDATE ON user_property_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
