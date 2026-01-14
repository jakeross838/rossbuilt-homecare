-- 003_clients.sql
-- Clients table for managing customer relationships

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Portal login link

  -- Primary contact
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Secondary contact
  secondary_first_name TEXT,
  secondary_last_name TEXT,
  secondary_email TEXT,
  secondary_phone TEXT,
  secondary_relationship TEXT, -- 'spouse', 'assistant', 'family_office', etc.

  -- Billing
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_zip TEXT,
  billing_email TEXT, -- If different from primary email

  -- Stripe
  stripe_customer_id TEXT,

  -- Metadata
  source TEXT, -- 'referral', 'website', 'builder_handoff', etc.
  referral_source TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clients_organization ON clients(organization_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_user ON clients(user_id);
CREATE INDEX idx_clients_active ON clients(is_active) WHERE is_active = true;
CREATE INDEX idx_clients_name ON clients USING gin (
  (first_name || ' ' || last_name) gin_trgm_ops
);
