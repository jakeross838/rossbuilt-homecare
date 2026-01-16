import { supabase } from '@/lib/supabase'
import {
  getUnsyncedFindings,
  markFindingsSynced,
  getUnsyncedPhotos,
  markPhotoUploaded,
  setSyncMeta,
} from './db'

export interface SyncResult {
  findings_synced: number
  photos_uploaded: number
  errors: string[]
}

// Sync all pending data to server
export async function syncPendingData(): Promise<SyncResult> {
  const result: SyncResult = {
    findings_synced: 0,
    photos_uploaded: 0,
    errors: [],
  }

  if (!navigator.onLine) {
    result.errors.push('Device is offline')
    return result
  }

  // Sync photos first (findings may reference uploaded URLs)
  const photosResult = await syncPendingPhotos()
  result.photos_uploaded = photosResult.uploaded
  result.errors.push(...photosResult.errors)

  // Then sync findings
  const findingsResult = await syncPendingFindings()
  result.findings_synced = findingsResult.synced
  result.errors.push(...findingsResult.errors)

  // Update last sync timestamp
  if (result.errors.length === 0) {
    await setSyncMeta('last_sync', new Date().toISOString())
  }

  return result
}

async function syncPendingPhotos(): Promise<{ uploaded: number; errors: string[] }> {
  const photos = await getUnsyncedPhotos()
  let uploaded = 0
  const errors: string[] = []

  for (const photo of photos) {
    try {
      // Upload to Supabase Storage
      const path = `inspections/${photo.inspection_id}/${photo.item_id}/${photo.filename}`
      const { error } = await supabase.storage
        .from('inspection-photos')
        .upload(path, photo.blob, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('inspection-photos')
        .getPublicUrl(path)

      await markPhotoUploaded(photo.id, urlData.publicUrl)
      uploaded++
    } catch (err) {
      errors.push(`Failed to upload photo ${photo.id}: ${err}`)
    }
  }

  return { uploaded, errors }
}

async function syncPendingFindings(): Promise<{ synced: number; errors: string[] }> {
  const findings = await getUnsyncedFindings()
  if (findings.length === 0) return { synced: 0, errors: [] }

  // Group by inspection for batch updates
  const byInspection = new Map<string, typeof findings>()
  for (const f of findings) {
    const existing = byInspection.get(f.inspection_id) || []
    existing.push(f)
    byInspection.set(f.inspection_id, existing)
  }

  let synced = 0
  const errors: string[] = []
  const syncedKeys: string[] = []

  for (const [inspectionId, items] of byInspection) {
    try {
      // Get current inspection data
      const { data: inspection, error: fetchError } = await supabase
        .from('inspections')
        .select('findings')
        .eq('id', inspectionId)
        .single()

      if (fetchError) throw fetchError

      // Merge findings
      const currentFindings = (inspection.findings || {}) as Record<string, unknown>
      const mergedFindings: Record<string, unknown> = { ...currentFindings }

      for (const item of items) {
        mergedFindings[item.item_id] = item.finding
        syncedKeys.push(`${inspectionId}:${item.item_id}`)
      }

      // Update inspection
      const { error: updateError } = await supabase
        .from('inspections')
        .update({
          findings: mergedFindings as unknown as null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inspectionId)

      if (updateError) throw updateError

      synced += items.length
    } catch (err) {
      errors.push(`Failed to sync findings for inspection ${inspectionId}: ${err}`)
    }
  }

  // Mark synced
  if (syncedKeys.length > 0) {
    await markFindingsSynced(syncedKeys)
  }

  return { synced, errors }
}

// Register for background sync (if supported)
export async function registerBackgroundSync(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (registration as any).sync.register('sync-inspection-data')
    return true
  } catch (err) {
    console.warn('Background sync registration failed:', err)
    return false
  }
}
