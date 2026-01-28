import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type {
  TimePeriod,
  RevenueMetrics,
  MonthlyRevenue,
  ClientRevenue,
  TimeSeriesDataPoint,
  CategoryDataPoint,
} from '@/lib/types/analytics'
import {
  getDateRangeForPeriod,
  aggregateMonthly,
  groupByDate,
  fillDateGaps,
  sortByValue,
} from '@/lib/helpers/analytics'
import { STATUS_CHART_COLORS } from '@/lib/constants/analytics'
import { STALE_STANDARD } from '@/lib/queries/config'

export const revenueMetricKeys = {
  all: ['revenue-metrics'] as const,
  summary: (period: TimePeriod) => [...revenueMetricKeys.all, 'summary', period] as const,
  timeline: (period: TimePeriod) => [...revenueMetricKeys.all, 'timeline', period] as const,
  byClient: (period: TimePeriod) => [...revenueMetricKeys.all, 'by-client', period] as const,
  byStatus: (period: TimePeriod) => [...revenueMetricKeys.all, 'by-status', period] as const,
}

interface UseRevenueMetricsOptions {
  period?: TimePeriod
}

/**
 * Hook to fetch revenue metrics summary
 */
export function useRevenueMetrics(options: UseRevenueMetricsOptions = {}) {
  const { period = 'month' } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: revenueMetricKeys.summary(period),
    queryFn: async (): Promise<RevenueMetrics> => {
      const orgId = profile!.organization_id
      const range = getDateRangeForPeriod(period)

      // Fetch paid invoices in period
      const { data: paidInvoices, error: paidError } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_type,
          total,
          paid_at,
          client_id,
          client:clients(id, first_name, last_name)
        `)
        .eq('organization_id', orgId)
        .eq('status', 'paid')
        .gte('paid_at', range.start.toISOString())
        .lte('paid_at', range.end.toISOString())

      if (paidError) throw paidError

      // Fetch outstanding invoices
      const { data: outstandingInvoices, error: outError } = await supabase
        .from('invoices')
        .select('id, balance_due, due_date, status')
        .eq('organization_id', orgId)
        .in('status', ['sent', 'viewed', 'partial', 'overdue'])

      if (outError) throw outError

      const paid = paidInvoices || []
      const outstanding = outstandingInvoices || []

      // Calculate total revenue
      const totalRevenue = paid.reduce((sum, inv) => sum + (inv.total || 0), 0)

      // Split by type
      const recurringRevenue = paid
        .filter((inv) => inv.invoice_type === 'subscription')
        .reduce((sum, inv) => sum + (inv.total || 0), 0)
      const serviceRevenue = totalRevenue - recurringRevenue

      // Group by month
      const monthlyData = groupByDate(paid, (inv) => inv.paid_at!, (inv) => inv.total || 0)
      const byMonth: MonthlyRevenue[] = aggregateMonthly(monthlyData).map((point) => ({
        month: point.date,
        revenue: point.value,
        invoiceCount: paid.filter((inv) => inv.paid_at?.startsWith(point.date)).length,
      }))

      // Group by client
      const clientMap = new Map<string, ClientRevenue>()
      paid.forEach((inv) => {
        if (inv.client) {
          const client = inv.client as unknown as { id: string; first_name: string; last_name: string }
          const existing = clientMap.get(client.id)
          if (existing) {
            existing.totalRevenue += inv.total || 0
          } else {
            clientMap.set(client.id, {
              clientId: client.id,
              clientName: `${client.first_name} ${client.last_name}`,
              totalRevenue: inv.total || 0,
              propertyCount: 0, // Will be populated below
            })
          }
        }
      })

      // Fetch actual property counts for each client
      const clientIds = Array.from(clientMap.keys())
      if (clientIds.length > 0) {
        const { data: propertyCounts } = await supabase
          .from('properties')
          .select('client_id')
          .eq('organization_id', orgId)
          .in('client_id', clientIds)

        if (propertyCounts) {
          const countMap = propertyCounts.reduce((acc, prop) => {
            acc[prop.client_id] = (acc[prop.client_id] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          clientMap.forEach((clientRevenue) => {
            clientRevenue.propertyCount = countMap[clientRevenue.clientId] || 0
          })
        }
      }

      const byClient = Array.from(clientMap.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10)

      // Outstanding totals
      const outstandingTotal = outstanding.reduce((sum, inv) => sum + (inv.balance_due || 0), 0)
      const today = new Date().toISOString().split('T')[0]
      const overdueAmount = outstanding
        .filter((inv) => inv.due_date && inv.due_date < today)
        .reduce((sum, inv) => sum + (inv.balance_due || 0), 0)

      return {
        totalRevenue,
        recurringRevenue,
        serviceRevenue,
        byMonth,
        byClient,
        outstandingInvoices: outstandingTotal,
        overdueAmount,
      }
    },
    enabled: !!profile?.organization_id,
    staleTime: STALE_STANDARD,
  })
}

/**
 * Hook to fetch revenue timeline for charts
 */
export function useRevenueTimeline(options: UseRevenueMetricsOptions = {}) {
  const { period = 'month' } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: revenueMetricKeys.timeline(period),
    queryFn: async (): Promise<TimeSeriesDataPoint[]> => {
      const orgId = profile!.organization_id
      const range = getDateRangeForPeriod(period)

      const { data, error } = await supabase
        .from('invoices')
        .select('id, paid_at, total')
        .eq('organization_id', orgId)
        .eq('status', 'paid')
        .gte('paid_at', range.start.toISOString())
        .lte('paid_at', range.end.toISOString())

      if (error) throw error

      const grouped = groupByDate(
        data || [],
        (inv) => inv.paid_at!,
        (inv) => inv.total || 0
      )
      return fillDateGaps(grouped, range.start, range.end)
    },
    enabled: !!profile?.organization_id,
    staleTime: STALE_STANDARD,
  })
}

/**
 * Hook to fetch invoices by status for pie chart
 */
export function useInvoicesByStatus(options: UseRevenueMetricsOptions = {}) {
  const { period = 'month' } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: revenueMetricKeys.byStatus(period),
    queryFn: async (): Promise<CategoryDataPoint[]> => {
      const orgId = profile!.organization_id
      const range = getDateRangeForPeriod(period)

      const { data, error } = await supabase
        .from('invoices')
        .select('id, status, created_at')
        .eq('organization_id', orgId)
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString())

      if (error) throw error

      return sortByValue(
        (data || []).reduce((acc, inv) => {
          const existing = acc.find((c) => c.name === inv.status)
          if (existing) {
            existing.value++
          } else {
            acc.push({
              name: inv.status,
              value: 1,
              color: STATUS_CHART_COLORS[inv.status],
            })
          }
          return acc
        }, [] as CategoryDataPoint[])
      )
    },
    enabled: !!profile?.organization_id,
    staleTime: STALE_STANDARD,
  })
}
