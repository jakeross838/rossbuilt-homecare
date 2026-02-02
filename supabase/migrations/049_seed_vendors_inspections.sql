-- Seed demo vendors and inspections for Patrick Gavin
-- These will sync to the client portal

-- =====================
-- DEMO VENDORS
-- =====================

INSERT INTO vendors (
  id,
  organization_id,
  company_name,
  contact_first_name,
  contact_last_name,
  email,
  phone,
  address_line1,
  city,
  state,
  zip,
  trade_categories,
  license_number,
  license_expiration,
  insurance_expiration,
  w9_on_file,
  is_preferred,
  is_active,
  average_rating,
  total_jobs,
  completed_jobs
) VALUES
-- HVAC Vendor
(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee01',
  '00000000-0000-0000-0000-000000000001',
  'Coastal Air Conditioning',
  'Mike',
  'Johnson',
  'mike@coastalac.com',
  '941-555-2222',
  '456 Industrial Blvd',
  'Sarasota',
  'FL',
  '34236',
  ARRAY['hvac', 'electrical'],
  'CAC-123456',
  '2027-06-30',
  '2027-01-15',
  true,
  true,
  true,
  4.8,
  45,
  42
),
-- Plumbing Vendor
(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee02',
  '00000000-0000-0000-0000-000000000001',
  'Island Plumbing Services',
  'Sarah',
  'Martinez',
  'sarah@islandplumbing.com',
  '941-555-3333',
  '789 Trade Center Dr',
  'Bradenton',
  'FL',
  '34205',
  ARRAY['plumbing'],
  'CFC-789012',
  '2026-12-31',
  '2026-08-01',
  true,
  true,
  true,
  4.9,
  38,
  38
),
-- General Contractor
(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee03',
  '00000000-0000-0000-0000-000000000001',
  'Gulf Coast Repairs LLC',
  'Tom',
  'Williams',
  'tom@gulfcoastrepairs.com',
  '941-555-4444',
  '123 Contractor Way',
  'Holmes Beach',
  'FL',
  '34217',
  ARRAY['general', 'roofing', 'painting'],
  'CGC-345678',
  '2027-03-15',
  '2026-11-30',
  true,
  false,
  true,
  4.5,
  22,
  20
),
-- Pool Service
(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee04',
  '00000000-0000-0000-0000-000000000001',
  'Crystal Clear Pools',
  'Dave',
  'Nelson',
  'dave@crystalclearpools.com',
  '941-555-5555',
  '555 Pool Service Rd',
  'Longboat Key',
  'FL',
  '34228',
  ARRAY['pool'],
  'CPC-901234',
  '2026-09-30',
  '2026-07-15',
  true,
  true,
  true,
  4.7,
  156,
  154
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  is_active = EXCLUDED.is_active;

-- =====================
-- DEMO INSPECTIONS (for Patrick Gavin's Gavin Home property)
-- =====================

-- Property ID for Gavin Home: 8a1754dc-85d6-4025-8420-807f41d3a3dd
-- Organization ID: 00000000-0000-0000-0000-000000000001

-- Completed inspection from last month
INSERT INTO inspections (
  id,
  organization_id,
  property_id,
  inspection_type,
  status,
  scheduled_date,
  scheduled_time_start,
  scheduled_time_end,
  actual_start_at,
  actual_end_at,
  overall_condition,
  summary,
  findings,
  completed_at
) VALUES (
  '11111111-1111-1111-1111-111111111101',
  '00000000-0000-0000-0000-000000000001',
  '8a1754dc-85d6-4025-8420-807f41d3a3dd',
  'scheduled',
  'completed',
  CURRENT_DATE - INTERVAL '30 days',
  '09:00',
  '11:00',
  (CURRENT_DATE - INTERVAL '30 days')::timestamp + TIME '09:15',
  (CURRENT_DATE - INTERVAL '30 days')::timestamp + TIME '10:45',
  'good',
  'Property is in good overall condition. Minor landscaping maintenance needed. Pool equipment operating normally. HVAC filters replaced.',
  '{
    "exterior_1": {"status": "pass", "notes": "Exterior walls in good condition"},
    "exterior_2": {"status": "pass", "notes": "Roof appears intact, no visible damage"},
    "exterior_3": {"status": "needs_attention", "notes": "Landscaping needs trimming around side yard"},
    "pool_1": {"status": "pass", "notes": "Pool water chemistry balanced"},
    "pool_2": {"status": "pass", "notes": "Pool equipment operating normally"},
    "hvac_1": {"status": "pass", "notes": "AC cooling properly, filters replaced"},
    "interior_1": {"status": "pass", "notes": "No signs of water intrusion"},
    "interior_2": {"status": "pass", "notes": "All appliances operational"}
  }'::jsonb,
  (CURRENT_DATE - INTERVAL '30 days')::timestamp + TIME '10:45'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  summary = EXCLUDED.summary;

-- Completed inspection from 2 weeks ago
INSERT INTO inspections (
  id,
  organization_id,
  property_id,
  inspection_type,
  status,
  scheduled_date,
  scheduled_time_start,
  scheduled_time_end,
  actual_start_at,
  actual_end_at,
  overall_condition,
  summary,
  findings,
  completed_at
) VALUES (
  '11111111-1111-1111-1111-111111111102',
  '00000000-0000-0000-0000-000000000001',
  '8a1754dc-85d6-4025-8420-807f41d3a3dd',
  'scheduled',
  'completed',
  CURRENT_DATE - INTERVAL '14 days',
  '10:00',
  '12:00',
  (CURRENT_DATE - INTERVAL '14 days')::timestamp + TIME '10:00',
  (CURRENT_DATE - INTERVAL '14 days')::timestamp + TIME '11:30',
  'excellent',
  'Property continues to be well maintained. All systems functioning properly. Landscaping issue from previous inspection has been addressed.',
  '{
    "exterior_1": {"status": "pass", "notes": "Exterior excellent condition"},
    "exterior_2": {"status": "pass", "notes": "Gutters clean"},
    "exterior_3": {"status": "pass", "notes": "Landscaping now properly maintained"},
    "pool_1": {"status": "pass", "notes": "Pool sparkling clean"},
    "pool_2": {"status": "pass", "notes": "Pool heater tested and working"},
    "hvac_1": {"status": "pass", "notes": "AC maintaining 72F as set"},
    "interior_1": {"status": "pass", "notes": "All rooms checked, no issues"},
    "interior_2": {"status": "pass", "notes": "Smoke detectors tested"}
  }'::jsonb,
  (CURRENT_DATE - INTERVAL '14 days')::timestamp + TIME '11:30'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  summary = EXCLUDED.summary;

-- Upcoming scheduled inspection
INSERT INTO inspections (
  id,
  organization_id,
  property_id,
  inspection_type,
  status,
  scheduled_date,
  scheduled_time_start,
  scheduled_time_end,
  overall_condition,
  summary
) VALUES (
  '11111111-1111-1111-1111-111111111103',
  '00000000-0000-0000-0000-000000000001',
  '8a1754dc-85d6-4025-8420-807f41d3a3dd',
  'scheduled',
  'scheduled',
  CURRENT_DATE + INTERVAL '7 days',
  '09:00',
  '11:00',
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  scheduled_date = EXCLUDED.scheduled_date,
  status = EXCLUDED.status;

-- Another upcoming inspection (storm prep for hurricane season)
INSERT INTO inspections (
  id,
  organization_id,
  property_id,
  inspection_type,
  status,
  scheduled_date,
  scheduled_time_start,
  scheduled_time_end,
  overall_condition,
  summary
) VALUES (
  '11111111-1111-1111-1111-111111111104',
  '00000000-0000-0000-0000-000000000001',
  '8a1754dc-85d6-4025-8420-807f41d3a3dd',
  'storm_pre',
  'scheduled',
  CURRENT_DATE + INTERVAL '14 days',
  '08:00',
  '10:00',
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  scheduled_date = EXCLUDED.scheduled_date,
  status = EXCLUDED.status;
