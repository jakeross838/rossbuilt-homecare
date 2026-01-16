import { useState, useCallback, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  savePhotoLocally,
  getItemPendingPhotos,
  deleteLocalPhoto,
  compressImage,
  createPhotoPreviewUrl,
  syncPendingPhotos,
} from '@/lib/offline/photos'
import { PHOTO_LIMITS } from '@/lib/constants/inspector'

interface LocalPhoto {
  id: string
  previewUrl: string
  isLocal: true
}

interface UploadedPhoto {
  url: string
  isLocal: false
}

// Photo union type for local and uploaded photos
type _Photo = LocalPhoto | UploadedPhoto

// Hook for capturing and managing photos for a checklist item
export function usePhotoCapture(inspectionId: string, itemId: string) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  // Get pending local photos for this item
  const { data: localPhotos = [] } = useQuery({
    queryKey: ['local-photos', inspectionId, itemId],
    queryFn: async () => {
      const pending = await getItemPendingPhotos(inspectionId, itemId)
      return pending.map((p) => ({
        id: p.id,
        previewUrl: createPhotoPreviewUrl(p.blob),
        isLocal: true as const,
      }))
    },
  })

  // Capture photo from camera
  const capturePhoto = useMutation({
    mutationFn: async (file: File) => {
      // Validate file type
      if (!PHOTO_LIMITS.ACCEPTED_TYPES.includes(file.type)) {
        throw new Error('Invalid file type. Please use JPEG, PNG, or WebP.')
      }

      // Validate file size
      if (file.size > PHOTO_LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024) {
        throw new Error(`File too large. Maximum size is ${PHOTO_LIMITS.MAX_FILE_SIZE_MB}MB.`)
      }

      // Compress the image
      const compressed = await compressImage(file)

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `${itemId}_${timestamp}.jpg`

      // Save locally
      const photoId = await savePhotoLocally(inspectionId, itemId, compressed, filename)

      return photoId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local-photos', inspectionId, itemId] })
    },
  })

  // Delete a local photo
  const deletePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      await deleteLocalPhoto(photoId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local-photos', inspectionId, itemId] })
    },
  })

  // Open camera/file picker
  const openCamera = useCallback(() => {
    if (localPhotos.length >= PHOTO_LIMITS.MAX_PHOTOS_PER_ITEM) {
      alert(`Maximum ${PHOTO_LIMITS.MAX_PHOTOS_PER_ITEM} photos per item.`)
      return
    }
    fileInputRef.current?.click()
  }, [localPhotos.length])

  // Handle file selection
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setIsCapturing(true)
      try {
        await capturePhoto.mutateAsync(file)
      } catch (err) {
        console.error('Failed to capture photo:', err)
        alert(err instanceof Error ? err.message : 'Failed to capture photo')
      } finally {
        setIsCapturing(false)
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [capturePhoto]
  )

  return {
    photos: localPhotos,
    isCapturing,
    canAddMore: localPhotos.length < PHOTO_LIMITS.MAX_PHOTOS_PER_ITEM,
    openCamera,
    deletePhoto: deletePhoto.mutate,
    fileInputRef,
    handleFileChange,
    maxPhotos: PHOTO_LIMITS.MAX_PHOTOS_PER_ITEM,
  }
}

// Hook for syncing all pending photos
export function usePhotoSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: syncPendingPhotos,
    onSuccess: (result) => {
      // Invalidate all local photo queries
      queryClient.invalidateQueries({ queryKey: ['local-photos'] })

      if (result.uploaded > 0) {
        console.log(`Synced ${result.uploaded} photos`)
      }
      if (result.failed > 0) {
        console.warn(`Failed to sync ${result.failed} photos`)
      }
    },
  })
}

// Camera input component helper
export function CameraInput({
  inputRef,
  onChange,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      capture="environment" // Use back camera on mobile
      onChange={onChange}
      className="hidden"
    />
  )
}
