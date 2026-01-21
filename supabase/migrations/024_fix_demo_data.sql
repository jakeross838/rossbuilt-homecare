-- 024_fix_demo_data.sql
-- Clean up any partial demo data from incorrect schema and re-insert correct data

-- Delete existing demo data (in reverse dependency order)
DELETE FROM notifications WHERE organization_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM activity_log WHERE organization_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM service_requests WHERE organization_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM payments WHERE organization_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM invoice_line_items WHERE invoice_id IN (SELECT id FROM invoices WHERE organization_id = '00000000-0000-0000-0000-000000000001');
DELETE FROM invoices WHERE organization_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM recommendations WHERE organization_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM work_orders WHERE organization_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM inspection_photos WHERE inspection_id IN (SELECT id FROM inspections WHERE organization_id = '00000000-0000-0000-0000-000000000001');
DELETE FROM inspections WHERE organization_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM programs WHERE organization_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM vendors WHERE organization_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM equipment WHERE property_id IN (SELECT id FROM properties WHERE organization_id = '00000000-0000-0000-0000-000000000001');
DELETE FROM calendar_events WHERE property_id IN (SELECT id FROM properties WHERE organization_id = '00000000-0000-0000-0000-000000000001');
DELETE FROM reminders WHERE property_id IN (SELECT id FROM properties WHERE organization_id = '00000000-0000-0000-0000-000000000001');
DELETE FROM documents WHERE property_id IN (SELECT id FROM properties WHERE organization_id = '00000000-0000-0000-0000-000000000001');
DELETE FROM home_manuals WHERE property_id IN (SELECT id FROM properties WHERE organization_id = '00000000-0000-0000-0000-000000000001');
DELETE FROM properties WHERE organization_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM clients WHERE organization_id = '00000000-0000-0000-0000-000000000001';

-- Now insert the corrected demo data

-- =============================================================================
-- CLIENTS (3 clients with different profiles)
-- =============================================================================

INSERT INTO clients (id, organization_id, first_name, last_name, email, phone, secondary_first_name, secondary_last_name, secondary_email, secondary_phone, secondary_relationship, billing_address_line1, billing_city, billing_state, billing_zip, notes, is_active) VALUES
  (
    '22222222-2222-2222-2222-222222222201',
    '00000000-0000-0000-0000-000000000001',
    'Michael',
    'Thompson',
    'mthompson@email.com',
    '941-555-1234',
    'Sarah',
    'Thompson',
    'sthompson@email.com',
    '941-555-1235',
    'spouse',
    '456 Oak Lane',
    'Bradenton',
    'FL',
    '34209',
    'Preferred contact method: email. Snowbirds - in FL from Oct to April.',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    '00000000-0000-0000-0000-000000000001',
    'Robert',
    'Martinez',
    'rmartinez@business.com',
    '941-555-2345',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '789 Palm Ave',
    'Sarasota',
    'FL',
    '34236',
    'Business owner with multiple properties. Prefers detailed reports.',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    '00000000-0000-0000-0000-000000000001',
    'Jennifer',
    'Wilson',
    'jwilson@gmail.com',
    '941-555-3456',
    'David',
    'Wilson',
    'dwilson@gmail.com',
    '941-555-3457',
    'spouse',
    '123 Beach Blvd',
    'Longboat Key',
    'FL',
    '34228',
    'New clients as of 2024. Very responsive.',
    true
  );

-- =============================================================================
-- PROPERTIES (3 properties with different features)
-- =============================================================================

INSERT INTO properties (id, organization_id, client_id, name, address_line1, city, state, zip, year_built, square_footage, bedrooms, bathrooms, gate_code, lockbox_code, alarm_code, alarm_company, alarm_company_phone, wifi_network, wifi_password, access_instructions, features, notes, is_active) VALUES
  (
    '33333333-3333-3333-3333-333333333301',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222201',
    'Thompson Residence',
    '1234 Sunset Drive',
    'Bradenton',
    'FL',
    '34209',
    2018,
    3500,
    4,
    3.0,
    '1234',
    '5678',
    '9012',
    'ADT',
    '800-238-2727',
    'ThompsonHome',
    'WelcomeHome2024',
    'Dogs are friendly. Key under blue pot by side door.',
    '{"pool": true, "spa": true, "dock": false, "elevator": false, "solar": true, "generator": true, "fire_sprinkler": true, "outdoor_kitchen": true, "security_system": true}'::jsonb,
    'Beautiful waterfront property with extensive pool area. 4BR/3BA, 3500 sqft. Built 2018.',
    true
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222202',
    'Martinez Beach House',
    '567 Gulf Shore Blvd',
    'Sarasota',
    'FL',
    '34236',
    2015,
    5200,
    5,
    5.0,
    '4567',
    NULL,
    '3456',
    'Vivint',
    '855-832-1550',
    NULL,
    NULL,
    'Call ahead before arriving. Housekeeper on-site Mon/Thu.',
    '{"pool": true, "spa": false, "dock": true, "elevator": true, "solar": false, "generator": true, "fire_sprinkler": true, "outdoor_kitchen": true, "security_system": true}'::jsonb,
    'Luxury beachfront property. 5BR/5BA, 5200 sqft. Built 2015. Full elevator access.',
    true
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222203',
    'Wilson Family Home',
    '890 Bay View Lane',
    'Longboat Key',
    'FL',
    '34228',
    2010,
    2200,
    3,
    2.0,
    NULL,
    '2468',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'No alarm system. Use lockbox on front door.',
    '{"pool": false, "spa": true, "dock": false, "elevator": false, "solar": true, "generator": false, "fire_sprinkler": false, "outdoor_kitchen": false, "security_system": false}'::jsonb,
    'Cozy family home. 3BR/2BA, 2200 sqft. Built 2010. Recently updated kitchen.',
    true
  );

