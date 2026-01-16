import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { ClientForm } from './components/client-form'
import { useCreateClient } from '@/hooks/use-clients'
import { transformClientData, type ClientFormData } from '@/lib/validations/client'
import { toast } from '@/hooks/use-toast'

export function NewClientPage() {
  const navigate = useNavigate()
  const createClient = useCreateClient()

  const handleSubmit = async (data: ClientFormData) => {
    try {
      const transformedData = transformClientData(data)
      const client = await createClient.mutateAsync(transformedData)

      toast({
        title: 'Client created',
        description: `${data.first_name} ${data.last_name} has been added successfully.`,
      })

      // Navigate to the new client's detail page
      navigate(`/clients/${client.id}`)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create client. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = () => {
    navigate('/clients')
  }

  return (
    <div>
      <PageHeader
        title="New Client"
        description="Add a new client to your organization"
      >
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
      </PageHeader>

      <div className="max-w-3xl">
        <ClientForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createClient.isPending}
          submitLabel="Create Client"
        />
      </div>
    </div>
  )
}

export default NewClientPage
