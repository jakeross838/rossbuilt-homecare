import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ArrowLeft,
  FileText,
  Download,
  ExternalLink,
  Loader2,
  MapPin,
  Calendar,
  User,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReportStatusBadge } from '@/components/reports/report-status-badge'
import { FindingsSummaryCard } from '@/components/reports/findings-summary-card'
import { GenerateReportDialog } from '@/components/reports/generate-report-dialog'
import { useBuildReportData, useInspectionForReport } from '@/hooks/use-reports'
import { downloadPDF } from '@/lib/pdf/generate-pdf'
import {
  CONDITION_LABELS,
  INSPECTION_TYPE_LABELS,
  FINDING_STATUS_COLORS,
  PRIORITY_COLORS,
} from '@/lib/constants/report'
import type { ReportStatus } from '@/lib/types/report'

export default function InspectionReportPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  const { data: rawData, isLoading: isLoadingRaw } = useInspectionForReport(id)
  const { data: reportData, isLoading } = useBuildReportData(id)

  if (isLoading || isLoadingRaw) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!reportData || !rawData) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Inspection Not Found</p>
          <p className="text-muted-foreground mb-4">
            The inspection you are looking for does not exist.
          </p>
          <Button onClick={() => navigate('/inspections')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inspections
          </Button>
        </div>
      </div>
    )
  }

  const inspection = rawData.inspection as {
    id: string
    status: string
    report_url: string | null
    report_generated_at: string | null
    report_sent_at: string | null
  }

  const getReportStatus = (): ReportStatus => {
    if (!inspection.report_url) return 'pending'
    if (inspection.report_sent_at) return 'sent'
    if (inspection.report_generated_at) return 'ready'
    return 'pending'
  }

  const reportStatus = getReportStatus()
  const conditionInfo = reportData.overall_condition
    ? CONDITION_LABELS[reportData.overall_condition]
    : null

  const handleDownload = async () => {
    await downloadPDF({ report: reportData })
  }

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/inspections')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{reportData.property.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {reportData.property.address}, {reportData.property.city},{' '}
              {reportData.property.state} {reportData.property.zip}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ReportStatusBadge status={reportStatus} />
          {reportStatus === 'pending' && inspection.status === 'completed' ? (
            <Button
              onClick={() => setShowGenerateDialog(true)}
              className="bg-rb-green hover:bg-rb-green/90"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          ) : inspection.report_url ? (
            <>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(inspection.report_url!, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Online
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inspection Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Inspection Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Date
                  </p>
                  <p className="font-medium">
                    {format(new Date(reportData.inspection_date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <Badge variant="outline">
                    {INSPECTION_TYPE_LABELS[reportData.inspection_type] ||
                      reportData.inspection_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                    <User className="h-3.5 w-3.5" />
                    Inspector
                  </p>
                  <p className="font-medium">{reportData.inspector.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    Duration
                  </p>
                  <p className="font-medium">{reportData.duration_minutes} minutes</p>
                </div>
              </div>

              {conditionInfo && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Overall Condition</p>
                    <span
                      className="inline-flex items-center px-4 py-2 rounded-full text-lg font-medium"
                      style={{
                        backgroundColor: conditionInfo.color + '20',
                        color: conditionInfo.color,
                      }}
                    >
                      {conditionInfo.label}
                    </span>
                  </div>
                </>
              )}

              {reportData.summary && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Inspector Summary</p>
                    <p className="text-sm leading-relaxed">{reportData.summary}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Findings Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  {reportData.recommendations.length > 0 && (
                    <TabsTrigger value="recommendations">
                      Recommendations ({reportData.recommendations.length})
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="summary" className="pt-4">
                  <FindingsSummaryCard summary={reportData.findings_summary} />
                </TabsContent>

                <TabsContent value="details" className="pt-4">
                  <div className="space-y-4">
                    {reportData.sections.map((section, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{section.section_name}</h4>
                          <span className="text-sm text-muted-foreground">
                            {section.summary.passed}/{section.summary.total} passed
                          </span>
                        </div>
                        <div className="space-y-2">
                          {section.items
                            .filter((item) =>
                              ['fail', 'needs_attention', 'urgent'].includes(item.status)
                            )
                            .map((item, j) => {
                              const statusInfo = FINDING_STATUS_COLORS[item.status]
                              return (
                                <div
                                  key={j}
                                  className="flex items-start gap-3 p-2 bg-muted/50 rounded"
                                >
                                  <Badge
                                    style={{
                                      backgroundColor: statusInfo.bg,
                                      color: statusInfo.text,
                                    }}
                                  >
                                    {statusInfo.label}
                                  </Badge>
                                  <div>
                                    <p className="text-sm font-medium">{item.label}</p>
                                    {item.notes && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {item.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          {section.summary.issues === 0 && (
                            <p className="text-sm text-green-600 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              All items passed
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {reportData.recommendations.length > 0 && (
                  <TabsContent value="recommendations" className="pt-4">
                    <div className="space-y-4">
                      {reportData.recommendations.map((rec, i) => {
                        const priorityInfo = PRIORITY_COLORS[rec.priority]
                        return (
                          <div key={i} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium">{rec.title}</h4>
                              <Badge
                                style={{
                                  backgroundColor: priorityInfo.bg,
                                  color: priorityInfo.text,
                                }}
                              >
                                {priorityInfo.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {rec.description}
                            </p>
                            {rec.ai_why_it_matters && (
                              <div className="bg-muted/50 p-3 rounded text-sm">
                                <p className="font-medium mb-1">Why This Matters</p>
                                <p className="text-muted-foreground">
                                  {rec.ai_why_it_matters}
                                </p>
                              </div>
                            )}
                            {(rec.estimated_cost_low || rec.estimated_cost_high) && (
                              <p className="text-sm mt-3">
                                <span className="text-muted-foreground">Estimated Cost: </span>
                                <span className="font-medium">
                                  ${rec.estimated_cost_low?.toLocaleString() || '?'} - $
                                  {rec.estimated_cost_high?.toLocaleString() || '?'}
                                </span>
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{reportData.client.name}</p>
              {reportData.client.email && (
                <p className="text-sm text-muted-foreground">{reportData.client.email}</p>
              )}
              {reportData.client.phone && (
                <p className="text-sm text-muted-foreground">{reportData.client.phone}</p>
              )}
            </CardContent>
          </Card>

          {/* Weather */}
          {reportData.weather && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weather Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {reportData.weather.temperature !== undefined && (
                    <div>
                      <p className="text-2xl font-semibold">
                        {reportData.weather.temperature}F
                      </p>
                      <p className="text-xs text-muted-foreground">Temperature</p>
                    </div>
                  )}
                  {reportData.weather.humidity !== undefined && (
                    <div>
                      <p className="text-2xl font-semibold">{reportData.weather.humidity}%</p>
                      <p className="text-xs text-muted-foreground">Humidity</p>
                    </div>
                  )}
                </div>
                {reportData.weather.conditions && (
                  <p className="text-sm mt-3">{reportData.weather.conditions}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          {reportData.all_photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Photos ({reportData.all_photos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {reportData.all_photos.slice(0, 4).map((photo, i) => (
                    <img
                      key={i}
                      src={photo.url}
                      alt={photo.caption || `Photo ${i + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
                {reportData.all_photos.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    +{reportData.all_photos.length - 4} more photos
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Report Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Generated</span>
                {inspection.report_generated_at ? (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {format(new Date(inspection.report_generated_at), 'MMM d, h:mm a')}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Not yet</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sent to Client</span>
                {inspection.report_sent_at ? (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {format(new Date(inspection.report_sent_at), 'MMM d, h:mm a')}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Not yet</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generate Report Dialog */}
      <GenerateReportDialog
        inspectionId={id!}
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
      />
    </div>
  )
}
