-- 019_seed_data.sql
-- Initial seed data for Ross Built organization

-- =============================================================================
-- ROSS BUILT ORGANIZATION
-- =============================================================================

-- Create default organization with fixed UUID for reference
INSERT INTO organizations (id, name, slug, phone, email, website, timezone, settings) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Ross Built Custom Homes',
    'ross-built',
    '941-555-0100',
    'info@rossbuilt.com',
    'https://rossbuilt.com',
    'America/New_York',
    '{
      "business_hours": {
        "start": "08:00",
        "end": "17:00",
        "lunch_start": "12:00",
        "lunch_end": "13:00"
      },
      "scheduling": {
        "buffer_minutes": 15,
        "max_daily_hours": 8,
        "lead_days": 14
      },
      "notifications": {
        "email_enabled": true,
        "sms_enabled": false
      }
    }'::jsonb
  );

-- =============================================================================
-- DEFAULT PRICING CONFIG
-- =============================================================================

-- Uses default JSONB values from table definition
INSERT INTO pricing_config (organization_id, effective_date, is_current) VALUES
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE, true);

-- =============================================================================
-- DEFAULT SETTINGS
-- =============================================================================

INSERT INTO settings (organization_id, setting_key, setting_value, description) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'company_info',
    '{
      "name": "Ross Built Custom Homes",
      "phone": "941-555-0100",
      "email": "info@rossbuilt.com",
      "address": {
        "line1": "",
        "city": "Bradenton",
        "state": "FL",
        "zip": ""
      }
    }'::jsonb,
    'Company information displayed on reports and invoices'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'email_templates',
    '{
      "inspection_scheduled": true,
      "inspection_reminder": true,
      "report_ready": true,
      "invoice_sent": true,
      "payment_received": true,
      "service_request_received": true,
      "work_order_update": true
    }'::jsonb,
    'Email notification toggles for various events'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'report_settings',
    '{
      "include_photos": true,
      "include_recommendations": true,
      "include_equipment_summary": true,
      "include_maintenance_schedule": true,
      "cover_page_enabled": true,
      "auto_send_on_completion": false
    }'::jsonb,
    'Default settings for inspection reports'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'invoice_settings',
    '{
      "payment_terms_days": 30,
      "late_fee_enabled": false,
      "late_fee_percent": 1.5,
      "auto_send_reminders": true,
      "reminder_days_before_due": 7,
      "reminder_days_after_due": [7, 14, 30]
    }'::jsonb,
    'Invoice and billing settings'
  );

-- =============================================================================
-- DEFAULT INSPECTION TEMPLATES
-- =============================================================================

-- Basic Exterior Checklist Template
INSERT INTO inspection_templates (
  organization_id, name, description, tier, category, sections, estimated_minutes, is_active
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Exterior Inspection Checklist',
    'Standard exterior inspection covering roof, siding, landscaping, and outdoor features',
    'visual',
    'exterior',
    '[
      {
        "id": "roof",
        "name": "Roof",
        "order": 1,
        "items": [
          {"id": "roof_surface", "text": "Roof surface condition", "type": "status", "photo_recommended": true, "help_text": "Check for missing shingles, cracks, debris"},
          {"id": "gutters", "text": "Gutters and downspouts", "type": "status", "photo_recommended": false, "help_text": "Check for clogs, damage, proper drainage"},
          {"id": "flashing", "text": "Flashing and penetrations", "type": "status", "photo_recommended": true, "help_text": "Check around vents, chimneys, skylights"}
        ]
      },
      {
        "id": "siding",
        "name": "Siding & Walls",
        "order": 2,
        "items": [
          {"id": "siding_condition", "text": "Siding condition", "type": "status", "photo_recommended": true, "help_text": "Check for cracks, rot, paint issues"},
          {"id": "caulking", "text": "Caulking around openings", "type": "status", "photo_recommended": false, "help_text": "Check windows, doors, penetrations"},
          {"id": "stucco", "text": "Stucco condition (if applicable)", "type": "status", "photo_recommended": true, "help_text": "Check for cracks, staining, delamination"}
        ]
      },
      {
        "id": "landscaping",
        "name": "Landscaping & Drainage",
        "order": 3,
        "items": [
          {"id": "vegetation", "text": "Vegetation clearance from structure", "type": "status", "photo_recommended": false, "help_text": "Check for plants touching siding, overhanging branches"},
          {"id": "drainage", "text": "Site drainage", "type": "status", "photo_recommended": true, "help_text": "Check grading, standing water, drainage paths"},
          {"id": "irrigation", "text": "Irrigation system (if applicable)", "type": "status", "photo_recommended": false, "help_text": "Check for leaks, coverage, head alignment"}
        ]
      },
      {
        "id": "exterior_features",
        "name": "Exterior Features",
        "order": 4,
        "items": [
          {"id": "driveway", "text": "Driveway and walkways", "type": "status", "photo_recommended": true, "help_text": "Check for cracks, settling, trip hazards"},
          {"id": "lighting", "text": "Exterior lighting", "type": "status", "photo_recommended": false, "help_text": "Check fixtures, bulbs, sensors"},
          {"id": "fencing", "text": "Fencing and gates (if applicable)", "type": "status", "photo_recommended": false, "help_text": "Check condition, operation, locks"}
        ]
      }
    ]'::jsonb,
    45,
    true
  );

