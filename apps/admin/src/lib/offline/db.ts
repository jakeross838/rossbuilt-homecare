import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { InspectorInspection, ChecklistItemFinding } from '@/lib/types/inspector'

// Database schema definition
interface OfflineDB extends DBSchema {
  // Cached inspections for offline access
  inspections: {
    key: string // inspection id
    value: {
      data: InspectorInspection
      cached_at: string
      expires_at: string
    }
    indexes: {
      'by-date': string
      'by-status': string
    }
  }
  // Pending findings updates to sync
  pendingFindings: {
    key: string // `${inspection_id}:${item_id}`
    value: {
      inspection_id: string
      item_id: string
      finding: ChecklistItemFinding
      created_at: string
      synced: boolean
    }
    indexes: {
      'by-inspection': string
      'by-synced': number // 0 or 1
    }
  }
  // Pending photos to upload
  pendingPhotos: {
    key: string // UUID
    value: {
      id: string
      inspection_id: string
      item_id: string
      blob: Blob
      filename: string
      created_at: string
      uploaded: boolean
      upload_url?: string
    }
    indexes: {
      'by-inspection': string
      'by-uploaded': number
    }
  }
  // Inspection completion to sync
  pendingCompletions: {
    key: string // inspection_id
    value: {
      inspection_id: string
      overall_condition: string
      summary: string
      completed_at: string
      synced: boolean
    }
  }
  // Sync metadata
  syncMeta: {
    key: string
    value: {
      key: string
      value: string | number
      updated_at: string
    }
  }
}

const DB_NAME = 'rossbuilt-offline'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<OfflineDB> | null = null

export async function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<OfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Inspections store
      if (!db.objectStoreNames.contains('inspections')) {
        const inspectionStore = db.createObjectStore('inspections', { keyPath: 'data.id' })
        inspectionStore.createIndex('by-date', 'data.scheduled_date')
        inspectionStore.createIndex('by-status', 'data.status')
      }

      // Pending findings store
      if (!db.objectStoreNames.contains('pendingFindings')) {
        const findingsStore = db.createObjectStore('pendingFindings')
        findingsStore.createIndex('by-inspection', 'inspection_id')
        findingsStore.createIndex('by-synced', 'synced')
      }

      // Pending photos store
      if (!db.objectStoreNames.contains('pendingPhotos')) {
        const photosStore = db.createObjectStore('pendingPhotos', { keyPath: 'id' })
        photosStore.createIndex('by-inspection', 'inspection_id')
        photosStore.createIndex('by-uploaded', 'uploaded')
      }

      // Pending completions store
      if (!db.objectStoreNames.contains('pendingCompletions')) {
        db.createObjectStore('pendingCompletions', { keyPath: 'inspection_id' })
      }

      // Sync metadata store
      if (!db.objectStoreNames.contains('syncMeta')) {
        db.createObjectStore('syncMeta', { keyPath: 'key' })
      }
    },
  })

  return dbInstance
}

// Inspection cache operations
export async function cacheInspection(inspection: InspectorInspection): Promise<void> {
  const db = await getDB()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  await db.put('inspections', {
    data: inspection,
    cached_at: new Date().toISOString(),
    expires_at: expiresAt,
  })
}

export async function getCachedInspection(id: string): Promise<InspectorInspection | null> {
  const db = await getDB()
  const cached = await db.get('inspections', id)
  if (!cached) return null

  // Check if expired
  if (new Date(cached.expires_at) < new Date()) {
    await db.delete('inspections', id)
    return null
  }

  return cached.data
}

export async function getCachedInspectionsForDate(date: string): Promise<InspectorInspection[]> {
  const db = await getDB()
  const cached = await db.getAllFromIndex('inspections', 'by-date', date)
  const now = new Date()

  return cached
    .filter(c => new Date(c.expires_at) > now)
    .map(c => c.data)
}

// Pending findings operations
export async function savePendingFinding(
  inspectionId: string,
  itemId: string,
  finding: ChecklistItemFinding
): Promise<void> {
  const db = await getDB()
  const key = `${inspectionId}:${itemId}`
  await db.put('pendingFindings', {
    inspection_id: inspectionId,
    item_id: itemId,
    finding,
    created_at: new Date().toISOString(),
    synced: false,
  }, key)
}

export async function getPendingFindings(inspectionId: string): Promise<Array<{
  item_id: string
  finding: ChecklistItemFinding
}>> {
  const db = await getDB()
  const pending = await db.getAllFromIndex('pendingFindings', 'by-inspection', inspectionId)
  return pending.map(p => ({ item_id: p.item_id, finding: p.finding }))
}

export async function getUnsyncedFindings(): Promise<Array<{
  inspection_id: string
  item_id: string
  finding: ChecklistItemFinding
}>> {
  const db = await getDB()
  const all = await db.getAll('pendingFindings')
  return all.filter(p => !p.synced)
}

export async function markFindingsSynced(keys: string[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('pendingFindings', 'readwrite')
  for (const key of keys) {
    const item = await tx.store.get(key)
    if (item) {
      await tx.store.put({ ...item, synced: true }, key)
    }
  }
  await tx.done
}

// Pending photo operations
export async function savePendingPhoto(
  inspectionId: string,
  itemId: string,
  blob: Blob,
  filename: string
): Promise<string> {
  const db = await getDB()
  const id = crypto.randomUUID()
  await db.put('pendingPhotos', {
    id,
    inspection_id: inspectionId,
    item_id: itemId,
    blob,
    filename,
    created_at: new Date().toISOString(),
    uploaded: false,
  })
  return id
}

export async function getUnsyncedPhotos(): Promise<Array<{
  id: string
  inspection_id: string
  item_id: string
  blob: Blob
  filename: string
}>> {
  const db = await getDB()
  const all = await db.getAll('pendingPhotos')
  return all.filter(p => !p.uploaded)
}

export async function markPhotoUploaded(id: string, url: string): Promise<void> {
  const db = await getDB()
  const photo = await db.get('pendingPhotos', id)
  if (photo) {
    await db.put('pendingPhotos', { ...photo, uploaded: true, upload_url: url })
  }
}

// Sync metadata
export async function getSyncMeta(key: string): Promise<string | number | null> {
  const db = await getDB()
  const meta = await db.get('syncMeta', key)
  return meta?.value ?? null
}

export async function setSyncMeta(key: string, value: string | number): Promise<void> {
  const db = await getDB()
  await db.put('syncMeta', {
    key,
    value,
    updated_at: new Date().toISOString(),
  })
}

// Clear expired cache entries
export async function cleanupExpiredCache(): Promise<void> {
  const db = await getDB()
  const now = new Date()

  const tx = db.transaction('inspections', 'readwrite')
  const all = await tx.store.getAll()
  for (const item of all) {
    if (new Date(item.expires_at) < now) {
      await tx.store.delete(item.data.id)
    }
  }
  await tx.done
}
