'use client'

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CHART_COLORS, CHART_DEFAULTS } from '@/lib/constants/analytics'
import type { CategoryDataPoint } from '@/lib/types/analytics'
import { formatCompactNumber, formatCurrency } from '@/lib/helpers/analytics'

interface BarChartProps {
  title: string
  description?: string
  data: CategoryDataPoint[]
  loading?: boolean
  valueFormatter?: (value: number) => string
  color?: string
  height?: number
  showGrid?: boolean
  horizontal?: boolean
  showLabels?: boolean
}

export function BarChart({
  title,
  description,
  data,
  loading = false,
  valueFormatter = formatCompactNumber,
  color = CHART_COLORS.primary,
  height = 300,
  showGrid = true,
  horizontal = false,
  showLabels: _showLabels = false,
}: BarChartProps) {
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

  // Format category names for display
  const formattedData = data.map((d) => ({
    ...d,
    displayName: d.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
  }))

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
            <RechartsBarChart
              data={formattedData}
              layout={horizontal ? 'vertical' : 'horizontal'}
              margin={{ top: 10, right: 10, left: horizontal ? 80 : 0, bottom: 0 }}
            >
              {showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={!horizontal}
                  vertical={horizontal}
                  stroke="hsl(var(--border))"
                />
              )}
              {horizontal ? (
                <>
                  <XAxis
                    type="number"
                    tickFormatter={valueFormatter}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="displayName"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey="displayName"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tickFormatter={valueFormatter}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                </>
              )}
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const point = payload[0].payload as CategoryDataPoint & { displayName: string }
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <p className="text-sm font-medium">{point.displayName}</p>
                      <p className="text-muted-foreground">{valueFormatter(point.value)}</p>
                    </div>
                  )
                }}
              />
              <Bar
                dataKey="value"
                radius={[CHART_DEFAULTS.barRadius, CHART_DEFAULTS.barRadius, 0, 0]}
                animationDuration={CHART_DEFAULTS.animationDuration}
              >
                {formattedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || color}
                  />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// Horizontal bar chart for ranked data
export function HorizontalBarChart(props: Omit<BarChartProps, 'horizontal'>) {
  return <BarChart {...props} horizontal />
}

// Revenue bar chart with currency formatting
export function RevenueBarChart(props: Omit<BarChartProps, 'valueFormatter'>) {
  return <BarChart {...props} valueFormatter={formatCurrency} />
}