-- Basic Interior Checklist Template
INSERT INTO inspection_templates (
  organization_id, name, description, tier, category, sections, estimated_minutes, is_active
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Interior Inspection Checklist',
    'Standard interior inspection covering living spaces, kitchen, bathrooms, and systems',
    'visual',
    'interior',
    '[
      {
        "id": "living_spaces",
        "name": "Living Spaces",
        "order": 1,
        "items": [
          {"id": "flooring", "text": "Flooring condition", "type": "status", "photo_recommended": false, "help_text": "Check all floor types for damage, wear, issues"},
          {"id": "walls_ceilings", "text": "Walls and ceilings", "type": "status", "photo_recommended": true, "help_text": "Check for cracks, staining, moisture damage"},
          {"id": "windows_doors", "text": "Windows and doors", "type": "status", "photo_recommended": false, "help_text": "Check operation, seals, locks"}
        ]
      },
      {
        "id": "kitchen",
        "name": "Kitchen",
        "order": 2,
        "items": [
          {"id": "appliances", "text": "Appliances operation", "type": "status", "photo_recommended": false, "help_text": "Check major appliances for function"},
          {"id": "sink_faucet", "text": "Sink and faucet", "type": "status", "photo_recommended": false, "help_text": "Check for leaks, drainage, operation"},
          {"id": "cabinets", "text": "Cabinets and counters", "type": "status", "photo_recommended": false, "help_text": "Check condition, operation, caulking"}
        ]
      },
      {
        "id": "bathrooms",
        "name": "Bathrooms",
        "order": 3,
        "items": [
          {"id": "fixtures", "text": "Fixtures and faucets", "type": "status", "photo_recommended": false, "help_text": "Check all sinks, tubs, showers, toilets"},
          {"id": "tile_grout", "text": "Tile and grout", "type": "status", "photo_recommended": true, "help_text": "Check for cracks, missing grout, caulk"},
          {"id": "ventilation", "text": "Ventilation fans", "type": "status", "photo_recommended": false, "help_text": "Check operation and condition"}
        ]
      },
      {
        "id": "systems",
        "name": "Systems Check",
        "order": 4,
        "items": [
          {"id": "electrical_panel", "text": "Electrical panel", "type": "status", "photo_recommended": true, "help_text": "Visual check of panel, proper labeling"},
          {"id": "water_heater", "text": "Water heater", "type": "status", "photo_recommended": true, "help_text": "Check condition, leaks, age"},
          {"id": "hvac_filters", "text": "HVAC filters", "type": "status", "photo_recommended": true, "help_text": "Check filter condition, note size"}
        ]
      }
    ]'::jsonb,
    60,
    true
  );

-- Pool/Spa Feature Template
INSERT INTO inspection_templates (
  organization_id, name, description, tier, category, feature_type, sections, estimated_minutes, is_active
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Pool & Spa Inspection',
    'Inspection checklist for pool and spa features',
    'visual',
    'exterior',
    'pool',
    '[
      {
        "id": "pool_structure",
        "name": "Pool Structure",
        "order": 1,
        "items": [
          {"id": "pool_surface", "text": "Pool surface condition", "type": "status", "photo_recommended": true, "help_text": "Check for cracks, staining, delamination"},
          {"id": "tile_coping", "text": "Tile and coping", "type": "status", "photo_recommended": true, "help_text": "Check for loose or damaged tiles, cracks"},
          {"id": "deck", "text": "Pool deck condition", "type": "status", "photo_recommended": false, "help_text": "Check for cracks, settling, trip hazards"}
        ]
      },
      {
        "id": "pool_equipment",
        "name": "Pool Equipment",
        "order": 2,
        "items": [
          {"id": "pump", "text": "Pump operation", "type": "status", "photo_recommended": false, "help_text": "Check for noise, leaks, proper operation"},
          {"id": "filter", "text": "Filter condition", "type": "status", "photo_recommended": false, "help_text": "Check pressure, last cleaning date"},
          {"id": "heater", "text": "Heater (if applicable)", "type": "status", "photo_recommended": false, "help_text": "Check operation and condition"}
        ]
      },
      {
        "id": "water_features",
        "name": "Water Features & Spa",
        "order": 3,
        "items": [
          {"id": "spa", "text": "Spa condition (if applicable)", "type": "status", "photo_recommended": false, "help_text": "Check surface, jets, controls"},
          {"id": "water_features", "text": "Water features", "type": "status", "photo_recommended": true, "help_text": "Check fountains, waterfalls, lights"},
          {"id": "automation", "text": "Pool automation", "type": "status", "photo_recommended": false, "help_text": "Check control panel, scheduling"}
        ]
      }
    ]'::jsonb,
    30,
    true
  );

