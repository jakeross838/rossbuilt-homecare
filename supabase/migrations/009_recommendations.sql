-- 009_recommendations.sql

CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  inspection_id UUID REFERENCES inspections(id) ON DELETE SET NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,

  -- Source
  checklist_item_id TEXT, -- Reference to specific checklist item
  template_id UUID REFERENCES recommendation_templates(id),

  -- Recommendation content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- 'repair', 'maintenance', 'replacement', 'upgrade', 'safety'
  priority priority_level NOT NULL DEFAULT 'medium',

  -- Cost estimates
  estimated_cost_low DECIMAL(10, 2),
  estimated_cost_high DECIMAL(10, 2),

  -- AI enhancement
  ai_enhanced_description TEXT,
  ai_why_it_matters TEXT,
  ai_enhanced_at TIMESTAMPTZ,

  -- Photos
  photos TEXT[] DEFAULT '{}',

  -- Status
  status recommendation_status DEFAULT 'pending',

  -- Client response
  client_responded_at TIMESTAMPTZ,
  client_response_notes TEXT,
  declined_reason TEXT,

  -- Conversion
  work_order_id UUID, -- Set when converted to work order

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_recommendations_organization ON recommendations(organization_id);
CREATE INDEX idx_recommendations_property ON recommendations(property_id);
CREATE INDEX idx_recommendations_inspection ON recommendations(inspection_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_pending ON recommendations(status, created_at)
  WHERE status = 'pending';
