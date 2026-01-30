import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type { PortalDashboardSummary, PortalProperty } from '@/lib/types/portal'
import { STALE_STANDARD, portalKeys } from '@/lib/queries'

/**
 * Helper to get client ID for a user
 * Checks: 1) client.user_id match, 2) client.email match
 */
async function getClientId(userId: string, userEmail: string | null): Promise<string | null> {
  // First: Find client by user_id
  const { data: clientByUserId } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (clientByUserId) {
    return clientByUserId.id
  }

  // Second fallback: Find client by email
  if (userEmail) {
    const { data: clientByEmail } = await supabase
      .from('clients')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (clientByEmail) {
      return clientByEmail.id
    }
  }

  return null
}

/**
 * Helper to get property IDs for a client user
 * Checks: 1) user_property_assignments, 2) client.user_id match, 3) client.email match
 */
async function getClientPropertyIds(userId: string, userEmail: string | null): Promise<string[]> {
  // First, check user_property_assignments
  const { data: assignments } = await supabase
    .from('user_property_assignments')
    .select('property_id')
    .eq('user_id', userId)

  if (assignments && assignments.length > 0) {
    return assignments.map((a) => a.property_id)
  }

  // Second: Find client by user_id and get their properties
  const { data: clientByUserId } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (clientByUserId) {
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .eq('client_id', clientByUserId.id)
      .eq('is_active', true)

    if (properties && properties.length > 0) {
      return properties.map((p) => p.id)
    }
  }

  // Third fallback: Find client by email and get their properties
  if (userEmail) {
    const { data: clientByEmail } = await supabase
      .from('clients')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (clientByEmail) {
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('client_id', clientByEmail.id)
        .eq('is_active', true)

      if (properties && properties.length > 0) {
        return properties.map((p) => p.id)
      }
    }
  }

  return []
}

/**
 * Hook to fetch client portal dashboard summary
 * Only counts data for properties assigned to the current user
 * Fetches all counts in parallel for better performance
 */
export function usePortalDashboard() {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: portalKeys.dashboard(),
    queryFn: async (): Promise<PortalDashboardSummary> => {
      if (!profile?.id) {
        throw new Error('User not authenticated')
      }

      // Get property IDs and client ID for this user
      const [assignedPropertyIds, clientId] = await Promise.all([
        getClientPropertyIds(profile.id, profile.email),
        getClientId(profile.id, profile.email),
      ])

      // If no properties found, return zeros
      if (assignedPropertyIds.length === 0) {
        return {
          properties_count: 0,
          upcoming_inspections: 0,
          open_service_requests: 0,
          pending_approvals: 0,
          outstanding_balance: 0,
        }
      }

      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      // Build invoices query - only if we have a client_id
      const invoicesQuery = clientId
        ? supabase
            .from('invoices')
            .select('balance_due')
            .eq('client_id', clientId)
            .in('status', ['sent', 'viewed', 'partial', 'overdue'])
        : Promise.resolve({ data: [], error: null })

      // Fetch ALL counts in parallel (not sequential)
      const [
        propertiesResult,
        inspectionsResult,
        requestsResult,
        approvalsResult,
        invoicesResult,
      ] = await Promise.all([
        // Properties count
        supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .in('id', assignedPropertyIds)
          .eq('is_active', true),

        // Upcoming inspections (next 30 days)
        supabase
          .from('inspections')
          .select('*', { count: 'exact', head: true })
          .in('property_id', assignedPropertyIds)
          .eq('status', 'scheduled')
          .gte('scheduled_date', new Date().toISOString())
          .lte('scheduled_date', thirtyDaysFromNow.toISOString()),

        // Open service requests
        supabase
          .from('service_requests')
          .select('*', { count: 'exact', head: true })
          .in('property_id', assignedPropertyIds)
          .in('status', ['new', 'acknowledged', 'in_progress', 'scheduled']),

        // Pending recommendations
        supabase
          .from('recommendations')
          .select('*', { count: 'exact', head: true })
          .in('property_id', assignedPropertyIds)
          .eq('status', 'pending'),

        // Outstanding invoices (by client_id, not property_id)
        invoicesQuery,
      ])

      const outstandingBalance = invoicesResult.data?.reduce(
        (sum, inv) => sum + (inv.balance_due || 0),
        0
      ) || 0

      return {
        properties_count: propertiesResult.count || 0,
        upcoming_inspections: inspectionsResult.count || 0,
        open_service_requests: requestsResult.count || 0,
        pending_approvals: approvalsResult.count || 0,
        outstanding_balance: outstandingBalance,
      }
    },
    enabled: profile?.role === 'client',
    staleTime: STALE_STANDARD,
  })
}

/**
 * Hook to fetch client's properties for portal
 * Uses portal_property_summaries view to avoid N+1 queries
 */
export function usePortalProperties() {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: portalKeys.propertySummaries(),
    queryFn: async (): Promise<PortalProperty[]> => {
      if (!profile?.id) {
        throw new Error('User not authenticated')
      }

      // Get property IDs for this client user
      const assignedPropertyIds = await getClientPropertyIds(profile.id, profile.email)

      // If no properties found, return empty array
      if (assignedPropertyIds.length === 0) {
        return []
      }

      // Single query to view with all pre-aggregated data
      const { data: summaries, error } = await supabase
        .from('portal_property_summaries')
        .select('*')
        .in('id', assignedPropertyIds)
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      // Map view data to PortalProperty shape
      return (summaries || []).map((s) => ({
        id: s.id,
        name: s.name,
        address_line1: s.address_line1,
        city: s.city,
        state: s.state,
        zip: s.zip,
        primary_photo_url: s.primary_photo_url,
        program: s.program_id ? {
          id: s.program_id,
          tier: s.inspection_tier,
          frequency: s.inspection_frequency,
          status: s.program_status,
          monthly_price: s.monthly_total,
          next_inspection_date: s.next_inspection_date,
        } : null,
        equipment_count: s.equipment_count ?? 0,
        open_work_order_count: s.open_work_order_count ?? 0,
        pending_recommendation_count: s.pending_recommendation_count ?? 0,
        last_inspection_date: s.last_inspection_date,
        overall_condition: s.last_inspection_condition,
      } satisfies PortalProperty))
    },
    enabled: profile?.role === 'client',
    staleTime: STALE_STANDARD,
  })
}
