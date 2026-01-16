'use client'

import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CHART_COLORS, CHART_DEFAULTS } from '@/lib/constants/analytics'
import type { CategoryDataPoint } from '@/lib/types/analytics'
import { formatCompactNumber } from '@/lib/helpers/analytics'

// Default color palette for pie charts
const DEFAULT_PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.accent,
  CHART_COLORS.secondary,
  CHART_COLORS.info,
  CHART_COLORS.warning,
  CHART_COLORS.success,
  CHART_COLORS.muted,
  CHART_COLORS.danger,
]

interface PieChartProps {
  title: string
  description?: string
  data: CategoryDataPoint[]
  loading?: boolean
  valueFormatter?: (value: number) => string
  height?: number
  donut?: boolean
  showLegend?: boolean
  showLabels?: boolean
}

export function PieChart({
  title,
  description,
  data,
  loading = false,
  valueFormatter = formatCompactNumber,
  height = 300,
  donut = false,
  showLegend = true,
  showLabels = false,
}: PieChartProps) {
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

  const isEmpty = !data || data.length === 0 || data.every((d) => d.value === 0)

  // Format names and assign colors
  const formattedData = data.map((d, i) => ({
    ...d,
    displayName: d.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    fill: d.color || DEFAULT_PIE_COLORS[i % DEFAULT_PIE_COLORS.length],
  }))

  const total = data.reduce((sum, d) => sum + d.value, 0)

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
            <RechartsPieChart>
              <Pie
                data={formattedData}
                dataKey="value"
                nameKey="displayName"
                cx="50%"
                cy="50%"
                innerRadius={donut ? '60%' : 0}
                outerRadius="80%"
                paddingAngle={2}
                animationDuration={CHART_DEFAULTS.animationDuration}
                label={
                  showLabels
                    ? ({ displayName, value }) =>
                        `${displayName}: ${valueFormatter(value)}`
                    : undefined
                }
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const point = payload[0].payload as CategoryDataPoint & {
                    displayName: string
                    fill: string
                  }
                  const percentage = ((point.value / total) * 100).toFixed(1)
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: point.fill }}
                        />
                        <p className="text-sm font-medium">{point.displayName}</p>
                      </div>
                      <p className="text-muted-foreground">
                        {valueFormatter(point.value)} ({percentage}%)
                      </p>
                    </div>
                  )
                }}
              />
              {showLegend && (
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  formatter={(value) => (
                    <span className="text-sm text-foreground">{value}</span>
                  )}
                />
              )}
            </RechartsPieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// Donut chart variant
export function DonutChart(props: Omit<PieChartProps, 'donut'>) {
  return <PieChart {...props} donut />
}
