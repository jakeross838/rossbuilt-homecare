import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Cloud, RefreshCw, Check, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOffline } from '@/hooks/use-offline'
import { useToast } from '@/hooks/use-toast'
import { getPendingPhotoCount } from '@/lib/offline/photos'
import { cn } from '@/lib/utils'
import type { SyncResult } from '@/lib/offline/sync'

interface SyncStatusProps {
  compact?: boolean
}

export function SyncStatus({ compact = false }: SyncStatusProps) {
  const { isOnline, isSyncing, lastSyncedAt, pendingChanges, syncNow } = useOffline()
  const { toast } = useToast()
  const [pendingPhotos, setPendingPhotos] = useState(0)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  // Get pending photo count
  useEffect(() => {
    getPendingPhotoCount().then(setPendingPhotos)
  }, [pendingChanges])

  const hasPendingData = pendingChanges > 0 || pendingPhotos > 0

  const handleSync = async () => {
    console.log('[SyncStatus] Sync button clicked')
    setSyncResult(null)
    setSyncError(null)
    try {
      console.log('[SyncStatus] Calling syncNow...')
      const result = await syncNow()
      console.log('[SyncStatus] Sync result:', result)
      setSyncResult(result)
      if (result.errors.length > 0) {
        setSyncError(result.errors.join(', '))
        toast({
          title: 'Sync had errors',
          description: result.errors.join(', '),
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Sync complete',
          description: `Synced ${result.findings_synced} findings, ${result.photos_uploaded} photos`,
        })
      }
      // Clear result after 5 seconds
      setTimeout(() => setSyncResult(null), 5000)
    } catch (err) {
      console.error('[SyncStatus] Sync error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Sync failed'
      setSyncError(errorMsg)
      toast({
        title: 'Sync failed',
        description: errorMsg,
        variant: 'destructive',
      })
    }
  }

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
      {isOnline && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full mt-3 gap-2"
        >
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Cloud className="h-4 w-4" />
          )}
          {hasPendingData ? 'Sync Now' : 'Force Sync'}
        </Button>
      )}

      {/* Sync result feedback */}
      {syncResult && syncResult.errors.length === 0 && (
        <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            Synced {syncResult.findings_synced} findings, {syncResult.photos_uploaded} photos
          </span>
        </div>
      )}

      {/* Sync error */}
      {syncError && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{syncError}</span>
        </div>
      )}

      {/* All synced indicator */}
      {!hasPendingData && !syncResult && (
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
