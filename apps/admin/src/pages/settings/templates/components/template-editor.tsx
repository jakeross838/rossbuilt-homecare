import { useEffect } from 'react'
import { useForm, useFieldArray, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import {
  inspectionTemplateSchema,
  type InspectionTemplateFormData,
  defaultChecklistSection,
  defaultChecklistItem,
  defaultInspectionTemplate,
} from '@/lib/validations/inspection-template'
import {
  useCreateInspectionTemplate,
  useUpdateInspectionTemplate,
} from '@/hooks/use-inspection-templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import type { Tables } from '@/lib/supabase'

type InspectionTemplate = Tables<'inspection_templates'>

interface TemplateEditorProps {
  template: InspectionTemplate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

// Category options for templates
const CATEGORY_OPTIONS = [
  { value: 'exterior', label: 'Exterior' },
  { value: 'interior', label: 'Interior' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'pool', label: 'Pool' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'safety', label: 'Safety' },
]

// Feature type options
const FEATURE_TYPE_OPTIONS = [
  { value: 'pool', label: 'Pool' },
  { value: 'dock', label: 'Dock' },
  { value: 'generator', label: 'Generator' },
  { value: 'elevator', label: 'Elevator' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'solar', label: 'Solar' },
]

// Item type options
const ITEM_TYPE_OPTIONS = [
  { value: 'status', label: 'Status (Pass/Fail)' },
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'select', label: 'Select Options' },
  { value: 'photo', label: 'Photo Only' },
]

export function TemplateEditor({
  template,
  open,
  onOpenChange,
  onSave,
}: TemplateEditorProps) {
  const { toast } = useToast()
  const createTemplate = useCreateInspectionTemplate()
  const updateTemplate = useUpdateInspectionTemplate()

  const isEditing = !!template?.id

  const form = useForm<InspectionTemplateFormData>({
    resolver: zodResolver(inspectionTemplateSchema) as Resolver<InspectionTemplateFormData>,
    defaultValues: defaultInspectionTemplate(),
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form

  // Field array for sections
  const {
    fields: sections,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: 'sections',
  })

  // Reset form when template changes or dialog opens
  useEffect(() => {
    if (open) {
      if (template) {
        // Parse sections from database JSON
        const sections = template.sections as InspectionTemplateFormData['sections'] | null
        reset({
          name: template.name,
          description: template.description || '',
          tier: template.tier as InspectionTemplateFormData['tier'],
          category: template.category || null,
          feature_type: template.feature_type || null,
          equipment_category: template.equipment_category || null,
          sections: sections || [],
          estimated_minutes: template.estimated_minutes || undefined,
        })
      } else {
        reset(defaultInspectionTemplate())
      }
    }
  }, [template, open, reset])

  const onSubmit = async (data: InspectionTemplateFormData) => {
    try {
      if (isEditing && template?.id) {
        await updateTemplate.mutateAsync({ id: template.id, data })
        toast({
          title: 'Template updated',
          description: 'The inspection template has been updated.',
        })
      } else {
        await createTemplate.mutateAsync(data)
        toast({
          title: 'Template created',
          description: 'The inspection template has been created.',
        })
      }
      onSave()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: isEditing
          ? 'Failed to update template.'
          : 'Failed to create template.',
      })
    }
  }

  // Add a new section
  const handleAddSection = () => {
    appendSection(defaultChecklistSection(sections.length))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? 'Edit Template' : 'New Template'}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the inspection template details and checklist items.'
              : 'Create a new inspection template with checklist items.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name')}
                error={!!errors.name}
                placeholder="e.g., Exterior Visual Inspection"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of this template..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier *</Label>
                <Select
                  value={watch('tier')}
                  onValueChange={(value) =>
                    setValue('tier', value as InspectionTemplateFormData['tier'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual</SelectItem>
                    <SelectItem value="functional">Functional</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="preventative">Preventative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estimated Minutes</Label>
                <Input
                  type="number"
                  {...register('estimated_minutes', { valueAsNumber: true })}
                  placeholder="e.g., 30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={watch('category') || ''}
                  onValueChange={(value) =>
                    setValue('category', value || null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Feature Type</Label>
                <Select
                  value={watch('feature_type') || ''}
                  onValueChange={(value) =>
                    setValue('feature_type', value || null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feature" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {FEATURE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sections Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Checklist Sections</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSection}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Section
              </Button>
            </div>

            {sections.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg border-dashed">
                No sections yet. Click "Add Section" to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {sections.map((section, sectionIndex) => (
                  <SectionEditor
                    key={section.id}
                    sectionIndex={sectionIndex}
                    register={register}
                    control={control}
                    watch={watch}
                    setValue={setValue}
                    onRemove={() => removeSection(sectionIndex)}
                  />
                ))}
              </div>
            )}
          </div>

          <SheetFooter className="mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isEditing
                  ? 'Update Template'
                  : 'Create Template'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// Section Editor Component
interface SectionEditorProps {
  sectionIndex: number
  register: ReturnType<typeof useForm<InspectionTemplateFormData>>['register']
  control: ReturnType<typeof useForm<InspectionTemplateFormData>>['control']
  watch: ReturnType<typeof useForm<InspectionTemplateFormData>>['watch']
  setValue: ReturnType<typeof useForm<InspectionTemplateFormData>>['setValue']
  onRemove: () => void
}

function SectionEditor({
  sectionIndex,
  register,
  control,
  watch,
  setValue,
  onRemove,
}: SectionEditorProps) {
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.items`,
  })

  const handleAddItem = () => {
    appendItem(defaultChecklistItem())
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <Input
          {...register(`sections.${sectionIndex}.name`)}
          placeholder="Section name"
          className="flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Items */}
      <div className="space-y-2 pl-6">
        {itemFields.map((item, itemIndex) => (
          <ItemEditor
            key={item.id}
            sectionIndex={sectionIndex}
            itemIndex={itemIndex}
            register={register}
            watch={watch}
            setValue={setValue}
            onRemove={() => removeItem(itemIndex)}
          />
        ))}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAddItem}
          className="text-muted-foreground"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Item
        </Button>
      </div>
    </div>
  )
}

// Item Editor Component
interface ItemEditorProps {
  sectionIndex: number
  itemIndex: number
  register: ReturnType<typeof useForm<InspectionTemplateFormData>>['register']
  watch: ReturnType<typeof useForm<InspectionTemplateFormData>>['watch']
  setValue: ReturnType<typeof useForm<InspectionTemplateFormData>>['setValue']
  onRemove: () => void
}

function ItemEditor({
  sectionIndex,
  itemIndex,
  register,
  watch,
  setValue,
  onRemove,
}: ItemEditorProps) {
  const itemPath = `sections.${sectionIndex}.items.${itemIndex}` as const
  const itemType = watch(`${itemPath}.type`)
  const photoRequired = watch(`${itemPath}.photo_required`)
  const photoRecommended = watch(`${itemPath}.photo_recommended`)

  return (
    <div className="flex items-start gap-2 p-2 border rounded bg-muted/30">
      <div className="flex-1 space-y-2">
        <Input
          {...register(`${itemPath}.text`)}
          placeholder="Checklist item text"
          className="text-sm"
        />

        <div className="flex items-center gap-4 flex-wrap">
          <Select
            value={itemType || 'status'}
            onValueChange={(value) =>
              setValue(`${itemPath}.type`, value as 'status' | 'text' | 'number' | 'select' | 'photo')
            }
          >
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEM_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Checkbox
              id={`${itemPath}-photo-required`}
              checked={photoRequired || false}
              onCheckedChange={(checked) =>
                setValue(`${itemPath}.photo_required`, !!checked)
              }
            />
            <Label
              htmlFor={`${itemPath}-photo-required`}
              className="text-xs font-normal"
            >
              Photo Required
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id={`${itemPath}-photo-recommended`}
              checked={photoRecommended || false}
              onCheckedChange={(checked) =>
                setValue(`${itemPath}.photo_recommended`, !!checked)
              }
            />
            <Label
              htmlFor={`${itemPath}-photo-recommended`}
              className="text-xs font-normal"
            >
              Photo Recommended
            </Label>
          </div>
        </div>

        <Input
          {...register(`${itemPath}.help_text`)}
          placeholder="Help text (optional)"
          className="text-xs h-7"
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}

export default TemplateEditor
