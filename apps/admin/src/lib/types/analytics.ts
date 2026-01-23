/**
 * Analytics types for Home Care OS dashboards
 */

// Time period options for filtering
export type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'

// Date range for custom filtering
export interface DateRange {
  start: Date
  end: Date
}

// Generic metric with value and trend
export interface MetricWithTrend {
  current: number
  previous: number
  change: number // percentage change
  trend: 'up' | 'down' | 'flat'
}

// Overview metrics for main dashboard
export interface DashboardOverview {
  activeClients: MetricWithTrend
  activeProperties: MetricWithTrend
  inspectionsCompleted: MetricWithTrend
  openWorkOrders: MetricWithTrend
  revenue: MetricWithTrend
  outstandingBalance: number
}

// Inspection metrics
export interface InspectionMetrics {
  total: number
  byStatus: Record<string, number>
  byTier: Record<string, number>
  completionRate: number
  averageDuration: number // in minutes
  findingsBreakdown: {
    pass: number
    fail: number
    needsAttention: number
    urgent: number
  }
}

// Work order metrics
export interface WorkOrderMetrics {
  total: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  byCategory: Record<string, number>
  averageCompletionTime: number // in days
  totalCost: number
  vendorPerformance: VendorPerformanceMetric[]
}

export interface VendorPerformanceMetric {
  vendorId: string
  vendorName: string
  completedJobs: number
  averageRating: number
  totalCost: number
}

// Revenue metrics
export interface RevenueMetrics {
  totalRevenue: number
  recurringRevenue: number // from programs
  serviceRevenue: number // from work orders
  byMonth: MonthlyRevenue[]
  byClient: ClientRevenue[]
  outstandingInvoices: number
  overdueAmount: number
}

export interface MonthlyRevenue {
  month: string // YYYY-MM format
  revenue: number
  invoiceCount: number
}

export interface ClientRevenue {
  clientId: string
  clientName: string
  totalRevenue: number
  propertyCount: number
}

// Property health metrics
export interface PropertyHealthMetrics {
  total: number
  excellent: number
  good: number
  needsAttention: number
  poor: number
  unassessed: number
  averageCondition: number // 1-5 scale
}

// Client engagement metrics
export interface ClientEngagementMetrics {
  totalClients: number
  activeClients: number // with active programs
  newClientsThisPeriod: number
  churnedClientsThisPeriod: number
  retentionRate: number
  averagePropertiesPerClient: number
}

// Activity log entry for recent activity feed
export interface ActivityLogEntry {
  id: string
  type: 'inspection' | 'work_order' | 'invoice' | 'client' | 'property' | 'service_request'
  action: 'created' | 'updated' | 'completed' | 'cancelled' | 'paid'
  title: string
  description: string
  entityId: string
  userId?: string
  userName?: string
  timestamp: string
}

// Chart data point for time series
export interface TimeSeriesDataPoint {
  date: string
  value: number
  label?: string
}

// Chart data for categorical data
export interface CategoryDataPoint {
  name: string
  value: number
  color?: string
}

// Inspector workload for scheduling optimization
export interface InspectorWorkloadMetric {
  inspectorId: string
  inspectorName: string
  scheduledInspections: number
  completedInspections: number
  averageRating: number
  utilizationRate: number // percentage
}

// Upcoming inspections for schedule overview
export interface UpcomingInspection {
  id: string
  propertyName: string
  clientName: string
  scheduledDate: string
  tier: string
  inspectorName?: string
}

// Overdue items requiring attention
export interface OverdueItem {
  type: 'inspection' | 'work_order' | 'invoice'
  id: string
  title: string
  dueDate: string
  daysOverdue: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
}
