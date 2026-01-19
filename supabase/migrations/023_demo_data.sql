-- 023_demo_data.sql
-- Comprehensive demo data for testing all features
-- Organization: Ross Built Custom Homes (00000000-0000-0000-0000-000000000001)

-- =============================================================================
-- CLIENTS (3 clients with different profiles)
-- =============================================================================

INSERT INTO clients (id, organization_id, name, email, phone, secondary_email, secondary_phone, billing_address, notes, is_active) VALUES
  (
    '22222222-2222-2222-2222-222222222201',
    '00000000-0000-0000-0000-000000000001',
    'Michael & Sarah Thompson',
    'mthompson@email.com',
    '941-555-1234',
    'sthompson@email.com',
    '941-555-1235',
    '{"line1": "456 Oak Lane", "line2": "", "city": "Bradenton", "state": "FL", "zip": "34209"}'::jsonb,
    'Preferred contact method: email. Snowbirds - in FL from Oct to April.',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    '00000000-0000-0000-0000-000000000001',
    'Robert Martinez',
    'rmartinez@business.com',
    '941-555-2345',
    NULL,
    NULL,
    '{"line1": "789 Palm Ave", "line2": "Suite 100", "city": "Sarasota", "state": "FL", "zip": "34236"}'::jsonb,
    'Business owner with multiple properties. Prefers detailed reports.',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    '00000000-0000-0000-0000-000000000001',
    'Jennifer & David Wilson',
    'jwilson@gmail.com',
    '941-555-3456',
    'dwilson@gmail.com',
    '941-555-3457',
    '{"line1": "123 Beach Blvd", "city": "Longboat Key", "state": "FL", "zip": "34228"}'::jsonb,
    'New clients as of 2024. Very responsive.',
    true
  );

-- =============================================================================
-- PROPERTIES (3 properties with different features)
-- =============================================================================

INSERT INTO properties (id, organization_id, client_id, name, address, features, access_info, notes, is_active) VALUES
  (
    '33333333-3333-3333-3333-333333333301',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222201',
    'Thompson Residence',
    '{"line1": "1234 Sunset Drive", "city": "Bradenton", "state": "FL", "zip": "34209"}'::jsonb,
    '{"pool": true, "spa": true, "boat_dock": false, "elevator": false, "solar": true, "smart_home": true, "generator": true, "fire_sprinkler": true, "wine_cellar": false, "outdoor_kitchen": true}'::jsonb,
    '{"gate_code": "1234", "lockbox_code": "5678", "alarm_code": "9012", "alarm_company": "ADT", "alarm_phone": "800-238-2727", "wifi_name": "ThompsonHome", "wifi_password": "WelcomeHome2024", "special_instructions": "Dogs are friendly. Key under blue pot by side door."}'::jsonb,
    'Beautiful waterfront property with extensive pool area. 4BR/3BA, 3500 sqft. Built 2018.',
    true
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222202',
    'Martinez Beach House',
    '{"line1": "567 Gulf Shore Blvd", "city": "Sarasota", "state": "FL", "zip": "34236"}'::jsonb,
    '{"pool": true, "spa": false, "boat_dock": true, "elevator": true, "solar": false, "smart_home": true, "generator": true, "fire_sprinkler": true, "wine_cellar": true, "outdoor_kitchen": true}'::jsonb,
    '{"gate_code": "4567", "lockbox_code": "", "alarm_code": "3456", "alarm_company": "Vivint", "alarm_phone": "855-832-1550", "special_instructions": "Call ahead before arriving. Housekeeper on-site Mon/Thu."}'::jsonb,
    'Luxury beachfront property. 5BR/5BA, 5200 sqft. Built 2015. Full elevator access.',
    true
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222203',
    'Wilson Family Home',
    '{"line1": "890 Bay View Lane", "city": "Longboat Key", "state": "FL", "zip": "34228"}'::jsonb,
    '{"pool": false, "spa": true, "boat_dock": false, "elevator": false, "solar": true, "smart_home": false, "generator": false, "fire_sprinkler": false, "wine_cellar": false, "outdoor_kitchen": false}'::jsonb,
    '{"gate_code": "", "lockbox_code": "2468", "alarm_code": "", "special_instructions": "No alarm system. Use lockbox on front door."}'::jsonb,
    'Cozy family home. 3BR/2BA, 2200 sqft. Built 2010. Recently updated kitchen.',
    true
  );

