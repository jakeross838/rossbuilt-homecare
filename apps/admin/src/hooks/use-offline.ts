import { useState, useEffect, useCallback } from 'react'
import { syncPendingData, registerBackgroundSync, type SyncResult } from '@/lib/offline/sync'
import { getSyncMeta, getUnsyncedFindings, getUnsyncedPhotos } from '@/lib/offline/db'

export interface OfflineState {
  isOnline: boolean
  isSyncing: boolean
  lastSyncedAt: string | null
  pendingChanges: number
  syncNow: () => Promise<SyncResult>
}

// Alias for components that prefer shorter hook name
export function useOfflineStatus(): OfflineState {
  return useOffline()
}

export function useOffline(): OfflineState {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [pendingChanges, setPendingChanges] = useState(0)

  // Manual sync trigger
  const syncNow = useCallback(async (): Promise<SyncResult> => {
    if (isSyncing || !navigator.onLine) {
      return { findings_synced: 0, photos_uploaded: 0, errors: ['Already syncing or offline'] }
    }

    setIsSyncing(true)
    try {
      const result = await syncPendingData()

      // Refresh pending count
      const findings = await getUnsyncedFindings()
      const photos = await getUnsyncedPhotos()
      setPendingChanges(findings.length + photos.length)

      // Update last synced
      const lastSync = await getSyncMeta('last_sync')
      setLastSyncedAt(lastSync as string | null)

      return result
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing])

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Auto-sync when coming back online
      syncNow()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncNow])

  // Load initial sync metadata
  useEffect(() => {
    const loadMeta = async () => {
      const lastSync = await getSyncMeta('last_sync')
      setLastSyncedAt(lastSync as string | null)

      const findings = await getUnsyncedFindings()
      const photos = await getUnsyncedPhotos()
      setPendingChanges(findings.length + photos.length)
    }

    loadMeta()
    // Register background sync
    registerBackgroundSync()
  }, [])

  return {
    isOnline,
    isSyncing,
    lastSyncedAt,
    pendingChanges,
    syncNow,
  }
}

// Hook to check if specific inspection has offline changes
export function useInspectionOfflineStatus(inspectionId: string) {
  const [hasPendingChanges, setHasPendingChanges] = useState(false)

  useEffect(() => {
    const check = async () => {
      const findings = await getUnsyncedFindings()
      const photos = await getUnsyncedPhotos()
      const hasChanges =
        findings.some(f => f.inspection_id === inspectionId) ||
        photos.some(p => p.inspection_id === inspectionId)
      setHasPendingChanges(hasChanges)
    }

    check()
    // Check periodically
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [inspectionId])

  return hasPendingChanges
}
