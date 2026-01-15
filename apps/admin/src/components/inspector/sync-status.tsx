import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Cloud, RefreshCw, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOffline } from '@/hooks/use-offline'
import { getPendingPhotoCount } from '@/lib/offline/photos'
import { cn } from '@/lib/utils'

interface SyncStatusProps {
  compact?: boolean
}

export function SyncStatus({ compact = false }: SyncStatusProps) {
  const { isOnline, isSyncing, lastSyncedAt, pendingChanges, syncNow } = useOffline()
  const [pendingPhotos, setPendingPhotos] = useState(0)

  // Get pending photo count
  useEffect(() => {
    getPendingPhotoCount().then(setPendingPhotos)
  }, [pendingChanges])

  const hasPendingData = pendingChanges > 0 || pendingPhotos > 0

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-yellow-600" />
        )}

        {hasPendingData && (
          <Badge variant="outline" className="text-xs gap-1">
            <Cloud className="h-3 w-3" />
            {pendingChanges + pendingPhotos}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Sync Status</h3>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
              <Wifi className="h-3 w-3" />
              Online
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-300">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {/* Pending findings */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Pending findings</span>
          <span className={cn(
            'font-medium',
            pendingChanges > 0 ? 'text-yellow-600' : 'text-green-600'
          )}>
            {pendingChanges}
          </span>
        </div>

        {/* Pending photos */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Pending photos</span>
          <span className={cn(
            'font-medium',
            pendingPhotos > 0 ? 'text-yellow-600' : 'text-green-600'
          )}>
            {pendingPhotos}
          </span>
        </div>

        {/* Last sync */}
        {lastSyncedAt && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last synced</span>
            <span className="font-medium">
              {formatRelativeTime(lastSyncedAt)}
            </span>
          </div>
        )}
      </div>

      {/* Sync button */}
      {isOnline && hasPendingData && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => syncNow()}
          disabled={isSyncing}
          className="w-full mt-3 gap-2"
        >
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Cloud className="h-4 w-4" />
          )}
          Sync Now
        </Button>
      )}

      {/* All synced indicator */}
      {!hasPendingData && (
        <div className="flex items-center gap-2 mt-3 text-green-600">
          <Check className="h-4 w-4" />
          <span className="text-sm">All data synced</span>
        </div>
      )}

      {/* Offline warning */}
      {!isOnline && hasPendingData && (
        <div className="flex items-center gap-2 mt-3 text-yellow-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Data will sync when online</span>
        </div>
      )}
    </div>
  )
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  return date.toLocaleDateString()
}
