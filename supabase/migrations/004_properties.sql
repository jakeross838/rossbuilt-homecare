-- 004_properties.sql
-- Properties table for managing client properties

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Property name
  name TEXT NOT NULL, -- "Beach House", "Main Residence"

  -- Address
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  county TEXT,

  -- Geolocation
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Property details
  year_built INTEGER,
  square_footage INTEGER,
  lot_size_sqft INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  stories INTEGER DEFAULT 1,
  construction_type TEXT, -- 'CBS', 'Frame', 'Steel', etc.
  roof_type TEXT, -- 'Tile', 'Shingle', 'Metal', 'Flat'
  foundation_type TEXT, -- 'Slab', 'Crawl', 'Basement', 'Pilings'

  -- Location info
  flood_zone TEXT,
  is_coastal BOOLEAN DEFAULT false,
  is_gated_community BOOLEAN DEFAULT false,
  hoa_name TEXT,

  -- Access information
  gate_code TEXT,
  garage_code TEXT,
  lockbox_code TEXT,
  lockbox_location TEXT,
  alarm_code TEXT,
  alarm_company TEXT,
  alarm_company_phone TEXT,
  wifi_network TEXT,
  wifi_password TEXT,
  access_instructions TEXT,

  -- Property features (JSON for flexibility)
  features JSONB DEFAULT '{
    "pool": false,
    "spa": false,
    "outdoor_kitchen": false,
    "dock": false,
    "seawall": false,
    "boat_lift": false,
    "irrigation": false,
    "exterior_lighting": false,
    "fencing": false,
    "generator": false,
    "elevator": false,
    "water_treatment": false,
    "fire_sprinkler": false,
    "security_system": false,
    "central_vacuum": false,
    "whole_home_audio": false,
    "motorized_shades": false,
    "ev_charger": false,
    "solar": false,
    "attic_access": false,
    "crawl_space": false,
    "multiple_hvac": false,
    "guest_house": false,
    "detached_garage": false
  }'::jsonb,

  -- Media
  primary_photo_url TEXT,
  photos TEXT[] DEFAULT '{}',

  -- Documents
  site_plan_url TEXT,
  floor_plan_url TEXT,

  -- Notes
  notes TEXT,
  internal_notes TEXT, -- Staff only

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_properties_organization ON properties(organization_id);
CREATE INDEX idx_properties_client ON properties(client_id);
CREATE INDEX idx_properties_location ON properties(city, state);
CREATE INDEX idx_properties_active ON properties(is_active) WHERE is_active = true;
CREATE INDEX idx_properties_address ON properties USING gin (
  (address_line1 || ' ' || city || ' ' || state) gin_trgm_ops
);
CREATE INDEX idx_properties_features ON properties USING gin (features);
