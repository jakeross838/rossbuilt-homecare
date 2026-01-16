import { Link } from 'react-router-dom'
import {
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  formatCondition,
  formatInspectionTier,
  formatRelativeDate,
} from '@/lib/helpers/portal'
import type { PortalInspection } from '@/lib/types/portal'

interface InspectionCardProps {
  inspection: PortalInspection
  showProperty?: boolean
}

export function InspectionCard({ inspection }: InspectionCardProps) {
  const condition = formatCondition(inspection.overall_condition)
  const isCompleted = inspection.status === 'completed'
  const isScheduled = inspection.status === 'scheduled'

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={isCompleted ? 'default' : 'secondary'}>
                {isCompleted ? 'Completed' : isScheduled ? 'Scheduled' : 'In Progress'}
              </Badge>
              <Badge variant="outline">
                {formatInspectionTier(inspection.inspection_type)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Calendar className="h-4 w-4" />
              <span>{formatRelativeDate(inspection.inspection_date)}</span>
            </div>
          </div>
          {isCompleted && inspection.report_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={inspection.report_url} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-1" />
                View Report
              </a>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Condition & Inspector */}
        {isCompleted && (
          <div className="flex items-center justify-between text-sm mb-4">
            <span className={cn('font-medium', condition.color)}>
              {condition.label}
            </span>
            {inspection.inspector && (
              <span className="text-gray-500 flex items-center gap-1">
                <User className="h-4 w-4" />
                {inspection.inspector.first_name} {inspection.inspector.last_name}
              </span>
            )}
          </div>
        )}

        {/* Findings Summary */}
        {isCompleted && inspection.findings_summary.total > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>{inspection.findings_summary.passed} passed</span>
            </div>
            {inspection.findings_summary.needs_attention > 0 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span>{inspection.findings_summary.needs_attention} attention</span>
              </div>
            )}
            {inspection.findings_summary.urgent > 0 && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span>{inspection.findings_summary.urgent} urgent</span>
              </div>
            )}
          </div>
        )}

        {/* Summary Text */}
        {inspection.summary && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
            {inspection.summary}
          </p>
        )}

        {/* View Details Link */}
        <Link
          to={`/portal/inspections/${inspection.id}`}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-3"
        >
          View details
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}
