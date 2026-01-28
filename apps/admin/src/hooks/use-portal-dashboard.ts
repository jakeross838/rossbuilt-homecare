import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type { PortalDashboardSummary, PortalProperty } from '@/lib/types/portal'
import { STALE_STANDARD } from '@/lib/queries/config'

// Query keys for portal
export const portalKeys = {
  all: ['portal'] as const,
  dashboard: () => [...portalKeys.all, 'dashboard'] as const,
  properties: () => [...portalKeys.all, 'properties'] as const,
  property: (id: string) => [...portalKeys.properties(), id] as const,
  inspections: (filters?: { propertyId?: string }) =>
    [...portalKeys.all, 'inspections', filters] as const,
  inspection: (id: string) => [...portalKeys.all, 'inspection', id] as const,
  requests: (filters?: { status?: string }) =>
    [...portalKeys.all, 'requests', filters] as const,
  request: (id: string) => [...portalKeys.all, 'request', id] as const,
  invoices: () => [...portalKeys.all, 'invoices'] as const,
  invoice: (id: string) => [...portalKeys.all, 'invoice', id] as const,
}

/**
 * Hook to fetch client portal dashboard summary
 * Only counts data for properties assigned to the current user
 */
export function usePortalDashboard() {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: portalKeys.dashboard(),
    queryFn: async (): Promise<PortalDashboardSummary> => {
      if (!profile?.id) {
        throw new Error('User not authenticated')
      }

      // First, get the property IDs assigned to this user
      const { data: assignments } = await supabase
        .from('user_property_assignments')
        .select('property_id')
        .eq('user_id', profile.id)

      const assignedPropertyIds = assignments?.map((a) => a.property_id) || []

      // If no assignments, return zeros
      if (assignedPropertyIds.length === 0) {
        return {
          properties_count: 0,
          upcoming_inspections: 0,
          open_service_requests: 0,
          pending_approvals: 0,
          outstanding_balance: 0,
        }
      }

      // Get properties count (only assigned)
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .in('id', assignedPropertyIds)
        .eq('is_active', true)

      // Get upcoming inspections (next 30 days) for assigned properties
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      const { count: upcomingInspections } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true })
        .in('property_id', assignedPropertyIds)
        .eq('status', 'scheduled')
        .gte('scheduled_date', new Date().toISOString())
        .lte('scheduled_date', thirtyDaysFromNow.toISOString())

      // Get open service requests for assigned properties
      const { count: openRequests } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .in('property_id', assignedPropertyIds)
        .in('status', ['new', 'acknowledged', 'in_progress', 'scheduled'])

      // Get pending recommendations for assigned properties
      const { count: pendingApprovals } = await supabase
        .from('recommendations')
        .select('*', { count: 'exact', head: true })
        .in('property_id', assignedPropertyIds)
        .eq('status', 'pending')

      // Get outstanding balance from invoices for assigned properties
      const { data: invoices } = await supabase
        .from('invoices')
        .select('balance_due')
        .in('property_id', assignedPropertyIds)
        .in('status', ['sent', 'viewed', 'partial', 'overdue'])

      const outstandingBalance = invoices?.reduce(
        (sum, inv) => sum + (inv.balance_due || 0),
        0
      ) || 0

      return {
        properties_count: propertiesCount || 0,
        upcoming_inspections: upcomingInspections || 0,
        open_service_requests: openRequests || 0,
        pending_approvals: pendingApprovals || 0,
        outstanding_balance: outstandingBalance,
      }
    },
    enabled: profile?.role === 'client',
    staleTime: STALE_STANDARD,
  })
}

/**
 * Hook to fetch client's properties for portal
 * Only returns properties assigned to the current user via user_property_assignments
 */
export function usePortalProperties() {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: portalKeys.properties(),
    queryFn: async (): Promise<PortalProperty[]> => {
      if (!profile?.id) {
        throw new Error('User not authenticated')
      }

      // First, get the property IDs assigned to this user
      const { data: assignments, error: assignmentError } = await supabase
        .from('user_property_assignments')
        .select('property_id')
        .eq('user_id', profile.id)

      if (assignmentError) {
        throw assignmentError
      }

      // If no assignments, return empty array
      if (!assignments || assignments.length === 0) {
        return []
      }

      const assignedPropertyIds = assignments.map((a) => a.property_id)

      // Fetch only the assigned properties
      const { data: properties, error } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          address_line1,
          city,
          state,
          zip,
          primary_photo_url,
          programs (
            id,
            inspection_tier,
            inspection_frequency,
            status,
            monthly_total
          )
        `)
        .in('id', assignedPropertyIds)
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      // For each property, get counts
      const propertiesWithCounts = await Promise.all(
        (properties || []).map(async (prop) => {
          // Equipment count
          const { count: equipmentCount } = await supabase
            .from('equipment')
            .select('*', { count: 'exact', head: true })
            .eq('property_id', prop.id)
            .eq('is_active', true)

          // Open work orders
          const { count: openWorkOrders } = await supabase
            .from('work_orders')
            .select('*', { count: 'exact', head: true })
            .eq('property_id', prop.id)
            .in('status', ['pending', 'vendor_assigned', 'scheduled', 'in_progress'])

          // Pending recommendations
          const { count: pendingRecs } = await supabase
            .from('recommendations')
            .select('*', { count: 'exact', head: true })
            .eq('property_id', prop.id)
            .eq('status', 'pending')

          // Last inspection
          const { data: lastInspection } = await supabase
            .from('inspections')
            .select('scheduled_date, overall_condition')
            .eq('property_id', prop.id)
            .eq('status', 'completed')
            .order('scheduled_date', { ascending: false })
            .limit(1)
            .single()

          const program = Array.isArray(prop.programs) ? prop.programs[0] : prop.programs

          // Get next scheduled inspection for this property
          const { data: nextInspection } = await supabase
            .from('inspections')
            .select('scheduled_date')
            .eq('property_id', prop.id)
            .eq('status', 'scheduled')
            .gte('scheduled_date', new Date().toISOString())
            .order('scheduled_date', { ascending: true })
            .limit(1)
            .single()

          return {
            id: prop.id,
            name: prop.name,
            address_line1: prop.address_line1,
            city: prop.city,
            state: prop.state,
            zip: prop.zip,
            primary_photo_url: prop.primary_photo_url,
            program: program ? {
              id: program.id,
              tier: program.inspection_tier,
              frequency: program.inspection_frequency,
              status: program.status,
              monthly_price: program.monthly_total,
              next_inspection_date: nextInspection?.scheduled_date || null,
            } : null,
            equipment_count: equipmentCount || 0,
            open_work_order_count: openWorkOrders || 0,
            pending_recommendation_count: pendingRecs || 0,
            last_inspection_date: lastInspection?.scheduled_date || null,
            overall_condition: lastInspection?.overall_condition || null,
          } satisfies PortalProperty
        })
      )

      return propertiesWithCounts
    },
    enabled: profile?.role === 'client',
  })
}
