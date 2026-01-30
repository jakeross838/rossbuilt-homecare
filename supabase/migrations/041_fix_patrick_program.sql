-- Fix: Update existing program to point to Patrick's property
UPDATE programs
SET
  property_id = '8a1754dc-85d6-4025-8420-807f41d3a3dd',
  client_id = '22222222-2222-2222-2222-222222222204',
  status = 'active'
WHERE id = '66666666-6666-6666-6666-666666666604';

-- If no rows updated, insert a new one with different ID
INSERT INTO programs (
  id,
  organization_id,
  property_id,
  client_id,
  inspection_frequency,
  inspection_tier,
  base_fee,
  tier_fee,
  monthly_total,
  status,
  billing_start_date,
  notes,
  activated_at
)
SELECT
  '66666666-6666-6666-6666-666666666605',
  '00000000-0000-0000-0000-000000000001',
  '8a1754dc-85d6-4025-8420-807f41d3a3dd',
  '22222222-2222-2222-2222-222222222204',
  'monthly',
  'comprehensive',
  250.00,
  145.00,
  395.00,
  'active',
  '2024-06-01',
  'Monthly comprehensive inspections for Gavin Home.',
  '2024-06-01 00:00:00+00'
WHERE NOT EXISTS (
  SELECT 1 FROM programs WHERE property_id = '8a1754dc-85d6-4025-8420-807f41d3a3dd' AND status = 'active'
);
