-- 006_equipment.sql

CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

  -- Equipment identification
  category TEXT NOT NULL, -- 'hvac', 'plumbing', 'kitchen', etc.
  equipment_type TEXT NOT NULL, -- 'air_handler', 'water_heater', etc.
  custom_name TEXT, -- User-defined name like "Main Floor AC"

  -- Manufacturer info
  manufacturer TEXT,
  model_number TEXT,
  serial_number TEXT,

  -- Dates
  install_date DATE,
  warranty_expiration DATE,
  expected_lifespan_years INTEGER,

  -- Location
  location TEXT, -- "Garage mechanical room"
  serves TEXT, -- "2nd floor", "Whole home"

  -- Specifications
  capacity TEXT, -- "3-ton", "50 gallon"
  filter_size TEXT,
  fuel_type TEXT, -- 'electric', 'gas', 'propane'
  specs JSONB DEFAULT '{}', -- Additional specs

  -- AI-generated content
  maintenance_schedule JSONB DEFAULT '[]',
  inspection_checklist JSONB DEFAULT '{
    "visual": [],
    "functional": [],
    "comprehensive": [],
    "preventative": []
  }'::jsonb,
  troubleshooting_guide JSONB DEFAULT '[]',
  ai_generated_at TIMESTAMPTZ,

  -- Media
  photo_url TEXT,
  photos TEXT[] DEFAULT '{}',
  manual_url TEXT, -- Uploaded PDF manual

  -- Service history tracking
  last_service_date DATE,
  last_service_notes TEXT,
  service_count INTEGER DEFAULT 0,

  -- Notes
  notes TEXT,

  -- Status
  condition condition_rating,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment service log
CREATE TABLE equipment_service_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  service_type TEXT NOT NULL, -- 'maintenance', 'repair', 'replacement', 'inspection'
  performed_by TEXT, -- Vendor name or 'Ross Built'
  description TEXT,
  cost DECIMAL(10, 2),
  notes TEXT,
  work_order_id UUID, -- Link to work order if applicable
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_equipment_property ON equipment(property_id);
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_warranty ON equipment(warranty_expiration);
CREATE INDEX idx_equipment_active ON equipment(is_active) WHERE is_active = true;
CREATE INDEX idx_equipment_service_log_equipment ON equipment_service_log(equipment_id);
CREATE INDEX idx_equipment_service_log_date ON equipment_service_log(service_date DESC);
