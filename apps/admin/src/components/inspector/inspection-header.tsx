import { ArrowLeft, MapPin, Phone, Clock, Wifi, WifiOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { InspectorInspection } from '@/lib/types/inspector'
import { calculateInspectionProgress } from '@/hooks/use-inspection-execution'
import { useOfflineStatus } from '@/hooks/use-offline'

interface InspectionHeaderProps {
  inspection: InspectorInspection
}

export function InspectionHeader({ inspection }: InspectionHeaderProps) {
  const navigate = useNavigate()
  const { isOnline } = useOfflineStatus()
  const progress = calculateInspectionProgress(inspection)

  return (
    <div className="bg-background border-b sticky top-0 z-10">
      {/* Top bar with back button and status */}
      <div className="flex items-center justify-between p-3 border-b">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => navigate('/inspections')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          {/* Offline indicator */}
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-300">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}

          {/* Status badge */}
          <Badge
            variant={inspection.status === 'in_progress' ? 'default' : 'secondary'}
            className={inspection.status === 'in_progress' ? 'bg-rb-green' : ''}
          >
            {inspection.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
          </Badge>
        </div>
      </div>

      {/* Property info */}
      <div className="p-4">
        <h1 className="font-semibold text-lg">
          {inspection.property?.name || 'Inspection'}
        </h1>

        {inspection.property && (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              {inspection.property.address_line1}
              {inspection.property.address_line2 && `, ${inspection.property.address_line2}`}
              <br />
              {inspection.property.city}, {inspection.property.state} {inspection.property.zip}
            </span>
          </div>
        )}

        {/* Client contact */}
        {inspection.client?.phone && (
          <a
            href={`tel:${inspection.client.phone}`}
            className="flex items-center gap-1.5 text-sm text-rb-green mt-2"
          >
            <Phone className="h-4 w-4" />
            {inspection.client.first_name} {inspection.client.last_name}: {inspection.client.phone}
          </a>
        )}

        {/* Time info */}
        {inspection.scheduled_time_start && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
            <Clock className="h-4 w-4" />
            Scheduled: {formatTime(inspection.scheduled_time_start)}
            {inspection.estimated_duration_minutes && (
              <span>({inspection.estimated_duration_minutes} min)</span>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {inspection.status === 'in_progress' && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {progress.completed} / {progress.total} items ({progress.percentage}%)
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>
      )}
    </div>
  )
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}
