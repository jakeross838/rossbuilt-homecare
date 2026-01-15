import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useProperties } from '@/hooks/use-properties'
import { useInspectors } from '@/hooks/use-inspectors'
import { useScheduleInspection } from '@/hooks/use-inspections'
import {
  scheduleInspectionSchema,
  type ScheduleInspectionInput,
} from '@/lib/validations/inspection'
import { INSPECTION_TYPES_LIST } from '@/lib/constants/scheduling'
import type { Resolver } from 'react-hook-form'

interface ScheduleInspectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDate?: Date
}

export function ScheduleInspectionDialog({
  open,
  onOpenChange,
  initialDate,
}: ScheduleInspectionDialogProps) {
  const { toast } = useToast()
  const { data: properties, isLoading: loadingProperties } = useProperties()
  const { data: inspectors, isLoading: loadingInspectors } = useInspectors()
  const scheduleInspection = useScheduleInspection()

  const form = useForm<ScheduleInspectionInput>({
    resolver: zodResolver(scheduleInspectionSchema) as Resolver<ScheduleInspectionInput>,
    defaultValues: {
      property_id: '',
      inspection_type: 'scheduled',
      scheduled_date: initialDate ? format(initialDate, 'yyyy-MM-dd') : '',
      scheduled_time_start: '09:00',
      estimated_duration_minutes: 60,
    },
  })

  const selectedType = form.watch('inspection_type')

  // Update duration when type changes (use tier-based defaults)
  const handleTypeChange = (value: string) => {
    form.setValue('inspection_type', value as ScheduleInspectionInput['inspection_type'])
    // Default duration based on common tier for type
    const duration = value === 'preventative' ? 120 : 60
    form.setValue('estimated_duration_minutes', duration)
  }

  const onSubmit = async (data: ScheduleInspectionInput) => {
    try {
      await scheduleInspection.mutateAsync(data)
      toast({
        title: 'Inspection scheduled',
        description: `Inspection scheduled for ${format(new Date(data.scheduled_date), 'MMMM d, yyyy')}`,
      })
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule inspection. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Filter to properties with active programs
  const activeProperties = properties?.filter(() => {
    // In a full implementation, would check for active program
    // For now, show all properties
    return true
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Inspection</DialogTitle>
          <DialogDescription>
            Create a new inspection for a property.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Property Select */}
          <div className="space-y-2">
            <Label htmlFor="property_id">Property *</Label>
            <Select
              value={form.watch('property_id')}
              onValueChange={(v) => form.setValue('property_id', v)}
              disabled={loadingProperties}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {activeProperties?.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name} - {property.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.property_id && (
              <p className="text-sm text-destructive">
                {form.formState.errors.property_id.message}
              </p>
            )}
          </div>

          {/* Inspection Type */}
          <div className="space-y-2">
            <Label htmlFor="inspection_type">Inspection Type</Label>
            <Select
              value={selectedType}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSPECTION_TYPES_LIST.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="scheduled_date">Date *</Label>
            <Input
              type="date"
              {...form.register('scheduled_date')}
            />
            {form.formState.errors.scheduled_date && (
              <p className="text-sm text-destructive">
                {form.formState.errors.scheduled_date.message}
              </p>
            )}
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_time_start">Start Time</Label>
              <Input
                type="time"
                {...form.register('scheduled_time_start')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_duration_minutes">Duration (min)</Label>
              <Input
                type="number"
                min={15}
                max={480}
                step={15}
                {...form.register('estimated_duration_minutes', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Inspector */}
          <div className="space-y-2">
            <Label htmlFor="inspector_id">Assign Inspector</Label>
            <Select
              value={form.watch('inspector_id') || ''}
              onValueChange={(v) => form.setValue('inspector_id', v || undefined)}
              disabled={loadingInspectors}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
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

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={scheduleInspection.isPending}
            >
              {scheduleInspection.isPending ? 'Scheduling...' : 'Schedule Inspection'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
