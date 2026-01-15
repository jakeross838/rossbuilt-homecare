import { useState, useEffect, useCallback } from 'react'
import { addMonths, subMonths, startOfMonth, endOfMonth, format } from 'date-fns'
import { CalendarHeader } from './calendar-header'
import { CalendarGrid } from './calendar-grid'
import type { CalendarInspection } from '@/lib/types/scheduling'

interface CalendarViewProps {
  inspections: CalendarInspection[]
  isLoading?: boolean
  onDayClick?: (date: Date) => void
  onInspectionClick?: (inspection: CalendarInspection) => void
  onDateRangeChange?: (start: string, end: string) => void
}

export function CalendarView({
  inspections,
  isLoading,
  onDayClick,
  onInspectionClick,
  onDateRangeChange,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Notify parent of date range changes for data fetching
  useEffect(() => {
    const start = format(startOfMonth(currentDate), 'yyyy-MM-dd')
    const end = format(endOfMonth(currentDate), 'yyyy-MM-dd')
    onDateRangeChange?.(start, end)
  }, [currentDate, onDateRangeChange])

  const handlePrevMonth = useCallback(() => {
    setCurrentDate((prev) => subMonths(prev, 1))
  }, [])

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => addMonths(prev, 1))
  }, [])

  const handleToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  return (
    <div>
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      {isLoading ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          Loading inspections...
        </div>
      ) : (
        <CalendarGrid
          currentDate={currentDate}
          inspections={inspections}
          onDayClick={onDayClick}
          onInspectionClick={onInspectionClick}
        />
      )}
    </div>
  )
}
