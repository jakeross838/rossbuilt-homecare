import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { PortalInspection } from '@/lib/types/portal'

interface PortalCalendarProps {
  inspections: PortalInspection[]
  isLoading?: boolean
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-400',
}

const statusLabels: Record<string, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function PortalCalendar({ inspections, isLoading }: PortalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDaySheet, setShowDaySheet] = useState(false)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getInspectionsForDay = (date: Date) => {
    return inspections.filter((inspection) =>
      isSameDay(new Date(inspection.inspection_date), date)
    )
  }

  const selectedDayInspections = selectedDate
    ? getInspectionsForDay(selectedDate)
    : []

  const handleDayClick = (date: Date) => {
    const dayInspections = getInspectionsForDay(date)
    if (dayInspections.length > 0) {
      setSelectedDate(date)
      setShowDaySheet(true)
    }
  }

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayInspections = getInspectionsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const hasInspections = dayInspections.length > 0

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(day)}
                className={cn(
                  'min-h-[80px] p-2 border-b border-r transition-colors',
                  !isCurrentMonth && 'bg-gray-50 text-gray-400',
                  hasInspections && 'cursor-pointer hover:bg-gray-50',
                  isToday(day) && 'bg-blue-50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isToday(day) &&
                        'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Inspection Dots */}
                <div className="mt-1 space-y-1">
                  {dayInspections.slice(0, 2).map((inspection) => (
                    <div
                      key={inspection.id}
                      className={cn(
                        'text-xs px-1.5 py-0.5 rounded truncate text-white',
                        statusColors[inspection.status] || 'bg-gray-400'
                      )}
                    >
                      {inspection.inspection_type}
                    </div>
                  ))}
                  {dayInspections.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{dayInspections.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-sm">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded', color)} />
            <span className="text-gray-600">{statusLabels[status]}</span>
          </div>
        ))}
      </div>

      {/* Day Detail Sheet */}
      <Sheet open={showDaySheet} onOpenChange={setShowDaySheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {selectedDayInspections.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No inspections on this day
              </p>
            ) : (
              selectedDayInspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium capitalize">
                        {inspection.inspection_type} Inspection
                      </h4>
                      {inspection.inspector && (
                        <p className="text-sm text-gray-500">
                          Inspector: {inspection.inspector.first_name}{' '}
                          {inspection.inspector.last_name}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={cn(
                        'text-white',
                        statusColors[inspection.status]
                      )}
                    >
                      {statusLabels[inspection.status]}
                    </Badge>
                  </div>

                  {inspection.overall_condition && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Condition:</span>
                      <Badge variant="outline" className="capitalize">
                        {inspection.overall_condition}
                      </Badge>
                    </div>
                  )}

                  {inspection.findings_summary &&
                    inspection.findings_summary.total > 0 && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Findings: </span>
                        {inspection.findings_summary.passed} passed,{' '}
                        {inspection.findings_summary.needs_attention} need attention
                        {inspection.findings_summary.urgent > 0 && (
                          <span className="text-red-600">
                            , {inspection.findings_summary.urgent} urgent
                          </span>
                        )}
                      </div>
                    )}

                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to={`/portal/inspections/${inspection.id}`}>
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
