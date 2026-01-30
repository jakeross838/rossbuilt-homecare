-- Seed service requests for Patrick Gavin's properties
-- These represent client-submitted requests that should appear in admin view

-- Service Request 1: HVAC issue at Patrick Residence
INSERT INTO service_requests (
  id,
  organization_id,
  property_id,
  client_id,
  request_number,
  request_type,
  title,
  description,
  priority,
  status,
  created_at,
  updated_at
) VALUES (
  'a1000001-0001-4001-8001-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '33333333-3333-3333-3333-333333333304',
  '22222222-2222-2222-2222-222222222204',
  'SR-001',
  'maintenance',
  'AC not cooling properly',
  'The air conditioning in the master bedroom is running but not cooling. Started noticing this issue 2 days ago. Thermostat shows 78°F but set to 72°F.',
  'high',
  'new',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- Service Request 2: Plumbing issue at Gavin Home
INSERT INTO service_requests (
  id,
  organization_id,
  property_id,
  client_id,
  request_number,
  request_type,
  title,
  description,
  priority,
  status,
  created_at,
  updated_at
) VALUES (
  'a1000001-0001-4001-8001-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '8a1754dc-85d6-4025-8420-807f41d3a3dd',
  '22222222-2222-2222-2222-222222222204',
  'SR-002',
  'repair',
  'Kitchen faucet leaking',
  'The kitchen faucet has a slow drip that started last week. Getting worse - now dripping about once per second.',
  'medium',
  'new',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
);

-- Service Request 3: Pool maintenance at Patrick Residence
INSERT INTO service_requests (
  id,
  organization_id,
  property_id,
  client_id,
  request_number,
  request_type,
  title,
  description,
  priority,
  status,
  created_at,
  updated_at
) VALUES (
  'a1000001-0001-4001-8001-000000000003',
  '00000000-0000-0000-0000-000000000001',
  '33333333-3333-3333-3333-333333333304',
  '22222222-2222-2222-2222-222222222204',
  'SR-003',
  'maintenance',
  'Pool water turning green',
  'Pool water has been getting cloudy and starting to turn green. Need pool service ASAP before the weekend.',
  'urgent',
  'new',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- Service Request 4: Electrical at Gavin Home (already acknowledged)
INSERT INTO service_requests (
  id,
  organization_id,
  property_id,
  client_id,
  request_number,
  request_type,
  title,
  description,
  priority,
  status,
  acknowledged_at,
  created_at,
  updated_at
) VALUES (
  'a1000001-0001-4001-8001-000000000004',
  '00000000-0000-0000-0000-000000000001',
  '8a1754dc-85d6-4025-8420-807f41d3a3dd',
  '22222222-2222-2222-2222-222222222204',
  'SR-004',
  'repair',
  'Outdoor lights flickering',
  'The landscape lights in the front yard have been flickering on and off. Some don''t turn on at all anymore.',
  'low',
  'acknowledged',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '3 days'
);

-- Service Request 5: General request at Patrick Residence (completed)
INSERT INTO service_requests (
  id,
  organization_id,
  property_id,
  client_id,
  request_number,
  request_type,
  title,
  description,
  priority,
  status,
  resolution,
  acknowledged_at,
  resolved_at,
  created_at,
  updated_at
) VALUES (
  'a1000001-0001-4001-8001-000000000005',
  '00000000-0000-0000-0000-000000000001',
  '33333333-3333-3333-3333-333333333304',
  '22222222-2222-2222-2222-222222222204',
  'SR-005',
  'inspection',
  'Annual gutter cleaning request',
  'Please schedule the annual gutter cleaning service.',
  'low',
  'completed',
  'Gutter cleaning completed on 1/25. All gutters and downspouts cleared. No issues found.',
  NOW() - INTERVAL '2 weeks',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '3 weeks',
  NOW() - INTERVAL '5 days'
);

-- Create work orders from some of the service requests to show the workflow

-- Work Order for the AC issue (from SR-001)
INSERT INTO work_orders (
  id,
  organization_id,
  property_id,
  client_id,
  work_order_number,
  title,
  description,
  category,
  priority,
  status,
  created_at,
  updated_at
) VALUES (
  'b1000001-0001-4001-8001-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '33333333-3333-3333-3333-333333333304',
  '22222222-2222-2222-2222-222222222204',
  'WO-100001',
  'HVAC Service - AC not cooling',
  'Customer reports AC in master bedroom not cooling. Thermostat shows 78°F but set to 72°F. Needs diagnosis and repair.',
  'hvac',
  'high',
  'pending',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- Link the service request to the work order
UPDATE service_requests
SET work_order_id = 'b1000001-0001-4001-8001-000000000001',
    status = 'in_progress',
    updated_at = NOW()
WHERE id = 'a1000001-0001-4001-8001-000000000001';

-- Work Order for pool issue (from SR-003)
INSERT INTO work_orders (
  id,
  organization_id,
  property_id,
  client_id,
  work_order_number,
  title,
  description,
  category,
  priority,
  status,
  created_at,
  updated_at
) VALUES (
  'b1000001-0001-4001-8001-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '33333333-3333-3333-3333-333333333304',
  '22222222-2222-2222-2222-222222222204',
  'WO-100002',
  'Pool Service - Water turning green',
  'Urgent pool service needed. Water cloudy and turning green. Customer needs resolved before weekend.',
  'pool',
  'urgent',
  'scheduled',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '12 hours'
);

-- Link the service request to the work order
UPDATE service_requests
SET work_order_id = 'b1000001-0001-4001-8001-000000000002',
    status = 'scheduled',
    updated_at = NOW()
WHERE id = 'a1000001-0001-4001-8001-000000000003';
