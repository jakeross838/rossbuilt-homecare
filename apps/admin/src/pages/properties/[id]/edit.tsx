import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/page-header'
import { PropertyForm } from '../components/property-form'
import { useProperty, useUpdateProperty } from '@/hooks/use-properties'
import {
  type PropertyFormData,
  defaultPropertyFeatures,
} from '@/lib/validations/property'
import { toast } from '@/hooks/use-toast'

export function EditPropertyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: property, isLoading, error } = useProperty(id)
  const updateProperty = useUpdateProperty()

  const handleSubmit = async (data: PropertyFormData) => {
    if (!id) return

    try {
      await updateProperty.mutateAsync({ id, data })

      toast({
        title: 'Property updated',
        description: `${data.name} has been updated successfully.`,
      })

      // Navigate back to property detail
      navigate(`/properties/${id}`)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update property. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = () => {
    navigate(`/properties/${id}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-destructive mb-4">Property not found</p>
        <Button variant="outline" onClick={() => navigate('/properties')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>
      </div>
    )
  }

  // Transform property data to form values
  const defaultValues: Partial<PropertyFormData> = {
    client_id: property.client_id || '',
    name: property.name || '',
    address_line1: property.address_line1 || '',
    address_line2: property.address_line2 || '',
    city: property.city || '',
    state: property.state || '',
    zip: property.zip || '',
    county: property.county || '',
    year_built: property.year_built || null,
    square_footage: property.square_footage || null,
    lot_size_sqft: property.lot_size_sqft || null,
    bedrooms: property.bedrooms || null,
    bathrooms: property.bathrooms || null,
    stories: property.stories || null,
    construction_type: property.construction_type || '',
    roof_type: property.roof_type || '',
    foundation_type: property.foundation_type || '',
    is_gated_community: property.is_gated_community || false,
    is_coastal: property.is_coastal || false,
    hoa_name: property.hoa_name || '',
    flood_zone: property.flood_zone || '',
    gate_code: property.gate_code || '',
    garage_code: property.garage_code || '',
    alarm_code: property.alarm_code || '',
    alarm_company: property.alarm_company || '',
    alarm_company_phone: property.alarm_company_phone || '',
    lockbox_code: property.lockbox_code || '',
    lockbox_location: property.lockbox_location || '',
    wifi_network: property.wifi_network || '',
    wifi_password: property.wifi_password || '',
    access_instructions: property.access_instructions || '',
    features: {
      ...defaultPropertyFeatures,
      ...(property.features as Record<string, boolean> || {}),
    },
    notes: property.notes || '',
    internal_notes: property.internal_notes || '',
    is_active: property.is_active ?? true,
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${property.name}`}
        description="Update property information"
      >
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Property
        </Button>
      </PageHeader>

      <div className="max-w-4xl">
        <PropertyForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateProperty.isPending}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  )
}

export default EditPropertyPage
