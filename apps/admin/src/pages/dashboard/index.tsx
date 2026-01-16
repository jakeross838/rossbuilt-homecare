import { useState } from 'react'
import {
  Users,
  Building2,
  ClipboardCheck,
  Wrench,
  DollarSign,
  AlertCircle,
  Calendar,
  TrendingUp,
} from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-store'

import {
  StatCard,
  RevenueStatCard,
  SimpleStatCard,
  AreaChart,
  DonutChart,
  PeriodSelector,
} from '@/components/charts'
import { useDashboardOverview } from '@/hooks/use-dashboard-overview'
import { useInspectionTimeline } from '@/hooks/use-inspection-metrics'
import { useRevenueTimeline } from '@/hooks/use-revenue-metrics'
import { useRecentActivity, useUpcomingInspections, useOverdueItems } from '@/hooks/use-dashboard-activity'
import { useInspectionsByStatus } from '@/hooks/use-inspection-metrics'
import type { TimePeriod, ActivityLogEntry, OverdueItem } from '@/lib/types/analytics'
import { formatCurrency, getComparisonLabel } from '@/lib/helpers/analytics'
import { Link } from 'react-router-dom'

function getActivityIcon(type: ActivityLogEntry['type']) {
  switch (type) {
    case 'inspection':
      return ClipboardCheck
    case 'work_order':
      return Wrench
    case 'invoice':
      return DollarSign
    case 'client':
      return Users
    case 'property':
      return Building2
    default:
      return AlertCircle
  }
}

function getActivityLink(activity: ActivityLogEntry): string {
  switch (activity.type) {
    case 'inspection':
      return `/inspections/${activity.entityId}`
    case 'work_order':
      return `/work-orders/${activity.entityId}`
    case 'invoice':
      return `/billing/invoices/${activity.entityId}`
    case 'client':
      return `/clients/${activity.entityId}`
    case 'property':
      return `/properties/${activity.entityId}`
    default:
      return '#'
  }
}

function getOverdueLink(item: OverdueItem): string {
  switch (item.type) {
    case 'inspection':
      return `/inspections/${item.id}`
    case 'work_order':
      return `/work-orders/${item.id}`
    case 'invoice':
      return `/billing/invoices/${item.id}`
    default:
      return '#'
  }
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function formatScheduledDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
  }
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

export function DashboardPage() {
  const [period, setPeriod] = useState<TimePeriod>('month')
  const profile = useAuthStore((state) => state.profile)

  // Fetch all dashboard data
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview({ period })
  const { data: inspectionTimeline, isLoading: timelineLoading } = useInspectionTimeline({ period })
  const { data: revenueTimeline, isLoading: revenueLoading } = useRevenueTimeline({ period })
  const { data: inspectionsByStatus, isLoading: statusLoading } = useInspectionsByStatus({ period })
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(8)
  const { data: upcomingInspections, isLoading: upcomingLoading } = useUpcomingInspections(7, 5)
  const { data: overdueItems, isLoading: overdueLoading } = useOverdueItems()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const displayName = profile?.first_name || 'there'
  const comparisonLabel = getComparisonLabel(period)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title={`${greeting()}, ${displayName}`}
          description="Here's what's happening with your properties."
        />
        <PeriodSelector value={period} onChange={setPeriod} className="w-40" />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Clients"
          metric={overview?.activeClients}
          loading={overviewLoading}
          icon={Users}
          description="Enrolled clients"
          comparisonLabel={comparisonLabel}
        />
        <StatCard
          title="Properties"
          metric={overview?.activeProperties}
          loading={overviewLoading}
          icon={Building2}
          description="Under management"
          comparisonLabel={comparisonLabel}
        />
        <StatCard
          title="Inspections"
          metric={overview?.inspectionsCompleted}
          loading={overviewLoading}
          icon={ClipboardCheck}
          description="Completed this period"
          comparisonLabel={comparisonLabel}
        />
        <StatCard
          title="Open Work Orders"
          metric={overview?.openWorkOrders}
          loading={overviewLoading}
          icon={Wrench}
          description="Requiring attention"
          positiveIsGood={false}
          comparisonLabel={comparisonLabel}
        />
      </div>

      {/* Revenue Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RevenueStatCard
          title="Revenue"
          metric={overview?.revenue}
          loading={overviewLoading}
          icon={DollarSign}
          description="This period"
          comparisonLabel={comparisonLabel}
        />
        <SimpleStatCard
          title="Outstanding Balance"
          value={overview?.outstandingBalance}
          loading={overviewLoading}
          valueFormatter={formatCurrency}
          icon={AlertCircle}
          description="Pending payments"
        />
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/work-orders">
                <Wrench className="mr-2 h-4 w-4" />
                Work Orders
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/billing">
                <DollarSign className="mr-2 h-4 w-4" />
                Billing
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AreaChart
          title="Inspections Completed"
          description="Daily inspection completions"
          data={inspectionTimeline || []}
          period={period}
          loading={timelineLoading}
        />
        <AreaChart
          title="Revenue"
          description="Daily revenue from paid invoices"
          data={revenueTimeline || []}
          period={period}
          loading={revenueLoading}
          valueFormatter={formatCurrency}
          color="#16a34a"
        />
      </div>

      {/* Distribution & Activity Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DonutChart
          title="Inspections by Status"
          description="Current period distribution"
          data={inspectionsByStatus || []}
          loading={statusLoading}
          height={250}
        />

        {/* Upcoming Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Inspections
            </CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !upcomingInspections?.length ? (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No upcoming inspections</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInspections.map((inspection) => (
                  <Link
                    key={inspection.id}
                    to={`/calendar?date=${inspection.scheduledDate.split('T')[0]}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {inspection.propertyName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {inspection.clientName}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-xs font-medium">
                        {formatScheduledDate(inspection.scheduledDate)}
                      </p>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {inspection.tier}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !recentActivity?.length ? (
              <div className="text-center py-6 text-muted-foreground">
                <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <Link
                      key={activity.id}
                      to={getActivityLink(activity)}
                      className="flex items-start gap-3 text-sm hover:bg-muted p-2 rounded-lg transition-colors"
                    >
                      <div className="rounded-full bg-muted p-1.5 mt-0.5">
                        <Icon className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{activity.title}</p>
                        <p className="text-muted-foreground text-xs truncate">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overdue Items Alert */}
      {overdueItems && overdueItems.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Items Requiring Attention
            </CardTitle>
            <CardDescription>
              {overdueItems.length} overdue item{overdueItems.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {overdueItems.slice(0, 6).map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={getOverdueLink(item)}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.priority === 'urgent'
                            ? 'destructive'
                            : item.priority === 'high'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="text-xs capitalize"
                      >
                        {item.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm truncate mt-1">
                      {item.title}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-xs text-destructive font-medium">
                      {item.daysOverdue}d overdue
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DashboardPage
