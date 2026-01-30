-- Populate checklist data for demo inspections
-- This adds realistic checklist items for inspectors to evaluate

-- Update all inspections that have empty or null checklists
UPDATE inspections
SET checklist = '{
  "sections": [
    {
      "id": "exterior",
      "title": "Exterior",
      "order": 1,
      "items": [
        { "id": "ext_001", "label": "Roof surface condition (from ground)", "item_type": "boolean", "required": false },
        { "id": "ext_002", "label": "Gutters and downspouts condition", "item_type": "boolean", "required": false },
        { "id": "ext_003", "label": "Fascia and soffit condition", "item_type": "boolean", "required": false },
        { "id": "ext_004", "label": "Exterior walls and siding", "item_type": "boolean", "required": false },
        { "id": "ext_005", "label": "Windows and doors (exterior)", "item_type": "boolean", "required": false },
        { "id": "ext_006", "label": "Foundation visible areas", "item_type": "boolean", "required": false },
        { "id": "ext_007", "label": "Driveway and walkways", "item_type": "boolean", "required": false },
        { "id": "ext_008", "label": "Landscaping condition", "item_type": "boolean", "required": false },
        { "id": "ext_009", "label": "Exterior lighting fixtures", "item_type": "boolean", "required": false },
        { "id": "ext_010", "label": "Fencing and gates", "item_type": "boolean", "required": false },
        { "id": "ext_011", "label": "Test exterior outlets (GFCI)", "item_type": "boolean", "required": false },
        { "id": "ext_012", "label": "Test exterior lighting", "item_type": "boolean", "required": false },
        { "id": "ext_013", "label": "Operate garage door(s)", "item_type": "boolean", "required": false },
        { "id": "ext_014", "label": "Test exterior hose bibs", "item_type": "boolean", "required": false }
      ]
    },
    {
      "id": "interior",
      "title": "Interior",
      "order": 2,
      "items": [
        { "id": "int_001", "label": "Entry door and hardware", "item_type": "boolean", "required": false },
        { "id": "int_002", "label": "Flooring condition throughout", "item_type": "boolean", "required": false },
        { "id": "int_003", "label": "Walls and ceilings (damage/stains)", "item_type": "boolean", "required": false },
        { "id": "int_004", "label": "Windows and window treatments", "item_type": "boolean", "required": false },
        { "id": "int_005", "label": "Interior doors and hardware", "item_type": "boolean", "required": false },
        { "id": "int_006", "label": "Kitchen cabinets and counters", "item_type": "boolean", "required": false },
        { "id": "int_007", "label": "Bathroom fixtures visual check", "item_type": "boolean", "required": false },
        { "id": "int_008", "label": "Signs of pest activity", "item_type": "boolean", "required": true },
        { "id": "int_009", "label": "Signs of water intrusion", "item_type": "boolean", "required": true },
        { "id": "int_010", "label": "Run all faucets (hot and cold)", "item_type": "boolean", "required": false },
        { "id": "int_011", "label": "Flush all toilets", "item_type": "boolean", "required": false },
        { "id": "int_012", "label": "Run all showers/tubs", "item_type": "boolean", "required": false },
        { "id": "int_013", "label": "Test garbage disposal", "item_type": "boolean", "required": false },
        { "id": "int_014", "label": "Run dishwasher (quick cycle)", "item_type": "boolean", "required": false },
        { "id": "int_015", "label": "Test range/cooktop burners", "item_type": "boolean", "required": false },
        { "id": "int_016", "label": "Check refrigerator operation", "item_type": "boolean", "required": false },
        { "id": "int_017", "label": "Test washer (quick cycle)", "item_type": "boolean", "required": false },
        { "id": "int_018", "label": "Test dryer operation", "item_type": "boolean", "required": false },
        { "id": "int_019", "label": "Test all light switches", "item_type": "boolean", "required": false },
        { "id": "int_020", "label": "Test ceiling fans", "item_type": "boolean", "required": false },
        { "id": "int_021", "label": "Test smoke detectors", "item_type": "boolean", "required": true },
        { "id": "int_022", "label": "Test CO detectors", "item_type": "boolean", "required": true },
        { "id": "int_023", "label": "Check thermostat operation", "item_type": "boolean", "required": false }
      ]
    },
    {
      "id": "hvac",
      "title": "HVAC Systems",
      "order": 3,
      "items": [
        { "id": "hvac_001", "label": "Air handler cabinet condition", "item_type": "boolean", "required": false },
        { "id": "hvac_002", "label": "Condenser unit condition", "item_type": "boolean", "required": false },
        { "id": "hvac_003", "label": "Visible ductwork condition", "item_type": "boolean", "required": false },
        { "id": "hvac_004", "label": "Thermostat condition", "item_type": "boolean", "required": false },
        { "id": "hvac_005", "label": "Cycle cooling mode", "item_type": "boolean", "required": false },
        { "id": "hvac_006", "label": "Cycle heating mode", "item_type": "boolean", "required": false },
        { "id": "hvac_007", "label": "Check airflow at registers", "item_type": "boolean", "required": false },
        { "id": "hvac_008", "label": "Listen for unusual sounds", "item_type": "boolean", "required": false },
        { "id": "hvac_009", "label": "Check air filter condition", "item_type": "boolean", "required": true },
        { "id": "hvac_010", "label": "Check condensate drain", "item_type": "boolean", "required": false }
      ]
    },
    {
      "id": "plumbing",
      "title": "Plumbing",
      "order": 4,
      "items": [
        { "id": "plumb_001", "label": "Water heater visual inspection", "item_type": "boolean", "required": false },
        { "id": "plumb_002", "label": "Water heater temperature check", "item_type": "boolean", "required": false },
        { "id": "plumb_003", "label": "Check under sink for leaks", "item_type": "boolean", "required": true },
        { "id": "plumb_004", "label": "Water pressure test", "item_type": "numeric", "required": false, "unit": "PSI" },
        { "id": "plumb_005", "label": "Main water shutoff accessible", "item_type": "boolean", "required": false },
        { "id": "plumb_006", "label": "Toilet tank internals", "item_type": "boolean", "required": false },
        { "id": "plumb_007", "label": "Sump pump operation (if applicable)", "item_type": "boolean", "required": false }
      ]
    },
    {
      "id": "electrical",
      "title": "Electrical",
      "order": 5,
      "items": [
        { "id": "elec_001", "label": "Electrical panel condition", "item_type": "boolean", "required": false },
        { "id": "elec_002", "label": "Panel labeling adequate", "item_type": "boolean", "required": false },
        { "id": "elec_003", "label": "No double-tapped breakers", "item_type": "boolean", "required": false },
        { "id": "elec_004", "label": "GFCI outlets test (bathrooms)", "item_type": "boolean", "required": true },
        { "id": "elec_005", "label": "GFCI outlets test (kitchen)", "item_type": "boolean", "required": true },
        { "id": "elec_006", "label": "GFCI outlets test (garage)", "item_type": "boolean", "required": false },
        { "id": "elec_007", "label": "Outlet covers secure", "item_type": "boolean", "required": false },
        { "id": "elec_008", "label": "No visible wiring issues", "item_type": "boolean", "required": false }
      ]
    },
    {
      "id": "pool",
      "title": "Pool & Spa",
      "order": 6,
      "items": [
        { "id": "pool_001", "label": "Pool water clarity", "item_type": "boolean", "required": false },
        { "id": "pool_002", "label": "Pool surface condition", "item_type": "boolean", "required": false },
        { "id": "pool_003", "label": "Tile and coping condition", "item_type": "boolean", "required": false },
        { "id": "pool_004", "label": "Pool deck condition", "item_type": "boolean", "required": false },
        { "id": "pool_005", "label": "Screen enclosure condition", "item_type": "boolean", "required": false },
        { "id": "pool_006", "label": "Equipment pad condition", "item_type": "boolean", "required": false },
        { "id": "pool_007", "label": "Pool pump operation", "item_type": "boolean", "required": false },
        { "id": "pool_008", "label": "Pool filter pressure", "item_type": "numeric", "required": false, "unit": "PSI" },
        { "id": "pool_009", "label": "Pool heater operation", "item_type": "boolean", "required": false },
        { "id": "pool_010", "label": "Pool lights operation", "item_type": "boolean", "required": false },
        { "id": "pool_011", "label": "Skimmer baskets clean", "item_type": "boolean", "required": false },
        { "id": "pool_012", "label": "Pool automation system check", "item_type": "boolean", "required": false }
      ]
    },
    {
      "id": "safety",
      "title": "Safety & Security",
      "order": 7,
      "items": [
        { "id": "safe_001", "label": "Security system armed/functional", "item_type": "boolean", "required": false },
        { "id": "safe_002", "label": "All entry points secure", "item_type": "boolean", "required": true },
        { "id": "safe_003", "label": "Fire extinguisher present and charged", "item_type": "boolean", "required": false },
        { "id": "safe_004", "label": "Handrails secure", "item_type": "boolean", "required": false },
        { "id": "safe_005", "label": "Adequate egress lighting", "item_type": "boolean", "required": false },
        { "id": "safe_006", "label": "No tripping hazards", "item_type": "boolean", "required": false },
        { "id": "safe_007", "label": "Garage door auto-reverse test", "item_type": "boolean", "required": false }
      ]
    }
  ],
  "generated_at": "2026-01-21T00:00:00.000Z",
  "template_versions": { "base": 1 }
}'::jsonb
WHERE checklist IS NULL OR checklist = '{}'::jsonb;

