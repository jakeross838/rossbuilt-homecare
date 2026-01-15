import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Building,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/page-header'
import { useProperties, useDeleteProperty } from '@/hooks/use-properties'
import { useClients } from '@/hooks/use-clients'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from '@/hooks/use-toast'

export function PropertiesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState<string>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  const debouncedSearch = useDebounce(search, 300)
  const { data: clients } = useClients({ active: true })
  const {
    data: properties,
    isLoading,
    error,
  } = useProperties({
    search: debouncedSearch,
    clientId: clientFilter || undefined,
  })
  const deleteProperty = useDeleteProperty()

  const handleRowClick = (id: string) => {
    navigate(`/properties/${id}`)
  }

  const handleDeleteClick = (id: string, name: string) => {
    setPropertyToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return

    try {
      await deleteProperty.mutateAsync(propertyToDelete.id)
      toast({
        title: 'Property archived',
        description: `${propertyToDelete.name} has been archived successfully.`,
      })
      setDeleteDialogOpen(false)
      setPropertyToDelete(null)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to archive property. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-destructive mb-4">Failed to load properties</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Properties"
        description="Manage property details, access codes, and features"
      >
        <Button asChild>
          <Link to="/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </PageHeader>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={clientFilter}
          onValueChange={setClientFilter}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Clients</SelectItem>
            {clients?.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.first_name} {client.last_name}
              </SelectItem>
            ))}
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
      {!isLoading && properties && properties.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center border rounded-lg bg-muted/10">
          <Building className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No properties found</h3>
          <p className="text-muted-foreground mb-4">
            {search || clientFilter
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first property'}
          </p>
          {!search && !clientFilter && (
            <Button asChild>
              <Link to="/properties/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Properties Table */}
      {!isLoading && properties && properties.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow
                  key={property.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(property.id)}
                >
                  <TableCell className="font-medium">{property.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{property.address_line1}</span>
                      <span className="text-sm text-muted-foreground">
                        {property.city}, {property.state} {property.zip}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {property.client ? (
                      <span>
                        {property.client.first_name} {property.client.last_name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No client</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={property.is_active ? 'success' : 'secondary'}
                    >
                      {property.is_active ? 'Active' : 'Archived'}
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
                            navigate(`/properties/${property.id}`)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/properties/${property.id}/edit`)
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
                            handleDeleteClick(property.id, property.name)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Archive
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive{' '}
              <span className="font-medium">{propertyToDelete?.name}</span>?
              This will hide it from the active properties list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteProperty.isPending}
            >
              {deleteProperty.isPending ? 'Archiving...' : 'Archive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PropertiesPage