-- =============================================================================
-- EQUIPMENT (for each property)
-- =============================================================================

INSERT INTO equipment (id, property_id, category, equipment_type, manufacturer, model_number, serial_number, install_date, warranty_expiration, location, specs, notes) VALUES
  (
    '44444444-4444-4444-4444-444444444401',
    '33333333-3333-3333-3333-333333333301',
    'hvac',
    'central_ac',
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
    '33333333-3333-3333-3333-333333333301',
    'pool',
    'pool_pump',
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
    '33333333-3333-3333-3333-333333333301',
    'plumbing',
    'water_heater_tank',
    'Rheem',
    'PROG50-38N RH67',
    'SN-2018-RHE-001',
    '2018-03-15',
    '2024-03-15',
    'Garage',
    '{"capacity_gallons": 50, "type": "gas", "energy_factor": 0.67}'::jsonb,
    'Warranty expired. Consider replacement soon.'
  ),
  (
    '44444444-4444-4444-4444-444444444404',
    '33333333-3333-3333-3333-333333333302',
    'hvac',
    'central_ac',
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
    '33333333-3333-3333-3333-333333333302',
    'hvac',
    'central_ac',
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
    '44444444-4444-4444-4444-444444444407',
    '33333333-3333-3333-3333-333333333303',
    'hvac',
    'central_ac',
    'Lennox',
    'XC21',
    'SN-2022-LEN-001',
    '2022-04-10',
    '2032-04-10',
    'Utility closet',
    '{"capacity": "2.5 ton", "seer": 21}'::jsonb,
    'New high-efficiency system installed 2022.'
  );

-- =============================================================================
-- VENDORS (5 vendors with different specialties)
-- =============================================================================

INSERT INTO vendors (id, organization_id, company_name, contact_first_name, contact_last_name, email, phone, trade_categories, license_number, insurance_expiration, notes, is_active, is_preferred) VALUES
  (
    '55555555-5555-5555-5555-555555555501',
    '00000000-0000-0000-0000-000000000001',
    'Cool Breeze HVAC',
    'Mike',
    'Johnson',
    'mike@coolbreezehvac.com',
    '941-555-4001',
    ARRAY['hvac'],
    'CAC-1812345',
    '2025-06-30',
    'Excellent response time. Specializes in high-end systems.',
    true,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555502',
    '00000000-0000-0000-0000-000000000001',
    'Crystal Clear Pools',
    'Lisa',
    'Chen',
    'lisa@crystalclearpools.com',
    '941-555-4002',
    ARRAY['pool'],
    'CPC-1823456',
    '2025-08-15',
    'Premium pool service. Weekly maintenance available.',
    true,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555503',
    '00000000-0000-0000-0000-000000000001',
    'Gulf Coast Electric',
    'James',
    'Brown',
    'james@gulfcoastelectric.com',
    '941-555-4003',
    ARRAY['electrical'],
    'EC-1834567',
    '2025-04-30',
    'Licensed master electrician. Generator specialist.',
    true,
    false
  ),
  (
    '55555555-5555-5555-5555-555555555504',
    '00000000-0000-0000-0000-000000000001',
    'Pro Plumbing Solutions',
    'David',
    'Williams',
    'david@proplumbing.com',
    '941-555-4004',
    ARRAY['plumbing'],
    'CFC-1845678',
    '2025-09-30',
    '24/7 emergency service available.',
    true,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555505',
    '00000000-0000-0000-0000-000000000001',
    'Sunshine Roofing',
    'Carlos',
    'Rodriguez',
    'carlos@sunshineroofing.com',
    '941-555-4005',
    ARRAY['roofing'],
    'CCC-1856789',
    '2025-12-31',
    'Tile and shingle specialists. Free estimates.',
    true,
    false
  );

