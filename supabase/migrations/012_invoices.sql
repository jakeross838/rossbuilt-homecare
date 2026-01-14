-- 012_invoices.sql
-- Invoices and billing schema

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Invoice info
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_type TEXT NOT NULL, -- 'subscription', 'service', 'mixed'

  -- Dates
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  period_start DATE, -- For subscriptions
  period_end DATE,

  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 4) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  discount_description TEXT,
  total DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  balance_due DECIMAL(10, 2) NOT NULL,

  -- Status
  status invoice_status DEFAULT 'draft',

  -- Stripe
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,

  -- Delivery
  sent_at TIMESTAMPTZ,
  sent_to_email TEXT,
  viewed_at TIMESTAMPTZ,

  -- Payment
  paid_at TIMESTAMPTZ,
  payment_method TEXT,

  -- PDF
  pdf_url TEXT,

  -- Notes
  notes TEXT,
  terms TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice line items table
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Line item
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,

  -- Type and reference
  line_type TEXT, -- 'subscription', 'addon', 'service', 'work_order', 'materials', 'other'
  reference_type TEXT, -- 'program', 'work_order', 'service_request'
  reference_id UUID,
  property_id UUID REFERENCES properties(id),

  -- Order
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Payment info
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL, -- 'card', 'ach', 'check', 'cash', 'other'

  -- Stripe
  stripe_payment_id TEXT,
  stripe_charge_id TEXT,

  -- Details
  last_four TEXT, -- Card last 4
  card_brand TEXT,
  check_number TEXT,

  -- Notes
  notes TEXT,

  -- Recorded by
  recorded_by UUID REFERENCES users(id),

  -- Timestamps
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequences
CREATE SEQUENCE invoice_seq START 1000;

-- Indexes
CREATE INDEX idx_invoices_organization ON invoices(organization_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due ON invoices(due_date, status) WHERE status NOT IN ('paid', 'void');
CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_client ON payments(client_id);
