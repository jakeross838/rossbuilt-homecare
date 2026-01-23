import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type {
  TimePeriod,
  WorkOrderMetrics,
  VendorPerformanceMetric,
  TimeSeriesDataPoint,
  CategoryDataPoint,
} from '@/lib/types/analytics'
import {
  getDateRangeForPeriod,
  groupByDate,
  groupByCategory,
  fillDateGaps,
} from '@/lib/helpers/analytics'
import {
  STATUS_CHART_COLORS,
} from '@/lib/constants/analytics'

export const workOrderMetricKeys = {
  all: ['work-order-metrics'] as const,
  summary: (period: TimePeriod) => [...workOrderMetricKeys.all, 'summary', period] as const,
  timeline: (period: TimePeriod) => [...workOrderMetricKeys.all, 'timeline', period] as const,
  byStatus: (period: TimePeriod) => [...workOrderMetricKeys.all, 'by-status', period] as const,
  byCategory: (period: TimePeriod) => [...workOrderMetricKeys.all, 'by-category', period] as const,
  vendorPerformance: (period: TimePeriod) => [...workOrderMetricKeys.all, 'vendor-perf', period] as const,
}

interface UseWorkOrderMetricsOptions {
  period?: TimePeriod
}

/**
 * Hook to fetch work order metrics summary
 */
export function useWorkOrderMetrics(options: UseWorkOrderMetricsOptions = {}) {
  const { period = 'month' } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: workOrderMetricKeys.summary(period),
    queryFn: async (): Promise<WorkOrderMetrics> => {
      const orgId = profile!.organization_id
      const range = getDateRangeForPeriod(period)

      const { data: workOrders, error } = await supabase
        .from('work_orders')
        .select(`
          id,
          status,
          priority,
          category,
          actual_cost,
          created_at,
          completed_at,
          vendor:vendors(id, company_name, average_rating)
        `)
        .eq('organization_id', orgId)
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString())

      if (error) throw error

      const data = workOrders || []
      const total = data.length

      // Count by status
      const byStatus = data.reduce((acc, wo) => {
        acc[wo.status] = (acc[wo.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Count by priority
      const byPriority = data.reduce((acc, wo) => {
        acc[wo.priority] = (acc[wo.priority] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Count by category
      const byCategory = data.reduce((acc, wo) => {
        acc[wo.category] = (acc[wo.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Calculate average completion time (in days)
      const completedOrders = data.filter(
        (wo) => wo.status === 'completed' && wo.completed_at
      )
      let averageCompletionTime = 0
      if (completedOrders.length > 0) {
        const totalDays = completedOrders.reduce((sum, wo) => {
          const created = new Date(wo.created_at).getTime()
          const completed = new Date(wo.completed_at!).getTime()
          return sum + (completed - created) / (1000 * 60 * 60 * 24)
        }, 0)
        averageCompletionTime = Math.round(totalDays / completedOrders.length)
      }

      // Total cost
      const totalCost = data.reduce((sum, wo) => sum + (wo.actual_cost || 0), 0)

      // Vendor performance (aggregate by vendor)
      const vendorMap = new Map<string, VendorPerformanceMetric>()
      data.forEach((wo) => {
        if (wo.vendor) {
          const vendor = wo.vendor as unknown as { id: string; company_name: string; average_rating: number }
          const existing = vendorMap.get(vendor.id)
          if (existing) {
            if (wo.status === 'completed') existing.completedJobs++
            existing.totalCost += wo.actual_cost || 0
          } else {
            vendorMap.set(vendor.id, {
              vendorId: vendor.id,
              vendorName: vendor.company_name,
              completedJobs: wo.status === 'completed' ? 1 : 0,
              averageRating: vendor.average_rating || 0,
              totalCost: wo.actual_cost || 0,
            })
          }
        }
      })
      const vendorPerformance = Array.from(vendorMap.values())
        .sort((a, b) => b.completedJobs - a.completedJobs)
        .slice(0, 10) // Top 10 vendors

      return {
        total,
        byStatus,
        byPriority,
        byCategory,
        averageCompletionTime,
        totalCost,
        vendorPerformance,
      }
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch work order timeline for charts
 */
export function useWorkOrderTimeline(options: UseWorkOrderMetricsOptions = {}) {
  const { period = 'month' } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: workOrderMetricKeys.timeline(period),
    queryFn: async (): Promise<TimeSeriesDataPoint[]> => {
      const orgId = profile!.organization_id
      const range = getDateRangeForPeriod(period)

      const { data, error } = await supabase
        .from('work_orders')
        .select('id, created_at')
        .eq('organization_id', orgId)
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString())

      if (error) throw error

      const grouped = groupByDate(data || [], (wo) => wo.created_at)
      return fillDateGaps(grouped, range.start, range.end)
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch work orders by status for pie chart
 */
export function useWorkOrdersByStatus(options: UseWorkOrderMetricsOptions = {}) {
  const { period = 'month' } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: workOrderMetricKeys.byStatus(period),
    queryFn: async (): Promise<CategoryDataPoint[]> => {
      const orgId = profile!.organization_id
      const range = getDateRangeForPeriod(period)

      const { data, error } = await supabase
        .from('work_orders')
        .select('id, status')
        .eq('organization_id', orgId)
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString())

      if (error) throw error

      return groupByCategory(data || [], (wo) => wo.status, STATUS_CHART_COLORS)
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch work orders by category for bar chart
 */
export function useWorkOrdersByCategory(options: UseWorkOrderMetricsOptions = {}) {
  const { period = 'month' } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: workOrderMetricKeys.byCategory(period),
    queryFn: async (): Promise<CategoryDataPoint[]> => {
      const orgId = profile!.organization_id
      const range = getDateRangeForPeriod(period)

      const { data, error } = await supabase
        .from('work_orders')
        .select('id, category')
        .eq('organization_id', orgId)
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString())

      if (error) throw error

      return groupByCategory(data || [], (wo) => wo.category)
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000,
  })
}
