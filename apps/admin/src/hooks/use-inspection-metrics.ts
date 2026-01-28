import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type {
  TimePeriod,
  InspectionMetrics,
  TimeSeriesDataPoint,
  CategoryDataPoint,
} from '@/lib/types/analytics'
import {
  getDateRangeForPeriod,
  groupByDate,
  groupByCategory,
  fillDateGaps,
  calculateCompletionRate,
} from '@/lib/helpers/analytics'
import {
  STATUS_CHART_COLORS,
  TIER_CHART_COLORS,
} from '@/lib/constants/analytics'
import { STALE_STANDARD, inspectionMetricKeys } from '@/lib/queries'

interface UseInspectionMetricsOptions {
  period?: TimePeriod
}

/**
 * Hook to fetch inspection metrics summary
 */
export function useInspectionMetrics(options: UseInspectionMetricsOptions = {}) {
  const { period = 'month' } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: inspectionMetricKeys.summary(period),
    queryFn: async (): Promise<InspectionMetrics> => {
      const orgId = profile!.organization_id
      const range = getDateRangeForPeriod(period)

      const { data: inspections, error } = await supabase
        .from('inspections')
        .select(`
          id,
          status,
          scheduled_date,
          actual_start_at,
          actual_end_at,
          findings,
          programs(inspection_tier)
        `)
        .eq('organization_id', orgId)
        .gte('scheduled_date', range.start.toISOString())
        .lte('scheduled_date', range.end.toISOString())

      if (error) throw error

      const data = inspections || []
      const total = data.length
      const completed = data.filter((i) => i.status === 'completed').length

      // Count by status
      const byStatus = data.reduce((acc, i) => {
        acc[i.status] = (acc[i.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Count by tier (from joined programs)
      const byTier = data.reduce((acc, i) => {
        const tier = (i.programs as { inspection_tier: string } | null)?.inspection_tier || 'unknown'
        acc[tier] = (acc[tier] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Calculate average duration (completed inspections only)
      const completedWithTimes = data.filter(
        (i) => i.status === 'completed' && i.actual_start_at && i.actual_end_at
      )
      let averageDuration = 0
      if (completedWithTimes.length > 0) {
        const totalMinutes = completedWithTimes.reduce((sum, i) => {
          const start = new Date(i.actual_start_at!).getTime()
          const end = new Date(i.actual_end_at!).getTime()
          return sum + (end - start) / 60000 // Convert to minutes
        }, 0)
        averageDuration = Math.round(totalMinutes / completedWithTimes.length)
      }

      // Aggregate findings from JSONB (findings is an object with item_id keys)
      const findingsBreakdown = { pass: 0, fail: 0, needsAttention: 0, urgent: 0 }
      data.forEach((i) => {
        if (i.findings && typeof i.findings === 'object' && !Array.isArray(i.findings)) {
          const findingsObj = i.findings as Record<string, { status: string }>
          Object.values(findingsObj).forEach((f) => {
            if (f.status === 'pass') findingsBreakdown.pass++
            else if (f.status === 'fail') findingsBreakdown.fail++
            else if (f.status === 'needs_attention') findingsBreakdown.needsAttention++
            else if (f.status === 'urgent') findingsBreakdown.urgent++
          })
        }
      })

      return {
        total,
        byStatus,
        byTier,
        completionRate: calculateCompletionRate(completed, total),
        averageDuration,
        findingsBreakdown,
      }
    },
    enabled: !!profile?.organization_id,
    staleTime: STALE_STANDARD,
  })
}

/**
 * Hook to fetch inspection timeline for charts
 */
export function useInspectionTimeline(options: UseInspectionMetricsOptions = {}) {
  const { period = 'month' } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: inspectionMetricKeys.timeline(period),
    queryFn: async (): Promise<TimeSeriesDataPoint[]> => {
      const orgId = profile!.organization_id
      const range = getDateRangeForPeriod(period)

      const { data, error } = await supabase
        .from('inspections')
        .select('id, scheduled_date, status')
        .eq('organization_id', orgId)
        .eq('status', 'completed')
        .gte('scheduled_date', range.start.toISOString())
        .lte('scheduled_date', range.end.toISOString())

      if (error) throw error

      const grouped = groupByDate(data || [], (i) => i.scheduled_date)
      return fillDateGaps(grouped, range.start, range.end)
    },
    enabled: !!profile?.organization_id,
    staleTime: STALE_STANDARD,
  })
}

/**
 * Hook to fetch inspection distribution by status for pie chart
 */
export function useInspectionsByStatus(options: UseInspectionMetricsOptions = {}) {
  const { period = 'month' } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: inspectionMetricKeys.byStatus(period),
    queryFn: async (): Promise<CategoryDataPoint[]> => {
      const orgId = profile!.organization_id
      const range = getDateRangeForPeriod(period)

      const { data, error } = await supabase
        .from('inspections')
        .select('id, status')
        .eq('organization_id', orgId)
        .gte('scheduled_date', range.start.toISOString())
        .lte('scheduled_date', range.end.toISOString())

      if (error) throw error

      return groupByCategory(data || [], (i) => i.status, STATUS_CHART_COLORS)
    },
    enabled: !!profile?.organization_id,
    staleTime: STALE_STANDARD,
  })
}

/**
 * Hook to fetch inspection distribution by tier for pie chart
 */
export function useInspectionsByTier(options: UseInspectionMetricsOptions = {}) {
  const { period = 'month' } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: inspectionMetricKeys.byTier(period),
    queryFn: async (): Promise<CategoryDataPoint[]> => {
      const orgId = profile!.organization_id
      const range = getDateRangeForPeriod(period)

      const { data, error } = await supabase
        .from('inspections')
        .select('id, programs(inspection_tier)')
        .eq('organization_id', orgId)
        .gte('scheduled_date', range.start.toISOString())
        .lte('scheduled_date', range.end.toISOString())

      if (error) throw error

      return groupByCategory(
        data || [],
        (i) => (i.programs as { inspection_tier: string } | null)?.inspection_tier || 'unknown',
        TIER_CHART_COLORS
      )
    },
    enabled: !!profile?.organization_id,
    staleTime: STALE_STANDARD,
  })
}
