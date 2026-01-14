-- 011_service_requests.sql

CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Request info
  request_number TEXT UNIQUE NOT NULL,
  request_type TEXT NOT NULL,
  -- 'maintenance', 'emergency', 'storm_prep', 'arrival', 'departure', 'question', 'other'

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority priority_level DEFAULT 'medium',

  -- Status
  status service_request_status DEFAULT 'new',

  -- Assignment
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Photos
  photos TEXT[] DEFAULT '{}',

  -- Resolution
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),

  -- Conversion
  work_order_id UUID REFERENCES work_orders(id),

  -- Communication
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service request comments
CREATE TABLE service_request_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Comment
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal = not visible to client

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequence
CREATE SEQUENCE service_request_seq START 1000;

-- Indexes
CREATE INDEX idx_service_requests_organization ON service_requests(organization_id);
CREATE INDEX idx_service_requests_property ON service_requests(property_id);
CREATE INDEX idx_service_requests_client ON service_requests(client_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_number ON service_requests(request_number);
CREATE INDEX idx_sr_comments_request ON service_request_comments(service_request_id);
