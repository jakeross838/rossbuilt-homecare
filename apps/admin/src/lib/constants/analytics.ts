/**
 * Analytics constants for dashboards
 */

// Time period options with labels
export const TIME_PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
] as const

// Chart colors aligned with Ross Built brand
export const CHART_COLORS = {
  primary: '#16a34a', // rb-green-600
  secondary: '#d4a574', // rb-sand (approximate)
  accent: '#0ea5e9', // sky-500
  muted: '#94a3b8', // slate-400
  success: '#22c55e', // green-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  info: '#3b82f6', // blue-500
} as const

// Status colors for charts
export const STATUS_CHART_COLORS: Record<string, string> = {
  // Inspection statuses
  scheduled: CHART_COLORS.info,
  in_progress: CHART_COLORS.warning,
  completed: CHART_COLORS.success,
  cancelled: CHART_COLORS.muted,
  rescheduled: CHART_COLORS.accent,
  // Work order statuses
  pending: CHART_COLORS.muted,
  vendor_assigned: CHART_COLORS.info,
  on_hold: CHART_COLORS.warning,
  // Invoice statuses
  draft: CHART_COLORS.muted,
  sent: CHART_COLORS.info,
  viewed: CHART_COLORS.accent,
  paid: CHART_COLORS.success,
  partial: CHART_COLORS.warning,
  overdue: CHART_COLORS.danger,
  void: CHART_COLORS.muted,
}

// Priority colors for charts
export const PRIORITY_CHART_COLORS: Record<string, string> = {
  low: '#94a3b8', // slate-400
  medium: '#3b82f6', // blue-500
  high: '#f59e0b', // amber-500
  urgent: '#ef4444', // red-500
}

// Condition colors for property health
export const CONDITION_CHART_COLORS: Record<string, string> = {
  excellent: '#22c55e', // green-500
  good: '#84cc16', // lime-500
  fair: '#f59e0b', // amber-500
  needs_attention: '#f97316', // orange-500
  poor: '#ef4444', // red-500
}

// Tier colors for inspection distribution
export const TIER_CHART_COLORS: Record<string, string> = {
  visual: '#94a3b8', // slate-400
  functional: '#3b82f6', // blue-500
  comprehensive: '#8b5cf6', // violet-500
  preventative: '#16a34a', // green-600
}

// Default date ranges in days
export const DATE_RANGE_DAYS: Record<string, number> = {
  today: 0,
  week: 7,
  month: 30,
  quarter: 90,
  year: 365,
  all: 3650, // ~10 years
}

// Dashboard refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  realtime: 30000, // 30 seconds
  frequent: 60000, // 1 minute
  normal: 300000, // 5 minutes
  lazy: 900000, // 15 minutes
} as const

// Metric thresholds for alerts
export const METRIC_THRESHOLDS = {
  completionRateWarning: 85, // Below this shows warning
  completionRateDanger: 70, // Below this shows danger
  overdueCountWarning: 5,
  overdueCountDanger: 10,
  utilizationOptimal: 80, // Ideal inspector utilization
  utilizationWarning: 95, // Too high
}

// Chart configuration defaults
export const CHART_DEFAULTS = {
  animationDuration: 300,
  tooltipDelay: 100,
  barRadius: 4,
  strokeWidth: 2,
  dotRadius: 4,
  activeDotRadius: 6,
}
