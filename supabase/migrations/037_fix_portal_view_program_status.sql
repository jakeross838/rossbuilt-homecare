-- 037_fix_portal_view_program_status.sql
-- Fix: Include pending and paused programs in portal view (not just active)
-- This ensures clients with new/pending programs can see their plans

CREATE OR REPLACE VIEW portal_property_summaries AS
SELECT
  p.id,
  p.name,
  p.address_line1,
  p.city,
  p.state,
  p.zip,
  p.primary_photo_url,
  p.is_active,
  p.client_id,

  -- Program data (active, pending, or paused - most recent)
  prog.id AS program_id,
  prog.inspection_tier,
  prog.inspection_frequency,
  prog.status AS program_status,
  prog.monthly_total,

  -- Counts via LATERAL subqueries
  COALESCE(eq.equipment_count, 0) AS equipment_count,
  COALESCE(wo.open_work_order_count, 0) AS open_work_order_count,
  COALESCE(rec.pending_recommendation_count, 0) AS pending_recommendation_count,

  -- Last completed inspection
  last_insp.scheduled_date AS last_inspection_date,
  last_insp.overall_condition AS last_inspection_condition,

  -- Next scheduled inspection
  next_insp.scheduled_date AS next_inspection_date

FROM properties p

-- Active, pending, or paused program (most recent, not cancelled)
LEFT JOIN LATERAL (
  SELECT pr.id, pr.inspection_tier, pr.inspection_frequency, pr.status, pr.monthly_total
  FROM programs pr
  WHERE pr.property_id = p.id
    AND pr.status IN ('active', 'pending', 'paused')
  ORDER BY pr.created_at DESC
  LIMIT 1
) prog ON true

-- Equipment count (active only)
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS equipment_count
  FROM equipment e
  WHERE e.property_id = p.id AND e.is_active = true
) eq ON true

-- Open work orders count
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS open_work_order_count
  FROM work_orders w
  WHERE w.property_id = p.id
    AND w.status IN ('pending', 'vendor_assigned', 'scheduled', 'in_progress')
) wo ON true

-- Pending recommendations count
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS pending_recommendation_count
  FROM recommendations r
  WHERE r.property_id = p.id AND r.status = 'pending'
) rec ON true

-- Last completed inspection
LEFT JOIN LATERAL (
  SELECT i.scheduled_date, i.overall_condition
  FROM inspections i
  WHERE i.property_id = p.id AND i.status = 'completed'
  ORDER BY i.scheduled_date DESC
  LIMIT 1
) last_insp ON true

-- Next scheduled inspection
LEFT JOIN LATERAL (
  SELECT i.scheduled_date
  FROM inspections i
  WHERE i.property_id = p.id
    AND i.status = 'scheduled'
    AND i.scheduled_date >= CURRENT_DATE
  ORDER BY i.scheduled_date ASC
  LIMIT 1
) next_insp ON true;

COMMENT ON VIEW portal_property_summaries IS 'Pre-aggregated property data for portal. Includes active/pending/paused programs.';
