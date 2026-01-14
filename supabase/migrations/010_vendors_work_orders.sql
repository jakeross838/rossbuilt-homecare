-- 010_vendors_work_orders.sql

-- Vendors
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Company info
  company_name TEXT NOT NULL,
  contact_first_name TEXT,
  contact_last_name TEXT,
  email TEXT,
  phone TEXT,

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,

  -- Capabilities
  trade_categories TEXT[] DEFAULT '{}', -- ['hvac', 'plumbing', 'electrical']
  service_area TEXT[], -- Zip codes or cities

  -- Business info
  license_number TEXT,
  license_expiration DATE,
  insurance_company TEXT,
  insurance_policy_number TEXT,
  insurance_expiration DATE,
  w9_on_file BOOLEAN DEFAULT false,
  w9_received_date DATE,

  -- Performance metrics
  total_jobs INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2), -- 1.00 - 5.00
  average_response_hours DECIMAL(6, 2),

  -- Preferences
  is_preferred BOOLEAN DEFAULT false,
  notes TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work orders
CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Source
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE SET NULL,
  service_request_id UUID, -- Will reference service_requests

  -- Assignment
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL, -- Internal staff

  -- Work order info
  work_order_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- 'hvac', 'plumbing', etc.
  priority priority_level DEFAULT 'medium',

  -- Status
  status work_order_status DEFAULT 'pending',

  -- Scheduling
  scheduled_date DATE,
  scheduled_time_start TIME,
  scheduled_time_end TIME,

  -- Actual times
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Costs
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  markup_percent DECIMAL(5, 2),
  markup_amount DECIMAL(10, 2),
  total_client_cost DECIMAL(10, 2),

  -- Documentation
  before_photos TEXT[] DEFAULT '{}',
  after_photos TEXT[] DEFAULT '{}',
  vendor_invoice_url TEXT,
  completion_notes TEXT,

  -- Billing
  invoice_id UUID, -- Will reference invoices
  invoiced_at TIMESTAMPTZ,

  -- Notes
  internal_notes TEXT,
  client_visible_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work order sequence for work_order_number
CREATE SEQUENCE work_order_seq START 1000;

-- Indexes
CREATE INDEX idx_vendors_organization ON vendors(organization_id);
CREATE INDEX idx_vendors_trades ON vendors USING gin(trade_categories);
CREATE INDEX idx_vendors_active ON vendors(is_active) WHERE is_active = true;
CREATE INDEX idx_work_orders_organization ON work_orders(organization_id);
CREATE INDEX idx_work_orders_property ON work_orders(property_id);
CREATE INDEX idx_work_orders_client ON work_orders(client_id);
CREATE INDEX idx_work_orders_vendor ON work_orders(vendor_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_number ON work_orders(work_order_number);