-- =============================================================================
-- EQUIPMENT (for each property)
-- =============================================================================

INSERT INTO equipment (id, organization_id, property_id, name, category, manufacturer, model_number, serial_number, install_date, warranty_expiration, location, specifications, notes) VALUES
  -- Thompson Residence Equipment
  (
    '44444444-4444-4444-4444-444444444401',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    'Main Floor HVAC',
    'hvac',
    'Carrier',
    'CA16NA036',
    'SN-2018-CAR-001',
    '2018-03-15',
    '2028-03-15',
    'Garage mechanical room',
    '{"capacity": "3 ton", "seer": 16, "type": "split system"}'::jsonb,
    '10-year warranty. Annual service recommended.'
  ),
  (
    '44444444-4444-4444-4444-444444444402',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    'Pool Equipment - Pump',
    'pool_equipment',
    'Pentair',
    'IntelliFlo VSF',
    'SN-2020-PEN-001',
    '2020-06-01',
    '2025-06-01',
    'Pool equipment pad',
    '{"hp": "3", "variable_speed": true}'::jsonb,
    'Variable speed pump. Upgraded in 2020.'
  ),
  (
    '44444444-4444-4444-4444-444444444403',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    'Water Heater',
    'water_heater',
    'Rheem',
    'PROG50-38N RH67',
    'SN-2018-RHE-001',
    '2018-03-15',
    '2024-03-15',
    'Garage',
    '{"capacity_gallons": 50, "type": "gas", "energy_factor": 0.67}'::jsonb,
    'Warranty expired. Consider replacement soon.'
  ),
  -- Martinez Beach House Equipment
  (
    '44444444-4444-4444-4444-444444444404',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    'HVAC Zone 1 - Main Living',
    'hvac',
    'Trane',
    'XR15',
    'SN-2015-TRN-001',
    '2015-08-20',
    '2025-08-20',
    'Attic mechanical room',
    '{"capacity": "4 ton", "seer": 15, "zones": "Zone 1"}'::jsonb,
    'Multi-zone system. Zone 1 covers main living areas.'
  ),
  (
    '44444444-4444-4444-4444-444444444405',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    'HVAC Zone 2 - Bedrooms',
    'hvac',
    'Trane',
    'XR15',
    'SN-2015-TRN-002',
    '2015-08-20',
    '2025-08-20',
    'Attic mechanical room',
    '{"capacity": "3 ton", "seer": 15, "zones": "Zone 2"}'::jsonb,
    'Zone 2 covers upstairs bedrooms.'
  ),
  (
    '44444444-4444-4444-4444-444444444406',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    'Elevator',
    'elevator',
    'Savaria',
    'Eclipse',
    'SN-2015-SAV-001',
    '2015-08-20',
    '2025-08-20',
    '3-story home elevator',
    '{"floors": 3, "capacity_lbs": 750}'::jsonb,
    'Annual inspection required. Last inspected Jan 2024.'
  ),
  -- Wilson Family Home Equipment
  (
    '44444444-4444-4444-4444-444444444407',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333303',
    'HVAC System',
    'hvac',
    'Lennox',
    'XC21',
    'SN-2022-LEN-001',
    '2022-04-10',
    '2032-04-10',
    'Utility closet',
    '{"capacity": "2.5 ton", "seer": 21}'::jsonb,
    'New high-efficiency system installed 2022.'
  ),
  (
    '44444444-4444-4444-4444-444444444408',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333303',
    'Spa/Hot Tub',
    'pool_equipment',
    'Hot Spring',
    'Grandee',
    'SN-2023-HS-001',
    '2023-09-01',
    '2028-09-01',
    'Back patio',
    '{"seats": 7, "jets": 45}'::jsonb,
    'New spa installed Sept 2023. Monthly service contract.'
  );

-- =============================================================================
-- VENDORS (5 vendors with different specialties)
-- =============================================================================

