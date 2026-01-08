-- Migration: Add Checklists and Special Requests
-- Run this in Supabase SQL Editor

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pm_special_requests_property ON pm_special_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_pm_checklist_templates_property ON pm_checklist_templates(property_id);
CREATE INDEX IF NOT EXISTS idx_pm_checklist_completions_property ON pm_checklist_completions(property_id);
CREATE INDEX IF NOT EXISTS idx_pm_checklist_completions_template ON pm_checklist_completions(template_id);
CREATE INDEX IF NOT EXISTS idx_pm_checklist_completions_date ON pm_checklist_completions(scheduled_date);

-- Add source type for checklist-generated work orders
ALTER TABLE pm_work_orders DROP CONSTRAINT IF EXISTS pm_work_orders_source_check;
ALTER TABLE pm_work_orders ADD CONSTRAINT pm_work_orders_source_check
  CHECK (source IN ('tenant_request', 'inspection', 'admin', 'checklist'));

-- Sample checklist templates for existing properties
INSERT INTO pm_checklist_templates (property_id, name, frequency, items) VALUES
-- Sunset Apartments
('11111111-1111-1111-1111-111111111111', 'Weekly Walkthrough', 'weekly',
 '[{"name": "Common areas clean", "category": "cleanliness"},
   {"name": "Lobby lighting working", "category": "electrical"},
   {"name": "Hallway lights working", "category": "electrical"},
   {"name": "Exit signs illuminated", "category": "safety"},
   {"name": "Fire extinguishers accessible", "category": "safety"},
   {"name": "Trash areas clean", "category": "cleanliness"},
   {"name": "Parking lot clear", "category": "exterior"}]'),
('11111111-1111-1111-1111-111111111111', 'Monthly Inspection', 'monthly',
 '[{"name": "HVAC filters checked", "category": "hvac"},
   {"name": "Smoke detectors tested", "category": "safety"},
   {"name": "Common area plumbing", "category": "plumbing"},
   {"name": "Exterior lighting", "category": "electrical"},
   {"name": "Landscaping condition", "category": "exterior"},
   {"name": "Pool/amenities (if applicable)", "category": "amenities"},
   {"name": "Pest inspection", "category": "general"}]'),
('11111111-1111-1111-1111-111111111111', 'Quarterly Deep Check', 'quarterly',
 '[{"name": "Roof inspection", "category": "exterior"},
   {"name": "Gutter cleaning needed", "category": "exterior"},
   {"name": "Foundation check", "category": "structural"},
   {"name": "Water heater inspection", "category": "plumbing"},
   {"name": "HVAC system service", "category": "hvac"},
   {"name": "Parking lot condition", "category": "exterior"},
   {"name": "Building envelope check", "category": "structural"}]'),
('11111111-1111-1111-1111-111111111111', 'Annual Inspection', 'yearly',
 '[{"name": "Full roof inspection", "category": "exterior"},
   {"name": "Elevator certification (if applicable)", "category": "safety"},
   {"name": "Fire system inspection", "category": "safety"},
   {"name": "Backflow prevention test", "category": "plumbing"},
   {"name": "Full HVAC service", "category": "hvac"},
   {"name": "Parking lot reseal needed", "category": "exterior"},
   {"name": "Paint/exterior condition", "category": "exterior"},
   {"name": "Capital improvements needed", "category": "general"}]'),
-- Palm Gardens
('33333333-3333-3333-3333-333333333333', 'Weekly Walkthrough', 'weekly',
 '[{"name": "Common areas clean", "category": "cleanliness"},
   {"name": "Lighting working", "category": "electrical"},
   {"name": "Exit signs illuminated", "category": "safety"},
   {"name": "Fire extinguishers accessible", "category": "safety"},
   {"name": "Trash areas clean", "category": "cleanliness"}]'),
('33333333-3333-3333-3333-333333333333', 'Monthly Inspection', 'monthly',
 '[{"name": "HVAC filters checked", "category": "hvac"},
   {"name": "Smoke detectors tested", "category": "safety"},
   {"name": "Plumbing check", "category": "plumbing"},
   {"name": "Landscaping condition", "category": "exterior"}]'),
-- Oak Plaza Office
('22222222-2222-2222-2222-222222222222', 'Weekly Walkthrough', 'weekly',
 '[{"name": "Lobby clean and presentable", "category": "cleanliness"},
   {"name": "All lighting working", "category": "electrical"},
   {"name": "Restrooms stocked/clean", "category": "cleanliness"},
   {"name": "HVAC functioning", "category": "hvac"},
   {"name": "Parking lot clear", "category": "exterior"}]'),
('22222222-2222-2222-2222-222222222222', 'Monthly Inspection', 'monthly',
 '[{"name": "Elevator inspection", "category": "safety"},
   {"name": "Fire system check", "category": "safety"},
   {"name": "HVAC service", "category": "hvac"},
   {"name": "Janitorial quality", "category": "cleanliness"}]');

-- Schedule some upcoming checklists
INSERT INTO pm_checklist_completions (template_id, property_id, scheduled_date, status)
SELECT
  t.id,
  t.property_id,
  CURRENT_DATE + (
    CASE t.frequency
      WHEN 'weekly' THEN (s.n * 7)
      WHEN 'biweekly' THEN (s.n * 14)
      WHEN 'monthly' THEN (s.n * 30)
      WHEN 'quarterly' THEN (s.n * 90)
      WHEN 'yearly' THEN (s.n * 365)
    END
  )::INTEGER,
  'scheduled'
FROM pm_checklist_templates t
CROSS JOIN (SELECT generate_series(0, 2) AS n) s
WHERE t.is_active = true;
