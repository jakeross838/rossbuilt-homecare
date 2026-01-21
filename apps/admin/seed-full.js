// Comprehensive demo data seed script
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qzbmnbinhxzkcwfjnmtb.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Ym1uYmluaHh6a2N3ZmpubXRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2ODc5NCwiZXhwIjoyMDgxNzQ0Nzk0fQ.TIlTWiHF9l9quHmezgNPfhM4CzxxwpqSfodt6uZreh8'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const ORG_ID = '00000000-0000-0000-0000-000000000001'

// Helper to generate UUIDs
const uuid = (prefix, num) => `${prefix}-0000-0000-0000-${String(num).padStart(12, '0')}`

async function seed() {
  console.log('🚀 Building comprehensive demo data...\n')

  // ============================================
  // VENDORS (12 vendors) - Matching actual schema
  // ============================================
  console.log('🔧 Adding vendors...')
  const vendors = [
    {
      id: uuid('33333333', 1),
      organization_id: ORG_ID,
      company_name: 'Cool Breeze HVAC',
      contact_first_name: 'Mike',
      contact_last_name: 'Johnson',
      email: 'mike@coolbreezehvac.com',
      phone: '941-555-4001',
      trade_categories: ['hvac'],
      service_area: ['Bradenton', 'Sarasota', 'Longboat Key'],
      license_number: 'CAC-1812345',
      insurance_expiration: '2025-12-31',
      notes: 'Excellent response time. Carrier & Trane certified. 24/7 emergency.',
      is_active: true,
      is_preferred: true
    },
    {
      id: uuid('33333333', 2),
      organization_id: ORG_ID,
      company_name: 'Crystal Clear Pools',
      contact_first_name: 'Lisa',
      contact_last_name: 'Chen',
      email: 'lisa@crystalclearpools.com',
      phone: '941-555-4002',
      trade_categories: ['pool'],
      service_area: ['Bradenton', 'Sarasota', 'Longboat Key', 'Anna Maria'],
      license_number: 'CPC-1823456',
      insurance_expiration: '2025-08-15',
      notes: 'Premium pool service. Weekly maintenance $150/mo. Equipment repairs.',
      is_active: true,
      is_preferred: true
    },
    {
      id: uuid('33333333', 3),
      organization_id: ORG_ID,
      company_name: 'Gulf Coast Electric',
      contact_first_name: 'James',
      contact_last_name: 'Brown',
      email: 'james@gulfcoastelectric.com',
      phone: '941-555-4003',
      trade_categories: ['electrical'],
      service_area: ['Bradenton', 'Sarasota'],
      license_number: 'EC-1834567',
      insurance_expiration: '2025-04-30',
      notes: 'Master electrician. Generator specialist. Kohler & Generac certified.',
      is_active: true,
      is_preferred: false
    },
    {
      id: uuid('33333333', 4),
      organization_id: ORG_ID,
      company_name: 'Pro Plumbing Solutions',
      contact_first_name: 'David',
      contact_last_name: 'Williams',
      email: 'david@proplumbing.com',
      phone: '941-555-4004',
      trade_categories: ['plumbing'],
      service_area: ['Bradenton', 'Sarasota', 'Longboat Key'],
      license_number: 'CFC-1845678',
      insurance_expiration: '2025-09-30',
      notes: '24/7 emergency service. Water heater specialist.',
      is_active: true,
      is_preferred: true
    },
    {
      id: uuid('33333333', 5),
      organization_id: ORG_ID,
      company_name: 'Sunshine Roofing',
      contact_first_name: 'Carlos',
      contact_last_name: 'Rodriguez',
      email: 'carlos@sunshineroofing.com',
      phone: '941-555-4005',
      trade_categories: ['roofing'],
      service_area: ['Bradenton', 'Sarasota', 'Longboat Key', 'Palmetto'],
      license_number: 'CCC-1856789',
      insurance_expiration: '2025-12-31',
      notes: 'Tile and shingle specialists. Free estimates. Storm damage experts.',
      is_active: true,
      is_preferred: false
    },
    {
      id: uuid('33333333', 6),
      organization_id: ORG_ID,
      company_name: 'Island Pest Control',
      contact_first_name: 'Tom',
      contact_last_name: 'Harris',
      email: 'tom@islandpest.com',
      phone: '941-555-4006',
      trade_categories: ['pest_control'],
      service_area: ['Anna Maria', 'Holmes Beach', 'Bradenton Beach', 'Longboat Key'],
      license_number: 'JB-234567',
      insurance_expiration: '2025-06-30',
      notes: 'Monthly service $45. Termite bonds available. Eco-friendly options.',
      is_active: true,
      is_preferred: true
    },
    {
      id: uuid('33333333', 7),
      organization_id: ORG_ID,
      company_name: 'Barrier Island Landscaping',
      contact_first_name: 'Maria',
      contact_last_name: 'Santos',
      email: 'maria@barrierisland.com',
      phone: '941-555-4007',
      trade_categories: ['landscaping'],
      service_area: ['Anna Maria', 'Holmes Beach', 'Bradenton Beach', 'Longboat Key'],
      insurance_expiration: '2025-03-31',
      notes: 'Full service landscaping. Irrigation repair. Palm tree specialists.',
      is_active: true,
      is_preferred: true
    },
    {
      id: uuid('33333333', 8),
      organization_id: ORG_ID,
      company_name: 'Coastal Appliance Repair',
      contact_first_name: 'Steve',
      contact_last_name: 'Miller',
      email: 'steve@coastalappliance.com',
      phone: '941-555-4008',
      trade_categories: ['appliance'],
      service_area: ['Bradenton', 'Sarasota', 'Longboat Key'],
      insurance_expiration: '2025-05-31',
      notes: 'Sub-Zero, Wolf, Viking certified. High-end appliance specialists.',
      is_active: true,
      is_preferred: true
    },
    {
      id: uuid('33333333', 9),
      organization_id: ORG_ID,
      company_name: 'Elite Elevator Service',
      contact_first_name: 'John',
      contact_last_name: 'Adams',
      email: 'john@eliteelevator.com',
      phone: '941-555-4009',
      trade_categories: ['elevator'],
      service_area: ['Tampa Bay Area'],
      license_number: 'EL-987654',
      insurance_expiration: '2025-10-31',
      notes: 'Residential elevator specialist. Annual inspections. 24hr emergency.',
      is_active: true,
      is_preferred: true
    },
    {
      id: uuid('33333333', 10),
      organization_id: ORG_ID,
      company_name: 'Hurricane Shield Pro',
      contact_first_name: 'Rick',
      contact_last_name: 'Storm',
      email: 'rick@hurricaneshield.com',
      phone: '941-555-4010',
      trade_categories: ['hurricane_protection'],
      service_area: ['Manatee County', 'Sarasota County'],
      license_number: 'CBC-1267890',
      insurance_expiration: '2025-07-31',
      notes: 'Shutters, impact windows, storm prep. Roll-down shutter repair.',
      is_active: true,
      is_preferred: true
    },
    {
      id: uuid('33333333', 11),
      organization_id: ORG_ID,
      company_name: 'Smart Home Solutions',
      contact_first_name: 'Alex',
      contact_last_name: 'Tech',
      email: 'alex@smarthomesolutions.com',
      phone: '941-555-4011',
      trade_categories: ['smart_home'],
      service_area: ['Bradenton', 'Sarasota'],
      insurance_expiration: '2025-11-30',
      notes: 'Control4, Lutron, Sonos certified. Home automation experts.',
      is_active: true,
      is_preferred: false
    },
    {
      id: uuid('33333333', 12),
      organization_id: ORG_ID,
      company_name: 'Dock Masters',
      contact_first_name: 'Pete',
      contact_last_name: 'Captain',
      email: 'pete@dockmasters.com',
      phone: '941-555-4012',
      trade_categories: ['marine'],
      service_area: ['Coastal Manatee', 'Sarasota'],
      license_number: 'MAR-456789',
      insurance_expiration: '2025-08-31',
      notes: 'Boat lifts, docks, seawalls. HydroHoist dealer.',
      is_active: true,
      is_preferred: true
    }
  ]

  const { error: vendorError } = await supabase.from('vendors').upsert(vendors, { onConflict: 'id' })
  console.log(vendorError ? `  ❌ ${vendorError.message}` : '  ✓ 12 vendors added')

  // ============================================
  // EQUIPMENT (25 items) - Matching actual schema
  // ============================================
  console.log('⚙️ Adding equipment...')

  // First get property IDs from database
  const { data: props } = await supabase.from('properties').select('id, name').limit(15)
  const propMap = {}
  props?.forEach(p => {
    if (p.name.includes('Thompson')) propMap.thompson = p.id
    if (p.name.includes('Martinez') && p.name.includes('Beach')) propMap.martinez = p.id
    if (p.name.includes('Chen') && !p.name.includes('Guest')) propMap.chen = p.id
    if (p.name.includes('Wilson')) propMap.wilson = p.id
    if (p.name.includes('O\'Brien') || p.name.includes('OBrien')) propMap.obrien = p.id
    if (p.name.includes('Park')) propMap.park = p.id
    if (p.name.includes('Anderson')) propMap.anderson = p.id
    if (p.name.includes('Foster')) propMap.foster = p.id
    if (p.name.includes('Gonzalez')) propMap.gonzalez = p.id
  })

  console.log('  Found properties:', Object.keys(propMap).length)

  const equipment = []

  // Thompson Property Equipment
  if (propMap.thompson) {
    equipment.push(
      { id: uuid('44444444', 1), property_id: propMap.thompson, equipment_type: 'air_conditioner', category: 'hvac', custom_name: 'Main Floor AC', manufacturer: 'Carrier', model_number: 'CA16NA048', serial_number: 'CAR-2018-001', install_date: '2018-03-15', warranty_expiration: '2028-03-15', location: 'Garage mechanical room', capacity: '4 ton', filter_size: '20x25x4', notes: '10-year warranty. SEER 16', is_active: true },
      { id: uuid('44444444', 2), property_id: propMap.thompson, equipment_type: 'pool_pump', category: 'pool', custom_name: 'Main Pool Pump', manufacturer: 'Pentair', model_number: 'IntelliFlo VSF', serial_number: 'PEN-2020-001', install_date: '2020-06-01', warranty_expiration: '2025-06-01', location: 'Pool equipment pad', capacity: '3 HP', notes: 'Variable speed. Schedule: 8am-6pm', is_active: true },
      { id: uuid('44444444', 3), property_id: propMap.thompson, equipment_type: 'pool_heater', category: 'pool', custom_name: 'Pool Heater', manufacturer: 'Hayward', model_number: 'H400FDN', serial_number: 'HAY-2020-001', install_date: '2020-06-01', warranty_expiration: '2025-06-01', location: 'Pool equipment pad', capacity: '400k BTU', fuel_type: 'natural_gas', notes: 'Set to 84°F when owners in residence', is_active: true },
      { id: uuid('44444444', 4), property_id: propMap.thompson, equipment_type: 'generator', category: 'generator', custom_name: 'Whole House Generator', manufacturer: 'Generac', model_number: '7043', serial_number: 'GEN-2018-001', install_date: '2018-03-15', warranty_expiration: '2028-03-15', location: 'Side yard', capacity: '22 kW', fuel_type: 'natural_gas', notes: 'Auto-test: Wed 2pm. Annual service due Feb.', is_active: true },
      { id: uuid('44444444', 5), property_id: propMap.thompson, equipment_type: 'water_heater', category: 'plumbing', custom_name: 'Water Heater', manufacturer: 'Rheem', model_number: 'PROG50-38N', serial_number: 'RHE-2018-001', install_date: '2018-03-15', warranty_expiration: '2024-03-15', location: 'Garage', capacity: '50 gallon', fuel_type: 'gas', notes: '⚠️ WARRANTY EXPIRED - Budget for replacement', is_active: true }
    )
  }

  // Martinez Property Equipment
  if (propMap.martinez) {
    equipment.push(
      { id: uuid('44444444', 6), property_id: propMap.martinez, equipment_type: 'air_conditioner', category: 'hvac', custom_name: 'HVAC Zone 1 - Main Living', manufacturer: 'Trane', model_number: 'XR17', serial_number: 'TRN-2015-001', install_date: '2015-08-20', warranty_expiration: '2025-08-20', location: 'Attic mechanical', capacity: '5 ton', filter_size: '20x20x4', notes: 'Main living areas. SEER 17', is_active: true },
      { id: uuid('44444444', 7), property_id: propMap.martinez, equipment_type: 'air_conditioner', category: 'hvac', custom_name: 'HVAC Zone 2 - Bedrooms', manufacturer: 'Trane', model_number: 'XR17', serial_number: 'TRN-2015-002', install_date: '2015-08-20', warranty_expiration: '2025-08-20', location: 'Attic mechanical', capacity: '3 ton', filter_size: '16x25x4', notes: 'Upstairs bedrooms', is_active: true },
      { id: uuid('44444444', 8), property_id: propMap.martinez, equipment_type: 'elevator', category: 'elevator', custom_name: 'Residential Elevator', manufacturer: 'Savaria', model_number: 'Eclipse', serial_number: 'SAV-2015-001', install_date: '2015-08-20', warranty_expiration: '2025-08-20', location: '3-story elevator shaft', capacity: '750 lbs', notes: 'Annual inspection required. Last: Jan 2024', is_active: true },
      { id: uuid('44444444', 9), property_id: propMap.martinez, equipment_type: 'wine_cooler', category: 'appliance', custom_name: 'Wine Cellar Cooling', manufacturer: 'WhisperKool', model_number: 'SC 8000i', serial_number: 'WK-2015-001', install_date: '2015-08-20', warranty_expiration: '2020-08-20', location: 'Wine cellar', capacity: '2000 cu ft', notes: 'Set to 56°F. Check monthly.', is_active: true },
      { id: uuid('44444444', 10), property_id: propMap.martinez, equipment_type: 'boat_lift', category: 'marine', custom_name: 'Boat Lift', manufacturer: 'HydroHoist', model_number: 'UL2 12000', serial_number: 'HH-2016-001', install_date: '2016-05-01', warranty_expiration: '2021-05-01', location: 'Dock', capacity: '12000 lbs', notes: 'Lubricate annually. Last service: Oct 2024', is_active: true }
    )
  }

  // Chen Property Equipment
  if (propMap.chen) {
    equipment.push(
      { id: uuid('44444444', 11), property_id: propMap.chen, equipment_type: 'air_conditioner', category: 'hvac', custom_name: 'HVAC System 1', manufacturer: 'Lennox', model_number: 'XC25', serial_number: 'LEN-2021-001', install_date: '2021-06-01', warranty_expiration: '2031-06-01', location: 'Mechanical room 1', capacity: '5 ton', notes: 'iComfort smart thermostat. SEER 26', is_active: true },
      { id: uuid('44444444', 12), property_id: propMap.chen, equipment_type: 'air_conditioner', category: 'hvac', custom_name: 'HVAC System 2', manufacturer: 'Lennox', model_number: 'XC25', serial_number: 'LEN-2021-002', install_date: '2021-06-01', warranty_expiration: '2031-06-01', location: 'Mechanical room 2', capacity: '4 ton', notes: 'iComfort smart thermostat. SEER 26', is_active: true },
      { id: uuid('44444444', 13), property_id: propMap.chen, equipment_type: 'battery_backup', category: 'electrical', custom_name: 'Tesla Powerwall x3', manufacturer: 'Tesla', model_number: 'Powerwall 2', serial_number: 'TSL-2021-001', install_date: '2021-06-01', warranty_expiration: '2031-06-01', location: 'Garage', capacity: '40.5 kWh total', notes: '3 units for whole house backup', is_active: true },
      { id: uuid('44444444', 14), property_id: propMap.chen, equipment_type: 'pool_automation', category: 'pool', custom_name: 'Pool Automation', manufacturer: 'Pentair', model_number: 'IntelliCenter', serial_number: 'PEN-2021-001', install_date: '2021-06-01', warranty_expiration: '2026-06-01', location: 'Pool equipment', capacity: '8 zones', notes: 'Controls pool, spa, lights, water features', is_active: true },
      { id: uuid('44444444', 15), property_id: propMap.chen, equipment_type: 'elevator', category: 'elevator', custom_name: 'Glass Panoramic Elevator', manufacturer: 'Savaria', model_number: 'Vuelift', serial_number: 'SAV-2021-001', install_date: '2021-06-01', warranty_expiration: '2026-06-01', location: 'Central atrium', capacity: '950 lbs', notes: 'Panoramic glass elevator', is_active: true }
    )
  }

  // Park Medical Estate - CRITICAL equipment
  if (propMap.park) {
    equipment.push(
      { id: uuid('44444444', 19), property_id: propMap.park, equipment_type: 'generator', category: 'generator', custom_name: '⚠️ CRITICAL Medical Generator', manufacturer: 'Generac', model_number: '7228', serial_number: 'GEN-2017-001', install_date: '2017-05-01', warranty_expiration: '2027-05-01', location: 'Equipment yard', capacity: '38 kW', fuel_type: 'natural_gas', notes: '⚠️ CRITICAL - Medical equipment depends on this. Test weekly. Priority response.', is_active: true },
      { id: uuid('44444444', 20), property_id: propMap.park, equipment_type: 'ups', category: 'electrical', custom_name: 'Medical UPS', manufacturer: 'APC', model_number: 'Smart-UPS 5000', serial_number: 'APC-2020-001', install_date: '2020-01-15', warranty_expiration: '2025-01-15', location: 'Master bedroom closet', capacity: '5000 VA', notes: 'Backup for CPAP/medical. Battery replace every 3 yrs.', is_active: true },
      { id: uuid('44444444', 21), property_id: propMap.park, equipment_type: 'air_conditioner', category: 'hvac', custom_name: 'Main HVAC', manufacturer: 'Trane', model_number: 'XV20i', serial_number: 'TRN-2017-001', install_date: '2017-05-01', warranty_expiration: '2029-05-01', location: 'Mechanical room', capacity: '5 ton', notes: 'Variable speed compressor. SEER 22', is_active: true }
    )
  }

  // Wilson Property
  if (propMap.wilson) {
    equipment.push(
      { id: uuid('44444444', 22), property_id: propMap.wilson, equipment_type: 'hot_tub', category: 'pool', custom_name: 'Spa System', manufacturer: 'Hot Spring', model_number: 'Grandee', serial_number: 'HS-2023-001', install_date: '2023-09-01', warranty_expiration: '2028-09-01', location: 'Back patio', capacity: '7 person', notes: 'New 2023. Monthly chemical check.', is_active: true }
    )
  }

  // O'Brien Property
  if (propMap.obrien) {
    equipment.push(
      { id: uuid('44444444', 16), property_id: propMap.obrien, equipment_type: 'air_conditioner', category: 'hvac', custom_name: 'HVAC Downstairs', manufacturer: 'Carrier', model_number: 'Infinity 24', serial_number: 'CAR-2008-001', install_date: '2008-04-01', warranty_expiration: '2018-04-01', location: 'Utility room', capacity: '3.5 ton', notes: '⚠️ 16+ years old. Plan replacement.', is_active: true },
      { id: uuid('44444444', 17), property_id: propMap.obrien, equipment_type: 'generator', category: 'generator', custom_name: 'Propane Generator', manufacturer: 'Kohler', model_number: '20RESCL', serial_number: 'KOH-2012-001', install_date: '2012-06-01', warranty_expiration: '2017-06-01', location: 'Side of house', capacity: '20 kW', fuel_type: 'propane', notes: 'Propane tank 500 gal. Test: Wed 3pm', is_active: true },
      { id: uuid('44444444', 18), property_id: propMap.obrien, equipment_type: 'boat_lift', category: 'marine', custom_name: 'Dock Lift', manufacturer: 'Golden Boat Lifts', model_number: 'GB-10000', serial_number: 'GBL-2015-001', install_date: '2015-03-01', warranty_expiration: '2020-03-01', location: 'Dock', capacity: '10000 lbs', notes: 'Annual inspection due May', is_active: true }
    )
  }

  // Anderson Property
  if (propMap.anderson) {
    equipment.push(
      { id: uuid('44444444', 23), property_id: propMap.anderson, equipment_type: 'hurricane_shutters', category: 'hurricane', custom_name: 'Hurricane Shutters', manufacturer: 'Roll-A-Shield', model_number: 'Manual Accordion', serial_number: 'N/A', install_date: '2005-06-01', location: 'All windows', capacity: '12 windows', notes: 'Manual shutters. Need 2 people. Test before storm season.', is_active: true }
    )
  }

  // Foster Property
  if (propMap.foster) {
    equipment.push(
      { id: uuid('44444444', 24), property_id: propMap.foster, equipment_type: 'solar_panels', category: 'electrical', custom_name: 'Solar Panel System', manufacturer: 'SunPower', model_number: 'Maxeon 3', serial_number: 'SP-2019-001', install_date: '2019-04-01', warranty_expiration: '2044-04-01', location: 'Roof', capacity: '12 kW / 30 panels', notes: '25-year warranty. Cleaning twice/year.', is_active: true }
    )
  }

  // Gonzalez Property
  if (propMap.gonzalez) {
    equipment.push(
      { id: uuid('44444444', 25), property_id: propMap.gonzalez, equipment_type: 'heat_pump', category: 'pool', custom_name: 'Pool Heat Pump', manufacturer: 'Hayward', model_number: 'HP21404T', serial_number: 'HAY-2016-001', install_date: '2016-04-01', warranty_expiration: '2021-04-01', location: 'Pool pad', capacity: '140k BTU', notes: 'Efficient heat pump. Set 82°F for rentals.', is_active: true }
    )
  }

  if (equipment.length > 0) {
    const { error: equipError } = await supabase.from('equipment').upsert(equipment, { onConflict: 'id' })
    console.log(equipError ? `  ❌ ${equipError.message}` : `  ✓ ${equipment.length} equipment items added`)
  } else {
    console.log('  ⚠️ No properties found to add equipment to')
  }

  // ============================================
  // INSPECTIONS (20 inspections - various statuses)
  // ============================================
  console.log('📋 Adding inspections...')

  // Get all properties with client_id
  const { data: allProps } = await supabase.from('properties').select('id, name, client_id').limit(20)

  const inspections = []
  const today = new Date()

  // Helper for date offsets
  const dateOffset = (days) => {
    const d = new Date(today)
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  }

  if (allProps && allProps.length > 0) {
    // Completed inspections (past)
    inspections.push(
      {
        id: uuid('55555555', 1),
        organization_id: ORG_ID,
        property_id: allProps[0]?.id,
        inspection_type: 'monthly',
        scheduled_date: dateOffset(-30),
        scheduled_time_start: '09:00',
        scheduled_time_end: '11:00',
        status: 'completed',
        overall_condition: 'excellent',
        summary: 'Property in excellent condition. All systems operating normally. Pool crystal clear.',
        checklist: { exterior: true, interior: true, pool: true, hvac: true, electrical: true },
        findings: { issues_found: 0, notes: 'No issues found. Property well maintained.' },
        completed_at: dateOffset(-30) + 'T10:45:00Z',
        actual_duration_minutes: 105
      },
      {
        id: uuid('55555555', 2),
        organization_id: ORG_ID,
        property_id: allProps[1]?.id,
        inspection_type: 'monthly',
        scheduled_date: dateOffset(-25),
        scheduled_time_start: '10:00',
        scheduled_time_end: '12:00',
        status: 'completed',
        overall_condition: 'good',
        summary: 'Property in good condition. Minor landscaping needed. AC filters replaced.',
        checklist: { exterior: true, interior: true, hvac: true, plumbing: true },
        findings: { issues_found: 2, notes: 'Landscaping needs attention. AC filter was dirty.' },
        completed_at: dateOffset(-25) + 'T11:30:00Z',
        actual_duration_minutes: 90
      },
      {
        id: uuid('55555555', 3),
        organization_id: ORG_ID,
        property_id: allProps[2]?.id,
        inspection_type: 'seasonal',
        scheduled_date: dateOffset(-20),
        scheduled_time_start: '14:00',
        scheduled_time_end: '16:00',
        status: 'completed',
        overall_condition: 'fair',
        summary: 'Fall seasonal inspection. Pool heater needs service. Some mold in guest bath.',
        checklist: { exterior: true, interior: true, pool: true, hurricane_prep: true },
        findings: { issues_found: 3, urgent: 1, notes: 'Pool heater making noise. Guest bath ceiling has mold spots.' },
        completed_at: dateOffset(-20) + 'T15:45:00Z',
        actual_duration_minutes: 105
      },
      {
        id: uuid('55555555', 4),
        organization_id: ORG_ID,
        property_id: allProps[3]?.id,
        inspection_type: 'pre_arrival',
        scheduled_date: dateOffset(-15),
        scheduled_time_start: '09:00',
        scheduled_time_end: '10:30',
        status: 'completed',
        overall_condition: 'excellent',
        summary: 'Pre-arrival inspection complete. Property ready for owners.',
        checklist: { interior: true, hvac: true, kitchen: true, linens: true, welcome_items: true },
        findings: { issues_found: 0, notes: 'AC set to 74°F. Fridge stocked. Welcome basket ready.' },
        completed_at: dateOffset(-15) + 'T10:15:00Z',
        actual_duration_minutes: 75
      },
      {
        id: uuid('55555555', 5),
        organization_id: ORG_ID,
        property_id: allProps[0]?.id,
        inspection_type: 'post_departure',
        scheduled_date: dateOffset(-10),
        scheduled_time_start: '11:00',
        scheduled_time_end: '12:30',
        status: 'completed',
        overall_condition: 'good',
        summary: 'Post-departure check. Owners left property in good condition.',
        checklist: { interior: true, kitchen: true, trash: true, windows_doors: true },
        findings: { issues_found: 1, notes: 'Minor scuff on garage door. Notified owners.' },
        completed_at: dateOffset(-10) + 'T12:00:00Z',
        actual_duration_minutes: 60
      },
      {
        id: uuid('55555555', 6),
        organization_id: ORG_ID,
        property_id: allProps[4]?.id,
        inspection_type: 'monthly',
        scheduled_date: dateOffset(-7),
        scheduled_time_start: '13:00',
        scheduled_time_end: '15:00',
        status: 'completed',
        overall_condition: 'needs_attention',
        summary: 'Monthly inspection revealed several maintenance items requiring attention.',
        checklist: { exterior: true, interior: true, hvac: true, pool: true },
        findings: { issues_found: 5, urgent: 2, notes: 'AC not cooling efficiently. Pool pump making noise. Irrigation leak in front yard.' },
        completed_at: dateOffset(-7) + 'T14:30:00Z',
        actual_duration_minutes: 90
      }
    )

    // Scheduled inspections (upcoming)
    inspections.push(
      {
        id: uuid('55555555', 7),
        organization_id: ORG_ID,
        property_id: allProps[5]?.id || allProps[0]?.id,
        inspection_type: 'monthly',
        scheduled_date: dateOffset(3),
        scheduled_time_start: '09:00',
        scheduled_time_end: '11:00',
        status: 'scheduled',
        checklist: { exterior: true, interior: true, hvac: true, pool: true, electrical: true }
      },
      {
        id: uuid('55555555', 8),
        organization_id: ORG_ID,
        property_id: allProps[6]?.id || allProps[1]?.id,
        inspection_type: 'pre_arrival',
        scheduled_date: dateOffset(5),
        scheduled_time_start: '10:00',
        scheduled_time_end: '11:30',
        status: 'scheduled',
        checklist: { interior: true, hvac: true, kitchen: true, linens: true },
        internal_notes: 'Owners arriving Jan 25. VIP clients - extra attention to detail.'
      },
      {
        id: uuid('55555555', 9),
        organization_id: ORG_ID,
        property_id: allProps[7]?.id || allProps[2]?.id,
        inspection_type: 'monthly',
        scheduled_date: dateOffset(7),
        scheduled_time_start: '14:00',
        scheduled_time_end: '16:00',
        status: 'scheduled',
        checklist: { exterior: true, interior: true, generator: true, pool: true }
      },
      {
        id: uuid('55555555', 10),
        organization_id: ORG_ID,
        property_id: allProps[0]?.id,
        inspection_type: 'seasonal',
        scheduled_date: dateOffset(10),
        scheduled_time_start: '09:00',
        scheduled_time_end: '12:00',
        status: 'scheduled',
        checklist: { exterior: true, interior: true, hurricane_prep: true, irrigation: true, roof: true },
        internal_notes: 'Winter seasonal inspection. Check hurricane shutters operation.'
      },
      {
        id: uuid('55555555', 11),
        organization_id: ORG_ID,
        property_id: allProps[1]?.id,
        inspection_type: 'monthly',
        scheduled_date: dateOffset(14),
        scheduled_time_start: '10:00',
        scheduled_time_end: '12:00',
        status: 'scheduled',
        checklist: { exterior: true, interior: true, hvac: true, pool: true, elevator: true }
      }
    )

    // In-progress inspection
    inspections.push({
      id: uuid('55555555', 12),
      organization_id: ORG_ID,
      property_id: allProps[8]?.id || allProps[3]?.id,
      inspection_type: 'monthly',
      scheduled_date: dateOffset(0),
      scheduled_time_start: '09:00',
      scheduled_time_end: '11:00',
      status: 'in_progress',
      actual_start_at: new Date().toISOString(),
      checklist: { exterior: true, interior: true, hvac: true },
      internal_notes: 'Currently on-site conducting inspection.'
    })

    // Cancelled/Rescheduled
    inspections.push(
      {
        id: uuid('55555555', 13),
        organization_id: ORG_ID,
        property_id: allProps[4]?.id,
        inspection_type: 'monthly',
        scheduled_date: dateOffset(-5),
        status: 'cancelled',
        checklist: { exterior: true, interior: true, hvac: true },
        internal_notes: 'Cancelled due to hurricane warning. Rescheduled to next week.'
      },
      {
        id: uuid('55555555', 14),
        organization_id: ORG_ID,
        property_id: allProps[5]?.id || allProps[0]?.id,
        inspection_type: 'pre_arrival',
        scheduled_date: dateOffset(-3),
        status: 'rescheduled',
        checklist: { interior: true, hvac: true, kitchen: true },
        internal_notes: 'Owners changed arrival date. Rescheduled inspection.'
      }
    )
  }

  if (inspections.length > 0) {
    const { error: inspError } = await supabase.from('inspections').upsert(inspections, { onConflict: 'id' })
    console.log(inspError ? `  ❌ ${inspError.message}` : `  ✓ ${inspections.length} inspections added`)
  }

  // ============================================
  // WORK ORDERS (25 work orders - various statuses)
  // ============================================
  console.log('🔨 Adding work orders...')

  // Get vendors for assignment
  const { data: allVendors } = await supabase.from('vendors').select('id, company_name, trade_categories').limit(15)
  const vendorMap = {}
  allVendors?.forEach(v => {
    v.trade_categories?.forEach(cat => {
      if (!vendorMap[cat]) vendorMap[cat] = v.id
    })
  })

  const workOrders = []
  let woNum = 1

  if (allProps && allProps.length > 0) {
    // Completed work orders
    workOrders.push(
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[0]?.id,
        client_id: allProps[0]?.client_id,
        work_order_number: 'WO-2024-001',
        title: 'AC Filter Replacement',
        description: 'Replace all HVAC filters throughout property. Main unit 20x25x4, guest unit 16x25x1.',
        category: 'hvac',
        priority: 'medium',
        status: 'completed',
        vendor_id: vendorMap.hvac,
        scheduled_date: dateOffset(-20),
        estimated_cost: 150,
        actual_cost: 145,
        markup_percent: 20,
        total_client_cost: 174,
        completed_at: dateOffset(-20) + 'T14:00:00Z',
        completion_notes: 'Replaced all filters. System running efficiently.'
      },
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[1]?.id,
        client_id: allProps[1]?.client_id,
        work_order_number: 'WO-2024-002',
        title: 'Pool Pump Repair',
        description: 'Pool pump making grinding noise. Needs inspection and likely bearing replacement.',
        category: 'pool',
        priority: 'high',
        status: 'completed',
        vendor_id: vendorMap.pool,
        scheduled_date: dateOffset(-18),
        estimated_cost: 450,
        actual_cost: 385,
        markup_percent: 20,
        total_client_cost: 462,
        completed_at: dateOffset(-18) + 'T11:30:00Z',
        completion_notes: 'Replaced motor bearings. Pump running smoothly. Recommend monitoring.'
      },
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[2]?.id,
        client_id: allProps[2]?.client_id,
        work_order_number: 'WO-2024-003',
        title: 'Irrigation System Repair',
        description: 'Zone 3 not activating. Possible valve or wiring issue.',
        category: 'landscaping',
        priority: 'medium',
        status: 'completed',
        vendor_id: vendorMap.landscaping,
        scheduled_date: dateOffset(-15),
        estimated_cost: 200,
        actual_cost: 175,
        markup_percent: 20,
        total_client_cost: 210,
        completed_at: dateOffset(-15) + 'T15:00:00Z',
        completion_notes: 'Replaced faulty solenoid valve on zone 3. System tested all zones OK.'
      },
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[3]?.id,
        client_id: allProps[3]?.client_id,
        work_order_number: 'WO-2024-004',
        title: 'Generator Annual Service',
        description: 'Annual maintenance service for Generac generator. Oil change, spark plugs, filters.',
        category: 'generator',
        priority: 'medium',
        status: 'completed',
        vendor_id: vendorMap.electrical,
        scheduled_date: dateOffset(-12),
        estimated_cost: 350,
        actual_cost: 350,
        markup_percent: 15,
        total_client_cost: 402.50,
        completed_at: dateOffset(-12) + 'T13:00:00Z',
        completion_notes: 'Completed annual service. Changed oil, filters, spark plugs. Load tested OK.'
      },
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[0]?.id,
        client_id: allProps[0]?.client_id,
        work_order_number: 'WO-2024-005',
        title: 'Pest Control - Quarterly',
        description: 'Quarterly pest control treatment. Interior and exterior perimeter.',
        category: 'pest_control',
        priority: 'low',
        status: 'completed',
        vendor_id: vendorMap.pest_control,
        scheduled_date: dateOffset(-10),
        estimated_cost: 95,
        actual_cost: 95,
        markup_percent: 10,
        total_client_cost: 104.50,
        completed_at: dateOffset(-10) + 'T09:30:00Z',
        completion_notes: 'Quarterly treatment completed. No signs of pest activity.'
      }
    )

    // In Progress work orders
    workOrders.push(
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[4]?.id,
        client_id: allProps[4]?.client_id,
        work_order_number: 'WO-2024-006',
        title: 'Water Heater Replacement',
        description: 'Replace 15-year-old water heater showing signs of corrosion. Upgrade to 50-gallon unit.',
        category: 'plumbing',
        priority: 'high',
        status: 'in_progress',
        vendor_id: vendorMap.plumbing,
        scheduled_date: dateOffset(0),
        estimated_cost: 1800,
        started_at: new Date().toISOString(),
        internal_notes: 'Vendor on-site. Old unit drained. Installing new Rheem unit.'
      },
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[5]?.id || allProps[1]?.id,
        client_id: allProps[5]?.client_id || allProps[1]?.client_id,
        work_order_number: 'WO-2024-007',
        title: 'Roof Tile Repair',
        description: 'Several cracked tiles found during inspection. Replace damaged tiles before rainy season.',
        category: 'roofing',
        priority: 'high',
        status: 'in_progress',
        vendor_id: vendorMap.roofing,
        scheduled_date: dateOffset(-1),
        estimated_cost: 650,
        started_at: dateOffset(-1) + 'T08:00:00Z',
        internal_notes: 'Vendor replaced 8 tiles yesterday, finishing remaining 4 today.'
      }
    )

    // Scheduled work orders
    workOrders.push(
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[6]?.id || allProps[2]?.id,
        client_id: allProps[6]?.client_id || allProps[2]?.client_id,
        work_order_number: 'WO-2024-008',
        title: 'AC Maintenance - Annual',
        description: 'Annual AC maintenance. Clean coils, check refrigerant, inspect ductwork.',
        category: 'hvac',
        priority: 'medium',
        status: 'scheduled',
        vendor_id: vendorMap.hvac,
        scheduled_date: dateOffset(2),
        scheduled_time_start: '09:00',
        scheduled_time_end: '11:00',
        estimated_cost: 250
      },
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[7]?.id || allProps[3]?.id,
        client_id: allProps[7]?.client_id || allProps[3]?.client_id,
        work_order_number: 'WO-2024-009',
        title: 'Elevator Annual Inspection',
        description: 'State-required annual elevator inspection and certification.',
        category: 'elevator',
        priority: 'high',
        status: 'scheduled',
        vendor_id: vendorMap.elevator,
        scheduled_date: dateOffset(5),
        scheduled_time_start: '10:00',
        scheduled_time_end: '12:00',
        estimated_cost: 450
      },
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[0]?.id,
        client_id: allProps[0]?.client_id,
        work_order_number: 'WO-2024-010',
        title: 'Pool Heater Service',
        description: 'Pool heater not heating efficiently. Needs inspection and tune-up.',
        category: 'pool',
        priority: 'medium',
        status: 'scheduled',
        vendor_id: vendorMap.pool,
        scheduled_date: dateOffset(7),
        estimated_cost: 275
      },
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[1]?.id,
        client_id: allProps[1]?.client_id,
        work_order_number: 'WO-2024-011',
        title: 'Landscape Refresh',
        description: 'Replace dead shrubs in front beds. Refresh mulch. Trim hedges.',
        category: 'landscaping',
        priority: 'low',
        status: 'scheduled',
        vendor_id: vendorMap.landscaping,
        scheduled_date: dateOffset(10),
        estimated_cost: 850
      }
    )

    // Vendor Assigned (waiting for scheduling)
    workOrders.push(
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[2]?.id,
        client_id: allProps[2]?.client_id,
        work_order_number: 'WO-2024-012',
        title: 'Smart Home System Update',
        description: 'Update Control4 system firmware. Reprogram outdoor lighting scenes.',
        category: 'smart_home',
        priority: 'low',
        status: 'vendor_assigned',
        vendor_id: vendorMap.smart_home,
        estimated_cost: 350,
        internal_notes: 'Vendor will call to schedule. Owner prefers weekday afternoon.'
      },
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[3]?.id,
        client_id: allProps[3]?.client_id,
        work_order_number: 'WO-2024-013',
        title: 'Dock Inspection & Repair',
        description: 'Annual dock inspection. Several boards showing wear. Lift cables need inspection.',
        category: 'marine',
        priority: 'medium',
        status: 'vendor_assigned',
        vendor_id: vendorMap.marine,
        estimated_cost: 1200,
        internal_notes: 'Dock Masters assessing scope. Will provide detailed quote.'
      }
    )

    // Pending (not yet assigned)
    workOrders.push(
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[4]?.id,
        client_id: allProps[4]?.client_id,
        work_order_number: 'WO-2024-014',
        title: 'Hurricane Shutter Repair',
        description: 'Two accordion shutters stuck. Need track cleaning/repair before storm season.',
        category: 'hurricane_protection',
        priority: 'high',
        status: 'pending',
        estimated_cost: 400,
        internal_notes: 'Need to schedule before June 1 hurricane season start.'
      },
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[5]?.id || allProps[0]?.id,
        client_id: allProps[5]?.client_id || allProps[0]?.client_id,
        work_order_number: 'WO-2024-015',
        title: 'Kitchen Faucet Replacement',
        description: 'Kitchen faucet leaking at base. Owner approved replacement with Kohler unit.',
        category: 'plumbing',
        priority: 'medium',
        status: 'pending',
        estimated_cost: 450,
        client_visible_notes: 'Approved faucet: Kohler Simplice K-596-VS'
      },
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[6]?.id || allProps[1]?.id,
        client_id: allProps[6]?.client_id || allProps[1]?.client_id,
        work_order_number: 'WO-2024-016',
        title: 'Garage Door Opener Repair',
        description: 'Garage door opener making grinding noise. May need gear replacement.',
        category: 'electrical',
        priority: 'medium',
        status: 'pending',
        estimated_cost: 300
      }
    )

    // On Hold
    workOrders.push({
      id: uuid('66666666', woNum++),
      organization_id: ORG_ID,
      property_id: allProps[7]?.id || allProps[2]?.id,
      client_id: allProps[7]?.client_id || allProps[2]?.client_id,
      work_order_number: 'WO-2024-017',
      title: 'Solar Panel Cleaning',
      description: 'Annual solar panel cleaning for optimal efficiency.',
      category: 'electrical',
      priority: 'low',
      status: 'on_hold',
      estimated_cost: 350,
      internal_notes: 'On hold - owner wants to wait until after pollen season (April).'
    })

    // Urgent work orders
    workOrders.push(
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[0]?.id,
        client_id: allProps[0]?.client_id,
        work_order_number: 'WO-2024-018',
        title: 'URGENT: AC Not Cooling',
        description: 'Main AC unit not cooling. Temperature at 82°F. Owners arriving tomorrow.',
        category: 'hvac',
        priority: 'urgent',
        status: 'scheduled',
        vendor_id: vendorMap.hvac,
        scheduled_date: dateOffset(0),
        scheduled_time_start: '14:00',
        scheduled_time_end: '16:00',
        estimated_cost: 500,
        internal_notes: 'PRIORITY - Cool Breeze dispatching emergency technician.'
      },
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[1]?.id,
        client_id: allProps[1]?.client_id,
        work_order_number: 'WO-2024-019',
        title: 'URGENT: Water Leak Under Sink',
        description: 'Active water leak under kitchen sink. Water shut off. Need immediate repair.',
        category: 'plumbing',
        priority: 'urgent',
        status: 'vendor_assigned',
        vendor_id: vendorMap.plumbing,
        estimated_cost: 300,
        internal_notes: 'Water main shut off. Pro Plumbing en route.'
      }
    )

    // More completed for history
    workOrders.push(
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[2]?.id,
        client_id: allProps[2]?.client_id,
        work_order_number: 'WO-2024-020',
        title: 'Window Cleaning - Exterior',
        description: 'Exterior window cleaning for all windows.',
        category: 'cleaning',
        priority: 'low',
        status: 'completed',
        scheduled_date: dateOffset(-8),
        estimated_cost: 275,
        actual_cost: 275,
        markup_percent: 10,
        total_client_cost: 302.50,
        completed_at: dateOffset(-8) + 'T16:00:00Z',
        completion_notes: 'All exterior windows cleaned. Screens wiped down.'
      },
      {
        id: uuid('66666666', woNum++),
        organization_id: ORG_ID,
        property_id: allProps[3]?.id,
        client_id: allProps[3]?.client_id,
        work_order_number: 'WO-2024-021',
        title: 'Appliance Repair - Refrigerator',
        description: 'Sub-Zero refrigerator ice maker not working.',
        category: 'appliance',
        priority: 'medium',
        status: 'completed',
        vendor_id: vendorMap.appliance,
        scheduled_date: dateOffset(-5),
        estimated_cost: 400,
        actual_cost: 325,
        markup_percent: 15,
        total_client_cost: 373.75,
        completed_at: dateOffset(-5) + 'T11:00:00Z',
        completion_notes: 'Replaced water inlet valve. Ice maker operational.'
      }
    )
  }

  if (workOrders.length > 0) {
    const { error: woError } = await supabase.from('work_orders').upsert(workOrders, { onConflict: 'id' })
    console.log(woError ? `  ❌ ${woError.message}` : `  ✓ ${workOrders.length} work orders added`)
  }

  // ============================================
  // INVOICES (15 invoices - various statuses)
  // ============================================
  console.log('💰 Adding invoices...')

  // Get clients
  const { data: allClients } = await supabase.from('clients').select('id, first_name, last_name, email').limit(15)

  const invoices = []
  let invNum = 1001

  if (allClients && allClients.length > 0) {
    // Paid invoices
    invoices.push(
      {
        id: uuid('77777777', 1),
        organization_id: ORG_ID,
        client_id: allClients[0]?.id,
        invoice_number: `INV-${invNum++}`,
        invoice_type: 'monthly_service',
        invoice_date: dateOffset(-45),
        due_date: dateOffset(-30),
        period_start: dateOffset(-60),
        period_end: dateOffset(-30),
        subtotal: 450,
        tax_rate: 0,
        tax_amount: 0,
        total: 450,
        amount_paid: 450,
        balance_due: 0,
        status: 'paid',
        paid_at: dateOffset(-28) + 'T10:00:00Z',
        payment_method: 'credit_card',
        notes: 'Monthly home watch service - December 2024'
      },
      {
        id: uuid('77777777', 2),
        organization_id: ORG_ID,
        client_id: allClients[1]?.id,
        invoice_number: `INV-${invNum++}`,
        invoice_type: 'work_order',
        invoice_date: dateOffset(-30),
        due_date: dateOffset(-15),
        subtotal: 462,
        tax_rate: 0,
        tax_amount: 0,
        total: 462,
        amount_paid: 462,
        balance_due: 0,
        status: 'paid',
        paid_at: dateOffset(-12) + 'T14:30:00Z',
        payment_method: 'ach',
        notes: 'Pool pump repair - WO-2024-002'
      },
      {
        id: uuid('77777777', 3),
        organization_id: ORG_ID,
        client_id: allClients[2]?.id,
        invoice_number: `INV-${invNum++}`,
        invoice_type: 'monthly_service',
        invoice_date: dateOffset(-40),
        due_date: dateOffset(-25),
        period_start: dateOffset(-55),
        period_end: dateOffset(-25),
        subtotal: 350,
        tax_rate: 0,
        tax_amount: 0,
        total: 350,
        amount_paid: 350,
        balance_due: 0,
        status: 'paid',
        paid_at: dateOffset(-22) + 'T09:15:00Z',
        payment_method: 'check',
        notes: 'Monthly home watch service - December 2024'
      },
      {
        id: uuid('77777777', 4),
        organization_id: ORG_ID,
        client_id: allClients[0]?.id,
        invoice_number: `INV-${invNum++}`,
        invoice_type: 'work_order',
        invoice_date: dateOffset(-25),
        due_date: dateOffset(-10),
        subtotal: 174,
        tax_rate: 0,
        tax_amount: 0,
        total: 174,
        amount_paid: 174,
        balance_due: 0,
        status: 'paid',
        paid_at: dateOffset(-8) + 'T16:00:00Z',
        payment_method: 'credit_card',
        notes: 'AC filter replacement - WO-2024-001'
      }
    )

    // Sent/Viewed invoices (current)
    invoices.push(
      {
        id: uuid('77777777', 5),
        organization_id: ORG_ID,
        client_id: allClients[0]?.id,
        invoice_number: `INV-${invNum++}`,
        invoice_type: 'monthly_service',
        invoice_date: dateOffset(-15),
        due_date: dateOffset(0),
        period_start: dateOffset(-30),
        period_end: dateOffset(0),
        subtotal: 450,
        tax_rate: 0,
        tax_amount: 0,
        total: 450,
        amount_paid: 0,
        balance_due: 450,
        status: 'viewed',
        sent_at: dateOffset(-14) + 'T09:00:00Z',
        sent_to_email: allClients[0]?.email,
        viewed_at: dateOffset(-13) + 'T11:30:00Z',
        notes: 'Monthly home watch service - January 2025'
      },
      {
        id: uuid('77777777', 6),
        organization_id: ORG_ID,
        client_id: allClients[1]?.id,
        invoice_number: `INV-${invNum++}`,
        invoice_type: 'monthly_service',
        invoice_date: dateOffset(-15),
        due_date: dateOffset(0),
        period_start: dateOffset(-30),
        period_end: dateOffset(0),
        subtotal: 550,
        tax_rate: 0,
        tax_amount: 0,
        total: 550,
        amount_paid: 0,
        balance_due: 550,
        status: 'sent',
        sent_at: dateOffset(-14) + 'T09:00:00Z',
        sent_to_email: allClients[1]?.email,
        notes: 'Monthly home watch service - January 2025 (Premium)'
      },
      {
        id: uuid('77777777', 7),
        organization_id: ORG_ID,
        client_id: allClients[3]?.id,
        invoice_number: `INV-${invNum++}`,
        invoice_type: 'work_order',
        invoice_date: dateOffset(-10),
        due_date: dateOffset(5),
        subtotal: 302.50,
        tax_rate: 0,
        tax_amount: 0,
        total: 302.50,
        amount_paid: 0,
        balance_due: 302.50,
        status: 'sent',
        sent_at: dateOffset(-9) + 'T10:00:00Z',
        notes: 'Window cleaning - WO-2024-020'
      }
    )

    // Overdue invoices
    invoices.push(
      {
        id: uuid('77777777', 8),
        organization_id: ORG_ID,
        client_id: allClients[4]?.id,
        invoice_number: `INV-${invNum++}`,
        invoice_type: 'monthly_service',
        invoice_date: dateOffset(-45),
        due_date: dateOffset(-30),
        period_start: dateOffset(-60),
        period_end: dateOffset(-30),
        subtotal: 350,
        tax_rate: 0,
        tax_amount: 0,
        total: 350,
        amount_paid: 0,
        balance_due: 350,
        status: 'overdue',
        sent_at: dateOffset(-44) + 'T09:00:00Z',
        notes: 'Monthly home watch - December 2024. OVERDUE - 2nd reminder sent.'
      },
      {
        id: uuid('77777777', 9),
        organization_id: ORG_ID,
        client_id: allClients[5]?.id || allClients[0]?.id,
        invoice_number: `INV-${invNum++}`,
        invoice_type: 'work_order',
        invoice_date: dateOffset(-35),
        due_date: dateOffset(-20),
        subtotal: 650,
        tax_rate: 0,
        tax_amount: 0,
        total: 650,
        amount_paid: 0,
        balance_due: 650,
        status: 'overdue',
        sent_at: dateOffset(-34) + 'T09:00:00Z',
        notes: 'Roof repair work. OVERDUE - Client traveling, will pay on return.'
      }
    )

    // Partial payment
    invoices.push({
      id: uuid('77777777', 10),
      organization_id: ORG_ID,
      client_id: allClients[2]?.id,
      invoice_number: `INV-${invNum++}`,
      invoice_type: 'work_order',
      invoice_date: dateOffset(-20),
      due_date: dateOffset(-5),
      subtotal: 1200,
      tax_rate: 0,
      tax_amount: 0,
      total: 1200,
      amount_paid: 600,
      balance_due: 600,
      status: 'partial',
      sent_at: dateOffset(-19) + 'T09:00:00Z',
      notes: 'Large landscaping project. Client paying in 2 installments.'
    })

    // Draft invoices
    invoices.push(
      {
        id: uuid('77777777', 11),
        organization_id: ORG_ID,
        client_id: allClients[0]?.id,
        invoice_number: `INV-${invNum++}`,
        invoice_type: 'work_order',
        invoice_date: dateOffset(0),
        due_date: dateOffset(15),
        subtotal: 373.75,
        tax_rate: 0,
        tax_amount: 0,
        total: 373.75,
        amount_paid: 0,
        balance_due: 373.75,
        status: 'draft',
        notes: 'Refrigerator repair - WO-2024-021. Ready to send.'
      },
      {
        id: uuid('77777777', 12),
        organization_id: ORG_ID,
        client_id: allClients[1]?.id,
        invoice_number: `INV-${invNum++}`,
        invoice_type: 'work_order',
        invoice_date: dateOffset(0),
        due_date: dateOffset(15),
        subtotal: 402.50,
        tax_rate: 0,
        tax_amount: 0,
        total: 402.50,
        amount_paid: 0,
        balance_due: 402.50,
        status: 'draft',
        notes: 'Generator annual service - WO-2024-004'
      }
    )

    // Void invoice
    invoices.push({
      id: uuid('77777777', 13),
      organization_id: ORG_ID,
      client_id: allClients[3]?.id,
      invoice_number: `INV-${invNum++}`,
      invoice_type: 'work_order',
      invoice_date: dateOffset(-30),
      due_date: dateOffset(-15),
      subtotal: 250,
      tax_rate: 0,
      tax_amount: 0,
      total: 250,
      amount_paid: 0,
      balance_due: 0,
      status: 'void',
      notes: 'VOIDED - Work was covered under warranty.'
    })
  }

  if (invoices.length > 0) {
    const { error: invError } = await supabase.from('invoices').upsert(invoices, { onConflict: 'id' })
    console.log(invError ? `  ❌ ${invError.message}` : `  ✓ ${invoices.length} invoices added`)
  }

  // ============================================
  // CALENDAR EVENTS (20 events - various types)
  // ============================================
  console.log('📅 Adding calendar events...')

  const calendarEvents = []

  if (allProps && allProps.length > 0) {
    // Inspection events (linked to inspections)
    calendarEvents.push(
      {
        id: uuid('88888888', 1),
        organization_id: ORG_ID,
        event_type: 'inspection',
        title: 'Monthly Inspection - Thompson Residence',
        description: 'Comprehensive monthly inspection including pool, HVAC, and exterior.',
        property_id: allProps[0]?.id,
        start_date: dateOffset(3),
        start_time: '09:00',
        end_date: dateOffset(3),
        end_time: '11:00',
        location: allProps[0]?.name || 'Thompson Residence',
        status: 'scheduled'
      },
      {
        id: uuid('88888888', 2),
        organization_id: ORG_ID,
        event_type: 'inspection',
        title: 'Pre-Arrival Check - VIP Client',
        description: 'Pre-arrival inspection for owners arriving Jan 25.',
        property_id: allProps[1]?.id,
        start_date: dateOffset(5),
        start_time: '10:00',
        end_date: dateOffset(5),
        end_time: '11:30',
        status: 'scheduled'
      },
      {
        id: uuid('88888888', 3),
        organization_id: ORG_ID,
        event_type: 'inspection',
        title: 'Seasonal Inspection - Winter',
        description: 'Winter seasonal inspection. Check hurricane shutters, irrigation.',
        property_id: allProps[0]?.id,
        start_date: dateOffset(10),
        start_time: '09:00',
        end_date: dateOffset(10),
        end_time: '12:00',
        status: 'scheduled'
      }
    )

    // Work order events
    calendarEvents.push(
      {
        id: uuid('88888888', 4),
        organization_id: ORG_ID,
        event_type: 'work_order',
        title: 'AC Maintenance - Annual Service',
        description: 'Cool Breeze HVAC - Annual AC maintenance',
        property_id: allProps[2]?.id,
        start_date: dateOffset(2),
        start_time: '09:00',
        end_date: dateOffset(2),
        end_time: '11:00',
        status: 'scheduled'
      },
      {
        id: uuid('88888888', 5),
        organization_id: ORG_ID,
        event_type: 'work_order',
        title: 'Elevator Inspection',
        description: 'Elite Elevator Service - Annual state-required inspection',
        property_id: allProps[3]?.id,
        start_date: dateOffset(5),
        start_time: '10:00',
        end_date: dateOffset(5),
        end_time: '12:00',
        status: 'scheduled'
      },
      {
        id: uuid('88888888', 6),
        organization_id: ORG_ID,
        event_type: 'work_order',
        title: 'URGENT: AC Emergency Repair',
        description: 'Cool Breeze HVAC - Emergency AC repair. Owners arriving tomorrow.',
        property_id: allProps[0]?.id,
        start_date: dateOffset(0),
        start_time: '14:00',
        end_date: dateOffset(0),
        end_time: '16:00',
        status: 'scheduled'
      }
    )

    // Service events (regular recurring services)
    calendarEvents.push(
      {
        id: uuid('88888888', 7),
        organization_id: ORG_ID,
        event_type: 'service',
        title: 'Pool Service - Weekly',
        description: 'Crystal Clear Pools - Weekly pool maintenance',
        property_id: allProps[0]?.id,
        start_date: dateOffset(1),
        start_time: '08:00',
        end_date: dateOffset(1),
        end_time: '09:00',
        is_recurring: true,
        recurrence_rule: 'FREQ=WEEKLY;BYDAY=TU',
        status: 'scheduled'
      },
      {
        id: uuid('88888888', 8),
        organization_id: ORG_ID,
        event_type: 'service',
        title: 'Pool Service - Weekly',
        description: 'Crystal Clear Pools - Weekly pool maintenance',
        property_id: allProps[1]?.id,
        start_date: dateOffset(1),
        start_time: '09:30',
        end_date: dateOffset(1),
        end_time: '10:30',
        is_recurring: true,
        recurrence_rule: 'FREQ=WEEKLY;BYDAY=TU',
        status: 'scheduled'
      },
      {
        id: uuid('88888888', 9),
        organization_id: ORG_ID,
        event_type: 'service',
        title: 'Lawn Maintenance',
        description: 'Barrier Island Landscaping - Bi-weekly lawn service',
        property_id: allProps[2]?.id,
        start_date: dateOffset(4),
        start_time: '07:00',
        end_date: dateOffset(4),
        end_time: '09:00',
        is_recurring: true,
        recurrence_rule: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=TH',
        status: 'scheduled'
      },
      {
        id: uuid('88888888', 10),
        organization_id: ORG_ID,
        event_type: 'service',
        title: 'Pest Control - Monthly',
        description: 'Island Pest Control - Monthly perimeter treatment',
        property_id: allProps[0]?.id,
        start_date: dateOffset(15),
        start_time: '08:00',
        end_date: dateOffset(15),
        end_time: '08:30',
        is_recurring: true,
        recurrence_rule: 'FREQ=MONTHLY;BYMONTHDAY=15',
        status: 'scheduled'
      }
    )

    // Reminder events
    calendarEvents.push(
      {
        id: uuid('88888888', 11),
        organization_id: ORG_ID,
        event_type: 'reminder',
        title: 'Generator Test Day',
        description: 'Weekly generator auto-test runs today. Verify operation.',
        property_id: allProps[0]?.id,
        start_date: dateOffset(3),
        all_day: true,
        status: 'scheduled'
      },
      {
        id: uuid('88888888', 12),
        organization_id: ORG_ID,
        event_type: 'reminder',
        title: 'Hurricane Season Prep Deadline',
        description: 'All hurricane prep work should be completed before June 1.',
        start_date: '2025-06-01',
        all_day: true,
        status: 'scheduled'
      },
      {
        id: uuid('88888888', 13),
        organization_id: ORG_ID,
        event_type: 'reminder',
        title: 'Warranty Expiring - Water Heater',
        description: 'Thompson property water heater warranty expires. Plan replacement.',
        property_id: allProps[0]?.id,
        start_date: dateOffset(30),
        all_day: true,
        status: 'scheduled'
      }
    )

    // Block events (unavailable time)
    calendarEvents.push(
      {
        id: uuid('88888888', 14),
        organization_id: ORG_ID,
        event_type: 'block',
        title: 'Staff Meeting',
        description: 'Weekly team meeting',
        start_date: dateOffset(1),
        start_time: '08:00',
        end_date: dateOffset(1),
        end_time: '09:00',
        is_recurring: true,
        recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
        status: 'scheduled'
      },
      {
        id: uuid('88888888', 15),
        organization_id: ORG_ID,
        event_type: 'block',
        title: 'Office Closed - MLK Day',
        description: 'Office closed for Martin Luther King Jr. Day',
        start_date: '2025-01-20',
        all_day: true,
        status: 'scheduled'
      }
    )

    // Other events
    calendarEvents.push(
      {
        id: uuid('88888888', 16),
        organization_id: ORG_ID,
        event_type: 'other',
        title: 'Owner Arrival - Thompson',
        description: 'Michael & Sarah Thompson arriving. Property prepped.',
        property_id: allProps[0]?.id,
        start_date: dateOffset(6),
        all_day: true,
        status: 'scheduled'
      },
      {
        id: uuid('88888888', 17),
        organization_id: ORG_ID,
        event_type: 'other',
        title: 'Vendor Meet & Greet',
        description: 'Meet new roofing vendor for property evaluation',
        property_id: allProps[4]?.id,
        start_date: dateOffset(8),
        start_time: '14:00',
        end_date: dateOffset(8),
        end_time: '15:00',
        status: 'scheduled'
      }
    )
  }

  if (calendarEvents.length > 0) {
    const { error: calError } = await supabase.from('calendar_events').upsert(calendarEvents, { onConflict: 'id' })
    console.log(calError ? `  ❌ ${calError.message}` : `  ✓ ${calendarEvents.length} calendar events added`)
  }

  // ============================================
  // REMINDERS (15 reminders - various types)
  // ============================================
  console.log('⏰ Adding reminders...')

  const reminders = []

  if (allProps && allProps.length > 0) {
    // Equipment maintenance reminders
    reminders.push(
      {
        id: uuid('99999999', 1),
        organization_id: ORG_ID,
        property_id: allProps[0]?.id,
        reminder_type: 'maintenance',
        title: 'HVAC Filter Change Due',
        description: 'Replace all HVAC filters. Main unit: 20x25x4, Guest unit: 16x25x1',
        due_date: dateOffset(30),
        reminder_date: dateOffset(23),
        is_recurring: true,
        recurrence_rule: 'FREQ=MONTHLY;INTERVAL=3',
        notify_staff: true,
        status: 'pending'
      },
      {
        id: uuid('99999999', 2),
        organization_id: ORG_ID,
        property_id: allProps[1]?.id,
        reminder_type: 'maintenance',
        title: 'Generator Service Due',
        description: 'Annual generator maintenance. Oil change, filters, spark plugs.',
        due_date: dateOffset(45),
        reminder_date: dateOffset(30),
        is_recurring: true,
        recurrence_rule: 'FREQ=YEARLY',
        notify_staff: true,
        notify_client: true,
        status: 'pending'
      },
      {
        id: uuid('99999999', 3),
        organization_id: ORG_ID,
        property_id: allProps[2]?.id,
        reminder_type: 'maintenance',
        title: 'Elevator Inspection Due',
        description: 'Annual state-required elevator inspection and certification.',
        due_date: dateOffset(60),
        reminder_date: dateOffset(45),
        is_recurring: true,
        recurrence_rule: 'FREQ=YEARLY',
        notify_staff: true,
        notify_client: true,
        status: 'pending'
      }
    )

    // Warranty expiration reminders
    reminders.push(
      {
        id: uuid('99999999', 4),
        organization_id: ORG_ID,
        property_id: allProps[0]?.id,
        reminder_type: 'warranty',
        title: 'Water Heater Warranty EXPIRED',
        description: 'Rheem water heater warranty expired March 2024. Budget for replacement.',
        due_date: dateOffset(-300),
        reminder_date: dateOffset(-330),
        notify_client: true,
        status: 'overdue'
      },
      {
        id: uuid('99999999', 5),
        organization_id: ORG_ID,
        property_id: allProps[1]?.id,
        reminder_type: 'warranty',
        title: 'HVAC Warranty Expiring Soon',
        description: 'Trane HVAC warranty expires August 2025. Consider extended warranty.',
        due_date: '2025-08-20',
        reminder_date: '2025-06-20',
        notify_client: true,
        status: 'pending'
      }
    )

    // Insurance/license reminders
    reminders.push(
      {
        id: uuid('99999999', 6),
        organization_id: ORG_ID,
        reminder_type: 'vendor',
        title: 'Vendor Insurance Renewal - Pro Plumbing',
        description: 'Pro Plumbing Solutions insurance expires Sept 30. Request updated COI.',
        due_date: '2025-09-30',
        reminder_date: '2025-09-01',
        notify_staff: true,
        status: 'pending'
      },
      {
        id: uuid('99999999', 7),
        organization_id: ORG_ID,
        reminder_type: 'vendor',
        title: 'Vendor Insurance Renewal - Gulf Coast Electric',
        description: 'Gulf Coast Electric insurance expires April 30. Request updated COI.',
        due_date: '2025-04-30',
        reminder_date: '2025-04-01',
        notify_staff: true,
        status: 'pending'
      }
    )

    // Seasonal reminders
    reminders.push(
      {
        id: uuid('99999999', 8),
        organization_id: ORG_ID,
        reminder_type: 'seasonal',
        title: 'Hurricane Season Prep - All Properties',
        description: 'Review all hurricane shutters, generators, and storm prep supplies.',
        due_date: '2025-06-01',
        reminder_date: '2025-05-01',
        is_recurring: true,
        recurrence_rule: 'FREQ=YEARLY;BYMONTH=5;BYMONTHDAY=1',
        notify_staff: true,
        status: 'pending'
      },
      {
        id: uuid('99999999', 9),
        organization_id: ORG_ID,
        reminder_type: 'seasonal',
        title: 'Snowbird Season Start',
        description: 'Begin pre-arrival inspections for returning seasonal residents.',
        due_date: '2025-10-15',
        reminder_date: '2025-10-01',
        is_recurring: true,
        recurrence_rule: 'FREQ=YEARLY;BYMONTH=10;BYMONTHDAY=1',
        notify_staff: true,
        status: 'pending'
      }
    )

    // Client-specific reminders
    reminders.push(
      {
        id: uuid('99999999', 10),
        organization_id: ORG_ID,
        property_id: allProps[0]?.id,
        reminder_type: 'client',
        title: 'Thompson Arrival - Prep Property',
        description: 'Owners arriving Jan 25. Run full pre-arrival checklist.',
        due_date: dateOffset(5),
        reminder_date: dateOffset(3),
        notify_staff: true,
        status: 'pending'
      },
      {
        id: uuid('99999999', 11),
        organization_id: ORG_ID,
        property_id: allProps[3]?.id,
        reminder_type: 'client',
        title: 'VIP Client Anniversary',
        description: '5-year client anniversary coming up. Send appreciation gift.',
        due_date: dateOffset(20),
        reminder_date: dateOffset(15),
        notify_staff: true,
        status: 'pending'
      }
    )

    // Completed reminders (for history)
    reminders.push(
      {
        id: uuid('99999999', 12),
        organization_id: ORG_ID,
        property_id: allProps[0]?.id,
        reminder_type: 'maintenance',
        title: 'Pool Filter Cleaning',
        description: 'Clean pool filter cartridges.',
        due_date: dateOffset(-14),
        reminder_date: dateOffset(-21),
        status: 'completed',
        completed_at: dateOffset(-14) + 'T10:00:00Z'
      },
      {
        id: uuid('99999999', 13),
        organization_id: ORG_ID,
        property_id: allProps[1]?.id,
        reminder_type: 'maintenance',
        title: 'A/C Coil Cleaning',
        description: 'Annual AC coil cleaning completed.',
        due_date: dateOffset(-10),
        reminder_date: dateOffset(-17),
        status: 'completed',
        completed_at: dateOffset(-10) + 'T14:00:00Z'
      }
    )

    // Snoozed reminder
    reminders.push({
      id: uuid('99999999', 14),
      organization_id: ORG_ID,
      property_id: allProps[2]?.id,
      reminder_type: 'maintenance',
      title: 'Solar Panel Cleaning',
      description: 'Annual solar panel cleaning for optimal efficiency.',
      due_date: dateOffset(-5),
      reminder_date: dateOffset(-12),
      snoozed_until: dateOffset(30) + 'T09:00:00Z',
      status: 'snoozed'
    })
  }

  if (reminders.length > 0) {
    const { error: remError } = await supabase.from('reminders').upsert(reminders, { onConflict: 'id' })
    console.log(remError ? `  ❌ ${remError.message}` : `  ✓ ${reminders.length} reminders added`)
  }

  // Get counts
  const { count: clientCount } = await supabase.from('clients').select('*', { count: 'exact', head: true })
  const { count: propCount } = await supabase.from('properties').select('*', { count: 'exact', head: true })
  const { count: vendorCount } = await supabase.from('vendors').select('*', { count: 'exact', head: true })
  const { count: equipCount } = await supabase.from('equipment').select('*', { count: 'exact', head: true })
  const { count: inspCount } = await supabase.from('inspections').select('*', { count: 'exact', head: true })
  const { count: woCount } = await supabase.from('work_orders').select('*', { count: 'exact', head: true })
  const { count: invCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true })
  const { count: calCount } = await supabase.from('calendar_events').select('*', { count: 'exact', head: true })
  const { count: remCount } = await supabase.from('reminders').select('*', { count: 'exact', head: true })

  console.log('\n' + '='.repeat(50))
  console.log('✅ DEMO DATA COMPLETE!')
  console.log('='.repeat(50))
  console.log(`  👥 Clients:        ${clientCount}`)
  console.log(`  🏠 Properties:     ${propCount}`)
  console.log(`  🔧 Vendors:        ${vendorCount}`)
  console.log(`  ⚙️  Equipment:      ${equipCount}`)
  console.log(`  📋 Inspections:    ${inspCount}`)
  console.log(`  🔨 Work Orders:    ${woCount}`)
  console.log(`  💰 Invoices:       ${invCount}`)
  console.log(`  📅 Calendar:       ${calCount}`)
  console.log(`  ⏰ Reminders:      ${remCount}`)
  console.log('='.repeat(50))
  console.log('\n🌐 View your app:')
  console.log('   Local: http://localhost:5178/')
  console.log('   Prod:  https://admin-snowy-three.vercel.app/')
}

seed().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
