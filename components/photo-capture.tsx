"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Camera, X, Upload, Image, Trash2, Loader2 } from "lucide-react"

interface Photo {
  id: string
  photo_url: string
  caption?: string
  room_area?: string
  item_name?: string
  created_at: string
}

interface PhotoCaptureProps {
  checklistCompletionId?: string
  workOrderId?: string
  itemName?: string
  roomArea?: string
  photos: Photo[]
  onPhotosChange: (photos: Photo[]) => void
  compact?: boolean
}

export function PhotoCapture({
  checklistCompletionId,
  workOrderId,
  itemName,
  roomArea,
  photos,
  onPhotosChange,
  compact = false
}: PhotoCaptureProps) {
  const [uploading, setUploading] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [caption, setCaption] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newPhotos: Photo[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      if (checklistCompletionId) formData.append('checklist_completion_id', checklistCompletionId)
      if (workOrderId) formData.append('work_order_id', workOrderId)
      if (itemName) formData.append('item_name', itemName)
      if (roomArea) formData.append('room_area', roomArea)
      if (caption) formData.append('caption', caption)

      try {
        const res = await fetch('/api/photos', {
          method: 'POST',
          body: formData
        })

        if (res.ok) {
          const photo = await res.json()
          newPhotos.push(photo)
        }
      } catch (err) {
        console.error('Upload failed:', err)
      }
    }

    onPhotosChange([...photos, ...newPhotos])
    setUploading(false)
    setCaption("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleDelete(photoId: string) {
    try {
      await fetch(`/api/photos?id=${photoId}`, { method: 'DELETE' })
      onPhotosChange(photos.filter(p => p.id !== photoId))
      setSelectedPhoto(null)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const itemPhotos = itemName
    ? photos.filter(p => p.item_name === itemName)
    : photos

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
        {itemPhotos.length > 0 && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowGallery(true)}
            className="text-xs"
          >
            <Image className="h-4 w-4 mr-1" />
            {itemPhotos.length}
          </Button>
        )}

        {/* Gallery Dialog */}
        <Dialog open={showGallery} onOpenChange={setShowGallery}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Photos {itemName && `- ${itemName}`}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-2">
              {itemPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || 'Inspection photo'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(photo.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGallery(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Full Photo View */}
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl">
            {selectedPhoto && (
              <>
                <img
                  src={selectedPhoto.photo_url}
                  alt={selectedPhoto.caption || 'Inspection photo'}
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                />
                {selectedPhoto.caption && (
                  <p className="text-sm text-muted-foreground mt-2">{selectedPhoto.caption}</p>
                )}
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedPhoto.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Full photo capture UI
  return (
    <Card className="p-4">
      <h4 className="font-medium mb-3 flex items-center gap-2">
        <Camera className="h-4 w-4" />
        Photo Documentation
      </h4>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Upload area */}
      <div
        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Tap to take photo or upload
            </p>
          </>
        )}
      </div>

      {/* Caption input */}
      <Input
        placeholder="Add caption (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="mb-4"
      />

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              <img
                src={photo.photo_url}
                alt={photo.caption || 'Inspection photo'}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              />
              <button
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(photo.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Full Photo View Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          {selectedPhoto && (
            <>
              <img
                src={selectedPhoto.photo_url}
                alt={selectedPhoto.caption || 'Inspection photo'}
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
              <div className="flex justify-between items-center mt-2">
                <div>
                  {selectedPhoto.caption && (
                    <p className="text-sm">{selectedPhoto.caption}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedPhoto.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedPhoto.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Photo Gallery component for viewing inspection photos
export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  if (photos.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        <Image className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No photos</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.photo_url}
              alt={photo.caption || 'Inspection photo'}
              className="w-full h-full object-cover"
            />
            {photo.item_name && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                {photo.item_name}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          {selectedPhoto && (
            <>
              <img
                src={selectedPhoto.photo_url}
                alt={selectedPhoto.caption || 'Inspection photo'}
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
              <div className="mt-2">
                {selectedPhoto.item_name && (
                  <p className="font-medium">{selectedPhoto.item_name}</p>
                )}
                {selectedPhoto.caption && (
                  <p className="text-sm text-muted-foreground">{selectedPhoto.caption}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(selectedPhoto.created_at).toLocaleString()}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
