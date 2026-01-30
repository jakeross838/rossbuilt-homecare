import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  MapPin,
  User,
  Building,
  FileText,
  Plus,
  X,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/page-header'
import { useClient } from '@/hooks/use-clients'
import { useUpdateProperty } from '@/hooks/use-properties'

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: client, isLoading, error, refetch } = useClient(id)
  const updateProperty = useUpdateProperty()
  const [propertyToRemove, setPropertyToRemove] = useState<{ id: string; name: string } | null>(null)

  const handleRemoveProperty = async () => {
    if (!propertyToRemove) return

    await updateProperty.mutateAsync({
      id: propertyToRemove.id,
      data: { client_id: null as unknown as string }, // Remove client association
    })
    setPropertyToRemove(null)
    refetch()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
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

  const hasSecondaryContact =
    client.secondary_first_name ||
    client.secondary_email ||
    client.secondary_phone

  const hasBillingInfo =
    client.billing_email ||
    client.billing_address_line1 ||
    client.billing_city

  const hasProperties =
    client.properties && Array.isArray(client.properties) && client.properties.length > 0

  return (
    <div>
      <PageHeader
        title={`${client.first_name} ${client.last_name}`}
        description={client.source ? `via ${client.source}` : undefined}
      >
        <Button variant="outline" onClick={() => navigate('/clients')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button asChild>
          <Link to={`/clients/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </PageHeader>

      <div className="flex items-center gap-2 mb-6">
        <Badge variant={client.is_active ? 'success' : 'secondary'}>
          {client.is_active ? 'Active' : 'Archived'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <a
                    href={`mailto:${client.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {client.email}
                  </a>
                </div>
              </div>
            )}
            {client.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a
                    href={`tel:${client.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {client.phone}
                  </a>
                </div>
              </div>
            )}
            {!client.email && !client.phone && (
              <p className="text-muted-foreground">No contact information</p>
            )}
          </CardContent>
        </Card>

        {/* Secondary Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Secondary Contact
            </CardTitle>
            {client.secondary_relationship && (
              <CardDescription>{client.secondary_relationship}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {hasSecondaryContact ? (
              <>
                {(client.secondary_first_name || client.secondary_last_name) && (
                  <div>
                    <p className="font-medium">
                      {client.secondary_first_name} {client.secondary_last_name}
                    </p>
                  </div>
                )}
                {client.secondary_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${client.secondary_email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {client.secondary_email}
                      </a>
                    </div>
                  </div>
                )}
                {client.secondary_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${client.secondary_phone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {client.secondary_phone}
                      </a>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No secondary contact</p>
            )}
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasBillingInfo ? (
              <>
                {client.billing_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Billing Email
                      </p>
                      <a
                        href={`mailto:${client.billing_email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {client.billing_email}
                      </a>
                    </div>
                  </div>
                )}
                {client.billing_address_line1 && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Billing Address
                      </p>
                      <p className="text-sm">{client.billing_address_line1}</p>
                      {client.billing_address_line2 && (
                        <p className="text-sm">{client.billing_address_line2}</p>
                      )}
                      {(client.billing_city ||
                        client.billing_state ||
                        client.billing_zip) && (
                        <p className="text-sm">
                          {[
                            client.billing_city,
                            client.billing_state,
                            client.billing_zip,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No billing information</p>
            )}
          </CardContent>
        </Card>

        {/* Properties */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Properties
              </CardTitle>
              <CardDescription>
                Properties associated with this client
              </CardDescription>
            </div>
            <Button asChild size="sm">
              <Link to={`/properties/new?client=${id}`}>
                <Plus className="mr-1 h-4 w-4" />
                Add Property
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {hasProperties ? (
              <div className="space-y-3">
                {client.properties.map((property: {
                  id: string
                  name: string
                  address_line1: string | null
                  city: string | null
                  state: string | null
                  is_active: boolean | null
                }) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Link
                      to={`/properties/${property.id}`}
                      className="flex-1"
                    >
                      <div>
                        <p className="font-medium">{property.name}</p>
                        {property.address_line1 && (
                          <p className="text-sm text-muted-foreground">
                            {property.address_line1}
                            {property.city && `, ${property.city}`}
                            {property.state && `, ${property.state}`}
                          </p>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={property.is_active ? 'success' : 'secondary'}
                      >
                        {property.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault()
                          setPropertyToRemove({ id: property.id, name: property.name })
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No properties linked</p>
            )}
          </CardContent>
        </Card>

        {/* Remove Property Dialog */}
        <AlertDialog open={!!propertyToRemove} onOpenChange={(open) => !open && setPropertyToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Property</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove "{propertyToRemove?.name}" from this client?
                The property will remain in the system but will no longer be associated with this client.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveProperty}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={updateProperty.isPending}
              >
                {updateProperty.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove Property'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Notes */}
        {client.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        {(client.referral_source || client.tags?.length) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.referral_source && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Referral Source
                  </p>
                  <p className="font-medium">{client.referral_source}</p>
                </div>
              )}
              {client.tags && client.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {client.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ClientDetailPage
