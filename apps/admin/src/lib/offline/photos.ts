import { supabase } from '@/lib/supabase'
import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'rossbuilt-photos'
const DB_VERSION = 1
const STORE_NAME = 'pending-photos'

interface PendingPhoto {
  id: string
  inspectionId: string
  itemId: string
  blob: Blob
  filename: string
  createdAt: string
  uploadAttempts: number
}

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('by-inspection', 'inspectionId')
          store.createIndex('by-item', ['inspectionId', 'itemId'])
        }
      },
    })
  }
  return dbPromise
}

// Generate unique ID for photo
function generatePhotoId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// Save photo blob locally
export async function savePhotoLocally(
  inspectionId: string,
  itemId: string,
  blob: Blob,
  filename: string
): Promise<string> {
  const db = await getDB()
  const id = generatePhotoId()

  const photo: PendingPhoto = {
    id,
    inspectionId,
    itemId,
    blob,
    filename,
    createdAt: new Date().toISOString(),
    uploadAttempts: 0,
  }

  await db.put(STORE_NAME, photo)
  return id
}

// Get all pending photos for an inspection
export async function getPendingPhotos(inspectionId: string): Promise<PendingPhoto[]> {
  const db = await getDB()
  return db.getAllFromIndex(STORE_NAME, 'by-inspection', inspectionId)
}

// Get pending photos for a specific checklist item
export async function getItemPendingPhotos(
  inspectionId: string,
  itemId: string
): Promise<PendingPhoto[]> {
  const db = await getDB()
  return db.getAllFromIndex(STORE_NAME, 'by-item', [inspectionId, itemId])
}

// Create object URL for local photo preview
export function createPhotoPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

// Upload a single photo to Supabase storage
export async function uploadPhoto(photo: PendingPhoto): Promise<string | null> {
  try {
    const path = `inspections/${photo.inspectionId}/${photo.itemId}/${photo.filename}`

    const { error } = await supabase.storage
      .from('inspection-photos')
      .upload(path, photo.blob, {
        contentType: photo.blob.type,
        upsert: true,
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('inspection-photos')
      .getPublicUrl(path)

    return urlData.publicUrl
  } catch (err) {
    console.error('Photo upload failed:', err)
    return null
  }
}

// Upload all pending photos and return uploaded URLs
export async function syncPendingPhotos(): Promise<{
  uploaded: number
  failed: number
  urls: Record<string, string[]> // itemId -> urls
}> {
  if (!navigator.onLine) {
    return { uploaded: 0, failed: 0, urls: {} }
  }

  const db = await getDB()
  const allPhotos = await db.getAll(STORE_NAME)

  let uploaded = 0
  let failed = 0
  const urls: Record<string, string[]> = {}
  const inspectionPhotos: Record<string, Record<string, string[]>> = {} // inspectionId -> itemId -> urls

  for (const photo of allPhotos) {
    const url = await uploadPhoto(photo)

    if (url) {
      // Success - remove from local storage
      await db.delete(STORE_NAME, photo.id)
      uploaded++

      // Track URL by itemId
      if (!urls[photo.itemId]) {
        urls[photo.itemId] = []
      }
      urls[photo.itemId].push(url)

      // Track by inspection for database update
      if (!inspectionPhotos[photo.inspectionId]) {
        inspectionPhotos[photo.inspectionId] = {}
      }
      if (!inspectionPhotos[photo.inspectionId][photo.itemId]) {
        inspectionPhotos[photo.inspectionId][photo.itemId] = []
      }
      inspectionPhotos[photo.inspectionId][photo.itemId].push(url)
    } else {
      // Failed - increment attempt counter
      photo.uploadAttempts++
      await db.put(STORE_NAME, photo)
      failed++
    }
  }

  // Update inspection findings with uploaded photo URLs
  for (const [inspectionId, itemPhotos] of Object.entries(inspectionPhotos)) {
    try {
      // Get current findings
      const { data } = await supabase
        .from('inspections')
        .select('findings')
        .eq('id', inspectionId)
        .single()

      if (data) {
        const findings = (data.findings || {}) as Record<string, { photos?: string[]; [key: string]: unknown }>

        // Add photos to each item's finding
        for (const [itemId, photoUrls] of Object.entries(itemPhotos)) {
          if (findings[itemId]) {
            // Merge with existing photos
            findings[itemId].photos = [
              ...(findings[itemId].photos || []),
              ...photoUrls,
            ]
          } else {
            // Create a minimal finding entry with photos
            findings[itemId] = {
              status: 'pass', // Default status
              photos: photoUrls,
              completed_at: new Date().toISOString(),
            }
          }
        }

        // Update inspection with new findings
        await supabase
          .from('inspections')
          .update({
            findings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', inspectionId)
      }
    } catch (err) {
      console.error(`Failed to update findings for inspection ${inspectionId}:`, err)
    }
  }

  return { uploaded, failed, urls }
}

// Get count of pending photos
export async function getPendingPhotoCount(): Promise<number> {
  const db = await getDB()
  return db.count(STORE_NAME)
}

// Delete a local photo (before upload)
export async function deleteLocalPhoto(photoId: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, photoId)
}

// Compress image blob for storage efficiency
export async function compressImage(
  blob: Blob,
  maxWidth = 1920,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Calculate dimensions
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      // Draw to canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
