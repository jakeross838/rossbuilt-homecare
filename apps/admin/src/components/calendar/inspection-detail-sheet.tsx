import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Calendar, Clock, MapPin, Play, ClipboardList, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useInspectors } from '@/hooks/use-inspectors'
import { useAssignInspector, useCancelInspection } from '@/hooks/use-inspections'
import type { CalendarInspection } from '@/lib/types/scheduling'
import { INSPECTION_STATUS_COLORS, INSPECTION_TYPES } from '@/lib/constants/scheduling'

interface InspectionDetailSheetProps {
  inspection: CalendarInspection | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Map inspection status to Badge variant
function getStatusBadgeVariant(status: string | null): 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive' | 'outline' {
  switch (status) {
    case 'scheduled':
      return 'info'
    case 'in_progress':
      return 'warning'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'secondary'
    case 'rescheduled':
      return 'warning'
    default:
      return 'default'
  }
}

export function InspectionDetailSheet({
  inspection,
  open,
  onOpenChange,
}: InspectionDetailSheetProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: inspectors } = useInspectors()
  const assignInspector = useAssignInspector()
  const cancelInspection = useCancelInspection()

  if (!inspection) return null

  const statusConfig = INSPECTION_STATUS_COLORS[inspection.status || 'scheduled']
  const typeInfo = INSPECTION_TYPES[inspection.inspection_type as keyof typeof INSPECTION_TYPES]

  const handleAssignInspector = async (inspectorId: string) => {
    try {
      await assignInspector.mutateAsync({
        inspectionId: inspection.id,
        inspectorId: inspectorId && inspectorId !== 'unassigned' ? inspectorId : null,
      })
      toast({
        title: 'Inspector assigned',
        description: inspectorId
          ? 'Inspector has been assigned to this inspection.'
          : 'Inspector has been unassigned.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to assign inspector. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = async () => {
    try {
      await cancelInspection.mutateAsync(inspection.id)
      toast({
        title: 'Inspection cancelled',
        description: 'The inspection has been cancelled.',
      })
      onOpenChange(false)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to cancel inspection. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const isCancellable = inspection.status === 'scheduled' || inspection.status === 'rescheduled'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle>{inspection.property?.name || 'Inspection'}</SheetTitle>
              <SheetDescription>
                {typeInfo?.label || inspection.inspection_type} Inspection
              </SheetDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(inspection.status)}>
              {statusConfig?.label || inspection.status || 'scheduled'}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Details */}
          <div className="space-y-4">
            <h3 className="font-medium">Details</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(inspection.scheduled_date), 'EEEE, MMMM d, yyyy')}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {inspection.scheduled_time_start?.slice(0, 5) || 'Time TBD'}
                  {inspection.scheduled_time_end && ` - ${inspection.scheduled_time_end.slice(0, 5)}`}
                  {inspection.estimated_duration_minutes && (
                    <span className="text-muted-foreground">
                      {' '}({inspection.estimated_duration_minutes} min)
                    </span>
                  )}
                </span>
              </div>

              {inspection.property && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div>{inspection.property.address_line1}</div>
                    <div className="text-muted-foreground">{inspection.property.city}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inspector Assignment */}
          <div className="space-y-3">
            <h3 className="font-medium">Inspector</h3>
            <Select
              value={inspection.inspector_id || 'unassigned'}
              onValueChange={handleAssignInspector}
              disabled={assignInspector.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assign inspector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {inspectors?.map((inspector) => (
                  <SelectItem key={inspector.id} value={inspector.id}>
                    {inspector.first_name && inspector.last_name
                      ? `${inspector.first_name} ${inspector.last_name}`
                      : inspector.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start/Continue Inspection */}
          <div className="space-y-3 pt-4 border-t">
            {inspection.status === 'scheduled' && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  onOpenChange(false)
                  navigate(`/inspector/inspection/${inspection.id}`)
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Inspection
              </Button>
            )}
            {inspection.status === 'in_progress' && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  onOpenChange(false)
                  navigate(`/inspector/inspection/${inspection.id}`)
                }}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Continue Inspection
              </Button>
            )}
            {inspection.status === 'completed' && (
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={() => {
                  onOpenChange(false)
                  navigate(`/inspections/${inspection.id}/report`)
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                View Report
              </Button>
            )}
          </div>

          {/* Other Actions */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-medium">Other Actions</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // TODO: Open reschedule dialog
                  toast({ title: 'Coming soon', description: 'Reschedule functionality' })
                }}
                disabled={!isCancellable}
              >
                Reschedule
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={!isCancellable || cancelInspection.isPending}
                  >
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Inspection?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel the scheduled inspection. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Inspection</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel}>
                      Cancel Inspection
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
