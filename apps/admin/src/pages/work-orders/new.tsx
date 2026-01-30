import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Building2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { WorkOrderForm } from '@/components/work-orders'
import { useProperties } from '@/hooks/use-properties'
import { useCreateWorkOrder } from '@/hooks/use-work-orders'
import { useToast } from '@/hooks/use-toast'
import type { CreateWorkOrderFormData } from '@/lib/validations/work-order'

interface PropertyWithClient {
  id: string
  name: string
  client_id: string
  address_line1: string | null
  city: string | null
  state: string | null
  client: {
    id: string
    first_name: string | null
    last_name: string | null
  } | null
}

interface SelectedProperty {
  id: string
  name: string
  clientId: string
  clientName: string
  address: string
}

export function NewWorkOrderPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<SelectedProperty | null>(null)

  const { data: properties = [], isLoading: loadingProperties } = useProperties({ search })
  const createWorkOrder = useCreateWorkOrder()

  const handleSelectProperty = (property: PropertyWithClient) => {
    setSelectedProperty({
      id: property.id,
      name: property.name,
      clientId: property.client_id,
      clientName: property.client
        ? `${property.client.first_name} ${property.client.last_name}`
        : 'Unknown Client',
      address: [property.address_line1, property.city, property.state]
        .filter(Boolean)
        .join(', '),
    })
  }

  const handleSubmit = async (data: CreateWorkOrderFormData) => {
    console.log('[NewWorkOrderPage] handleSubmit called with data:', data)
    try {
      const workOrder = await createWorkOrder.mutateAsync(data)

      toast({
        title: 'Work order created',
        description: `Work order #${workOrder.work_order_number} has been created.`,
      })

      navigate(`/work-orders/${workOrder.id}`)
    } catch (error) {
      console.error('[NewWorkOrderPage] Error creating work order:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create work order. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = () => {
    if (selectedProperty) {
      setSelectedProperty(null)
    } else {
      navigate('/work-orders')
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <PageHeader
        title={selectedProperty ? 'Create Work Order' : 'New Work Order'}
        description={
          selectedProperty
            ? `Creating work order for ${selectedProperty.name}`
            : 'Select a property to create a work order'
        }
      >
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {selectedProperty ? 'Change Property' : 'Back to Work Orders'}
        </Button>
      </PageHeader>

      {!selectedProperty ? (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Property List */}
          {loadingProperties ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading properties...
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No properties found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/properties/new')}
              >
                Add a property first
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(properties as PropertyWithClient[]).map((property) => (
                <Card
                  key={property.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleSelectProperty(property)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">
                          {property.name}
                        </CardTitle>
                        <CardDescription className="truncate">
                          {property.client
                            ? `${property.client.first_name} ${property.client.last_name}`
                            : 'No client'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground truncate">
                      {[property.address_line1, property.city, property.state]
                        .filter(Boolean)
                        .join(', ') || 'No address'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl">
          {/* Selected Property Info */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{selectedProperty.name}</CardTitle>
                  <CardDescription>{selectedProperty.clientName}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {selectedProperty.address || 'No address'}
              </p>
            </CardContent>
          </Card>

          {/* Work Order Form */}
          <Card>
            <CardHeader>
              <CardTitle>Work Order Details</CardTitle>
              <CardDescription>
                Fill in the details for the new work order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkOrderForm
                propertyId={selectedProperty.id}
                clientId={selectedProperty.clientId}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={createWorkOrder.isPending}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default NewWorkOrderPage
