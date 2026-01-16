import { useState, useCallback } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { CalendarView } from '@/components/calendar'
import { ScheduleInspectionDialog } from '@/components/calendar/schedule-inspection-dialog'
import { InspectionDetailSheet } from '@/components/calendar/inspection-detail-sheet'
import { useCalendarInspections } from '@/hooks/use-inspections'
import type { CalendarInspection } from '@/lib/types/scheduling'

export default function CalendarPage() {
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date()
    return {
      start: format(startOfMonth(now), 'yyyy-MM-dd'),
      end: format(endOfMonth(now), 'yyyy-MM-dd'),
    }
  })

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedInspection, setSelectedInspection] = useState<CalendarInspection | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)

  const { data: inspections, isLoading, refetch } = useCalendarInspections(
    dateRange.start,
    dateRange.end
  )

  // Refetch calendar when inspection is created
  const handleInspectionCreated = useCallback(() => {
    refetch()
  }, [refetch])

  const handleDateRangeChange = useCallback((start: string, end: string) => {
    setDateRange({ start, end })
  }, [])

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setScheduleDialogOpen(true)
  }

  const handleInspectionClick = (inspection: CalendarInspection) => {
    setSelectedInspection(inspection)
    setDetailSheetOpen(true)
  }

  const handleScheduleNew = () => {
    setSelectedDate(undefined)
    setScheduleDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="View and manage scheduled inspections"
      >
        <Button onClick={handleScheduleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Inspection
        </Button>
      </PageHeader>

      <CalendarView
        inspections={inspections || []}
        isLoading={isLoading}
        onDayClick={handleDayClick}
        onInspectionClick={handleInspectionClick}
        onDateRangeChange={handleDateRangeChange}
      />

      <ScheduleInspectionDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        initialDate={selectedDate}
        onSuccess={handleInspectionCreated}
      />

      <InspectionDetailSheet
        inspection={selectedInspection}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />
    </div>
  )
}
