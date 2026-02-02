-- Clean up "Gavin Patrick" duplicate client (names reversed)
-- This was likely manually created and has orphaned invoices

-- First, reassign any invoices from "Gavin Patrick" to "Patrick Gavin"
-- (so we don't lose the invoice data)
UPDATE invoices
SET client_id = '22222222-2222-2222-2222-222222222204'
WHERE client_id IN (
  SELECT id FROM clients
  WHERE first_name = 'Gavin'
    AND last_name = 'Patrick'
    AND organization_id = '00000000-0000-0000-0000-000000000001'
);

-- Reassign any payments from "Gavin Patrick" to "Patrick Gavin"
UPDATE payments
SET client_id = '22222222-2222-2222-2222-222222222204'
WHERE client_id IN (
  SELECT id FROM clients
  WHERE first_name = 'Gavin'
    AND last_name = 'Patrick'
    AND organization_id = '00000000-0000-0000-0000-000000000001'
);

-- Reassign any work orders from "Gavin Patrick" to "Patrick Gavin"
UPDATE work_orders
SET client_id = '22222222-2222-2222-2222-222222222204'
WHERE client_id IN (
  SELECT id FROM clients
  WHERE first_name = 'Gavin'
    AND last_name = 'Patrick'
    AND organization_id = '00000000-0000-0000-0000-000000000001'
);

-- Reassign any service requests from "Gavin Patrick" to "Patrick Gavin"
UPDATE service_requests
SET client_id = '22222222-2222-2222-2222-222222222204'
WHERE client_id IN (
  SELECT id FROM clients
  WHERE first_name = 'Gavin'
    AND last_name = 'Patrick'
    AND organization_id = '00000000-0000-0000-0000-000000000001'
);

-- Now delete the duplicate "Gavin Patrick" client
DELETE FROM clients
WHERE first_name = 'Gavin'
  AND last_name = 'Patrick'
  AND organization_id = '00000000-0000-0000-0000-000000000001';
