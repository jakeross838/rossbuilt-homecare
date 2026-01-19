/**
 * Seed Demo Data Script
 *
 * Run this script to populate your Supabase database with demo data.
 *
 * Usage:
 *   1. Get your service role key from Supabase Dashboard > Project Settings > API
 *   2. Run: SUPABASE_SERVICE_ROLE_KEY=your_key_here node scripts/seed-demo-data.js
 *
 * Or set the key in your .env.local file and run:
 *   node scripts/seed-demo-data.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
config({ path: '.env.local' });
config({ path: 'apps/admin/.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qzbmnbinhxzkcwfjnmtb.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey || serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.error('\n❌ Error: SUPABASE_SERVICE_ROLE_KEY is required');
  console.log('\nTo get your service role key:');
  console.log('1. Go to https://supabase.com/dashboard/project/qzbmnbinhxzkcwfjnmtb/settings/api');
  console.log('2. Copy the "service_role" key (not the anon key)');
  console.log('3. Run: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/seed-demo-data.js');
  console.log('\nOr add it to your .env.local file:\n  SUPABASE_SERVICE_ROLE_KEY=your_key_here\n');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedDemoData() {
  console.log('\n🌱 Seeding demo data to Supabase...\n');

  try {
    // Read the migration SQL file
    const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '023_demo_data.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements (rough split, handles most cases)
    const statements = sql
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments-only statements
      if (statement.split('\n').every(line => line.trim().startsWith('--') || line.trim() === '')) {
        continue;
      }

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

        if (error) {
          // Try direct query approach
          const { error: queryError } = await supabase.from('_exec').select().limit(0);

          if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
            skipCount++;
            process.stdout.write('⏭️ ');
          } else {
            throw error;
          }
        } else {
          successCount++;
          process.stdout.write('✅ ');
        }
      } catch (err) {
        if (err.message?.includes('duplicate') || err.message?.includes('already exists') || err.message?.includes('violates unique constraint')) {
          skipCount++;
          process.stdout.write('⏭️ ');
        } else {
          errorCount++;
          process.stdout.write('❌ ');
          console.log(`\n  Error on statement ${i + 1}: ${err.message}`);
        }
      }

      // Progress indicator every 10 statements
      if ((i + 1) % 20 === 0) {
        console.log(` [${i + 1}/${statements.length}]`);
      }
    }

    console.log('\n\n📊 Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⏭️  Skipped (already exists): ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 Demo data seeded successfully!\n');
      console.log('You can now view the data in your app at http://localhost:5174\n');
    } else {
      console.log('\n⚠️  Some statements failed. You may need to run the SQL manually.\n');
    }

  } catch (error) {
    console.error('\n❌ Failed to seed demo data:', error.message);
    console.log('\n💡 Alternative: Run the SQL manually in Supabase Dashboard');
    console.log('   1. Go to https://supabase.com/dashboard/project/qzbmnbinhxzkcwfjnmtb/sql');
    console.log('   2. Copy contents of supabase/migrations/023_demo_data.sql');
    console.log('   3. Paste and run in the SQL Editor\n');
    process.exit(1);
  }
}

// Alternative approach: Insert data using Supabase client directly
async function seedWithClient() {
  console.log('\n🌱 Seeding demo data using Supabase client...\n');

  const orgId = '00000000-0000-0000-0000-000000000001';

  try {
    // 1. Seed Users
    console.log('👤 Creating demo users...');
    const { error: usersError } = await supabase.from('users').upsert([
      { id: '11111111-1111-1111-1111-111111111111', email: 'demo@rossbuilt.com', full_name: 'Demo Admin', role: 'admin', organization_id: orgId, is_active: true },
      { id: '11111111-1111-1111-1111-111111111112', email: 'inspector@rossbuilt.com', full_name: 'John Inspector', role: 'inspector', organization_id: orgId, is_active: true }
    ], { onConflict: 'id' });
    if (usersError && !usersError.message.includes('duplicate')) console.log('  Users error:', usersError.message);
    else console.log('  ✅ Users created');

    // 2. Seed Clients
    console.log('👥 Creating clients...');
    const { error: clientsError } = await supabase.from('clients').upsert([
      {
        id: '22222222-2222-2222-2222-222222222201',
        organization_id: orgId,
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
        organization_id: orgId,
        name: 'Robert Martinez',
        email: 'rmartinez@business.com',
        phone: '941-555-2345',
        billing_address: { line1: '789 Palm Ave', line2: 'Suite 100', city: 'Sarasota', state: 'FL', zip: '34236' },
        notes: 'Business owner with multiple properties. Prefers detailed reports.',
        is_active: true
      },
      {
        id: '22222222-2222-2222-2222-222222222203',
        organization_id: orgId,
        name: 'Jennifer & David Wilson',
        email: 'jwilson@gmail.com',
        phone: '941-555-3456',
        secondary_email: 'dwilson@gmail.com',
        secondary_phone: '941-555-3457',
        billing_address: { line1: '123 Beach Blvd', city: 'Longboat Key', state: 'FL', zip: '34228' },
        notes: 'New clients as of 2024. Very responsive.',
        is_active: true
      }
    ], { onConflict: 'id' });
    if (clientsError && !clientsError.message.includes('duplicate')) console.log('  Clients error:', clientsError.message);
    else console.log('  ✅ Clients created');

    // 3. Seed Properties
    console.log('🏠 Creating properties...');
    const { error: propertiesError } = await supabase.from('properties').upsert([
      {
        id: '33333333-3333-3333-3333-333333333301',
        organization_id: orgId,
        client_id: '22222222-2222-2222-2222-222222222201',
        name: 'Thompson Residence',
        address: { line1: '1234 Sunset Drive', city: 'Bradenton', state: 'FL', zip: '34209' },
        features: { pool: true, spa: true, boat_dock: false, elevator: false, solar: true, smart_home: true, generator: true, fire_sprinkler: true, wine_cellar: false, outdoor_kitchen: true },
        access_info: { gate_code: '1234', lockbox_code: '5678', alarm_code: '9012', alarm_company: 'ADT', special_instructions: 'Dogs are friendly. Key under blue pot by side door.' },
        notes: 'Beautiful waterfront property with extensive pool area. 4BR/3BA, 3500 sqft. Built 2018.',
        is_active: true
      },
      {
        id: '33333333-3333-3333-3333-333333333302',
        organization_id: orgId,
        client_id: '22222222-2222-2222-2222-222222222202',
        name: 'Martinez Beach House',
        address: { line1: '567 Gulf Shore Blvd', city: 'Sarasota', state: 'FL', zip: '34236' },
        features: { pool: true, spa: false, boat_dock: true, elevator: true, solar: false, smart_home: true, generator: true, fire_sprinkler: true, wine_cellar: true, outdoor_kitchen: true },
        access_info: { gate_code: '4567', alarm_code: '3456', alarm_company: 'Vivint', special_instructions: 'Call ahead before arriving. Housekeeper on-site Mon/Thu.' },
        notes: 'Luxury beachfront property. 5BR/5BA, 5200 sqft. Built 2015. Full elevator access.',
        is_active: true
      },
      {
        id: '33333333-3333-3333-3333-333333333303',
        organization_id: orgId,
        client_id: '22222222-2222-2222-2222-222222222203',
        name: 'Wilson Family Home',
        address: { line1: '890 Bay View Lane', city: 'Longboat Key', state: 'FL', zip: '34228' },
        features: { pool: false, spa: true, boat_dock: false, elevator: false, solar: true, smart_home: false, generator: false, fire_sprinkler: false, wine_cellar: false, outdoor_kitchen: false },
        access_info: { lockbox_code: '2468', special_instructions: 'No alarm system. Use lockbox on front door.' },
        notes: 'Cozy family home. 3BR/2BA, 2200 sqft. Built 2010. Recently updated kitchen.',
        is_active: true
      }
    ], { onConflict: 'id' });
    if (propertiesError && !propertiesError.message.includes('duplicate')) console.log('  Properties error:', propertiesError.message);
    else console.log('  ✅ Properties created');

    // 4. Seed Vendors
    console.log('🔧 Creating vendors...');
    const { error: vendorsError } = await supabase.from('vendors').upsert([
      {
        id: '55555555-5555-5555-5555-555555555501',
        organization_id: orgId,
        company_name: 'Cool Breeze HVAC',
        contact_name: 'Mike Johnson',
        email: 'mike@coolbreezehvac.com',
        phone: '941-555-4001',
        trade_categories: ['hvac', 'air_quality'],
        service_area: ['Bradenton', 'Sarasota', 'Longboat Key'],
        license_number: 'CAC-1812345',
        insurance_expiration: '2025-06-30',
        rating: 4.8,
        notes: 'Excellent response time. Specializes in high-end systems.',
        is_active: true,
        is_preferred: true
      },
      {
        id: '55555555-5555-5555-5555-555555555502',
        organization_id: orgId,
        company_name: 'Crystal Clear Pools',
        contact_name: 'Lisa Chen',
        email: 'lisa@crystalclearpools.com',
        phone: '941-555-4002',
        trade_categories: ['pool', 'spa'],
        service_area: ['Bradenton', 'Sarasota', 'Longboat Key', 'Anna Maria'],
        license_number: 'CPC-1823456',
        insurance_expiration: '2025-08-15',
        rating: 4.9,
        notes: 'Premium pool service. Weekly maintenance available.',
        is_active: true,
        is_preferred: true
      },
      {
        id: '55555555-5555-5555-5555-555555555503',
        organization_id: orgId,
        company_name: 'Gulf Coast Electric',
        contact_name: 'James Brown',
        email: 'james@gulfcoastelectric.com',
        phone: '941-555-4003',
        trade_categories: ['electrical', 'generator'],
        service_area: ['Bradenton', 'Sarasota'],
        license_number: 'EC-1834567',
        insurance_expiration: '2025-04-30',
        rating: 4.5,
        notes: 'Licensed master electrician. Generator specialist.',
        is_active: true,
        is_preferred: false
      },
      {
        id: '55555555-5555-5555-5555-555555555504',
        organization_id: orgId,
        company_name: 'Pro Plumbing Solutions',
        contact_name: 'David Williams',
        email: 'david@proplumbing.com',
        phone: '941-555-4004',
        trade_categories: ['plumbing', 'water_heater'],
        service_area: ['Bradenton', 'Sarasota', 'Longboat Key'],
        license_number: 'CFC-1845678',
        insurance_expiration: '2025-09-30',
        rating: 4.7,
        notes: '24/7 emergency service available.',
        is_active: true,
        is_preferred: true
      },
      {
        id: '55555555-5555-5555-5555-555555555505',
        organization_id: orgId,
        company_name: 'Sunshine Roofing',
        contact_name: 'Carlos Rodriguez',
        email: 'carlos@sunshineroofing.com',
        phone: '941-555-4005',
        trade_categories: ['roofing', 'gutters'],
        service_area: ['Bradenton', 'Sarasota', 'Longboat Key', 'Palmetto'],
        license_number: 'CCC-1856789',
        insurance_expiration: '2025-12-31',
        rating: 4.6,
        notes: 'Tile and shingle specialists. Free estimates.',
        is_active: true,
        is_preferred: false
      }
    ], { onConflict: 'id' });
    if (vendorsError && !vendorsError.message.includes('duplicate')) console.log('  Vendors error:', vendorsError.message);
    else console.log('  ✅ Vendors created');

    // 5. Seed Work Orders
    console.log('📋 Creating work orders...');
    const { error: workOrdersError } = await supabase.from('work_orders').upsert([
      {
        id: '88888888-8888-8888-8888-888888888801',
        organization_id: orgId,
        property_id: '33333333-3333-3333-3333-333333333301',
        vendor_id: '55555555-5555-5555-5555-555555555501',
        title: 'HVAC Annual Maintenance',
        description: 'Perform annual HVAC maintenance and filter replacement.',
        category: 'hvac',
        priority: 'medium',
        status: 'completed',
        estimated_cost: 250.00,
        scheduled_date: '2024-11-20',
        completed_date: '2024-11-20',
        completion_notes: 'Completed maintenance. Replaced filter, cleaned coils. System operating at peak efficiency.'
      },
      {
        id: '88888888-8888-8888-8888-888888888802',
        organization_id: orgId,
        property_id: '33333333-3333-3333-3333-333333333302',
        vendor_id: '55555555-5555-5555-5555-555555555501',
        title: 'HVAC Filter Replacement - Urgent',
        description: 'Replace all HVAC filters. Filters found very dirty during inspection.',
        category: 'hvac',
        priority: 'high',
        status: 'in_progress',
        estimated_cost: 150.00,
        scheduled_date: '2025-01-18'
      },
      {
        id: '88888888-8888-8888-8888-888888888803',
        organization_id: orgId,
        property_id: '33333333-3333-3333-3333-333333333301',
        vendor_id: '55555555-5555-5555-5555-555555555502',
        title: 'Pool Service - Monthly',
        description: 'Monthly pool service: chemical balance, cleaning, equipment check.',
        category: 'pool',
        priority: 'medium',
        status: 'scheduled',
        estimated_cost: 175.00,
        scheduled_date: '2025-01-25'
      },
      {
        id: '88888888-8888-8888-8888-888888888804',
        organization_id: orgId,
        property_id: '33333333-3333-3333-3333-333333333303',
        vendor_id: '55555555-5555-5555-5555-555555555504',
        title: 'Water Heater Inspection',
        description: 'Annual water heater inspection and maintenance.',
        category: 'plumbing',
        priority: 'low',
        status: 'pending',
        estimated_cost: 125.00
      },
      {
        id: '88888888-8888-8888-8888-888888888805',
        organization_id: orgId,
        property_id: '33333333-3333-3333-3333-333333333302',
        vendor_id: '55555555-5555-5555-5555-555555555503',
        title: 'Generator Annual Service',
        description: 'Annual generator maintenance and load test.',
        category: 'electrical',
        priority: 'medium',
        status: 'vendor_assigned',
        estimated_cost: 350.00
      }
    ], { onConflict: 'id' });
    if (workOrdersError && !workOrdersError.message.includes('duplicate')) console.log('  Work orders error:', workOrdersError.message);
    else console.log('  ✅ Work orders created');

    // 6. Seed Invoices
    console.log('💰 Creating invoices...');
    const { error: invoicesError } = await supabase.from('invoices').upsert([
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001',
        organization_id: orgId,
        client_id: '22222222-2222-2222-2222-222222222201',
        property_id: '33333333-3333-3333-3333-333333333301',
        invoice_number: 'INV-2024-001',
        status: 'paid',
        issue_date: '2024-11-16',
        due_date: '2024-12-16',
        subtotal: 350.00,
        tax_amount: 24.50,
        total: 374.50,
        notes: 'Q4 2024 Comprehensive Inspection'
      },
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa002',
        organization_id: orgId,
        client_id: '22222222-2222-2222-2222-222222222202',
        property_id: '33333333-3333-3333-3333-333333333302',
        invoice_number: 'INV-2025-001',
        status: 'sent',
        issue_date: '2025-01-11',
        due_date: '2025-02-10',
        subtotal: 450.00,
        tax_amount: 31.50,
        total: 481.50,
        notes: 'January 2025 Monthly Inspection'
      },
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa003',
        organization_id: orgId,
        client_id: '22222222-2222-2222-2222-222222222203',
        property_id: '33333333-3333-3333-3333-333333333303',
        invoice_number: 'INV-2025-002',
        status: 'draft',
        issue_date: '2025-01-19',
        due_date: '2025-02-18',
        subtotal: 200.00,
        tax_amount: 14.00,
        total: 214.00,
        notes: 'Semi-annual inspection fee'
      },
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa004',
        organization_id: orgId,
        client_id: '22222222-2222-2222-2222-222222222202',
        property_id: '33333333-3333-3333-3333-333333333302',
        invoice_number: 'INV-2024-002',
        status: 'overdue',
        issue_date: '2024-10-15',
        due_date: '2024-11-14',
        subtotal: 450.00,
        tax_amount: 31.50,
        total: 481.50,
        notes: 'October 2024 Monthly Inspection - OVERDUE'
      }
    ], { onConflict: 'id' });
    if (invoicesError && !invoicesError.message.includes('duplicate')) console.log('  Invoices error:', invoicesError.message);
    else console.log('  ✅ Invoices created');

    // 7. Seed Calendar Events
    console.log('📅 Creating calendar events...');
    const today = new Date().toISOString().split('T')[0];
    const { error: calendarError } = await supabase.from('calendar_events').upsert([
      {
        id: 'dddddddd-dddd-dddd-dddd-ddddddddd001',
        organization_id: orgId,
        title: 'Pool Inspection - Thompson',
        description: 'Quarterly pool and spa inspection',
        event_type: 'inspection',
        start_date: '2025-02-15',
        start_time: '09:00',
        end_date: '2025-02-15',
        end_time: '11:00',
        all_day: false,
        property_id: '33333333-3333-3333-3333-333333333301',
        location: '1234 Sunset Drive, Bradenton, FL',
        status: 'scheduled'
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-ddddddddd002',
        organization_id: orgId,
        title: 'Exterior Inspection - Wilson',
        description: 'Semi-annual exterior inspection',
        event_type: 'inspection',
        start_date: '2025-02-01',
        start_time: '11:00',
        end_date: '2025-02-01',
        end_time: '12:30',
        all_day: false,
        property_id: '33333333-3333-3333-3333-333333333303',
        location: '890 Bay View Lane, Longboat Key, FL',
        status: 'scheduled'
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-ddddddddd003',
        organization_id: orgId,
        title: 'Pool Service - Thompson',
        description: 'Monthly pool service',
        event_type: 'work_order',
        start_date: '2025-01-25',
        start_time: '08:00',
        end_date: '2025-01-25',
        end_time: '10:00',
        all_day: false,
        property_id: '33333333-3333-3333-3333-333333333301',
        work_order_id: '88888888-8888-8888-8888-888888888803',
        location: '1234 Sunset Drive, Bradenton, FL',
        status: 'scheduled'
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-ddddddddd004',
        organization_id: orgId,
        title: 'Review Quarterly Reports',
        description: 'Review and send Q1 inspection reports to clients',
        event_type: 'reminder',
        start_date: '2025-01-31',
        all_day: true,
        location: 'Office',
        status: 'scheduled'
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-ddddddddd005',
        organization_id: orgId,
        title: 'HVAC Inspection - Martinez',
        description: 'HVAC system inspection',
        event_type: 'inspection',
        start_date: today,
        start_time: '14:00',
        end_date: today,
        end_time: '16:00',
        all_day: false,
        property_id: '33333333-3333-3333-3333-333333333302',
        location: '567 Gulf Shore Blvd, Sarasota, FL',
        status: 'scheduled'
      }
    ], { onConflict: 'id' });
    if (calendarError && !calendarError.message.includes('duplicate')) console.log('  Calendar error:', calendarError.message);
    else console.log('  ✅ Calendar events created');

    // 8. Seed Activity Log
    console.log('📝 Creating activity log...');
    const { error: activityError } = await supabase.from('activity_log').upsert([
      {
        id: 'ffffffff-ffff-ffff-ffff-fffffffffff01',
        organization_id: orgId,
        user_id: '11111111-1111-1111-1111-111111111111',
        action: 'created',
        entity_type: 'work_order',
        entity_id: '88888888-8888-8888-8888-888888888802',
        details: { title: 'HVAC Filter Replacement created for Martinez Beach House' }
      },
      {
        id: 'ffffffff-ffff-ffff-ffff-fffffffffff02',
        organization_id: orgId,
        user_id: '11111111-1111-1111-1111-111111111111',
        action: 'sent',
        entity_type: 'invoice',
        entity_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa002',
        details: { invoice_number: 'INV-2025-001', client: 'Robert Martinez', amount: 481.50 }
      },
      {
        id: 'ffffffff-ffff-ffff-ffff-fffffffffff03',
        organization_id: orgId,
        user_id: '11111111-1111-1111-1111-111111111111',
        action: 'payment_received',
        entity_type: 'invoice',
        entity_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001',
        details: { invoice_number: 'INV-2024-001', client: 'Michael & Sarah Thompson', amount: 374.50 }
      }
    ], { onConflict: 'id' });
    if (activityError && !activityError.message.includes('duplicate')) console.log('  Activity error:', activityError.message);
    else console.log('  ✅ Activity log created');

    console.log('\n🎉 Demo data seeded successfully!\n');
    console.log('View your app at http://localhost:5174\n');

  } catch (error) {
    console.error('\n❌ Error seeding data:', error.message);
    process.exit(1);
  }
}

// Run the seed
seedWithClient();
