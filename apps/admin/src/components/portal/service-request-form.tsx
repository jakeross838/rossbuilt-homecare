import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SERVICE_REQUEST_TYPES, PRIORITY_DISPLAY } from '@/lib/constants/portal'
import {
  createServiceRequestSchema,
  type CreateServiceRequestInput,
} from '@/lib/validations/service-request'
import { useCreateServiceRequest, useUploadServiceRequestPhoto } from '@/hooks/use-service-requests'
import { usePortalProperties } from '@/hooks/use-portal-dashboard'
import { useToast } from '@/hooks/use-toast'
import type { Resolver } from 'react-hook-form'

interface ServiceRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultPropertyId?: string
}

export function ServiceRequestForm({
  open,
  onOpenChange,
  defaultPropertyId,
}: ServiceRequestFormProps) {
  const { toast } = useToast()
  const { data: properties } = usePortalProperties()
  const createRequest = useCreateServiceRequest()
  const uploadPhoto = useUploadServiceRequestPhoto()
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateServiceRequestInput>({
    resolver: zodResolver(createServiceRequestSchema) as Resolver<CreateServiceRequestInput>,
    defaultValues: {
      property_id: defaultPropertyId || '',
      request_type: 'maintenance',
      priority: 'medium',
      title: '',
      description: '',
      photos: [],
    },
  })

  const selectedType = watch('request_type')

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadPhoto.mutateAsync({ file })
      )
      const urls = await Promise.all(uploadPromises)
      const newPhotos = [...photos, ...urls]
      setPhotos(newPhotos)
      setValue('photos', newPhotos)
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload photos. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    setValue('photos', newPhotos)
  }

  const onSubmit = async (data: CreateServiceRequestInput) => {
    try {
      await createRequest.mutateAsync({
        ...data,
        photos,
      })
      toast({
        title: 'Request submitted',
        description: 'We\'ll get back to you as soon as possible.',
      })
      reset()
      setPhotos([])
      onOpenChange(false)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Service Request</DialogTitle>
          <DialogDescription>
            Describe what you need and we'll get back to you promptly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Property Selection */}
          <div className="space-y-2">
            <Label htmlFor="property_id">Property *</Label>
            <Select
              value={watch('property_id')}
              onValueChange={(value) => setValue('property_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties?.map((prop) => (
                  <SelectItem key={prop.id} value={prop.id}>
                    {prop.name} - {prop.address_line1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.property_id && (
              <p className="text-sm text-red-600">{errors.property_id.message}</p>
            )}
          </div>

          {/* Request Type */}
          <div className="space-y-2">
            <Label htmlFor="request_type">Request Type *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue('request_type', value as typeof selectedType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="What kind of request?" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_REQUEST_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Emergency Warning */}
          {selectedType === 'emergency' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                For true emergencies (flooding, fire, security breach), please also call us
                directly at <strong>(555) 123-4567</strong>.
              </AlertDescription>
            </Alert>
          )}

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={watch('priority')}
              onValueChange={(value) => setValue('priority', value as 'low' | 'medium' | 'high' | 'urgent')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_DISPLAY).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Subject *</Label>
            <Input
              id="title"
              placeholder="Brief summary of your request"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Details *</Label>
            <Textarea
              id="description"
              placeholder="Please describe what you need in detail..."
              rows={4}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photos (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < 10 && (
                <label className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  ) : (
                    <Upload className="h-6 w-6 text-gray-400" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Add photos to help us understand the issue
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
