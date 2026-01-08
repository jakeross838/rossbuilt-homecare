-- Property Maintenance App Schema
-- Run this in Supabase SQL Editor

-- Properties (buildings/addresses you manage)
CREATE TABLE IF NOT EXISTS pm_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'residential' CHECK (type IN ('residential', 'commercial')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Units within properties
CREATE TABLE IF NOT EXISTS pm_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES pm_properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  bedrooms INTEGER DEFAULT 0,
  bathrooms DECIMAL(3,1) DEFAULT 1,
  sqft INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'vacant' CHECK (status IN ('occupied', 'vacant', 'maintenance')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(property_id, unit_number)
);

-- Tenants
CREATE TABLE IF NOT EXISTS pm_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES pm_units(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  access_code TEXT NOT NULL DEFAULT LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
  lease_start DATE,
  lease_end DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Work Orders (core of the system)
CREATE TABLE IF NOT EXISTS pm_work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES pm_properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES pm_units(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES pm_tenants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('plumbing', 'electrical', 'hvac', 'appliance', 'general')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'in_progress', 'completed', 'cancelled')),
  source TEXT NOT NULL DEFAULT 'admin' CHECK (source IN ('tenant_request', 'inspection', 'admin')),
  assigned_to TEXT,
  scheduled_date DATE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inspections
CREATE TABLE IF NOT EXISTS pm_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES pm_properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES pm_units(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'routine' CHECK (type IN ('move_in', 'move_out', 'routine', 'annual')),
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  inspector TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  checklist JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Work Order Activity (audit log)
CREATE TABLE IF NOT EXISTS pm_work_order_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES pm_work_orders(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Special Requests (non-maintenance requests from tenants/clients)
CREATE TABLE IF NOT EXISTS pm_special_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES pm_properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES pm_units(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES pm_tenants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'completed')),
  response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checklist Templates (define what to check at each frequency)
CREATE TABLE IF NOT EXISTS pm_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES pm_properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  items JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checklist Completions (actual walkthrough records)
CREATE TABLE IF NOT EXISTS pm_checklist_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES pm_checklist_templates(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES pm_properties(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  results JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pm_units_property ON pm_units(property_id);
CREATE INDEX IF NOT EXISTS idx_pm_tenants_unit ON pm_tenants(unit_id);
CREATE INDEX IF NOT EXISTS idx_pm_tenants_email ON pm_tenants(email);
CREATE INDEX IF NOT EXISTS idx_pm_work_orders_property ON pm_work_orders(property_id);
CREATE INDEX IF NOT EXISTS idx_pm_work_orders_status ON pm_work_orders(status);
CREATE INDEX IF NOT EXISTS idx_pm_work_orders_priority ON pm_work_orders(priority);
CREATE INDEX IF NOT EXISTS idx_pm_inspections_property ON pm_inspections(property_id);
CREATE INDEX IF NOT EXISTS idx_pm_inspections_status ON pm_inspections(status);
CREATE INDEX IF NOT EXISTS idx_pm_special_requests_property ON pm_special_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_pm_checklist_templates_property ON pm_checklist_templates(property_id);
CREATE INDEX IF NOT EXISTS idx_pm_checklist_completions_property ON pm_checklist_completions(property_id);
CREATE INDEX IF NOT EXISTS idx_pm_checklist_completions_template ON pm_checklist_completions(template_id);
CREATE INDEX IF NOT EXISTS idx_pm_checklist_completions_date ON pm_checklist_completions(scheduled_date);
