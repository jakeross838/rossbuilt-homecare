-- 008_inspections.sql

CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  inspector_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Type
  inspection_type TEXT NOT NULL DEFAULT 'scheduled',
  -- 'scheduled', 'storm_pre', 'storm_post', 'arrival', 'departure', 'special', 'initial'

  -- Status
  status inspection_status DEFAULT 'scheduled',

  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  estimated_duration_minutes INTEGER,

  -- Actual times
  actual_start_at TIMESTAMPTZ,
  actual_end_at TIMESTAMPTZ,
  actual_duration_minutes INTEGER,

  -- Checklist (snapshot at time of inspection)
  checklist JSONB NOT NULL DEFAULT '{}',
  /*
    Structure copied from templates at scheduling time:
    {
      "sections": [...],
      "generated_at": "timestamp",
      "template_versions": {"template_id": version}
    }
  */

  -- Results
  findings JSONB DEFAULT '{}',
  /*
    Structure:
    {
      "item_id": {
        "status": "pass|fail|na|needs_attention|urgent",
        "response": "text if applicable",
        "numeric_value": 0,
        "photos": ["url1", "url2"],
        "notes": "text",
        "recommendation_added": true|false,
        "completed_at": "timestamp"
      }
    }
  */

  -- Summary
  overall_condition condition_rating,
  summary TEXT, -- AI-generated or manual
  internal_notes TEXT,

  -- Weather context
  weather_conditions JSONB DEFAULT '{}',
  /*
    {
      "temperature": 85,
      "humidity": 70,
      "conditions": "Partly Cloudy",
      "wind_speed": 10
    }
  */

  -- Report
  report_url TEXT,
  report_generated_at TIMESTAMPTZ,
  report_sent_at TIMESTAMPTZ,
  report_viewed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Inspection photos (separate for better querying)
CREATE TABLE inspection_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  item_id TEXT, -- Reference to checklist item
  section_id TEXT,

  -- Photo info
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,

  -- Metadata
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  file_size INTEGER,
  width INTEGER,
  height INTEGER,

  -- Order
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_inspections_organization ON inspections(organization_id);
CREATE INDEX idx_inspections_property ON inspections(property_id);
CREATE INDEX idx_inspections_program ON inspections(program_id);
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_date ON inspections(scheduled_date);
CREATE INDEX idx_inspections_upcoming ON inspections(scheduled_date, status)
  WHERE status IN ('scheduled', 'in_progress');
CREATE INDEX idx_inspection_photos_inspection ON inspection_photos(inspection_id);
