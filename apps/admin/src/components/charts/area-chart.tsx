'use client'

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CHART_COLORS, CHART_DEFAULTS } from '@/lib/constants/analytics'
import type { TimeSeriesDataPoint, TimePeriod } from '@/lib/types/analytics'
import { formatChartDate, formatCompactNumber, formatCurrency } from '@/lib/helpers/analytics'

interface AreaChartProps {
  title: string
  description?: string
  data: TimeSeriesDataPoint[]
  period?: TimePeriod
  loading?: boolean
  valueFormatter?: (value: number) => string
  color?: string
  height?: number
  showGrid?: boolean
  gradient?: boolean
}

export function AreaChart({
  title,
  description,
  data,
  period = 'month',
  loading = false,
  valueFormatter = formatCompactNumber,
  color = CHART_COLORS.primary,
  height = 300,
  showGrid = true,
  gradient = true,
}: AreaChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height }} />
        </CardContent>
      </Card>
    )
  }

  const isEmpty = !data || data.length === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div
            className="flex items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsAreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              {gradient && (
                <defs>
                  <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
              )}
              {showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
              )}
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatChartDate(value, period)}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={valueFormatter}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const point = payload[0].payload as TimeSeriesDataPoint
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <p className="text-sm text-muted-foreground">
                        {formatChartDate(point.date, period)}
                      </p>
                      <p className="font-medium">{valueFormatter(point.value)}</p>
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={CHART_DEFAULTS.strokeWidth}
                fill={gradient ? `url(#gradient-${title.replace(/\s/g, '')})` : color}
                fillOpacity={gradient ? 1 : 0.1}
                animationDuration={CHART_DEFAULTS.animationDuration}
              />
            </RechartsAreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// Convenience component for currency charts
export function RevenueAreaChart(props: Omit<AreaChartProps, 'valueFormatter'>) {
  return <AreaChart {...props} valueFormatter={formatCurrency} />
}
