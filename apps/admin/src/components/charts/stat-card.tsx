import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { MetricWithTrend } from '@/lib/types/analytics'
import {
  formatCompactNumber,
  formatCurrency,
  formatPercentageChange,
  getTrendColor,
} from '@/lib/helpers/analytics'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  metric: MetricWithTrend | undefined
  loading?: boolean
  valueFormatter?: (value: number) => string
  icon?: React.ComponentType<{ className?: string }>
  description?: string
  positiveIsGood?: boolean
  comparisonLabel?: string
}

export function StatCard({
  title,
  metric,
  loading = false,
  valueFormatter = formatCompactNumber,
  icon: Icon,
  description,
  positiveIsGood = true,
  comparisonLabel = 'vs last period',
}: StatCardProps) {
  if (loading || !metric) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          {Icon && <Skeleton className="h-4 w-4" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    )
  }

  const TrendIcon =
    metric.trend === 'up' ? ArrowUp : metric.trend === 'down' ? ArrowDown : Minus

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{valueFormatter(metric.current)}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {metric.change !== 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            <TrendIcon
              className={cn('h-3 w-3', getTrendColor(metric.trend, positiveIsGood))}
            />
            <span className={cn('font-medium', getTrendColor(metric.trend, positiveIsGood))}>
              {formatPercentageChange(metric.change)}
            </span>
            <span className="text-muted-foreground">{comparisonLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Currency stat card
export function RevenueStatCard(props: Omit<StatCardProps, 'valueFormatter'>) {
  return <StatCard {...props} valueFormatter={formatCurrency} />
}

// Percentage stat card
export function PercentageStatCard(
  props: Omit<StatCardProps, 'valueFormatter'>
) {
  return (
    <StatCard
      {...props}
      valueFormatter={(value) => `${value}%`}
    />
  )
}

// Simple stat without trend (for current values)
interface SimpleStatCardProps {
  title: string
  value: number | string | undefined
  loading?: boolean
  valueFormatter?: (value: number) => string
  icon?: React.ComponentType<{ className?: string }>
  description?: string
}

export function SimpleStatCard({
  title,
  value,
  loading = false,
  valueFormatter = formatCompactNumber,
  icon: Icon,
  description,
}: SimpleStatCardProps) {
  if (loading || value === undefined) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          {Icon && <Skeleton className="h-4 w-4" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          {description && <Skeleton className="h-4 w-32" />}
        </CardContent>
      </Card>
    )
  }

  const displayValue = typeof value === 'number' ? valueFormatter(value) : value

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
