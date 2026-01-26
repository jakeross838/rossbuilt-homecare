import { useState } from 'react'
import { Search, Building2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useClients } from '@/hooks/use-clients'
import { useLinkUserToClient } from '@/hooks/use-users'
import { toast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/use-debounce'

interface ClientLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function ClientLinkDialog({
  open,
  onOpenChange,
  userId,
}: ClientLinkDialogProps) {
  const [search, setSearch] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)
  const { data: clients, isLoading } = useClients({ search: debouncedSearch })
  const linkUserToClient = useLinkUserToClient()

  // Filter to only show clients without a user_id (not already linked)
  const availableClients = (clients || []).filter((c) => !c.user_id)

  const handleLink = async () => {
    if (!selectedClientId) return

    try {
      await linkUserToClient.mutateAsync({
        userId,
        clientId: selectedClientId,
      })

      toast({
        title: 'Client linked',
        description: 'User has been linked to the client record.',
      })

      setSelectedClientId(null)
      setSearch('')
      onOpenChange(false)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to link client. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleClose = () => {
    setSelectedClientId(null)
    setSearch('')
    onOpenChange(false)
  }

  const selectedClient = availableClients.find((c) => c.id === selectedClientId)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link Client Record</DialogTitle>
          <DialogDescription>
            Select a client record to link to this user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
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
            ) : availableClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {search
                    ? 'No matching clients found'
                    : 'All clients are already linked to users'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {availableClients.map((client) => (
                  <div
                    key={client.id}
                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                      selectedClientId === client.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedClientId(client.id)}
                  >
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {client.first_name} {client.last_name}
                      </p>
                      {client.email && (
                        <p className="text-sm text-muted-foreground truncate">
                          {client.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {selectedClient && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Selected:</p>
              <p className="text-sm">
                {selectedClient.first_name} {selectedClient.last_name}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleLink}
            disabled={!selectedClientId || linkUserToClient.isPending}
          >
            {linkUserToClient.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Linking...
              </>
            ) : (
              'Link Client'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