INSERT INTO vendors (id, organization_id, company_name, contact_name, email, phone, trade_categories, service_area, license_number, insurance_expiration, rating, notes, is_active, is_preferred) VALUES
  (
    '55555555-5555-5555-5555-555555555501',
    '00000000-0000-0000-0000-000000000001',
    'Cool Breeze HVAC',
    'Mike Johnson',
    'mike@coolbreezehvac.com',
    '941-555-4001',
    ARRAY['hvac', 'air_quality'],
    ARRAY['Bradenton', 'Sarasota', 'Longboat Key'],
    'CAC-1812345',
    '2025-06-30',
    4.8,
    'Excellent response time. Specializes in high-end systems.',
    true,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555502',
    '00000000-0000-0000-0000-000000000001',
    'Crystal Clear Pools',
    'Lisa Chen',
    'lisa@crystalclearpools.com',
    '941-555-4002',
    ARRAY['pool', 'spa'],
    ARRAY['Bradenton', 'Sarasota', 'Longboat Key', 'Anna Maria'],
    'CPC-1823456',
    '2025-08-15',
    4.9,
    'Premium pool service. Weekly maintenance available.',
    true,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555503',
    '00000000-0000-0000-0000-000000000001',
    'Gulf Coast Electric',
    'James Brown',
    'james@gulfcoastelectric.com',
    '941-555-4003',
    ARRAY['electrical', 'generator'],
    ARRAY['Bradenton', 'Sarasota'],
    'EC-1834567',
    '2025-04-30',
    4.5,
    'Licensed master electrician. Generator specialist.',
    true,
    false
  ),
  (
    '55555555-5555-5555-5555-555555555504',
    '00000000-0000-0000-0000-000000000001',
    'Pro Plumbing Solutions',
    'David Williams',
    'david@proplumbing.com',
    '941-555-4004',
    ARRAY['plumbing', 'water_heater'],
    ARRAY['Bradenton', 'Sarasota', 'Longboat Key'],
    'CFC-1845678',
    '2025-09-30',
    4.7,
    '24/7 emergency service available.',
    true,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555505',
    '00000000-0000-0000-0000-000000000001',
    'Sunshine Roofing',
    'Carlos Rodriguez',
    'carlos@sunshineroofing.com',
    '941-555-4005',
    ARRAY['roofing', 'gutters'],
    ARRAY['Bradenton', 'Sarasota', 'Longboat Key', 'Palmetto'],
    'CCC-1856789',
    '2025-12-31',
    4.6,
    'Tile and shingle specialists. Free estimates.',
    true,
    false
  );

-- =============================================================================
-- PROGRAMS (Service programs for properties)
-- =============================================================================

INSERT INTO programs (id, organization_id, property_id, name, frequency, tier, status, start_date, next_inspection_date, price_per_visit, notes) VALUES
  (
    '66666666-6666-6666-6666-666666666601',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    'Premium Annual Care',
    'quarterly',
    'comprehensive',
    'active',
    '2024-01-01',
    '2025-02-15',
    350.00,
    'Full quarterly inspections with HVAC and pool checks.'
  ),
  (
    '66666666-6666-6666-6666-666666666602',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    'Executive Home Watch',
    'monthly',
    'comprehensive',
    'active',
    '2023-06-01',
    '2025-02-01',
    450.00,
    'Monthly comprehensive inspections for luxury property.'
  ),
  (
    '66666666-6666-6666-6666-666666666603',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333303',
    'Standard Care',
    'semi_annual',
    'visual',
    'active',
    '2024-06-01',
    '2025-06-01',
    200.00,
    'Twice yearly visual inspection.'
  );

-- =============================================================================
-- INSPECTIONS (Various statuses - past, scheduled, in-progress)
-- =============================================================================

