import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
import { useInspectors } from '@/hooks/use-inspectors'
import { useRescheduleInspection } from '@/hooks/use-inspections'
import {
  rescheduleInspectionSchema,
  type RescheduleInspectionInput,
} from '@/lib/validations/inspection'
import type { CalendarInspection } from '@/lib/types/scheduling'
import type { Resolver } from 'react-hook-form'

interface RescheduleInspectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inspection: CalendarInspection | null
  onSuccess?: () => void
}

export function RescheduleInspectionDialog({
  open,
  onOpenChange,
  inspection,
  onSuccess,
}: RescheduleInspectionDialogProps) {
  const { toast } = useToast()
  const { data: inspectors, isLoading: loadingInspectors } = useInspectors()
  const rescheduleInspection = useRescheduleInspection()

  const { control, register, handleSubmit, formState: { errors }, reset } = useForm<RescheduleInspectionInput>({
    resolver: zodResolver(rescheduleInspectionSchema) as Resolver<RescheduleInspectionInput>,
    defaultValues: {
      scheduled_date: '',
      scheduled_time_start: '',
      scheduled_time_end: '',
      inspector_id: '',
    },
  })

  // Reset form when dialog opens with inspection data
  useEffect(() => {
    if (open && inspection) {
      reset({
        scheduled_date: inspection.scheduled_date,
        scheduled_time_start: inspection.scheduled_time_start?.slice(0, 5) || '',
        scheduled_time_end: inspection.scheduled_time_end?.slice(0, 5) || '',
        inspector_id: inspection.inspector_id || '',
      })
    }
  }, [open, inspection, reset])

  const onSubmit = async (data: RescheduleInspectionInput) => {
    if (!inspection) return

    try {
      await rescheduleInspection.mutateAsync({
        id: inspection.id,
        ...data,
      })
      toast({
        title: 'Inspection rescheduled',
        description: `Inspection rescheduled to ${format(new Date(data.scheduled_date), 'MMMM d, yyyy')}`,
      })
      onSuccess?.()
      onOpenChange(false)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to reschedule inspection. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (!inspection) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Inspection</DialogTitle>
          <DialogDescription>
            Reschedule the inspection for {inspection.property?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="scheduled_date">New Date *</Label>
            <Input
              type="date"
              {...register('scheduled_date')}
            />
            {errors.scheduled_date && (
              <p className="text-sm text-destructive">
                {errors.scheduled_date.message}
              </p>
            )}
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_time_start">Start Time</Label>
              <Input
                type="time"
                {...register('scheduled_time_start')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_time_end">End Time</Label>
              <Input
                type="time"
                {...register('scheduled_time_end')}
              />
            </div>
          </div>

          {/* Inspector */}
          <div className="space-y-2">
            <Label htmlFor="inspector_id">Assign Inspector</Label>
            <Controller
              name="inspector_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || 'unassigned'}
                  onValueChange={(v) => field.onChange(v === 'unassigned' ? '' : v)}
                  disabled={loadingInspectors}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
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
              )}
            />
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
              disabled={rescheduleInspection.isPending}
            >
              {rescheduleInspection.isPending ? 'Rescheduling...' : 'Reschedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
