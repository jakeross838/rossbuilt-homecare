import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  FileText,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ReportStatusDot } from '@/components/reports/report-status-badge'
import { FindingsSummaryInline } from '@/components/reports/findings-summary-card'
import { GenerateReportDialog } from '@/components/reports/generate-report-dialog'
import { supabase } from '@/lib/supabase'
import { INSPECTION_TYPE_LABELS, CONDITION_LABELS } from '@/lib/constants/report'
import type { ReportStatus, ReportFindingSummary } from '@/lib/types/report'
import type { ChecklistItemFinding } from '@/lib/types/inspector'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'cancelled', label: 'Cancelled' },
]

interface InspectionListItem {
  id: string
  status: string
  inspection_type: string
  scheduled_date: string
  scheduled_time_start: string | null
  overall_condition: string | null
  findings: Record<string, ChecklistItemFinding> | null
  report_url: string | null
  report_generated_at: string | null
  report_sent_at: string | null
  property: {
    id: string
    name: string
    city: string
    state: string
    client: {
      first_name: string
      last_name: string
    } | null
  } | null
}

function useInspectionsList(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['inspections-list', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id,
          status,
          inspection_type,
          scheduled_date,
          scheduled_time_start,
          overall_condition,
          findings,
          report_url,
          report_generated_at,
          report_sent_at,
          property:properties(
            id,
            name,
            city,
            state,
            client:clients(first_name, last_name)
          )
        `)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .order('scheduled_date', { ascending: false })

      if (error) throw error
      // Filter out inspections with missing property data
      return (data || []).filter((row) => row.id && row.property) as InspectionListItem[]
    },
    enabled: !!startDate && !!endDate,
  })
}

export default function InspectionsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  // Get inspections from last 30 days to 7 days ahead
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 7)

  const { data: inspections, isLoading } = useInspectionsList(
    format(startDate, 'yyyy-MM-dd'),
    format(endDate, 'yyyy-MM-dd')
  )

  // Filter inspections
  const filteredInspections = (inspections || []).filter((inspection) => {
    // Status filter
    if (statusFilter !== 'all' && inspection.status !== statusFilter) {
      return false
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      const propertyName = inspection.property?.name?.toLowerCase() || ''
      const clientName = inspection.property?.client
        ? `${inspection.property.client.first_name} ${inspection.property.client.last_name}`.toLowerCase()
        : ''
      return propertyName.includes(searchLower) || clientName.includes(searchLower)
    }

    return true
  })

  // Sort by date (newest first)
  const sortedInspections = [...filteredInspections].sort(
    (a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
  )

  const getReportStatus = (inspection: InspectionListItem): ReportStatus => {
    if (!inspection.report_url) return 'pending'
    if (inspection.report_sent_at) return 'sent'
    if (inspection.report_generated_at) return 'ready'
    return 'pending'
  }

  const calculateFindingsSummary = (
    findings: Record<string, ChecklistItemFinding> | null
  ): ReportFindingSummary | null => {
    if (!findings) return null

    const summary: ReportFindingSummary = {
      total_items: 0,
      passed: 0,
      failed: 0,
      needs_attention: 0,
      urgent: 0,
      not_applicable: 0,
      completion_percentage: 0,
    }

    for (const finding of Object.values(findings)) {
      summary.total_items++
      switch (finding.status) {
        case 'pass':
          summary.passed++
          break
        case 'fail':
          summary.failed++
          break
        case 'needs_attention':
          summary.needs_attention++
          break
        case 'urgent':
          summary.urgent++
          break
        case 'na':
          summary.not_applicable++
          break
      }
    }

    summary.completion_percentage =
      summary.total_items > 0 ? Math.round((summary.total_items / summary.total_items) * 100) : 0

    return summary
  }

  const handleGenerateReport = (inspectionId: string) => {
    setSelectedInspectionId(inspectionId)
    setShowGenerateDialog(true)
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Inspections</h1>
          <p className="text-muted-foreground">
            View and manage inspection reports
          </p>
        </div>
        <Button onClick={() => navigate('/calendar')}>
          <Calendar className="h-4 w-4 mr-2" />
          Calendar View
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by property or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Inspections Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Findings</TableHead>
              <TableHead>Report</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading inspections...
                </TableCell>
              </TableRow>
            ) : sortedInspections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No inspections found
                </TableCell>
              </TableRow>
            ) : (
              sortedInspections.map((inspection) => {
                const reportStatus = getReportStatus(inspection)
                const findingsSummary = calculateFindingsSummary(
                  inspection.findings as Record<string, ChecklistItemFinding> | null
                )
                const conditionInfo = inspection.overall_condition
                  ? CONDITION_LABELS[inspection.overall_condition]
                  : null

                return (
                  <TableRow
                    key={inspection.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/inspections/${inspection.id}/report`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {format(new Date(inspection.scheduled_date), 'MMM d, yyyy')}
                          </div>
                          {inspection.scheduled_time_start && (
                            <div className="text-xs text-muted-foreground">
                              {inspection.scheduled_time_start}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{inspection.property?.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {inspection.property?.city}, {inspection.property?.state}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {INSPECTION_TYPE_LABELS[inspection.inspection_type] ||
                          inspection.inspection_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            inspection.status === 'completed'
                              ? 'success'
                              : inspection.status === 'in_progress'
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {inspection.status}
                        </Badge>
                        {conditionInfo && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: conditionInfo.color + '20',
                              color: conditionInfo.color,
                            }}
                          >
                            {conditionInfo.label}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {findingsSummary ? (
                        <FindingsSummaryInline summary={findingsSummary} />
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ReportStatusDot status={reportStatus} />
                        {reportStatus === 'pending' && inspection.status === 'completed' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleGenerateReport(inspection.id)
                            }}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Generate
                          </Button>
                        ) : (
                          <span className="text-sm capitalize">{reportStatus}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Generate Report Dialog */}
      {selectedInspectionId && (
        <GenerateReportDialog
          inspectionId={selectedInspectionId}
          open={showGenerateDialog}
          onOpenChange={setShowGenerateDialog}
        />
      )}
    </div>
  )
}
