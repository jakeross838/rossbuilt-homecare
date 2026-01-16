import { useState } from 'react'
import {
  ClipboardCheck,
  Wrench,
  DollarSign,
  Users,
  TrendingUp,
} from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AreaChart,
  BarChart,
  HorizontalBarChart,
  DonutChart,
  PeriodSelector,
  SimpleStatCard,
} from '@/components/charts'
import {
  useInspectionMetrics,
  useInspectionTimeline,
  useInspectionsByStatus,
  useInspectionsByTier,
} from '@/hooks/use-inspection-metrics'
import {
  useWorkOrderMetrics,
  useWorkOrderTimeline,
  useWorkOrdersByStatus,
  useWorkOrdersByCategory,
} from '@/hooks/use-work-order-metrics'
import {
  useRevenueMetrics,
  useRevenueTimeline,
  useInvoicesByStatus,
} from '@/hooks/use-revenue-metrics'
import type { TimePeriod } from '@/lib/types/analytics'
import { formatCurrency, getComparisonLabel } from '@/lib/helpers/analytics'

export function ReportsPage() {
  const [period, setPeriod] = useState<TimePeriod>('month')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Analytics Reports"
          description="Detailed metrics and performance insights"
        />
        <PeriodSelector value={period} onChange={setPeriod} className="w-40" />
      </div>

      <Tabs defaultValue="inspections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inspections" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Inspections
          </TabsTrigger>
          <TabsTrigger value="work-orders" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Work Orders
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inspections">
          <InspectionReports period={period} />
        </TabsContent>

        <TabsContent value="work-orders">
          <WorkOrderReports period={period} />
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueReports period={period} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InspectionReports({ period }: { period: TimePeriod }) {
  const { data: metrics, isLoading: metricsLoading } = useInspectionMetrics({ period })
  const { data: timeline, isLoading: timelineLoading } = useInspectionTimeline({ period })
  const { data: byStatus, isLoading: statusLoading } = useInspectionsByStatus({ period })
  const { data: byTier, isLoading: tierLoading } = useInspectionsByTier({ period })

  const comparisonLabel = getComparisonLabel(period)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SimpleStatCard
          title="Total Inspections"
          value={metrics?.total}
          loading={metricsLoading}
          icon={ClipboardCheck}
          description="This period"
        />
        <SimpleStatCard
          title="Completion Rate"
          value={metrics?.completionRate}
          loading={metricsLoading}
          valueFormatter={(v) => `${v}%`}
          icon={TrendingUp}
          description="Completed on time"
        />
        <SimpleStatCard
          title="Avg Duration"
          value={metrics?.averageDuration}
          loading={metricsLoading}
          valueFormatter={(v) => `${v} min`}
          icon={ClipboardCheck}
          description="Per inspection"
        />
        <SimpleStatCard
          title="Issues Found"
          value={
            metrics
              ? metrics.findingsBreakdown.fail +
                metrics.findingsBreakdown.needsAttention +
                metrics.findingsBreakdown.urgent
              : undefined
          }
          loading={metricsLoading}
          icon={Wrench}
          description="Requiring attention"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AreaChart
          title="Inspections Over Time"
          description="Daily completed inspections"
          data={timeline || []}
          period={period}
          loading={timelineLoading}
        />
        <DonutChart
          title="By Status"
          description="Inspection status distribution"
          data={byStatus || []}
          loading={statusLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DonutChart
          title="By Tier"
          description="Inspection tier distribution"
          data={byTier || []}
          loading={tierLoading}
        />
        <BarChart
          title="Findings Breakdown"
          description="Inspection findings by type"
          data={
            metrics
              ? [
                  { name: 'Pass', value: metrics.findingsBreakdown.pass, color: '#22c55e' },
                  { name: 'Needs Attention', value: metrics.findingsBreakdown.needsAttention, color: '#f59e0b' },
                  { name: 'Fail', value: metrics.findingsBreakdown.fail, color: '#ef4444' },
                  { name: 'Urgent', value: metrics.findingsBreakdown.urgent, color: '#dc2626' },
                ]
              : []
          }
          loading={metricsLoading}
        />
      </div>
    </div>
  )
}

function WorkOrderReports({ period }: { period: TimePeriod }) {
  const { data: metrics, isLoading: metricsLoading } = useWorkOrderMetrics({ period })
  const { data: timeline, isLoading: timelineLoading } = useWorkOrderTimeline({ period })
  const { data: byStatus, isLoading: statusLoading } = useWorkOrdersByStatus({ period })
  const { data: byCategory, isLoading: categoryLoading } = useWorkOrdersByCategory({ period })

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SimpleStatCard
          title="Total Work Orders"
          value={metrics?.total}
          loading={metricsLoading}
          icon={Wrench}
          description="This period"
        />
        <SimpleStatCard
          title="Avg Completion"
          value={metrics?.averageCompletionTime}
          loading={metricsLoading}
          valueFormatter={(v) => `${v} days`}
          icon={TrendingUp}
          description="Time to complete"
        />
        <SimpleStatCard
          title="Total Cost"
          value={metrics?.totalCost}
          loading={metricsLoading}
          valueFormatter={formatCurrency}
          icon={DollarSign}
          description="This period"
        />
        <SimpleStatCard
          title="Active Vendors"
          value={metrics?.vendorPerformance.length}
          loading={metricsLoading}
          icon={Users}
          description="With work orders"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AreaChart
          title="Work Orders Over Time"
          description="Daily work orders created"
          data={timeline || []}
          period={period}
          loading={timelineLoading}
          color="#f59e0b"
        />
        <DonutChart
          title="By Status"
          description="Work order status distribution"
          data={byStatus || []}
          loading={statusLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <HorizontalBarChart
          title="By Category"
          description="Work order categories"
          data={(byCategory || []).slice(0, 8)}
          loading={categoryLoading}
          height={350}
        />
        <HorizontalBarChart
          title="Top Vendors"
          description="By completed jobs"
          data={
            metrics?.vendorPerformance.slice(0, 8).map((v) => ({
              name: v.vendorName,
              value: v.completedJobs,
            })) || []
          }
          loading={metricsLoading}
          height={350}
        />
      </div>
    </div>
  )
}

function RevenueReports({ period }: { period: TimePeriod }) {
  const { data: metrics, isLoading: metricsLoading } = useRevenueMetrics({ period })
  const { data: timeline, isLoading: timelineLoading } = useRevenueTimeline({ period })
  const { data: byStatus, isLoading: statusLoading } = useInvoicesByStatus({ period })

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SimpleStatCard
          title="Total Revenue"
          value={metrics?.totalRevenue}
          loading={metricsLoading}
          valueFormatter={formatCurrency}
          icon={DollarSign}
          description="This period"
        />
        <SimpleStatCard
          title="Recurring Revenue"
          value={metrics?.recurringRevenue}
          loading={metricsLoading}
          valueFormatter={formatCurrency}
          icon={TrendingUp}
          description="From subscriptions"
        />
        <SimpleStatCard
          title="Outstanding"
          value={metrics?.outstandingInvoices}
          loading={metricsLoading}
          valueFormatter={formatCurrency}
          icon={DollarSign}
          description="Pending payment"
        />
        <SimpleStatCard
          title="Overdue"
          value={metrics?.overdueAmount}
          loading={metricsLoading}
          valueFormatter={formatCurrency}
          icon={DollarSign}
          description="Past due date"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AreaChart
          title="Revenue Over Time"
          description="Daily revenue from paid invoices"
          data={timeline || []}
          period={period}
          loading={timelineLoading}
          valueFormatter={formatCurrency}
          color="#16a34a"
        />
        <DonutChart
          title="Invoice Status"
          description="Invoice status distribution"
          data={byStatus || []}
          loading={statusLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <HorizontalBarChart
          title="Revenue by Client"
          description="Top clients by revenue"
          data={
            metrics?.byClient.slice(0, 8).map((c) => ({
              name: c.clientName,
              value: c.totalRevenue,
            })) || []
          }
          loading={metricsLoading}
          valueFormatter={formatCurrency}
          height={350}
        />
        <BarChart
          title="Monthly Revenue"
          description="Revenue trend by month"
          data={
            metrics?.byMonth.map((m) => ({
              name: m.month,
              value: m.revenue,
            })) || []
          }
          loading={metricsLoading}
          valueFormatter={formatCurrency}
        />
      </div>
    </div>
  )
}

export default ReportsPage
