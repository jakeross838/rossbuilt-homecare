-- 016_settings.sql
-- Settings and pricing configuration schema

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,

  -- Metadata
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false, -- For API keys, etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, setting_key)
);

-- Pricing settings
CREATE TABLE pricing_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Version tracking
  version INTEGER DEFAULT 1,
  effective_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT true,

  -- Frequency pricing
  frequency_pricing JSONB NOT NULL DEFAULT '{
    "annual": 50,
    "semi_annual": 85,
    "quarterly": 150,
    "monthly": 275,
    "bi_weekly": 450
  }'::jsonb,

  -- Tier pricing
  tier_pricing JSONB NOT NULL DEFAULT '{
    "visual": 75,
    "functional": 150,
    "comprehensive": 250,
    "preventative": 375
  }'::jsonb,

  -- Add-on pricing
  addon_pricing JSONB NOT NULL DEFAULT '{
    "digital_manual": 25,
    "warranty_tracking": 15,
    "emergency_response": 50,
    "hurricane_monitoring": 25
  }'::jsonb,

  -- Service rates
  service_rates JSONB NOT NULL DEFAULT '{
    "hourly_rate": 85,
    "pre_storm_prep": 150,
    "post_storm_inspection": 250,
    "arrival_prep": 125,
    "departure_check": 100,
    "home_manual_creation": 350,
    "vendor_markup_percent": 15
  }'::jsonb,

  -- Time estimates (minutes)
  time_estimates JSONB NOT NULL DEFAULT '{
    "base_times": {
      "visual": 30,
      "functional": 60,
      "comprehensive": 120,
      "preventative": 180
    },
    "per_1000_sqft": {
      "visual": 5,
      "functional": 10,
      "comprehensive": 15,
      "preventative": 20
    },
    "feature_additions": {
      "pool": {"visual": 10, "functional": 15, "comprehensive": 25, "preventative": 35},
      "dock": {"visual": 10, "functional": 15, "comprehensive": 20, "preventative": 25},
      "generator": {"visual": 5, "functional": 10, "comprehensive": 15, "preventative": 20}
    }
  }'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_settings_organization ON settings(organization_id);
CREATE INDEX idx_settings_key ON settings(setting_key);
CREATE INDEX idx_pricing_organization ON pricing_config(organization_id);
CREATE INDEX idx_pricing_current ON pricing_config(organization_id, is_current) WHERE is_current = true;
