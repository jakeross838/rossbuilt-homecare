import { Link } from 'react-router-dom'
import {
  Users,
  Shield,
  Building2,
  MapPin,
  ChevronRight,
  UserCheck,
  UserX,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/layout/page-header'
import { useUsers } from '@/hooks/use-users'
import { roleLabels } from '@/lib/validations/user'

export function PermissionsPage() {
  const { data: allUsers, isLoading } = useUsers({ active: true })

  // Stats
  const totalUsers = allUsers?.length || 0
  const usersWithAccess = allUsers?.filter((u) => (u.assignment_count || 0) > 0).length || 0
  const admins = allUsers?.filter((u) => u.role === 'admin' || u.role === 'manager') || []
  const nonAdmins = allUsers?.filter((u) => u.role !== 'admin' && u.role !== 'manager') || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Permissions Overview"
        description="View and manage user access across the organization"
      >
        <Button asChild>
          <Link to="/settings/users">
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
            <p className="text-xs text-muted-foreground">
              Admin & manager roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">With Property Access</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usersWithAccess} / {totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Have assigned properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Need Assignment</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nonAdmins.filter((u) => (u.assignment_count || 0) === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Non-admin users without access
            </p>
          </CardContent>
        </Card>
      </div>

      {/* All Users Property Access */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>User Property Access</CardTitle>
          <CardDescription>
            Which properties each user can view (all roles)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalUsers === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserX className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No users found</p>
              <p className="text-sm">Create users to assign property access</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers?.map((user) => {
                  const assignmentCount = user.assignment_count || 0
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {assignmentCount}{' '}
                            {assignmentCount === 1 ? 'property' : 'properties'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignmentCount > 0 ? (
                          <Badge variant="success">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Assigned
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <UserX className="h-3 w-3 mr-1" />
                            No Access
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/settings/users/${user.id}`}>
                            Manage
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PermissionsPage