-- =============================================================================
-- PROGRAMS (Service programs for properties)
-- =============================================================================

INSERT INTO programs (id, organization_id, property_id, name, tier, frequency, status, start_date, next_inspection_date, price_per_inspection, notes) VALUES
  (
    '66666666-6666-6666-6666-666666666601',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    'Premium Annual Care',
    'comprehensive',
    'quarterly',
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
    'comprehensive',
    'monthly',
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
    'visual',
    'semi_annual',
    'active',
    '2024-06-01',
    '2025-06-01',
    200.00,
    'Twice yearly visual inspection.'
  );

-- =============================================================================
-- INSPECTIONS (Various statuses - past, scheduled, in-progress)
-- =============================================================================

INSERT INTO inspections (id, organization_id, property_id, program_id, inspector_id, inspection_type, status, scheduled_date, scheduled_time_start, scheduled_time_end, estimated_duration_minutes, completed_at, checklist, findings, overall_condition, summary) VALUES
  (
    '77777777-7777-7777-7777-777777777701',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    '66666666-6666-6666-6666-666666666601',
    NULL,
    'scheduled',
    'completed',
    '2024-11-15',
    '09:00',
    '11:00',
    120,
    '2024-11-15 11:30:00+00',
    '{"sections": [{"id": "exterior", "title": "Exterior", "items": [{"id": "roof_surface", "text": "Roof Surface Condition", "type": "status"}, {"id": "gutters", "text": "Gutters & Downspouts", "type": "status"}]}]}'::jsonb,
    '{"roof_surface": {"status": "pass", "notes": "Good condition", "completed_at": "2024-11-15T10:00:00Z"}, "gutters": {"status": "needs_attention", "notes": "Minor debris buildup", "completed_at": "2024-11-15T10:15:00Z"}}'::jsonb,
    'good',
    'Overall property in excellent condition. Gutters need cleaning before rainy season.'
  ),
  (
    '77777777-7777-7777-7777-777777777702',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    '66666666-6666-6666-6666-666666666602',
    NULL,
    'scheduled',
    'completed',
    '2025-01-10',
    '10:00',
    '13:00',
    180,
    '2025-01-10 13:00:00+00',
    '{"sections": [{"id": "systems", "title": "Systems", "items": [{"id": "hvac_filters", "text": "HVAC Filters", "type": "status"}, {"id": "water_heater", "text": "Water Heater", "type": "status"}]}]}'::jsonb,
    '{"hvac_filters": {"status": "fail", "notes": "Filters very dirty, need replacement", "completed_at": "2025-01-10T11:00:00Z"}, "water_heater": {"status": "pass", "completed_at": "2025-01-10T11:30:00Z"}}'::jsonb,
    'fair',
    'HVAC filters need immediate attention. Work order created for filter replacement.'
  ),
  (
    '77777777-7777-7777-7777-777777777703',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    '66666666-6666-6666-6666-666666666601',
    NULL,
    'scheduled',
    'scheduled',
    '2025-02-15',
    '09:00',
    '11:00',
    120,
    NULL,
    '{"sections": [{"id": "pool", "title": "Pool & Spa", "items": [{"id": "pool_water", "text": "Pool Water Quality", "type": "status"}, {"id": "pool_pump", "text": "Pool Pump Operation", "type": "status"}]}]}'::jsonb,
    '{}'::jsonb,
    NULL,
    'Quarterly pool inspection.'
  ),
  (
    '77777777-7777-7777-7777-777777777704',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    '66666666-6666-6666-6666-666666666602',
    NULL,
    'scheduled',
    'in_progress',
    '2025-01-19',
    '14:00',
    '16:00',
    120,
    NULL,
    '{"sections": [{"id": "hvac", "title": "HVAC System", "items": [{"id": "filter", "text": "Air Filter", "type": "status"}, {"id": "thermostat", "text": "Thermostat Operation", "type": "status"}]}]}'::jsonb,
    '{"filter": {"status": "pass", "notes": "New filter installed", "completed_at": "2025-01-19T14:30:00Z"}}'::jsonb,
    NULL,
    'HVAC inspection in progress.'
  ),
  (
    '77777777-7777-7777-7777-777777777705',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333303',
    '66666666-6666-6666-6666-666666666603',
    NULL,
    'scheduled',
    'scheduled',
    '2025-02-01',
    '11:00',
    '12:30',
    90,
    NULL,
    '{"sections": [{"id": "exterior", "title": "Exterior", "items": [{"id": "siding", "text": "Exterior Siding", "type": "status"}, {"id": "windows", "text": "Windows & Doors", "type": "status"}]}]}'::jsonb,
    '{}'::jsonb,
    NULL,
    'Semi-annual exterior inspection.'
  );

