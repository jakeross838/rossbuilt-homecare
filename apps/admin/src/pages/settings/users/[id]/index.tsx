import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  Clock,
  Building2,
  MapPin,
  Plus,
  X,
  LinkIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PageHeader } from '@/components/layout/page-header'
import { useUser } from '@/hooks/use-users'
import { useDeleteAssignment } from '@/hooks/use-property-assignments'
import { toast } from '@/hooks/use-toast'
import { roleLabels } from '@/lib/validations/user'
import { PropertyAssignmentDialog } from './components/property-assignment-dialog'
import { ClientLinkDialog } from './components/client-link-dialog'
import { useState } from 'react'

const roleBadgeVariants: Record<string, 'default' | 'secondary' | 'outline' | 'success'> = {
  admin: 'default',
  manager: 'secondary',
  inspector: 'outline',
  client: 'success',
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading, error } = useUser(id)
  const deleteAssignment = useDeleteAssignment()

  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [clientLinkDialogOpen, setClientLinkDialogOpen] = useState(false)

  const handleRemoveAssignment = async (
    assignmentId: string,
    propertyId: string,
    propertyName: string
  ) => {
    if (!id) return

    try {
      await deleteAssignment.mutateAsync({
        assignmentId,
        userId: id,
        propertyId,
      })
      toast({
        title: 'Assignment removed',
        description: `${propertyName} has been unassigned.`,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove assignment. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-destructive mb-4">Failed to load user</p>
        <Button variant="outline" onClick={() => navigate('/settings/users')}>
          Back to Users
        </Button>
      </div>
    )
  }

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const linkedClient = user.client && Array.isArray(user.client) && user.client.length > 0
    ? user.client[0]
    : null

  const propertyAssignments = user.property_assignments || []

  return (
    <div>
      <PageHeader
        title={`${user.first_name} ${user.last_name}`}
        description={user.email}
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/settings/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button asChild>
            <Link to={`/settings/users/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="mt-6 space-y-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge
                    variant={roleBadgeVariants[user.role] || 'secondary'}
                    className="mt-1"
                  >
                    {roleLabels[user.role] || user.role}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={user.is_active ? 'success' : 'secondary'}
                    className="mt-1"
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {user.last_login_at && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">
                      {new Date(user.last_login_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Link - shown for client role */}
        {user.role === 'client' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Client Record</CardTitle>
                <CardDescription>
                  Link to a client record to grant access to their properties
                </CardDescription>
              </div>
              {!linkedClient && (
                <Button size="sm" onClick={() => setClientLinkDialogOpen(true)}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Link Client
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {linkedClient ? (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {linkedClient.first_name} {linkedClient.last_name}
                      </p>
                      {linkedClient.email && (
                        <p className="text-sm text-muted-foreground">
                          {linkedClient.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/clients/${linkedClient.id}`}>View Client</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No client record linked</p>
                  <p className="text-sm">
                    Link a client record to grant this user access to their data.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Property Assignments - shown for all users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Property Access</CardTitle>
              <CardDescription>
                Properties this user can view and access
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setAssignmentDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </CardHeader>
          <CardContent>
            {propertyAssignments.length > 0 ? (
              <div className="space-y-2">
                {propertyAssignments.map((assignment: any) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {assignment.property?.name || 'Unknown Property'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.property?.address_line1}
                          {assignment.property?.city &&
                            `, ${assignment.property.city}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link to={`/properties/${assignment.property_id}`}>
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRemoveAssignment(
                            assignment.id,
                            assignment.property_id,
                            assignment.property?.name || 'Property'
                          )
                        }
                        disabled={deleteAssignment.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No properties assigned</p>
                <p className="text-sm">
                  Assign properties to control what this user can access.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <PropertyAssignmentDialog
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
        userId={id!}
        existingAssignments={propertyAssignments.map((a: any) => a.property_id)}
      />

      {user.role === 'client' && (
        <ClientLinkDialog
          open={clientLinkDialogOpen}
          onOpenChange={setClientLinkDialogOpen}
          userId={id!}
        />
      )}
    </div>
  )
}

export default UserDetailPage
