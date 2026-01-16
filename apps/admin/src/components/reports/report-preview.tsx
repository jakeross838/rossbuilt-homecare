import { format } from 'date-fns'
import {
  FileText,
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
  Calendar,
  User,
  Thermometer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ReportStatusBadge } from './report-status-badge'
import { FindingsSummaryCard } from './findings-summary-card'
import { useBuildReportData } from '@/hooks/use-reports'
import { downloadPDF } from '@/lib/pdf/generate-pdf'
import { CONDITION_LABELS, INSPECTION_TYPE_LABELS } from '@/lib/constants/report'
import type { ReportStatus } from '@/lib/types/report'

interface ReportPreviewProps {
  inspectionId: string
  reportUrl?: string | null
  reportGeneratedAt?: string | null
  reportSentAt?: string | null
  onGenerateClick?: () => void
  className?: string
}

export function ReportPreview({
  inspectionId,
  reportUrl,
  reportGeneratedAt,
  reportSentAt,
  onGenerateClick,
  className,
}: ReportPreviewProps) {
  const { data: reportData, isLoading } = useBuildReportData(inspectionId)

  // Determine report status
  const getStatus = (): ReportStatus => {
    if (!reportUrl) return 'pending'
    if (reportSentAt) return 'sent'
    if (reportGeneratedAt) return 'ready'
    return 'pending'
  }

  const status = getStatus()

  const handleDownload = async () => {
    if (!reportData) return
    await downloadPDF({ report: reportData })
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!reportData) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Unable to load report data</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const conditionInfo = reportData.overall_condition
    ? CONDITION_LABELS[reportData.overall_condition]
    : null

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <CardTitle>Inspection Report</CardTitle>
          <ReportStatusBadge status={status} />
        </div>
        <div className="flex items-center gap-2">
          {reportUrl ? (
            <>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(reportUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={onGenerateClick} className="bg-rb-green hover:bg-rb-green/90">
              <FileText className="h-4 w-4 mr-1" />
              Generate Report
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Inspection Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Date
            </p>
            <p className="font-medium">
              {format(new Date(reportData.inspection_date), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium">
              {INSPECTION_TYPE_LABELS[reportData.inspection_type] || reportData.inspection_type}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Inspector
            </p>
            <p className="font-medium">{reportData.inspector.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">{reportData.duration_minutes} minutes</p>
          </div>
        </div>

        <Separator />

        {/* Overall Condition */}
        {conditionInfo && (
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overall Condition</p>
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: conditionInfo.color + '20',
                  color: conditionInfo.color,
                }}
              >
                {conditionInfo.label}
              </span>
            </div>
            {reportData.weather && (
              <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
                {reportData.weather.temperature && (
                  <span className="flex items-center gap-1">
                    <Thermometer className="h-4 w-4" />
                    {reportData.weather.temperature}°F
                  </span>
                )}
                {reportData.weather.conditions && (
                  <span>{reportData.weather.conditions}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {reportData.summary && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Inspector Summary</p>
            <p className="text-sm">{reportData.summary}</p>
          </div>
        )}

        <Separator />

        {/* Findings Summary */}
        <FindingsSummaryCard summary={reportData.findings_summary} />

        {/* Recommendations count */}
        {reportData.recommendations.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm">
              <strong>{reportData.recommendations.length}</strong> recommendation
              {reportData.recommendations.length > 1 ? 's' : ''} included
            </span>
            <span className="text-sm text-muted-foreground">
              {reportData.recommendations.filter((r) => r.priority === 'urgent').length} urgent
            </span>
          </div>
        )}

        {/* Photo count */}
        {reportData.all_photos.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm">
              <strong>{reportData.all_photos.length}</strong> photo
              {reportData.all_photos.length > 1 ? 's' : ''} documented
            </span>
          </div>
        )}

        {/* Report metadata */}
        {reportGeneratedAt && (
          <div className="text-xs text-muted-foreground">
            Report generated: {format(new Date(reportGeneratedAt), 'MMM d, yyyy h:mm a')}
            {reportSentAt && ` • Sent: ${format(new Date(reportSentAt), 'MMM d, yyyy h:mm a')}`}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
