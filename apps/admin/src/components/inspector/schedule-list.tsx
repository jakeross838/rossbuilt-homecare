import { Link } from 'react-router-dom'
import { MapPin, Clock, ChevronRight, CheckCircle2, PlayCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useInspectorDaySchedule } from '@/hooks/use-inspector-schedule'
import type { InspectorInspection } from '@/lib/types/inspector'
import { cn } from '@/lib/utils'

interface ScheduleListProps {
  date: string // YYYY-MM-DD
}

export function ScheduleList({ date }: ScheduleListProps) {
  const { data: schedule, isLoading, error } = useInspectorDaySchedule(date)

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-5 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        Failed to load schedule. Please try again.
      </div>
    )
  }

  if (!schedule?.inspections.length) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">No inspections scheduled</p>
        <p className="text-sm mt-1">Enjoy your day off!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>{schedule.inspections.length} inspection{schedule.inspections.length > 1 ? 's' : ''}</span>
        <span>{Math.round(schedule.total_estimated_minutes / 60)}h estimated</span>
      </div>

      {schedule.inspections.map((inspection) => (
        <InspectionCard key={inspection.id} inspection={inspection} />
      ))}
    </div>
  )
}

function InspectionCard({ inspection }: { inspection: InspectorInspection }) {
  const isInProgress = inspection.status === 'in_progress'
  const isCompleted = inspection.status === 'completed'

  return (
    <Link to={`/inspector/inspection/${inspection.id}`}>
      <Card
        className={cn(
          'transition-colors hover:bg-muted/50 active:bg-muted',
          isInProgress && 'border-rb-green ring-1 ring-rb-green/20'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Property name */}
              <h3 className="font-semibold text-base truncate">
                {inspection.property?.name || 'Unknown Property'}
              </h3>

              {/* Address */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">
                  {inspection.property?.city}, {inspection.property?.state}
                </span>
              </div>

              {/* Time and type */}
              <div className="flex items-center gap-3 mt-2">
                {inspection.scheduled_time_start && (
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {formatTime(inspection.scheduled_time_start)}
                    </span>
                  </div>
                )}
                <Badge variant="outline" className="text-xs">
                  {inspection.inspection_type}
                </Badge>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center">
              {isCompleted ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : isInProgress ? (
                <PlayCircle className="h-6 w-6 text-rb-green" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function formatTime(time: string): string {
  // time is in HH:MM:SS format
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}
