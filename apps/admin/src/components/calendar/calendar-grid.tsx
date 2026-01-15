import { cn } from '@/lib/utils'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from 'date-fns'
import type { CalendarInspection } from '@/lib/types/scheduling'
import { InspectionCard } from './inspection-card'

interface CalendarGridProps {
  currentDate: Date
  inspections: CalendarInspection[]
  onDayClick?: (date: Date) => void
  onInspectionClick?: (inspection: CalendarInspection) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarGrid({
  currentDate,
  inspections,
  onDayClick,
  onInspectionClick,
}: CalendarGridProps) {
  // Get all days to display (includes days from prev/next month to fill grid)
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Group inspections by date
  const inspectionsByDate = new Map<string, CalendarInspection[]>()
  for (const inspection of inspections) {
    const dateKey = inspection.scheduled_date
    const existing = inspectionsByDate.get(dateKey) || []
    existing.push(inspection)
    inspectionsByDate.set(dateKey, existing)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-muted">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayInspections = inspectionsByDate.get(dateKey) || []
          const isCurrentMonth = isSameMonth(day, currentDate)

          return (
            <div
              key={index}
              onClick={() => onDayClick?.(day)}
              className={cn(
                'min-h-[100px] p-1 border-t border-l cursor-pointer',
                'hover:bg-muted/50 transition-colors',
                !isCurrentMonth && 'bg-muted/30'
              )}
            >
              {/* Day number */}
              <div
                className={cn(
                  'text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full',
                  isToday(day) && 'bg-primary text-primary-foreground',
                  !isCurrentMonth && 'text-muted-foreground'
                )}
              >
                {format(day, 'd')}
              </div>

              {/* Inspections */}
              <div className="space-y-1">
                {dayInspections.slice(0, 3).map((inspection) => (
                  <InspectionCard
                    key={inspection.id}
                    inspection={inspection}
                    compact
                    onClick={() => {
                      onInspectionClick?.(inspection)
                    }}
                  />
                ))}
                {dayInspections.length > 3 && (
                  <div className="text-xs text-muted-foreground px-2">
                    +{dayInspections.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
