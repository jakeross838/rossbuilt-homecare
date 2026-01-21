import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar, FileText, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePortalInspections } from '@/hooks/use-portal-inspections'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }> = {
  scheduled: { label: 'Scheduled', variant: 'secondary' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
}

const conditionColors: Record<string, string> = {
  excellent: 'text-green-600 bg-green-50',
  good: 'text-blue-600 bg-blue-50',
  fair: 'text-yellow-600 bg-yellow-50',
  poor: 'text-orange-600 bg-orange-50',
  critical: 'text-red-600 bg-red-50',
}

export default function PortalInspectionsPage() {
  const { data: inspections, isLoading } = usePortalInspections({ limit: 50 })

  if (isLoading) {
    return <div className="p-4 text-center">Loading inspections...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Inspections</h1>
        <p className="text-muted-foreground">
          View all inspections and reports for your properties
        </p>
      </div>

      {!inspections?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No inspections yet</h3>
            <p className="text-muted-foreground">
              Inspections will appear here once scheduled
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {inspections.map((inspection) => {
            const status = statusConfig[inspection.status] || statusConfig.scheduled
            const condition = inspection.overall_condition

            return (
              <Link
                key={inspection.id}
                to={`/portal/inspections/${inspection.id}`}
                className="block"
              >
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium">
                            {format(new Date(inspection.inspection_date), 'MMM d, yyyy')}
                          </span>
                          <Badge variant={status.variant}>{status.label}</Badge>
                          {condition && (
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${conditionColors[condition] || ''}`}>
                              {condition}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground capitalize mb-2">
                          {inspection.inspection_type.replace('_', ' ')} Inspection
                        </p>

                        {inspection.inspector && (
                          <p className="text-sm text-muted-foreground">
                            Inspector: {inspection.inspector.first_name} {inspection.inspector.last_name}
                          </p>
                        )}

                        {inspection.findings_summary && inspection.findings_summary.total > 0 && (
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-green-600">
                              {inspection.findings_summary.passed} passed
                            </span>
                            {inspection.findings_summary.needs_attention > 0 && (
                              <span className="text-yellow-600">
                                {inspection.findings_summary.needs_attention} needs attention
                              </span>
                            )}
                            {inspection.findings_summary.urgent > 0 && (
                              <span className="text-red-600">
                                {inspection.findings_summary.urgent} urgent
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {inspection.report_url && (
                          <Badge variant="outline" className="gap-1">
                            <FileText className="h-3 w-3" />
                            Report
                          </Badge>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
