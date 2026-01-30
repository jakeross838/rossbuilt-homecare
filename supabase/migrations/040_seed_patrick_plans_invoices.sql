-- Seed plans and invoices for Patrick Gavin
-- Property: Gavin Home (8a1754dc-85d6-4025-8420-807f41d3a3dd)
-- Client: Patrick Gavin (22222222-2222-2222-2222-222222222204)

-- Create a program/plan for Gavin Home
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
) VALUES (
  '66666666-6666-6666-6666-666666666604',
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
  'Monthly comprehensive inspections for Gavin Home. Includes HVAC, pool, and full interior/exterior checks.',
  '2024-06-01 00:00:00+00'
) ON CONFLICT (id) DO NOTHING;

-- Create invoices for Patrick
-- Invoice 1: Outstanding (sent)
INSERT INTO invoices (
  id,
  organization_id,
  client_id,
  invoice_number,
  invoice_type,
  invoice_date,
  due_date,
  subtotal,
  tax_rate,
  tax_amount,
  total,
  balance_due,
  status,
  notes
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa004',
  '00000000-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222204',
  'INV-2026-004',
  'service',
  '2026-01-15',
  '2026-02-15',
  395.00,
  0.07,
  27.65,
  422.65,
  422.65,
  'sent',
  'January 2026 Monthly Inspection - Gavin Home'
) ON CONFLICT (id) DO NOTHING;

-- Invoice 2: Overdue
INSERT INTO invoices (
  id,
  organization_id,
  client_id,
  invoice_number,
  invoice_type,
  invoice_date,
  due_date,
  subtotal,
  tax_rate,
  tax_amount,
  total,
  balance_due,
  status,
  notes
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa005',
  '00000000-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222204',
  'INV-2025-012',
  'service',
  '2025-12-01',
  '2025-12-31',
  395.00,
  0.07,
  27.65,
  422.65,
  422.65,
  'overdue',
  'December 2025 Monthly Inspection - Gavin Home'
) ON CONFLICT (id) DO NOTHING;

-- Invoice 3: Paid
INSERT INTO invoices (
  id,
  organization_id,
  client_id,
  invoice_number,
  invoice_type,
  invoice_date,
  due_date,
  subtotal,
  tax_rate,
  tax_amount,
  total,
  amount_paid,
  balance_due,
  status,
  paid_at,
  notes
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa006',
  '00000000-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222204',
  'INV-2025-011',
  'service',
  '2025-11-01',
  '2025-11-30',
  395.00,
  0.07,
  27.65,
  422.65,
  422.65,
  0.00,
  'paid',
  '2025-11-20 10:30:00+00',
  'November 2025 Monthly Inspection - Gavin Home'
) ON CONFLICT (id) DO NOTHING;

-- Invoice line items
INSERT INTO invoice_line_items (id, invoice_id, description, quantity, unit_price, amount) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa004', 'Monthly Comprehensive Inspection - January 2026', 1, 395.00, 395.00),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa005', 'Monthly Comprehensive Inspection - December 2025', 1, 395.00, 395.00),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa006', 'Monthly Comprehensive Inspection - November 2025', 1, 395.00, 395.00)
ON CONFLICT (id) DO NOTHING;

-- Payment for paid invoice
INSERT INTO payments (id, organization_id, invoice_id, client_id, amount, payment_method, payment_date) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccc002', '00000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa006', '22222222-2222-2222-2222-222222222204', 422.65, 'card', '2025-11-20 10:30:00+00')
ON CONFLICT (id) DO NOTHING;
