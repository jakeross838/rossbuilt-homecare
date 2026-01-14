-- 005_programs.sql

CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Program configuration
  inspection_frequency inspection_frequency NOT NULL,
  inspection_tier inspection_tier NOT NULL,

  -- Add-ons
  addon_digital_manual BOOLEAN DEFAULT false,
  addon_warranty_tracking BOOLEAN DEFAULT false,
  addon_emergency_response BOOLEAN DEFAULT false,
  addon_hurricane_monitoring BOOLEAN DEFAULT false,

  -- Pricing (calculated and stored)
  base_fee DECIMAL(10, 2) NOT NULL,
  tier_fee DECIMAL(10, 2) NOT NULL,
  addons_fee DECIMAL(10, 2) DEFAULT 0,
  monthly_total DECIMAL(10, 2) NOT NULL,

  -- Vendor coordination markup
  vendor_markup_percent DECIMAL(5, 2) DEFAULT 15.00,

  -- Status
  status program_status DEFAULT 'pending',

  -- Scheduling preferences
  preferred_day_of_week INTEGER, -- 0=Sunday, 6=Saturday
  preferred_time_slot TEXT, -- 'morning', 'afternoon', 'anytime'
  preferred_inspector_id UUID REFERENCES users(id),

  -- Billing
  billing_start_date DATE,
  billing_day_of_month INTEGER DEFAULT 1,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,

  -- Notes
  notes TEXT,

  -- Timestamps
  activated_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial unique constraint for one active program per property
CREATE UNIQUE INDEX idx_programs_unique_active_per_property
  ON programs(property_id)
  WHERE status = 'active';

-- Program history (for tracking changes)
CREATE TABLE program_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES users(id),
  change_type TEXT NOT NULL, -- 'created', 'updated', 'status_change'
  previous_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_programs_organization ON programs(organization_id);
CREATE INDEX idx_programs_property ON programs(property_id);
CREATE INDEX idx_programs_client ON programs(client_id);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_active ON programs(status) WHERE status = 'active';
CREATE INDEX idx_program_history_program ON program_history(program_id);