-- =============================================================================
-- WORK ORDERS (Various statuses)
-- =============================================================================

INSERT INTO work_orders (id, organization_id, property_id, client_id, vendor_id, inspection_id, title, description, category, priority, status, estimated_cost, scheduled_date, completed_at, completion_notes) VALUES
  (
    '88888888-8888-8888-8888-888888888801',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    '22222222-2222-2222-2222-222222222201',
    '55555555-5555-5555-5555-555555555501',
    '77777777-7777-7777-7777-777777777701',
    'HVAC Annual Maintenance',
    'Perform annual HVAC maintenance and filter replacement.',
    'hvac',
    'medium',
    'completed',
    250.00,
    '2024-11-20',
    '2024-11-20 15:00:00+00',
    'Completed maintenance. Replaced filter, cleaned coils. System operating at peak efficiency.'
  ),
  (
    '88888888-8888-8888-8888-888888888802',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    '22222222-2222-2222-2222-222222222202',
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
  (
    '88888888-8888-8888-8888-888888888803',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    '22222222-2222-2222-2222-222222222201',
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
  (
    '88888888-8888-8888-8888-888888888804',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333303',
    '22222222-2222-2222-2222-222222222203',
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
  (
    '88888888-8888-8888-8888-888888888805',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    '22222222-2222-2222-2222-222222222202',
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

INSERT INTO recommendations (id, organization_id, inspection_id, property_id, title, description, category, priority, status, estimated_cost_low, estimated_cost_high) VALUES
  (
    '99999999-9999-9999-9999-999999999901',
    '00000000-0000-0000-0000-000000000001',
    '77777777-7777-7777-7777-777777777701',
    '33333333-3333-3333-3333-333333333301',
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

INSERT INTO invoices (id, organization_id, client_id, invoice_number, invoice_type, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, notes) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222201',
    'INV-2024-001',
    'service',
    'paid',
    '2024-11-16',
    '2024-12-16',
    350.00,
    7.0,
    24.50,
    374.50,
    'Q4 2024 Comprehensive Inspection'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa002',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222202',
    'INV-2025-001',
    'service',
    'sent',
    '2025-01-11',
    '2025-02-10',
    450.00,
    7.0,
    31.50,
    481.50,
    'January 2025 Monthly Inspection'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa003',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222203',
    'INV-2025-002',
    'service',
    'draft',
    '2025-01-19',
    '2025-02-18',
    200.00,
    7.0,
    14.00,
    214.00,
    'Semi-annual inspection fee'
  );

-- Invoice line items
INSERT INTO invoice_line_items (id, invoice_id, description, quantity, unit_price, total) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001', 'Comprehensive Quarterly Inspection', 1, 350.00, 350.00),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa002', 'Monthly Executive Inspection', 1, 450.00, 450.00),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa003', 'Semi-Annual Visual Inspection', 1, 200.00, 200.00);

-- Payment for paid invoice
INSERT INTO payments (id, organization_id, invoice_id, amount, payment_method, payment_date, reference_number) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccc001', '00000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001', 374.50, 'credit_card', '2024-11-20', 'CC-12345');

-- =============================================================================
-- SERVICE REQUESTS (From clients)
-- =============================================================================

INSERT INTO service_requests (id, organization_id, property_id, client_id, request_type, title, description, priority, status, created_at) VALUES
  (
    '22222222-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333301',
    '22222222-2222-2222-2222-222222222201',
    'maintenance',
    'Pool heater not working',
    'The pool heater turns on but water is not getting warm. Please check.',
    'medium',
    'new',
    NOW() - INTERVAL '2 days'
  ),
  (
    '22222222-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333302',
    '22222222-2222-2222-2222-222222222202',
    'maintenance',
    'Strange noise from HVAC',
    'There is a clicking/rattling noise coming from the air handler when it starts up.',
    'high',
    'acknowledged',
    NOW() - INTERVAL '1 day'
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
    'HVAC inspection started at Martinez Beach House',
    'inspection',
    '77777777-7777-7777-7777-777777777704',
    false,
    NOW() - INTERVAL '30 minutes'
  ),
  (
    '11111111-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'work_order',
    'Work Order Assigned',
    'Generator Annual Service assigned to Gulf Coast Electric',
    'work_order',
    '88888888-8888-8888-8888-888888888805',
    true,
    NOW() - INTERVAL '3 days'
  );
