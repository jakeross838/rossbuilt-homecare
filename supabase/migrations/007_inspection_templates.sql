-- 007_inspection_templates.sql

CREATE TABLE inspection_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Template info
  name TEXT NOT NULL,
  description TEXT,

  -- Scope
  tier inspection_tier NOT NULL,
  category TEXT, -- 'exterior', 'interior', 'hvac', etc. NULL = general
  feature_type TEXT, -- 'pool', 'dock', etc. NULL = always include
  equipment_category TEXT, -- If specific to equipment type

  -- Checklist items (structured)
  sections JSONB NOT NULL DEFAULT '[]',
  /*
    Structure:
    [
      {
        "id": "section_1",
        "name": "Roof",
        "order": 1,
        "items": [
          {
            "id": "item_1",
            "text": "Roof surface condition",
            "type": "status", // status, text, number, select, photo
            "options": [], // For select type
            "photo_required": false,
            "photo_recommended": true,
            "recommendation_template_id": "roof_condition",
            "help_text": "Check for missing shingles, cracks, debris"
          }
        ]
      }
    ]
  */

  -- Time estimate
  estimated_minutes INTEGER,

  -- Versioning
  version INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT true,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendation templates
CREATE TABLE recommendation_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Template info
  template_key TEXT NOT NULL, -- Unique key for lookup
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- 'roofing', 'hvac', 'plumbing', etc.

  -- Defaults
  default_priority priority_level DEFAULT 'medium',
  estimated_cost_low DECIMAL(10, 2),
  estimated_cost_high DECIMAL(10, 2),

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, template_key)
);

-- Indexes
CREATE INDEX idx_templates_organization ON inspection_templates(organization_id);
CREATE INDEX idx_templates_tier ON inspection_templates(tier);
CREATE INDEX idx_templates_category ON inspection_templates(category);
CREATE INDEX idx_templates_feature ON inspection_templates(feature_type);
CREATE INDEX idx_templates_active ON inspection_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_rec_templates_organization ON recommendation_templates(organization_id);
CREATE INDEX idx_rec_templates_key ON recommendation_templates(template_key);
