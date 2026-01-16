import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/page-header'
import { ClientForm } from '../components/client-form'
import { useClient, useUpdateClient } from '@/hooks/use-clients'
import { transformClientData, type ClientFormData } from '@/lib/validations/client'
import { toast } from '@/hooks/use-toast'

export function EditClientPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: client, isLoading, error } = useClient(id)
  const updateClient = useUpdateClient()

  const handleSubmit = async (data: ClientFormData) => {
    if (!id) return

    try {
      const transformedData = transformClientData(data)
      await updateClient.mutateAsync({ id, data: transformedData })

      toast({
        title: 'Client updated',
        description: `${data.first_name} ${data.last_name} has been updated successfully.`,
      })

      // Navigate back to the client detail page
      navigate(`/clients/${id}`)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update client. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = () => {
    navigate(`/clients/${id}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-64 w-full max-w-3xl" />
        <Skeleton className="h-48 w-full max-w-3xl" />
        <Skeleton className="h-48 w-full max-w-3xl" />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-destructive mb-4">Client not found</p>
        <Button variant="outline" onClick={() => navigate('/clients')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
      </div>
    )
  }

  // Map client data to form values
  const defaultValues: Partial<ClientFormData> = {
    first_name: client.first_name,
    last_name: client.last_name,
    email: client.email || '',
    phone: client.phone || '',
    secondary_first_name: client.secondary_first_name || '',
    secondary_last_name: client.secondary_last_name || '',
    secondary_email: client.secondary_email || '',
    secondary_phone: client.secondary_phone || '',
    secondary_relationship: client.secondary_relationship || '',
    billing_email: client.billing_email || '',
    billing_address_line1: client.billing_address_line1 || '',
    billing_address_line2: client.billing_address_line2 || '',
    billing_city: client.billing_city || '',
    billing_state: client.billing_state || '',
    billing_zip: client.billing_zip || '',
    source: client.source || '',
    referral_source: client.referral_source || '',
    notes: client.notes || '',
    tags: client.tags || [],
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${client.first_name} ${client.last_name}`}
        description="Update client information"
      >
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Client
        </Button>
      </PageHeader>

      <div className="max-w-3xl">
        <ClientForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateClient.isPending}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  )
}

export default EditClientPage