-- HVAC Equipment Template
INSERT INTO inspection_templates (
  organization_id, name, description, tier, category, equipment_category, sections, estimated_minutes, is_active
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'HVAC System Inspection',
    'Comprehensive HVAC inspection for air handlers and condensers',
    'functional',
    NULL,
    'hvac',
    '[
      {
        "id": "air_handler",
        "name": "Air Handler",
        "order": 1,
        "items": [
          {"id": "filter", "text": "Air filter condition", "type": "status", "photo_required": true, "help_text": "Document filter size and condition"},
          {"id": "coil", "text": "Evaporator coil", "type": "status", "photo_recommended": true, "help_text": "Check for cleanliness, frost, damage"},
          {"id": "drain", "text": "Condensate drain", "type": "status", "photo_recommended": false, "help_text": "Check drain line, pan, float switch"},
          {"id": "blower", "text": "Blower operation", "type": "status", "photo_recommended": false, "help_text": "Listen for noise, check belt if applicable"}
        ]
      },
      {
        "id": "condenser",
        "name": "Condenser Unit",
        "order": 2,
        "items": [
          {"id": "coil_outdoor", "text": "Condenser coil", "type": "status", "photo_recommended": true, "help_text": "Check for debris, cleanliness, damage"},
          {"id": "fan", "text": "Fan operation", "type": "status", "photo_recommended": false, "help_text": "Check blade condition, noise, vibration"},
          {"id": "refrigerant", "text": "Refrigerant lines", "type": "status", "photo_recommended": false, "help_text": "Check insulation, connections"},
          {"id": "electrical", "text": "Electrical connections", "type": "status", "photo_recommended": false, "help_text": "Check disconnect, wiring, contactors"}
        ]
      },
      {
        "id": "performance",
        "name": "System Performance",
        "order": 3,
        "items": [
          {"id": "temp_split", "text": "Temperature differential", "type": "text", "photo_recommended": false, "help_text": "Record supply and return temps"},
          {"id": "thermostat", "text": "Thermostat operation", "type": "status", "photo_recommended": false, "help_text": "Check programming, calibration"},
          {"id": "airflow", "text": "Airflow at registers", "type": "status", "photo_recommended": false, "help_text": "Check supply registers for proper airflow"}
        ]
      }
    ]'::jsonb,
    45,
    true
  );

-- =============================================================================
-- DEFAULT RECOMMENDATION TEMPLATES
-- =============================================================================

INSERT INTO recommendation_templates (organization_id, template_key, title, description, category, default_priority, estimated_cost_low, estimated_cost_high) VALUES
  ('00000000-0000-0000-0000-000000000001', 'roof_shingle_repair', 'Roof Shingle Repair Needed', 'Damaged or missing shingles should be repaired to prevent water intrusion.', 'roofing', 'high', 300, 800),
  ('00000000-0000-0000-0000-000000000001', 'gutter_cleaning', 'Gutter Cleaning Recommended', 'Gutters contain debris and should be cleaned to ensure proper drainage.', 'exterior', 'medium', 150, 300),
  ('00000000-0000-0000-0000-000000000001', 'hvac_filter_replace', 'HVAC Filter Replacement Due', 'Air filter should be replaced to maintain system efficiency and air quality.', 'hvac', 'medium', 25, 75),
  ('00000000-0000-0000-0000-000000000001', 'caulk_windows', 'Window Caulking Needed', 'Exterior caulking around windows is deteriorated and should be replaced.', 'exterior', 'medium', 200, 500),
  ('00000000-0000-0000-0000-000000000001', 'pool_resurfacing', 'Pool Surface Showing Wear', 'Pool surface showing signs of wear and may need resurfacing in the near future.', 'pool', 'low', 5000, 15000),
  ('00000000-0000-0000-0000-000000000001', 'water_heater_age', 'Water Heater Approaching End of Life', 'Water heater is approaching or past typical lifespan. Consider planning for replacement.', 'plumbing', 'medium', 1200, 3000),
  ('00000000-0000-0000-0000-000000000001', 'grout_repair', 'Bathroom Grout Repair Needed', 'Grout in shower/bath area is cracked or missing and should be repaired to prevent water damage.', 'interior', 'high', 200, 600),
  ('00000000-0000-0000-0000-000000000001', 'exterior_paint', 'Exterior Paint Touch-up Recommended', 'Exterior paint showing signs of wear in specific areas.', 'exterior', 'low', 500, 2000),
  ('00000000-0000-0000-0000-000000000001', 'irrigation_adjustment', 'Irrigation System Adjustment Needed', 'Irrigation heads need adjustment for optimal coverage.', 'landscaping', 'low', 75, 200),
  ('00000000-0000-0000-0000-000000000001', 'smoke_detector_battery', 'Smoke Detector Battery Replacement', 'Smoke detector batteries should be replaced annually.', 'safety', 'high', 20, 50);
