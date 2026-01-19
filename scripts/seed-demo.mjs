// Seed demo data directly using Supabase client
// Run with: node scripts/seed-demo.mjs

const SUPABASE_URL = 'https://qzbmnbinhxzkcwfjnmtb.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.log(`
=================================================
SUPABASE SERVICE ROLE KEY REQUIRED
=================================================

To run demo data, you need your service role key.

1. Go to: https://supabase.com/dashboard/project/qzbmnbinhxzkcwfjnmtb/settings/api
2. Copy the "service_role" key (NOT the anon key)
3. Run: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/seed-demo.mjs

Or paste the SQL directly in the Supabase SQL Editor:
https://supabase.com/dashboard/project/qzbmnbinhxzkcwfjnmtb/sql/new
=================================================
  `)
  process.exit(1)
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const ORG_ID = '00000000-0000-0000-0000-000000000001'

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
  }
]

async function seed() {
  console.log('Seeding demo data...\n')

  // Insert clients
  console.log('Inserting clients...')
  const { error: clientError } = await supabase.from('clients').upsert(clients, { onConflict: 'id' })
  if (clientError) console.log('  Clients:', clientError.message)
  else console.log('  Clients: OK')

  // Insert properties
  console.log('Inserting properties...')
  const { error: propError } = await supabase.from('properties').upsert(properties, { onConflict: 'id' })
  if (propError) console.log('  Properties:', propError.message)
  else console.log('  Properties: OK')

  // Insert vendors
  console.log('Inserting vendors...')
  const { error: vendorError } = await supabase.from('vendors').upsert(vendors, { onConflict: 'id' })
  if (vendorError) console.log('  Vendors:', vendorError.message)
  else console.log('  Vendors: OK')

  console.log('\nDone! Check your app at http://localhost:5178/')
}

seed().catch(console.error)
