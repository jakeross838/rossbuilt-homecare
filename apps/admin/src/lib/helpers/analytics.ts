/**
 * Analytics helper functions for data aggregation and formatting
 */

import type {
  TimePeriod,
  DateRange,
  MetricWithTrend,
  TimeSeriesDataPoint,
  CategoryDataPoint,
} from '@/lib/types/analytics'
import { DATE_RANGE_DAYS } from '@/lib/constants/analytics'

/**
 * Get date range for a given time period
 */
export function getDateRangeForPeriod(period: TimePeriod): DateRange {
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const start = new Date()
  start.setHours(0, 0, 0, 0)

  if (period === 'today') {
    return { start, end }
  }

  const days = DATE_RANGE_DAYS[period] || 30
  start.setDate(start.getDate() - days)

  return { start, end }
}

/**
 * Get previous period date range for comparison
 */
export function getPreviousPeriodRange(period: TimePeriod): DateRange {
  const current = getDateRangeForPeriod(period)
  const duration = current.end.getTime() - current.start.getTime()

  const end = new Date(current.start.getTime() - 1)
  const start = new Date(end.getTime() - duration)

  return { start, end }
}

/**
 * Calculate metric with trend comparison
 */
export function calculateTrend(current: number, previous: number): MetricWithTrend {
  const change = previous === 0
    ? current > 0 ? 100 : 0
    : Math.round(((current - previous) / previous) * 100)

  return {
    current,
    previous,
    change,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
  }
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toString()
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format percentage with sign
 */
export function formatPercentageChange(change: number): string {
  const sign = change > 0 ? '+' : ''
  return `${sign}${change}%`
}

/**
 * Group data by date for time series charts
 */
export function groupByDate<T>(
  items: T[],
  dateAccessor: (item: T) => string,
  valueAccessor: (item: T) => number = () => 1
): TimeSeriesDataPoint[] {
  const grouped = items.reduce((acc, item) => {
    const date = dateAccessor(item).split('T')[0] // Get date part only
    acc[date] = (acc[date] || 0) + valueAccessor(item)
    return acc
  }, {} as Record<string, number>)

  return Object.entries(grouped)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Group data by category for pie/bar charts
 */
export function groupByCategory<T>(
  items: T[],
  categoryAccessor: (item: T) => string,
  colorMap?: Record<string, string>
): CategoryDataPoint[] {
  const grouped = items.reduce((acc, item) => {
    const category = categoryAccessor(item)
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(grouped).map(([name, value]) => ({
    name,
    value,
    color: colorMap?.[name],
  }))
}

/**
 * Fill missing dates in time series with zero values
 */
export function fillDateGaps(
  data: TimeSeriesDataPoint[],
  startDate: Date,
  endDate: Date
): TimeSeriesDataPoint[] {
  const dateMap = new Map(data.map((d) => [d.date, d.value]))
  const result: TimeSeriesDataPoint[] = []

  const current = new Date(startDate)
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0]
    result.push({
      date: dateStr,
      value: dateMap.get(dateStr) || 0,
    })
    current.setDate(current.getDate() + 1)
  }

  return result
}

/**
 * Aggregate monthly data from daily data
 */
export function aggregateMonthly(data: TimeSeriesDataPoint[]): TimeSeriesDataPoint[] {
  const monthly = data.reduce((acc, point) => {
    const month = point.date.substring(0, 7) // YYYY-MM
    acc[month] = (acc[month] || 0) + point.value
    return acc
  }, {} as Record<string, number>)

  return Object.entries(monthly)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calculate average from array of numbers
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
}

/**
 * Calculate completion rate
 */
export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Get friendly label for time period
 */
export function getPeriodLabel(period: TimePeriod): string {
  const labels: Record<TimePeriod, string> = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    quarter: 'This Quarter',
    year: 'This Year',
    all: 'All Time',
  }
  return labels[period]
}

/**
 * Get comparison label for previous period
 */
export function getComparisonLabel(period: TimePeriod): string {
  const labels: Record<TimePeriod, string> = {
    today: 'vs yesterday',
    week: 'vs last week',
    month: 'vs last month',
    quarter: 'vs last quarter',
    year: 'vs last year',
    all: '',
  }
  return labels[period]
}

/**
 * Determine trend indicator color
 */
export function getTrendColor(
  trend: 'up' | 'down' | 'flat',
  positiveIsGood: boolean = true
): string {
  if (trend === 'flat') return 'text-muted-foreground'
  const isPositive = trend === 'up'
  if (positiveIsGood) {
    return isPositive ? 'text-green-600' : 'text-red-600'
  }
  return isPositive ? 'text-red-600' : 'text-green-600'
}

/**
 * Sort category data by value (descending)
 */
export function sortByValue(data: CategoryDataPoint[]): CategoryDataPoint[] {
  return [...data].sort((a, b) => b.value - a.value)
}

/**
 * Take top N categories, grouping rest into "Other"
 */
export function takeTopCategories(
  data: CategoryDataPoint[],
  topN: number,
  otherLabel: string = 'Other'
): CategoryDataPoint[] {
  if (data.length <= topN) return data

  const sorted = sortByValue(data)
  const top = sorted.slice(0, topN)
  const otherValue = sorted.slice(topN).reduce((sum, d) => sum + d.value, 0)

  if (otherValue > 0) {
    top.push({ name: otherLabel, value: otherValue })
  }

  return top
}

/**
 * Format date for chart axis labels
 */
export function formatChartDate(dateStr: string, period: TimePeriod): string {
  const date = new Date(dateStr)

  if (period === 'today') {
    return date.toLocaleTimeString('en-US', { hour: 'numeric' })
  }

  if (period === 'week') {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  if (period === 'month') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (period === 'quarter' || period === 'year') {
    return date.toLocaleDateString('en-US', { month: 'short' })
  }

  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}
