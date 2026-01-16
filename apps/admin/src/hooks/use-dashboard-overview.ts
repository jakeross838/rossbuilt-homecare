import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type {
  TimePeriod,
  DashboardOverview,
} from '@/lib/types/analytics'
import {
  getDateRangeForPeriod,
  getPreviousPeriodRange,
  calculateTrend,
} from '@/lib/helpers/analytics'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: (period: TimePeriod) => [...dashboardKeys.all, 'overview', period] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
  upcoming: () => [...dashboardKeys.all, 'upcoming'] as const,
  overdue: () => [...dashboardKeys.all, 'overdue'] as const,
}

interface UseOverviewOptions {
  period?: TimePeriod
}

/**
 * Hook to fetch dashboard overview metrics with trends
 */
export function useDashboardOverview(options: UseOverviewOptions = {}) {
  const { period = 'month' } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: dashboardKeys.overview(period),
    queryFn: async (): Promise<DashboardOverview> => {
      const orgId = profile!.organization_id
      const currentRange = getDateRangeForPeriod(period)
      const previousRange = getPreviousPeriodRange(period)

      // Fetch all counts in parallel
      const [
        currentClientsResult,
        previousClientsResult,
        currentPropertiesResult,
        previousPropertiesResult,
        currentInspectionsResult,
        previousInspectionsResult,
        currentWorkOrdersResult,
        previousWorkOrdersResult,
        currentRevenueResult,
        previousRevenueResult,
        outstandingResult,
      ] = await Promise.all([
        // Current period clients
        supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('is_active', true),
        // Previous period clients (use created_at for new clients)
        supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('is_active', true)
          .lt('created_at', currentRange.start.toISOString()),
        // Current properties
        supabase
          .from('properties')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('is_active', true),
        // Previous properties
        supabase
          .from('properties')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('is_active', true)
          .lt('created_at', currentRange.start.toISOString()),
        // Current period completed inspections
        supabase
          .from('inspections')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('status', 'completed')
          .gte('actual_end_at', currentRange.start.toISOString())
          .lte('actual_end_at', currentRange.end.toISOString()),
        // Previous period completed inspections
        supabase
          .from('inspections')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('status', 'completed')
          .gte('actual_end_at', previousRange.start.toISOString())
          .lte('actual_end_at', previousRange.end.toISOString()),
        // Current open work orders
        supabase
          .from('work_orders')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .not('status', 'in', '("completed","cancelled")'),
        // Previous open work orders
        supabase
          .from('work_orders')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .not('status', 'in', '("completed","cancelled")')
          .lt('created_at', currentRange.start.toISOString()),
        // Current period revenue (paid invoices)
        supabase
          .from('invoices')
          .select('total')
          .eq('organization_id', orgId)
          .eq('status', 'paid')
          .gte('paid_at', currentRange.start.toISOString())
          .lte('paid_at', currentRange.end.toISOString()),
        // Previous period revenue
        supabase
          .from('invoices')
          .select('total')
          .eq('organization_id', orgId)
          .eq('status', 'paid')
          .gte('paid_at', previousRange.start.toISOString())
          .lte('paid_at', previousRange.end.toISOString()),
        // Outstanding balance (sent, viewed, overdue, partial)
        supabase
          .from('invoices')
          .select('balance_due')
          .eq('organization_id', orgId)
          .in('status', ['sent', 'viewed', 'overdue', 'partial']),
      ])

      // Calculate totals
      const currentClients = currentClientsResult.count || 0
      const previousClients = previousClientsResult.count || 0
      const currentProperties = currentPropertiesResult.count || 0
      const previousProperties = previousPropertiesResult.count || 0
      const currentInspections = currentInspectionsResult.count || 0
      const previousInspections = previousInspectionsResult.count || 0
      const currentWorkOrders = currentWorkOrdersResult.count || 0
      const previousWorkOrders = previousWorkOrdersResult.count || 0

      const currentRevenue = (currentRevenueResult.data || [])
        .reduce((sum, inv) => sum + (inv.total || 0), 0)
      const previousRevenue = (previousRevenueResult.data || [])
        .reduce((sum, inv) => sum + (inv.total || 0), 0)
      const outstandingBalance = (outstandingResult.data || [])
        .reduce((sum, inv) => sum + (inv.balance_due || 0), 0)

      return {
        activeClients: calculateTrend(currentClients, previousClients),
        activeProperties: calculateTrend(currentProperties, previousProperties),
        inspectionsCompleted: calculateTrend(currentInspections, previousInspections),
        openWorkOrders: calculateTrend(currentWorkOrders, previousWorkOrders),
        revenue: calculateTrend(currentRevenue, previousRevenue),
        outstandingBalance,
      }
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
