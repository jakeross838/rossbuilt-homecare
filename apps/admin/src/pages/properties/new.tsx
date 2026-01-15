import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { PropertyForm } from './components/property-form'
import { useCreateProperty } from '@/hooks/use-properties'
import { type PropertyFormData } from '@/lib/validations/property'
import { toast } from '@/hooks/use-toast'

export function NewPropertyPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedClientId = searchParams.get('client') || undefined

  const createProperty = useCreateProperty()

  const handleSubmit = async (data: PropertyFormData) => {
    try {
      const property = await createProperty.mutateAsync(data)

      toast({
        title: 'Property created',
        description: `${data.name} has been added successfully.`,
      })

      // Navigate to the new property's detail page
      navigate(`/properties/${property.id}`)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create property. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = () => {
    // Go back to client page if came from there, otherwise properties list
    if (preselectedClientId) {
      navigate(`/clients/${preselectedClientId}`)
    } else {
      navigate('/properties')
    }
  }

  return (
    <div>
      <PageHeader
        title="New Property"
        description="Add a new property to your organization"
      >
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      <div className="max-w-4xl">
        <PropertyForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createProperty.isPending}
          submitLabel="Create Property"
          preselectedClientId={preselectedClientId}
        />
      </div>
    </div>
  )
}

export default NewPropertyPage
