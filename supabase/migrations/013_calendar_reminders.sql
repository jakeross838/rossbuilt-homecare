-- 013_calendar_reminders.sql
-- Calendar events and reminders schema

-- Calendar events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Event info
  title TEXT NOT NULL,
  description TEXT,
  event_type calendar_event_type NOT NULL,

  -- Scheduling
  start_date DATE NOT NULL,
  start_time TIME,
  end_date DATE,
  end_time TIME,
  all_day BOOLEAN DEFAULT false,

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- RRULE format
  recurrence_end_date DATE,
  parent_event_id UUID REFERENCES calendar_events(id), -- For recurring instances

  -- Assignment
  assigned_to UUID REFERENCES users(id),

  -- References
  property_id UUID REFERENCES properties(id),
  inspection_id UUID REFERENCES inspections(id),
  work_order_id UUID REFERENCES work_orders(id),

  -- Location
  location TEXT,

  -- Status
  status TEXT DEFAULT 'scheduled',

  -- External sync
  google_event_id TEXT,
  last_synced_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminders table
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Reference
  property_id UUID REFERENCES properties(id),
  equipment_id UUID REFERENCES equipment(id),
  program_id UUID REFERENCES programs(id),

  -- Reminder info
  title TEXT NOT NULL,
  description TEXT,
  reminder_type TEXT NOT NULL,
  -- 'maintenance', 'warranty', 'service', 'inspection', 'filter', 'custom'

  -- Scheduling
  due_date DATE NOT NULL,
  reminder_date DATE NOT NULL, -- When to send reminder (usually before due_date)

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  next_occurrence DATE,

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'completed', 'snoozed', 'cancelled'
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  snoozed_until DATE,

  -- Notifications
  notify_staff BOOLEAN DEFAULT true,
  notify_client BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calendar_events_organization ON calendar_events(organization_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(start_date);
CREATE INDEX idx_calendar_events_assigned ON calendar_events(assigned_to);
CREATE INDEX idx_calendar_events_type ON calendar_events(event_type);
CREATE INDEX idx_reminders_organization ON reminders(organization_id);
CREATE INDEX idx_reminders_due ON reminders(due_date);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_equipment ON reminders(equipment_id);
