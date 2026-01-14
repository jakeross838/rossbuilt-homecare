-- 014_documents.sql
-- Documents and home manuals schema

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Associations (all optional for flexibility)
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,

  -- Document info
  name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  -- 'inspection_report', 'invoice', 'home_manual', 'warranty', 'contract',
  -- 'equipment_manual', 'photo', 'site_plan', 'other'

  -- File info
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  description TEXT,

  -- Access
  is_client_visible BOOLEAN DEFAULT false,

  -- Upload info
  uploaded_by UUID REFERENCES users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Home manuals table
CREATE TABLE home_manuals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE UNIQUE,

  -- Content (structured JSON)
  content JSONB NOT NULL DEFAULT '{}',
  /*
    {
      "property_overview": {...},
      "emergency_contacts": {...},
      "systems_overview": {...},
      "equipment_registry": [...],
      "maintenance_calendar": {...},
      "vendor_directory": [...],
      "service_history": [...],
      "home_care_tips": {...}
    }
  */

  -- Generated files
  pdf_url TEXT,
  web_url TEXT, -- Shareable web link
  share_token TEXT UNIQUE, -- For unauthenticated access

  -- Versioning
  version INTEGER DEFAULT 1,

  -- Timestamps
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_documents_property ON documents(property_id);
CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_home_manuals_property ON home_manuals(property_id);
CREATE INDEX idx_home_manuals_share ON home_manuals(share_token);
