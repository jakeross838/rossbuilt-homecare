-- 001_enums.sql
-- Core enumeration types for Home Care OS

-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'inspector', 'client');

-- Program statuses
CREATE TYPE program_status AS ENUM ('pending', 'active', 'paused', 'cancelled');

-- Inspection frequencies
CREATE TYPE inspection_frequency AS ENUM ('annual', 'semi_annual', 'quarterly', 'monthly', 'bi_weekly');

-- Inspection tiers
CREATE TYPE inspection_tier AS ENUM ('visual', 'functional', 'comprehensive', 'preventative');

-- Inspection statuses
CREATE TYPE inspection_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled');

-- Inspection item statuses
CREATE TYPE inspection_item_status AS ENUM ('pass', 'fail', 'na', 'needs_attention', 'urgent');

-- Recommendation statuses
CREATE TYPE recommendation_status AS ENUM ('pending', 'approved', 'declined', 'scheduled', 'in_progress', 'completed');

-- Work order statuses
CREATE TYPE work_order_status AS ENUM ('pending', 'vendor_assigned', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold');

-- Service request statuses
CREATE TYPE service_request_status AS ENUM ('new', 'acknowledged', 'in_progress', 'scheduled', 'completed', 'cancelled');

-- Invoice statuses
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'void');

-- Priority levels
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');

-- Condition ratings
CREATE TYPE condition_rating AS ENUM ('excellent', 'good', 'fair', 'needs_attention', 'poor');

-- Notification types
CREATE TYPE notification_type AS ENUM ('inspection', 'work_order', 'payment', 'reminder', 'alert', 'message');

-- Calendar event types
CREATE TYPE calendar_event_type AS ENUM ('inspection', 'work_order', 'reminder', 'service', 'block', 'other');
