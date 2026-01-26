/**
 * RLS Security Test Suite
 *
 * Verifies cross-tenant data isolation at the database level.
 * These tests ensure Client A cannot see Client B's data.
 */

import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

// Test configuration - uses test accounts created for security testing
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qzbmnbinhxzkcwfjnmtb.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''

// Test client credentials (created for testing purposes)
const CLIENT_A = {
  email: 'client-a-test@example.com',
  password: 'testpassword123',
}

const CLIENT_B = {
  email: 'client-b-test@example.com',
  password: 'testpassword123',
}

test.describe('Cross-Tenant RLS Security', () => {
  test.describe.configure({ mode: 'serial' })

  let clientASupabase: ReturnType<typeof createClient>
  let clientBSupabase: ReturnType<typeof createClient>
  let clientAId: string
  let clientBId: string

  test.beforeAll(async () => {
    // Create authenticated Supabase clients for each test user
    clientASupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    clientBSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Sign in as Client A
    const { data: authA, error: authErrorA } = await clientASupabase.auth.signInWithPassword({
      email: CLIENT_A.email,
      password: CLIENT_A.password,
    })
    if (authErrorA) {
      console.log('Client A auth skipped - test accounts not set up')
      test.skip()
    }

    // Sign in as Client B
    const { data: authB, error: authErrorB } = await clientBSupabase.auth.signInWithPassword({
      email: CLIENT_B.email,
      password: CLIENT_B.password,
    })
    if (authErrorB) {
      console.log('Client B auth skipped - test accounts not set up')
      test.skip()
    }

    // Get client IDs from the clients table
    const { data: clientA } = await clientASupabase
      .from('clients')
      .select('id')
      .single()
    clientAId = clientA?.id || ''

    const { data: clientB } = await clientBSupabase
      .from('clients')
      .select('id')
      .single()
    clientBId = clientB?.id || ''
  })

  test.afterAll(async () => {
    await clientASupabase?.auth.signOut()
    await clientBSupabase?.auth.signOut()
  })

  test('Client A can only see their own client record', async () => {
    const { data, error } = await clientASupabase
      .from('clients')
      .select('*')

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data?.[0]?.id).toBe(clientAId)
  })

  test('Client A cannot see Client B properties', async () => {
    // Get Client B's property ID first (as admin or from setup)
    const { data: clientBProperties } = await clientBSupabase
      .from('properties')
      .select('id')

    if (!clientBProperties?.length) {
      test.skip()
    }

    // Client A should not be able to query Client B's properties
    const { data, error } = await clientASupabase
      .from('properties')
      .select('*')
      .eq('client_id', clientBId)

    // Should return empty array, not Client B's properties
    expect(data).toHaveLength(0)
  })

  test('Client A cannot see Client B work orders', async () => {
    const { data, error } = await clientASupabase
      .from('work_orders')
      .select('*')

    // All returned work orders should belong to Client A
    expect(error).toBeNull()
    data?.forEach((wo) => {
      expect(wo.client_id).toBe(clientAId)
    })
  })

  test('Client A cannot see Client B inspections', async () => {
    // Get Client A's property IDs
    const { data: myProperties } = await clientASupabase
      .from('properties')
      .select('id')
    const myPropertyIds = myProperties?.map(p => p.id) || []

    // All inspections should be for Client A's properties
    const { data: inspections, error } = await clientASupabase
      .from('inspections')
      .select('*, properties!inner(client_id)')

    expect(error).toBeNull()
    inspections?.forEach((inspection) => {
      expect(myPropertyIds).toContain(inspection.property_id)
    })
  })

  test('Client A cannot see Client B invoices', async () => {
    const { data, error } = await clientASupabase
      .from('invoices')
      .select('*')

    expect(error).toBeNull()
    data?.forEach((invoice) => {
      expect(invoice.client_id).toBe(clientAId)
    })
  })

  test('Client A cannot see Client B programs', async () => {
    const { data, error } = await clientASupabase
      .from('programs')
      .select('*')

    expect(error).toBeNull()
    data?.forEach((program) => {
      expect(program.client_id).toBe(clientAId)
    })
  })

  test('Client A can update their own program', async () => {
    // Get Client A's program
    const { data: programs } = await clientASupabase
      .from('programs')
      .select('*')
      .limit(1)

    if (!programs?.length) {
      test.skip()
    }

    const programId = programs![0].id
    const originalAddonValue = programs![0].addon_digital_manual

    // Update the program
    const { data, error } = await clientASupabase
      .from('programs')
      .update({ addon_digital_manual: !originalAddonValue })
      .eq('id', programId)
      .select()
      .single()

    expect(error).toBeNull()
    expect(data?.addon_digital_manual).toBe(!originalAddonValue)

    // Revert the change
    await clientASupabase
      .from('programs')
      .update({ addon_digital_manual: originalAddonValue })
      .eq('id', programId)
  })

  test('Client A cannot update Client B program', async () => {
    // Get Client B's program ID
    const { data: clientBPrograms } = await clientBSupabase
      .from('programs')
      .select('id')
      .limit(1)

    if (!clientBPrograms?.length) {
      test.skip()
    }

    // Attempt to update Client B's program as Client A
    const { data, error } = await clientASupabase
      .from('programs')
      .update({ addon_digital_manual: true })
      .eq('id', clientBPrograms![0].id)
      .select()

    // Should fail or return no rows (RLS blocks it)
    expect(data).toHaveLength(0)
  })

  test('Client cannot change program ownership fields', async () => {
    // Get Client A's program
    const { data: programs } = await clientASupabase
      .from('programs')
      .select('*')
      .limit(1)

    if (!programs?.length) {
      test.skip()
    }

    const programId = programs![0].id

    // Attempt to change client_id (should fail)
    const { data, error } = await clientASupabase
      .from('programs')
      .update({ client_id: clientBId })
      .eq('id', programId)
      .select()

    // Should fail due to WITH CHECK constraint
    expect(data).toHaveLength(0)
  })
})

test.describe('RLS Performance', () => {
  test('Queries complete within 100ms', async ({ page }) => {
    // Navigate to a data-heavy page
    await page.goto('/billing')

    // Wait for initial load
    await page.waitForLoadState('networkidle')

    // Measure query performance via Network tab
    const resourceTimings = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => r.name.includes('supabase'))
        .map(r => ({
          name: r.name,
          duration: r.duration
        }))
    })

    // All Supabase queries should complete within 100ms
    resourceTimings.forEach(timing => {
      expect(timing.duration).toBeLessThan(100)
    })
  })
})
