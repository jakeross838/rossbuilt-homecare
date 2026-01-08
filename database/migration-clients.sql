-- Clients table (property owners who can log into the client portal)
CREATE TABLE IF NOT EXISTS pm_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add client_id to properties (nullable for backward compatibility)
ALTER TABLE pm_properties
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES pm_clients(id) ON DELETE SET NULL;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_properties_client_id ON pm_properties(client_id);

-- Sample client (password is 'demo123' - in production use proper hashing)
-- INSERT INTO pm_clients (name, email, phone, password_hash) VALUES
-- ('Demo Client', 'demo@example.com', '555-0100', 'demo123');