INSERT INTO inspections (id, organization_id, property_id, program_id, inspector_id, template_id, tier, status, scheduled_date, scheduled_time, completed_at, findings, notes) VALUES
  -- Completed inspection
  (
    '77777777-7777-7777-7777-777777777701',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    '66666666-6666-6666-6666-666666666601',
    NULL,
    (SELECT id FROM inspection_templates WHERE name = 'Exterior Inspection Checklist' AND organization_id = '00000000-0000-0000-0000-000000000001' LIMIT 1),
    'comprehensive',
    'completed',
    '2024-11-15',
    '09:00',
    '2024-11-15 11:30:00+00',
    '{"sections": [{"id": "roof", "items": [{"id": "roof_surface", "status": "pass", "notes": "Good condition"}, {"id": "gutters", "status": "needs_attention", "notes": "Minor debris buildup"}]}]}'::jsonb,
    'Overall property in excellent condition. Gutters need cleaning before rainy season.'
  ),
  -- Completed inspection with issues
  (
    '77777777-7777-7777-7777-777777777702',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    '66666666-6666-6666-6666-666666666602',
    NULL,
    (SELECT id FROM inspection_templates WHERE name = 'Interior Inspection Checklist' AND organization_id = '00000000-0000-0000-0000-000000000001' LIMIT 1),
    'comprehensive',
    'completed',
    '2025-01-10',
    '10:00',
    '2025-01-10 13:00:00+00',
    '{"sections": [{"id": "systems", "items": [{"id": "hvac_filters", "status": "fail", "notes": "Filters very dirty, need replacement"}, {"id": "water_heater", "status": "pass"}]}]}'::jsonb,
    'HVAC filters need immediate attention. Work order created for filter replacement.'
  ),
  -- Scheduled upcoming inspection
  (
    '77777777-7777-7777-7777-777777777703',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    '66666666-6666-6666-6666-666666666601',
    NULL,
    (SELECT id FROM inspection_templates WHERE name = 'Pool & Spa Inspection' AND organization_id = '00000000-0000-0000-0000-000000000001' LIMIT 1),
    'functional',
    'scheduled',
    '2025-02-15',
    '09:00',
    NULL,
    NULL,
    'Quarterly pool inspection.'
  ),
  -- In-progress inspection
  (
    '77777777-7777-7777-7777-777777777704',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    '66666666-6666-6666-6666-666666666602',
    NULL,
    (SELECT id FROM inspection_templates WHERE name = 'HVAC System Inspection' AND organization_id = '00000000-0000-0000-0000-000000000001' LIMIT 1),
    'functional',
    'in_progress',
    '2025-01-19',
    '14:00',
    NULL,
    '{"sections": [{"id": "air_handler", "items": [{"id": "filter", "status": "pass", "notes": "New filter installed"}]}]}'::jsonb,
    'HVAC inspection in progress.'
  ),
  -- Scheduled for Wilson property
  (
    '77777777-7777-7777-7777-777777777705',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333303',
    '66666666-6666-6666-6666-666666666603',
    NULL,
    (SELECT id FROM inspection_templates WHERE name = 'Exterior Inspection Checklist' AND organization_id = '00000000-0000-0000-0000-000000000001' LIMIT 1),
    'visual',
    'scheduled',
    '2025-02-01',
    '11:00',
    NULL,
    NULL,
    'Semi-annual exterior inspection.'
  );

-- =============================================================================
-- WORK ORDERS (Various statuses)
-- =============================================================================

INSERT INTO work_orders (id, organization_id, property_id, vendor_id, inspection_id, title, description, category, priority, status, estimated_cost, scheduled_date, completed_date, completion_notes) VALUES
  -- Completed work order
  (
    '88888888-8888-8888-8888-888888888801',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    '55555555-5555-5555-5555-555555555501',
    '77777777-7777-7777-7777-777777777701',
    'HVAC Annual Maintenance',
    'Perform annual HVAC maintenance and filter replacement.',
    'hvac',
    'medium',
    'completed',
    250.00,
    '2024-11-20',
    '2024-11-20',
    'Completed maintenance. Replaced filter, cleaned coils. System operating at peak efficiency.'
  ),
  -- In-progress work order
  (
    '88888888-8888-8888-8888-888888888802',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    '55555555-5555-5555-5555-555555555501',
    '77777777-7777-7777-7777-777777777702',
    'HVAC Filter Replacement - Urgent',
    'Replace all HVAC filters. Filters found very dirty during inspection.',
    'hvac',
    'high',
    'in_progress',
    150.00,
    '2025-01-18',
    NULL,
    NULL
  ),
  -- Scheduled work order
  (
    '88888888-8888-8888-8888-888888888803',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    '55555555-5555-5555-5555-555555555502',
    NULL,
    'Pool Service - Monthly',
    'Monthly pool service: chemical balance, cleaning, equipment check.',
    'pool',
    'medium',
    'scheduled',
    175.00,
    '2025-01-25',
    NULL,
    NULL
  ),
  -- Pending work order
  (
    '88888888-8888-8888-8888-888888888804',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333303',
    '55555555-5555-5555-5555-555555555504',
    NULL,
    'Water Heater Inspection',
    'Annual water heater inspection and maintenance.',
    'plumbing',
    'low',
    'pending',
    125.00,
    NULL,
    NULL,
    NULL
  ),
  -- Vendor assigned
  (
    '88888888-8888-8888-8888-888888888805',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    '55555555-5555-5555-5555-555555555503',
    NULL,
    'Generator Annual Service',
    'Annual generator maintenance and load test.',
    'electrical',
    'medium',
    'vendor_assigned',
    350.00,
    NULL,
    NULL,
    NULL
  );

