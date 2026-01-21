import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  equipmentSchema,
  type EquipmentFormData,
  equipmentDefaults,
  transformEquipmentData,
} from '@/lib/validations/equipment'
import {
  EQUIPMENT_CATEGORIES,
  FUEL_TYPES,
  type EquipmentCategory,
} from '@/lib/constants/equipment'
import { useCreateEquipment, useUpdateEquipment } from '@/hooks/use-equipment'
import { useToast } from '@/hooks/use-toast'
import type { Tables } from '@/lib/supabase'

type Equipment = Tables<'equipment'>

interface EquipmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  propertyId: string
  equipment?: Equipment
}

/**
 * Equipment form dialog for creating and editing equipment items
 */
export function EquipmentForm({
  open,
  onOpenChange,
  propertyId,
  equipment,
}: EquipmentFormProps) {
  const [category, setCategory] = useState<string>(equipment?.category || '')
  const { toast } = useToast()

  const createEquipment = useCreateEquipment()
  const updateEquipment = useUpdateEquipment()

  const isEditMode = !!equipment

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: equipment
      ? {
          property_id: equipment.property_id,
          category: equipment.category,
          equipment_type: equipment.equipment_type,
          custom_name: equipment.custom_name || '',
          manufacturer: equipment.manufacturer || '',
          model_number: equipment.model_number || '',
          serial_number: equipment.serial_number || '',
          install_date: equipment.install_date || null,
          warranty_expiration: equipment.warranty_expiration || null,
          location: equipment.location || '',
          serves: equipment.serves || '',
          capacity: equipment.capacity || '',
          filter_size: equipment.filter_size || '',
          fuel_type: equipment.fuel_type || '',
          notes: equipment.notes || '',
        }
      : equipmentDefaults(propertyId),
  })

  // Get types for currently selected category
  const types = category
    ? EQUIPMENT_CATEGORIES[category as EquipmentCategory]?.types || []
    : []

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setValue('category', value)
    setValue('equipment_type', '') // Clear type when category changes
  }

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      const transformedData = transformEquipmentData(data)

      if (isEditMode && equipment) {
        await updateEquipment.mutateAsync({
          id: equipment.id,
          data: transformedData,
        })
        toast({
          title: 'Success',
          description: 'Equipment updated successfully',
        })
      } else {
        await createEquipment.mutateAsync(transformedData)
        toast({
          title: 'Success',
          description: 'Equipment added successfully',
        })
      }

      reset(equipmentDefaults(propertyId))
      setCategory('')
      onOpenChange(false)
    } catch {
      toast({
        title: 'Error',
        description: isEditMode
          ? 'Failed to update equipment'
          : 'Failed to add equipment',
        variant: 'destructive',
      })
    }
  }

  const isPending = createEquipment.isPending || updateEquipment.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Equipment' : 'Add Equipment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || category}
                    onValueChange={(value) => {
                      field.onChange(value)
                      setCategory(value)
                      setValue('equipment_type', '')
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EQUIPMENT_CATEGORIES).map(([key, cat]) => (
                        <SelectItem key={key} value={key}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Type <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="equipment_type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.equipment_type && (
                <p className="text-sm text-destructive">
                  {errors.equipment_type.message}
                </p>
              )}
            </div>
          </div>

          {/* Custom Name */}
          <div className="space-y-2">
            <Label htmlFor="custom_name">Custom Name</Label>
            <Input
              id="custom_name"
              placeholder="e.g., Main Floor AC"
              {...register('custom_name')}
            />
          </div>

          {/* Manufacturer, Model, Serial */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                placeholder="e.g., Carrier"
                {...register('manufacturer')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model_number">Model Number</Label>
              <Input
                id="model_number"
                placeholder="e.g., 24ACC636A003"
                {...register('model_number')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input
                id="serial_number"
                placeholder="e.g., 1234567890"
                {...register('serial_number')}
              />
            </div>
          </div>

          {/* Install Date, Warranty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="install_date">Install Date</Label>
              <Input type="date" id="install_date" {...register('install_date')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty_expiration">Warranty Expiration</Label>
              <Input
                type="date"
                id="warranty_expiration"
                {...register('warranty_expiration')}
              />
            </div>
          </div>

          {/* Location, Serves */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Garage, Utility Room"
                {...register('location')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serves">Serves</Label>
              <Input
                id="serves"
                placeholder="e.g., 2nd Floor, Master Suite"
                {...register('serves')}
              />
            </div>
          </div>

          {/* Capacity, Filter Size, Fuel Type */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                placeholder="e.g., 3-ton, 50 gallon"
                {...register('capacity')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter_size">Filter Size</Label>
              <Input
                id="filter_size"
                placeholder="e.g., 20x25x1"
                {...register('filter_size')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel_type">Fuel Type</Label>
              <Controller
                name="fuel_type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this equipment..."
              rows={2}
              {...register('notes')}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Adding...'}
                </>
              ) : isEditMode ? (
                'Update Equipment'
              ) : (
                'Add Equipment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EquipmentForm