-- Also populate findings with some demo data for completed inspections
-- This gives users a sense of what completed inspections look like

UPDATE inspections
SET findings = '{
  "ext_001": { "status": "pass", "photos": [], "notes": "Roof in good condition, no visible damage" },
  "ext_002": { "status": "pass", "photos": [], "notes": "Gutters clear and draining properly" },
  "ext_003": { "status": "pass", "photos": [] },
  "ext_004": { "status": "pass", "photos": [] },
  "ext_005": { "status": "pass", "photos": [] },
  "ext_006": { "status": "pass", "photos": [] },
  "ext_007": { "status": "needs_attention", "photos": [], "notes": "Minor crack in driveway near garage" },
  "ext_008": { "status": "pass", "photos": [] },
  "ext_009": { "status": "pass", "photos": [] },
  "ext_010": { "status": "pass", "photos": [] },
  "ext_011": { "status": "pass", "photos": [] },
  "ext_012": { "status": "pass", "photos": [] },
  "ext_013": { "status": "pass", "photos": [] },
  "ext_014": { "status": "pass", "photos": [] },
  "int_001": { "status": "pass", "photos": [] },
  "int_002": { "status": "pass", "photos": [] },
  "int_003": { "status": "pass", "photos": [] },
  "int_004": { "status": "pass", "photos": [] },
  "int_005": { "status": "pass", "photos": [] },
  "int_006": { "status": "pass", "photos": [] },
  "int_007": { "status": "pass", "photos": [] },
  "int_008": { "status": "pass", "photos": [], "notes": "No signs of pest activity" },
  "int_009": { "status": "pass", "photos": [], "notes": "No water intrusion detected" },
  "int_010": { "status": "pass", "photos": [] },
  "int_011": { "status": "pass", "photos": [] },
  "int_012": { "status": "pass", "photos": [] },
  "int_013": { "status": "pass", "photos": [] },
  "int_014": { "status": "pass", "photos": [] },
  "int_015": { "status": "pass", "photos": [] },
  "int_016": { "status": "pass", "photos": [] },
  "int_017": { "status": "na", "photos": [], "notes": "No washer on property" },
  "int_018": { "status": "na", "photos": [], "notes": "No dryer on property" },
  "int_019": { "status": "pass", "photos": [] },
  "int_020": { "status": "pass", "photos": [] },
  "int_021": { "status": "pass", "photos": [], "notes": "All smoke detectors functional" },
  "int_022": { "status": "pass", "photos": [], "notes": "CO detectors functional" },
  "int_023": { "status": "pass", "photos": [] },
  "hvac_001": { "status": "pass", "photos": [] },
  "hvac_002": { "status": "pass", "photos": [] },
  "hvac_003": { "status": "pass", "photos": [] },
  "hvac_004": { "status": "pass", "photos": [] },
  "hvac_005": { "status": "pass", "photos": [] },
  "hvac_006": { "status": "pass", "photos": [] },
  "hvac_007": { "status": "pass", "photos": [] },
  "hvac_008": { "status": "pass", "photos": [] },
  "hvac_009": { "status": "needs_attention", "photos": [], "notes": "Air filter due for replacement" },
  "hvac_010": { "status": "pass", "photos": [] },
  "plumb_001": { "status": "pass", "photos": [] },
  "plumb_002": { "status": "pass", "photos": [] },
  "plumb_003": { "status": "pass", "photos": [] },
  "plumb_004": { "status": "pass", "photos": [], "numeric_value": 55 },
  "plumb_005": { "status": "pass", "photos": [] },
  "plumb_006": { "status": "pass", "photos": [] },
  "plumb_007": { "status": "na", "photos": [] },
  "elec_001": { "status": "pass", "photos": [] },
  "elec_002": { "status": "pass", "photos": [] },
  "elec_003": { "status": "pass", "photos": [] },
  "elec_004": { "status": "pass", "photos": [] },
  "elec_005": { "status": "pass", "photos": [] },
  "elec_006": { "status": "pass", "photos": [] },
  "elec_007": { "status": "pass", "photos": [] },
  "elec_008": { "status": "pass", "photos": [] },
  "pool_001": { "status": "pass", "photos": [] },
  "pool_002": { "status": "pass", "photos": [] },
  "pool_003": { "status": "pass", "photos": [] },
  "pool_004": { "status": "pass", "photos": [] },
  "pool_005": { "status": "pass", "photos": [] },
  "pool_006": { "status": "pass", "photos": [] },
  "pool_007": { "status": "pass", "photos": [] },
  "pool_008": { "status": "pass", "photos": [], "numeric_value": 15 },
  "pool_009": { "status": "pass", "photos": [] },
  "pool_010": { "status": "pass", "photos": [] },
  "pool_011": { "status": "pass", "photos": [] },
  "pool_012": { "status": "pass", "photos": [] },
  "safe_001": { "status": "pass", "photos": [] },
  "safe_002": { "status": "pass", "photos": [] },
  "safe_003": { "status": "pass", "photos": [] },
  "safe_004": { "status": "pass", "photos": [] },
  "safe_005": { "status": "pass", "photos": [] },
  "safe_006": { "status": "pass", "photos": [] },
  "safe_007": { "status": "pass", "photos": [] }
}'::jsonb
WHERE status = 'completed' AND (findings IS NULL OR findings = '{}'::jsonb);

-- For in_progress inspections, add partial findings to show work in progress
UPDATE inspections
SET findings = '{
  "ext_001": { "status": "pass", "photos": [], "notes": "Roof in good condition" },
  "ext_002": { "status": "pass", "photos": [] },
  "ext_003": { "status": "pass", "photos": [] },
  "ext_004": { "status": "needs_attention", "photos": [], "notes": "Minor paint peeling on south wall" },
  "ext_005": { "status": "pass", "photos": [] },
  "ext_006": { "status": "pass", "photos": [] },
  "ext_007": { "status": "pass", "photos": [] },
  "int_001": { "status": "pass", "photos": [] },
  "int_002": { "status": "pass", "photos": [] }
}'::jsonb
WHERE status = 'in_progress' AND (findings IS NULL OR findings = '{}'::jsonb);