-- =============================================================================
-- RECOMMENDATIONS (From inspections)
-- =============================================================================

INSERT INTO recommendations (id, organization_id, inspection_id, property_id, template_id, title, description, category, priority, status, estimated_cost_low, estimated_cost_high) VALUES
  (
    '99999999-9999-9999-9999-999999999901',
    '00000000-0000-0000-0000-000000000001',
    '77777777-7777-7777-7777-777777777701',
    '33333333-3333-3333-3333-333333333301',
    (SELECT id FROM recommendation_templates WHERE template_key = 'gutter_cleaning' LIMIT 1),
    'Gutter Cleaning Recommended',
    'Gutters have debris buildup. Recommend professional cleaning before rainy season.',
    'exterior',
    'medium',
    'approved',
    150.00,
    300.00
  ),
  (
    '99999999-9999-9999-9999-999999999902',
    '00000000-0000-0000-0000-000000000001',
    '77777777-7777-7777-7777-777777777702',
    '33333333-3333-3333-3333-333333333302',
    (SELECT id FROM recommendation_templates WHERE template_key = 'hvac_filter_replace' LIMIT 1),
    'HVAC Filter Replacement Due',
    'All HVAC filters need immediate replacement. Very dirty condition.',
    'hvac',
    'high',
    'scheduled',
    75.00,
    150.00
  ),
  (
    '99999999-9999-9999-9999-999999999903',
    '00000000-0000-0000-0000-000000000001',
    '77777777-7777-7777-7777-777777777701',
    '33333333-3333-3333-3333-333333333301',
    (SELECT id FROM recommendation_templates WHERE template_key = 'water_heater_age' LIMIT 1),
    'Water Heater Approaching End of Life',
    'Water heater installed in 2018, now 7 years old. Warranty expired. Recommend budgeting for replacement.',
    'plumbing',
    'low',
    'pending',
    1200.00,
    3000.00
  );

-- =============================================================================
-- INVOICES (Various statuses)
-- =============================================================================

INSERT INTO invoices (id, organization_id, client_id, property_id, inspection_id, invoice_number, status, issue_date, due_date, subtotal, tax_amount, total, notes) VALUES
  -- Paid invoice
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333301',
    '77777777-7777-7777-7777-777777777701',
    'INV-2024-001',
    'paid',
    '2024-11-16',
    '2024-12-16',
    350.00,
    24.50,
    374.50,
    'Q4 2024 Comprehensive Inspection'
  ),
  -- Sent invoice (awaiting payment)
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa002',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333302',
    '77777777-7777-7777-7777-777777777702',
    'INV-2025-001',
    'sent',
    '2025-01-11',
    '2025-02-10',
    450.00,
    31.50,
    481.50,
    'January 2025 Monthly Inspection'
  ),
  -- Draft invoice
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa003',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222203',
    '33333333-3333-3333-3333-333333333303',
    NULL,
    'INV-2025-002',
    'draft',
    '2025-01-19',
    '2025-02-18',
    200.00,
    14.00,
    214.00,
    'Semi-annual inspection fee'
  ),
  -- Overdue invoice
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa004',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333302',
    NULL,
    'INV-2024-002',
    'overdue',
    '2024-10-15',
    '2024-11-14',
    450.00,
    31.50,
    481.50,
    'October 2024 Monthly Inspection - OVERDUE'
  );

-- Invoice line items
INSERT INTO invoice_line_items (id, invoice_id, description, quantity, unit_price, total) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001', 'Comprehensive Quarterly Inspection', 1, 350.00, 350.00),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa002', 'Monthly Executive Inspection', 1, 450.00, 450.00),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa003', 'Semi-Annual Visual Inspection', 1, 200.00, 200.00),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa004', 'Monthly Executive Inspection', 1, 450.00, 450.00);

-- Payment for paid invoice
INSERT INTO payments (id, organization_id, invoice_id, amount, payment_method, payment_date, reference_number) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccc001', '00000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001', 374.50, 'credit_card', '2024-11-20', 'CC-12345');

