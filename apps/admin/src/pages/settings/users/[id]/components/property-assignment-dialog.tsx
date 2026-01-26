import { useState } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useProperties } from '@/hooks/use-properties'
import { useCreateAssignment } from '@/hooks/use-property-assignments'
import { toast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/use-debounce'

interface PropertyAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  existingAssignments: string[]
}

export function PropertyAssignmentDialog({
  open,
  onOpenChange,
  userId,
  existingAssignments,
}: PropertyAssignmentDialogProps) {
  const [search, setSearch] = useState('')
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])

  const debouncedSearch = useDebounce(search, 300)
  const { data: properties, isLoading } = useProperties({ search: debouncedSearch })
  const createAssignment = useCreateAssignment()

  // Filter out already assigned properties
  const availableProperties = (properties || []).filter(
    (p) => !existingAssignments.includes(p.id)
  )

  const handleToggleProperty = (propertyId: string) => {
    setSelectedProperties((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  const handleAssign = async () => {
    if (selectedProperties.length === 0) return

    try {
      // Create assignments one by one
      for (const propertyId of selectedProperties) {
        await createAssignment.mutateAsync({
          userId,
          propertyId,
        })
      }

      toast({
        title: 'Properties assigned',
        description: `${selectedProperties.length} ${
          selectedProperties.length === 1 ? 'property' : 'properties'
        } assigned successfully.`,
      })

      setSelectedProperties([])
      setSearch('')
      onOpenChange(false)
    } catch (error) {
      console.error('Assignment error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign properties. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleClose = () => {
    setSelectedProperties([])
    setSearch('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Properties</DialogTitle>
          <DialogDescription>
            Select properties to assign to this tech
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px] border rounded-md">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : availableProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {search
                    ? 'No matching properties found'
                    : 'All properties are already assigned'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {availableProperties.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => handleToggleProperty(property.id)}
                  >
                    <Checkbox
                      checked={selectedProperties.includes(property.id)}
                      onCheckedChange={() => handleToggleProperty(property.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{property.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {property.address_line1}
                        {property.city && `, ${property.city}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {selectedProperties.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedProperties.length}{' '}
              {selectedProperties.length === 1 ? 'property' : 'properties'} selected
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedProperties.length === 0 || createAssignment.isPending}
          >
            {createAssignment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              `Assign ${selectedProperties.length || ''} ${
                selectedProperties.length === 1 ? 'Property' : 'Properties'
              }`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
