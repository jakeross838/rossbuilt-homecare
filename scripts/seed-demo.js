// Seed demo data using Supabase service role key
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qzbmnbinhxzkcwfjnmtb.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Ym1uYmluaHh6a2N3ZmpubXRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2ODc5NCwiZXhwIjoyMDgxNzQ0Nzk0fQ.TIlTWiHF9l9quHmezgNPfhM4CzxxwpqSfodt6uZreh8'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const ORG_ID = '00000000-0000-0000-0000-000000000001'

async function seed() {
  console.log('Seeding demo data...\n')

  // Demo Clients
  const clients = [
    {
      id: '22222222-2222-2222-2222-222222222201',
      organization_id: ORG_ID,
      name: 'Michael & Sarah Thompson',
      email: 'mthompson@email.com',
      phone: '941-555-1234',
      secondary_email: 'sthompson@email.com',
      secondary_phone: '941-555-1235',
      billing_address: { line1: '456 Oak Lane', city: 'Bradenton', state: 'FL', zip: '34209' },
      notes: 'Preferred contact method: email. Snowbirds - in FL from Oct to April.',
      is_active: true
    },
    {
      id: '22222222-2222-2222-2222-222222222202',
      organization_id: ORG_ID,
      name: 'Robert Martinez',
      email: 'rmartinez@business.com',
      phone: '941-555-2345',
      billing_address: { line1: '789 Palm Ave', line2: 'Suite 100', city: 'Sarasota', state: 'FL', zip: '34236' },
      notes: 'Business owner with multiple properties. Prefers detailed reports.',
      is_active: true
    },
    {
      id: '22222222-2222-2222-2222-222222222203',
      organization_id: ORG_ID,
      name: 'Jennifer & David Wilson',
      email: 'jwilson@gmail.com',
      phone: '941-555-3456',
      secondary_email: 'dwilson@gmail.com',
      secondary_phone: '941-555-3457',
      billing_address: { line1: '123 Beach Blvd', city: 'Longboat Key', state: 'FL', zip: '34228' },
      notes: 'New clients as of 2024. Very responsive.',
      is_active: true
    }
  ]

  // Demo Properties
  const properties = [
    {
      id: '33333333-3333-3333-3333-333333333301',
      organization_id: ORG_ID,
      client_id: '22222222-2222-2222-2222-222222222201',
      name: 'Thompson Residence',
      address: { line1: '1234 Sunset Drive', city: 'Bradenton', state: 'FL', zip: '34209' },
      features: { pool: true, spa: true, generator: true, smart_home: true, solar: true, fire_sprinkler: true, outdoor_kitchen: true },
      access_info: { gate_code: '1234', lockbox_code: '5678', alarm_code: '9012', wifi_name: 'ThompsonHome', wifi_password: 'WelcomeHome2024' },
      notes: 'Beautiful waterfront property with extensive pool area. 4BR/3BA, 3500 sqft.',
      is_active: true
    },
    {
      id: '33333333-3333-3333-3333-333333333302',
      organization_id: ORG_ID,
      client_id: '22222222-2222-2222-2222-222222222202',
      name: 'Martinez Beach House',
      address: { line1: '567 Gulf Shore Blvd', city: 'Sarasota', state: 'FL', zip: '34236' },
      features: { pool: true, boat_dock: true, elevator: true, generator: true, smart_home: true, fire_sprinkler: true, wine_cellar: true, outdoor_kitchen: true },
      access_info: { gate_code: '4567', alarm_code: '3456' },
      notes: 'Luxury beachfront property. 5BR/5BA, 5200 sqft. Full elevator access.',
      is_active: true
    },
    {
      id: '33333333-3333-3333-3333-333333333303',
      organization_id: ORG_ID,
      client_id: '22222222-2222-2222-2222-222222222203',
      name: 'Wilson Family Home',
      address: { line1: '890 Bay View Lane', city: 'Longboat Key', state: 'FL', zip: '34228' },
      features: { spa: true, solar: true },
      access_info: { lockbox_code: '2468' },
      notes: 'Cozy family home. 3BR/2BA, 2200 sqft. Recently updated kitchen.',
      is_active: true
    }
  ]

  // Demo Vendors
  const vendors = [
    {
      id: '55555555-5555-5555-5555-555555555501',
      organization_id: ORG_ID,
      company_name: 'Cool Breeze HVAC',
      contact_name: 'Mike Johnson',
      email: 'mike@coolbreezehvac.com',
      phone: '941-555-4001',
      trade_categories: ['hvac', 'air_quality'],
      service_area: ['Bradenton', 'Sarasota', 'Longboat Key'],
      license_number: 'CAC-1812345',
      rating: 4.8,
      notes: 'Excellent response time. Specializes in high-end systems.',
      is_active: true,
      is_preferred: true
    },
    {
      id: '55555555-5555-5555-5555-555555555502',
      organization_id: ORG_ID,
      company_name: 'Crystal Clear Pools',
      contact_name: 'Lisa Chen',
      email: 'lisa@crystalclearpools.com',
      phone: '941-555-4002',
      trade_categories: ['pool', 'spa'],
      service_area: ['Bradenton', 'Sarasota', 'Longboat Key', 'Anna Maria'],
      license_number: 'CPC-1823456',
      rating: 4.9,
      notes: 'Premium pool service. Weekly maintenance available.',
      is_active: true,
      is_preferred: true
    },
    {
      id: '55555555-5555-5555-5555-555555555503',
      organization_id: ORG_ID,
      company_name: 'Gulf Coast Electric',
      contact_name: 'James Brown',
      email: 'james@gulfcoastelectric.com',
      phone: '941-555-4003',
      trade_categories: ['electrical', 'generator'],
      service_area: ['Bradenton', 'Sarasota'],
      license_number: 'EC-1834567',
      rating: 4.5,
      notes: 'Licensed master electrician. Generator specialist.',
      is_active: true,
      is_preferred: false
    },
    {
      id: '55555555-5555-5555-5555-555555555504',
      organization_id: ORG_ID,
      company_name: 'Pro Plumbing Solutions',
      contact_name: 'David Williams',
      email: 'david@proplumbing.com',
      phone: '941-555-4004',
      trade_categories: ['plumbing', 'water_heater'],
      service_area: ['Bradenton', 'Sarasota', 'Longboat Key'],
      license_number: 'CFC-1845678',
      rating: 4.7,
      notes: '24/7 emergency service available.',
      is_active: true,
      is_preferred: true
    },
    {
      id: '55555555-5555-5555-5555-555555555505',
      organization_id: ORG_ID,
      company_name: 'Sunshine Roofing',
      contact_name: 'Carlos Rodriguez',
      email: 'carlos@sunshineroofing.com',
      phone: '941-555-4005',
      trade_categories: ['roofing', 'gutters'],
      service_area: ['Bradenton', 'Sarasota', 'Longboat Key', 'Palmetto'],
      license_number: 'CCC-1856789',
      rating: 4.6,
      notes: 'Tile and shingle specialists. Free estimates.',
      is_active: true,
      is_preferred: false
    }
  ]

  // Demo Equipment
  const equipment = [
    {
      id: '44444444-4444-4444-4444-444444444401',
      organization_id: ORG_ID,
      property_id: '33333333-3333-3333-3333-333333333301',
      name: 'Main Floor HVAC',
      category: 'hvac',
      manufacturer: 'Carrier',
      model_number: 'CA16NA036',
      serial_number: 'SN-2018-CAR-001',
      install_date: '2018-03-15',
      warranty_expiration: '2028-03-15',
      location: 'Garage mechanical room',
      specifications: { capacity: '3 ton', seer: 16, type: 'split system' },
      notes: '10-year warranty. Annual service recommended.'
    },
    {
      id: '44444444-4444-4444-4444-444444444402',
      organization_id: ORG_ID,
      property_id: '33333333-3333-3333-3333-333333333301',
      name: 'Pool Equipment - Pump',
      category: 'pool_equipment',
      manufacturer: 'Pentair',
      model_number: 'IntelliFlo VSF',
      serial_number: 'SN-2020-PEN-001',
      install_date: '2020-06-01',
      warranty_expiration: '2025-06-01',
      location: 'Pool equipment pad',
      specifications: { hp: '3', variable_speed: true },
      notes: 'Variable speed pump. Upgraded in 2020.'
    },
    {
      id: '44444444-4444-4444-4444-444444444403',
      organization_id: ORG_ID,
      property_id: '33333333-3333-3333-3333-333333333301',
      name: 'Water Heater',
      category: 'water_heater',
      manufacturer: 'Rheem',
      model_number: 'PROG50-38N RH67',
      serial_number: 'SN-2018-RHE-001',
      install_date: '2018-03-15',
      warranty_expiration: '2024-03-15',
      location: 'Garage',
      specifications: { capacity_gallons: 50, type: 'gas', energy_factor: 0.67 },
      notes: 'Warranty expired. Consider replacement soon.'
    },
    {
      id: '44444444-4444-4444-4444-444444444404',
      organization_id: ORG_ID,
      property_id: '33333333-3333-3333-3333-333333333302',
      name: 'HVAC Zone 1 - Main Living',
      category: 'hvac',
      manufacturer: 'Trane',
      model_number: 'XR15',
      serial_number: 'SN-2015-TRN-001',
      install_date: '2015-08-20',
      warranty_expiration: '2025-08-20',
      location: 'Attic mechanical room',
      specifications: { capacity: '4 ton', seer: 15, zones: 'Zone 1' },
      notes: 'Multi-zone system. Zone 1 covers main living areas.'
    },
    {
      id: '44444444-4444-4444-4444-444444444405',
      organization_id: ORG_ID,
      property_id: '33333333-3333-3333-3333-333333333302',
      name: 'Elevator',
      category: 'elevator',
      manufacturer: 'Savaria',
      model_number: 'Eclipse',
      serial_number: 'SN-2015-SAV-001',
      install_date: '2015-08-20',
      warranty_expiration: '2025-08-20',
      location: '3-story home elevator',
      specifications: { floors: 3, capacity_lbs: 750 },
      notes: 'Annual inspection required. Last inspected Jan 2024.'
    },
    {
      id: '44444444-4444-4444-4444-444444444406',
      organization_id: ORG_ID,
      property_id: '33333333-3333-3333-3333-333333333303',
      name: 'HVAC System',
      category: 'hvac',
      manufacturer: 'Lennox',
      model_number: 'XC21',
      serial_number: 'SN-2022-LEN-001',
      install_date: '2022-04-10',
      warranty_expiration: '2032-04-10',
      location: 'Utility closet',
      specifications: { capacity: '2.5 ton', seer: 21 },
      notes: 'New high-efficiency system installed 2022.'
    },
    {
      id: '44444444-4444-4444-4444-444444444407',
      organization_id: ORG_ID,
      property_id: '33333333-3333-3333-3333-333333333303',
      name: 'Spa/Hot Tub',
      category: 'pool_equipment',
      manufacturer: 'Hot Spring',
      model_number: 'Grandee',
      serial_number: 'SN-2023-HS-001',
      install_date: '2023-09-01',
      warranty_expiration: '2028-09-01',
      location: 'Back patio',
      specifications: { seats: 7, jets: 45 },
      notes: 'New spa installed Sept 2023. Monthly service contract.'
    }
  ]

  // Insert data
  console.log('Inserting clients...')
  const { error: clientError } = await supabase.from('clients').upsert(clients, { onConflict: 'id' })
  console.log(clientError ? `  Error: ${clientError.message}` : '  OK - 3 clients')

  console.log('Inserting properties...')
  const { error: propError } = await supabase.from('properties').upsert(properties, { onConflict: 'id' })
  console.log(propError ? `  Error: ${propError.message}` : '  OK - 3 properties')

  console.log('Inserting vendors...')
  const { error: vendorError } = await supabase.from('vendors').upsert(vendors, { onConflict: 'id' })
  console.log(vendorError ? `  Error: ${vendorError.message}` : '  OK - 5 vendors')

  console.log('Inserting equipment...')
  const { error: equipError } = await supabase.from('equipment').upsert(equipment, { onConflict: 'id' })
  console.log(equipError ? `  Error: ${equipError.message}` : '  OK - 7 equipment items')

  console.log('\n✓ Demo data seeded!')
  console.log('View your app at: http://localhost:5178/')
  console.log('Or production: https://admin-snowy-three.vercel.app/')
}

seed().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