-- =============================================================================
-- CALENDAR EVENTS
-- =============================================================================

INSERT INTO calendar_events (id, organization_id, title, description, event_type, start_date, start_time, end_date, end_time, all_day, property_id, inspection_id, work_order_id, location, status) VALUES
  -- Upcoming inspection events
  (
    'dddddddd-dddd-dddd-dddd-ddddddddd001',
    '00000000-0000-0000-0000-000000000001',
    'Pool Inspection - Thompson',
    'Quarterly pool and spa inspection',
    'inspection',
    '2025-02-15',
    '09:00',
    '2025-02-15',
    '11:00',
    false,
    '33333333-3333-3333-3333-333333333301',
    '77777777-7777-7777-7777-777777777703',
    NULL,
    '1234 Sunset Drive, Bradenton, FL',
    'scheduled'
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddd002',
    '00000000-0000-0000-0000-000000000001',
    'Exterior Inspection - Wilson',
    'Semi-annual exterior inspection',
    'inspection',
    '2025-02-01',
    '11:00',
    '2025-02-01',
    '12:30',
    false,
    '33333333-3333-3333-3333-333333333303',
    '77777777-7777-7777-7777-777777777705',
    NULL,
    '890 Bay View Lane, Longboat Key, FL',
    'scheduled'
  ),
  -- Work order event
  (
    'dddddddd-dddd-dddd-dddd-ddddddddd003',
    '00000000-0000-0000-0000-000000000001',
    'Pool Service - Thompson',
    'Monthly pool service',
    'work_order',
    '2025-01-25',
    '08:00',
    '2025-01-25',
    '10:00',
    false,
    '33333333-3333-3333-3333-333333333301',
    NULL,
    '88888888-8888-8888-8888-888888888803',
    '1234 Sunset Drive, Bradenton, FL',
    'scheduled'
  ),
  -- Reminder event
  (
    'dddddddd-dddd-dddd-dddd-ddddddddd004',
    '00000000-0000-0000-0000-000000000001',
    'Review Quarterly Reports',
    'Review and send Q1 inspection reports to clients',
    'reminder',
    '2025-01-31',
    NULL,
    '2025-01-31',
    NULL,
    true,
    NULL,
    NULL,
    NULL,
    'Office',
    'scheduled'
  ),
  -- Today's event
  (
    'dddddddd-dddd-dddd-dddd-ddddddddd005',
    '00000000-0000-0000-0000-000000000001',
    'HVAC Inspection - Martinez',
    'HVAC system inspection in progress',
    'inspection',
    CURRENT_DATE,
    '14:00',
    CURRENT_DATE,
    '16:00',
    false,
    '33333333-3333-3333-3333-333333333302',
    '77777777-7777-7777-7777-777777777704',
    NULL,
    '567 Gulf Shore Blvd, Sarasota, FL',
    'scheduled'
  );

-- =============================================================================
-- REMINDERS
-- =============================================================================

INSERT INTO reminders (id, organization_id, property_id, equipment_id, title, description, reminder_type, due_date, reminder_date, status, notify_staff) VALUES
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeee001',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    '44444444-4444-4444-4444-444444444403',
    'Water Heater Replacement Planning',
    'Water heater warranty expired. Budget for replacement.',
    'maintenance',
    '2025-03-15',
    '2025-02-15',
    'pending',
    true
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeee002',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    '44444444-4444-4444-4444-444444444406',
    'Elevator Annual Inspection Due',
    'Schedule annual elevator inspection - required by law.',
    'inspection',
    '2025-08-20',
    '2025-07-20',
    'pending',
    true
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeee003',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    '44444444-4444-4444-4444-444444444402',
    'Pool Pump Warranty Expiration',
    'Pentair pool pump warranty expires June 2025. Consider extended warranty.',
    'warranty',
    '2025-06-01',
    '2025-05-01',
    'pending',
    true
  );

-- =============================================================================
-- ACTIVITY LOG (Recent activities)
-- =============================================================================

