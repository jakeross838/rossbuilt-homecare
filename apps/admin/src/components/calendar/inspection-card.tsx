import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, User } from 'lucide-react'
import type { CalendarInspection } from '@/lib/types/scheduling'
import { INSPECTION_STATUS_COLORS, INSPECTION_TYPES } from '@/lib/constants/scheduling'

interface InspectionCardProps {
  inspection: CalendarInspection
  onClick?: () => void
  compact?: boolean
}

export function InspectionCard({ inspection, onClick, compact = false }: InspectionCardProps) {
  const statusKey = inspection.status || 'scheduled'
  const statusColor = INSPECTION_STATUS_COLORS[statusKey]
  const typeInfo = INSPECTION_TYPES[inspection.inspection_type as keyof typeof INSPECTION_TYPES]

  // Map status to badge variant
  const getBadgeVariant = (status: string): 'success' | 'warning' | 'info' | 'secondary' | 'outline' => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'in_progress':
        return 'warning'
      case 'scheduled':
        return 'info'
      case 'cancelled':
      case 'rescheduled':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (compact) {
    // Compact view for month calendar cells
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left px-2 py-1 rounded text-xs truncate',
          'hover:opacity-80 transition-opacity',
          statusColor?.bgColor || 'bg-blue-100',
          statusColor?.textColor || 'text-blue-700'
        )}
      >
        <span className="font-medium">{inspection.scheduled_time_start?.slice(0, 5) || 'TBD'}</span>
        {' '}
        <span className="truncate">{inspection.property?.name || 'Unknown property'}</span>
      </button>
    )
  }

  // Full card view for day/week views or detail panels
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3 rounded-lg border cursor-pointer',
        'hover:shadow-md transition-shadow',
        'bg-card'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm truncate">
          {inspection.property?.name || 'Unknown property'}
        </h4>
        <Badge variant={getBadgeVariant(statusKey)} className="shrink-0">
          {statusColor?.label || 'Scheduled'}
        </Badge>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        {inspection.property?.address_line1 && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {inspection.property.address_line1}, {inspection.property.city}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            {inspection.scheduled_time_start?.slice(0, 5) || 'Time TBD'}
            {inspection.scheduled_time_end && ` - ${inspection.scheduled_time_end.slice(0, 5)}`}
          </span>
        </div>

        {inspection.inspector && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>
              {inspection.inspector.first_name && inspection.inspector.last_name
                ? `${inspection.inspector.first_name} ${inspection.inspector.last_name}`
                : inspection.inspector.email}
            </span>
          </div>
        )}
      </div>

      {typeInfo && (
        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            {typeInfo.label}
          </Badge>
        </div>
      )}
    </div>
  )
}
