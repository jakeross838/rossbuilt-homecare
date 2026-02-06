-- Remove all demo/seed data while keeping schema, templates, and org settings
-- This prepares the database for production use

-- Delete in dependency order (children first, parents last)

-- Activity log
DELETE FROM activity_log;

-- Service requests
DELETE FROM service_requests;

-- Recommendations
DELETE FROM recommendations;

-- Invoice line items (if table exists)
DO $$ BEGIN
  DELETE FROM invoice_line_items;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Invoices
DELETE FROM invoices;

-- Work orders
DELETE FROM work_orders;

-- Inspection findings/items (if table exists)
DO $$ BEGIN
  DELETE FROM inspection_findings;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DELETE FROM inspection_items;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Inspections
DELETE FROM inspections;

-- Equipment
DELETE FROM equipment;

-- Programs / service plans
DELETE FROM programs;

-- Properties
DELETE FROM properties;

-- Vendors
DELETE FROM vendors;

-- Clients
DELETE FROM clients;

-- Keep: organization, settings, pricing_config, inspection_templates, recommendation_templates, user profiles
