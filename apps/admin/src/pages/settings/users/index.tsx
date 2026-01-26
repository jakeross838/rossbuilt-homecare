import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  UserX,
  Users,
  Building2,
  MapPin,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/page-header'
import { useUsers, useDeactivateUser } from '@/hooks/use-users'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from '@/hooks/use-toast'
import { roleLabels } from '@/lib/validations/user'

const roleBadgeVariants: Record<string, 'default' | 'secondary' | 'outline' | 'success'> = {
  admin: 'default',
  manager: 'secondary',
  inspector: 'outline',
  client: 'success',
}

export function UsersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [userToDeactivate, setUserToDeactivate] = useState<{
    id: string
    name: string
  } | null>(null)

  const debouncedSearch = useDebounce(search, 300)
  const { data: users, isLoading, error } = useUsers({
    search: debouncedSearch,
    role: roleFilter === 'all' ? undefined : roleFilter,
    active: true,
  })
  const deactivateUser = useDeactivateUser()

  const handleRowClick = (id: string) => {
    navigate(`/settings/users/${id}`)
  }

  const handleDeactivateClick = (id: string, name: string) => {
    setUserToDeactivate({ id, name })
    setDeactivateDialogOpen(true)
  }

  const handleConfirmDeactivate = async () => {
    if (!userToDeactivate) return

    try {
      await deactivateUser.mutateAsync(userToDeactivate.id)
      toast({
        title: 'User deactivated',
        description: `${userToDeactivate.name} has been deactivated successfully.`,
      })
      setDeactivateDialogOpen(false)
      setUserToDeactivate(null)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to deactivate user. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Get access display based on role
  const getAccessDisplay = (user: NonNullable<typeof users>[number]) => {
    if (user.role === 'client') {
      if (user.client && Array.isArray(user.client) && user.client.length > 0) {
        const client = user.client[0]
        return (
          <div className="flex items-center gap-1 text-sm">
            <Building2 className="h-3 w-3 text-muted-foreground" />
            <span>{client.first_name} {client.last_name}</span>
          </div>
        )
      }
      return <span className="text-muted-foreground text-sm">Not linked</span>
    }

    if (user.role === 'inspector') {
      const count = user.assignment_count || 0
      return (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>{count} {count === 1 ? 'property' : 'properties'}</span>
        </div>
      )
    }

    return <span className="text-muted-foreground text-sm">Full access</span>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-destructive mb-4">Failed to load users</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage user accounts, roles, and access permissions"
      >
        <Button asChild>
          <Link to="/settings/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Administrators</SelectItem>
            <SelectItem value="manager">Managers</SelectItem>
            <SelectItem value="inspector">Techs / Inspectors</SelectItem>
            <SelectItem value="client">Clients</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && users && users.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center border rounded-lg bg-muted/10">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No users found</h3>
          <p className="text-muted-foreground mb-4">
            {search || roleFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first user'}
          </p>
          {!search && roleFilter === 'all' && (
            <Button asChild>
              <Link to="/settings/users/new">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Users Table */}
      {!isLoading && users && users.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(user.id)}
                >
                  <TableCell className="font-medium">
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariants[user.role] || 'secondary'}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{getAccessDisplay(user)}</TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'success' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/settings/users/${user.id}`)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/settings/users/${user.id}/edit`)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeactivateClick(
                              user.id,
                              `${user.first_name} ${user.last_name}`
                            )
                          }}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate{' '}
              <span className="font-medium">{userToDeactivate?.name}</span>? They
              will no longer be able to log in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeactivateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeactivate}
              disabled={deactivateUser.isPending}
            >
              {deactivateUser.isPending ? 'Deactivating...' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersPage
