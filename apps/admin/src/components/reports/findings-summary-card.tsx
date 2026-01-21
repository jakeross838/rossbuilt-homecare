import { CheckCircle, XCircle, AlertTriangle, AlertOctagon, MinusCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ReportFindingSummary } from '@/lib/types/report'

interface FindingsSummaryCardProps {
  summary: ReportFindingSummary
  className?: string
}

export function FindingsSummaryCard({ summary, className }: FindingsSummaryCardProps) {
  const items = [
    {
      label: 'Passed',
      count: summary.passed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Failed',
      count: summary.failed,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Attention',
      count: summary.needs_attention,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Urgent',
      count: summary.urgent,
      icon: AlertOctagon,
      color: 'text-red-700',
      bgColor: 'bg-red-200',
    },
    {
      label: 'N/A',
      count: summary.not_applicable,
      icon: MinusCircle,
      color: 'text-slate-600',
      bgColor: 'bg-slate-200',
    },
  ]

  const issueCount = summary.failed + summary.needs_attention + summary.urgent
  const hasIssues = issueCount > 0

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Findings Summary</CardTitle>
          <span className="text-sm text-muted-foreground">
            {summary.completion_percentage}% complete
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
                hasIssues ? 'bg-yellow-500' : 'bg-green-500'
              )}
              style={{ width: `${summary.completion_percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.total_items} items inspected
          </p>
        </div>

        {/* Status counts */}
        <div className="grid grid-cols-5 gap-2">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex flex-col items-center p-2 rounded-lg"
              >
                <div className={cn('p-1.5 rounded-full mb-1', item.bgColor)}>
                  <Icon className={cn('h-4 w-4', item.color)} />
                </div>
                <span className="text-lg font-semibold">{item.count}</span>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            )
          })}
        </div>

        {/* Issue alert */}
        {hasIssues && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>{issueCount} issue{issueCount > 1 ? 's' : ''}</strong> found
              requiring attention
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact version for tables/lists
export function FindingsSummaryInline({ summary }: { summary: ReportFindingSummary }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-green-600">
        <CheckCircle className="h-3.5 w-3.5 inline mr-1" />
        {summary.passed}
      </span>
      {summary.failed > 0 && (
        <span className="text-red-600">
          <XCircle className="h-3.5 w-3.5 inline mr-1" />
          {summary.failed}
        </span>
      )}
      {summary.needs_attention > 0 && (
        <span className="text-yellow-600">
          <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
          {summary.needs_attention}
        </span>
      )}
      {summary.urgent > 0 && (
        <span className="text-red-700 font-medium">
          <AlertOctagon className="h-3.5 w-3.5 inline mr-1" />
          {summary.urgent}
        </span>
      )}
    </div>
  )
}