INSERT INTO activity_log (id, organization_id, user_id, action, entity_type, entity_id, details, created_at) VALUES
  (
    'ffffffff-ffff-ffff-ffff-fffffffffff01',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'created',
    'inspection',
    '77777777-7777-7777-7777-777777777704',
    '{"title": "HVAC Inspection scheduled for Martinez Beach House"}'::jsonb,
    NOW() - INTERVAL '2 hours'
  ),
  (
    'ffffffff-ffff-ffff-ffff-fffffffffff02',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'updated',
    'inspection',
    '77777777-7777-7777-7777-777777777704',
    '{"status": "in_progress", "previous_status": "scheduled"}'::jsonb,
    NOW() - INTERVAL '30 minutes'
  ),
  (
    'ffffffff-ffff-ffff-ffff-fffffffffff03',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'created',
    'work_order',
    '88888888-8888-8888-8888-888888888802',
    '{"title": "HVAC Filter Replacement created for Martinez Beach House"}'::jsonb,
    NOW() - INTERVAL '1 day'
  ),
  (
    'ffffffff-ffff-ffff-ffff-fffffffffff04',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'sent',
    'invoice',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa002',
    '{"invoice_number": "INV-2025-001", "client": "Robert Martinez", "amount": 481.50}'::jsonb,
    NOW() - INTERVAL '8 days'
  ),
  (
    'ffffffff-ffff-ffff-ffff-fffffffffff05',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'completed',
    'inspection',
    '77777777-7777-7777-7777-777777777702',
    '{"property": "Martinez Beach House", "findings": "HVAC filters need replacement"}'::jsonb,
    NOW() - INTERVAL '9 days'
  ),
  (
    'ffffffff-ffff-ffff-ffff-fffffffffff06',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'payment_received',
    'invoice',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001',
    '{"invoice_number": "INV-2024-001", "client": "Michael & Sarah Thompson", "amount": 374.50}'::jsonb,
    NOW() - INTERVAL '60 days'
  ),
  (
    'ffffffff-ffff-ffff-ffff-fffffffffff07',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'completed',
    'work_order',
    '88888888-8888-8888-8888-888888888801',
    '{"title": "HVAC Annual Maintenance completed", "vendor": "Cool Breeze HVAC"}'::jsonb,
    NOW() - INTERVAL '60 days'
  ),
  (
    'ffffffff-ffff-ffff-ffff-fffffffffff08',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'created',
    'client',
    '22222222-2222-2222-2222-222222222203',
    '{"name": "Jennifer & David Wilson", "email": "jwilson@gmail.com"}'::jsonb,
    NOW() - INTERVAL '180 days'
  );

-- =============================================================================
-- NOTIFICATIONS (For dashboard)
-- =============================================================================

INSERT INTO notifications (id, organization_id, user_id, type, title, message, entity_type, entity_id, is_read, created_at) VALUES
  (
    '11111111-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'inspection',
    'Inspection In Progress',
    'John Inspector started HVAC inspection at Martinez Beach House',
    'inspection',
    '77777777-7777-7777-7777-777777777704',
    false,
    NOW() - INTERVAL '30 minutes'
  ),
  (
    '11111111-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'payment',
    'Invoice Overdue',
    'Invoice INV-2024-002 for Martinez Beach House is 67 days overdue',
    'invoice',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa004',
    false,
    NOW() - INTERVAL '1 day'
  ),
  (
    '11111111-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'work_order',
    'Work Order Assigned',
    'Generator Annual Service assigned to Gulf Coast Electric',
    'work_order',
    '88888888-8888-8888-8888-888888888805',
    true,
    NOW() - INTERVAL '3 days'
  ),
  (
    '11111111-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'reminder',
    'Upcoming Inspections',
    'You have 2 inspections scheduled for next month',
    NULL,
    NULL,
    true,
    NOW() - INTERVAL '5 days'
  );

-- =============================================================================
-- SERVICE REQUESTS (From clients)
-- =============================================================================

INSERT INTO service_requests (id, organization_id, property_id, client_id, title, description, category, priority, status, requested_date) VALUES
  (
    '22222222-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    '22222222-2222-2222-2222-222222222201',
    'Pool heater not working',
    'The pool heater turns on but water is not getting warm. Please check.',
    'pool',
    'medium',
    'new',
    NOW() - INTERVAL '2 days'
  ),
  (
    '22222222-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    '22222222-2222-2222-2222-222222222202',
    'Strange noise from HVAC',
    'There is a clicking/rattling noise coming from the air handler when it starts up.',
    'hvac',
    'high',
    'acknowledged',
    NOW() - INTERVAL '1 day'
  );
