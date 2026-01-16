import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { VendorForm } from '@/components/vendors'
import { useCreateVendor } from '@/hooks/use-vendors'
import { useToast } from '@/hooks/use-toast'
import type { CreateVendorFormData } from '@/lib/validations/vendor'

export function NewVendorPage() {
  const navigate = useNavigate()
  const createVendor = useCreateVendor()
  const { toast } = useToast()

  const handleSubmit = async (data: CreateVendorFormData) => {
    try {
      const vendor = await createVendor.mutateAsync(data)

      toast({
        title: 'Vendor created',
        description: `${data.company_name} has been added successfully.`,
      })

      // Navigate to the new vendor's detail page
      navigate(`/vendors/${vendor.id}`)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create vendor. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = () => {
    navigate('/vendors')
  }

  return (
    <div className="container py-6 space-y-6">
      <PageHeader
        title="New Vendor"
        description="Add a new service provider or contractor"
      >
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vendors
        </Button>
      </PageHeader>

      <div className="max-w-3xl">
        <VendorForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createVendor.isPending}
        />
      </div>
    </div>
  )
}

export default NewVendorPage
