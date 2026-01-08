'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle, XCircle, Camera, ChevronLeft, ChevronRight,
  Upload, Wifi, WifiOff, Home, Save, Check, AlertTriangle
} from 'lucide-react'

interface ChecklistItem {
  name: string
  category: string
  status: 'pending' | 'ok' | 'issue'
  notes: string
}

interface ChecklistCompletion {
  id: string
  template_id: string
  property_id: string
  scheduled_date: string
  status: string
  template?: {
    id: string
    name: string
    items: { name: string; category: string }[]
  }
}

interface InspectionPhoto {
  id: string
  photo_url: string
  caption?: string
  item_name?: string
}

interface MobileInspectionProps {
  completion: ChecklistCompletion
  onComplete: () => void
  onExit: () => void
}

export function MobileInspection({ completion, onComplete, onExit }: MobileInspectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [photos, setPhotos] = useState<InspectionPhoto[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize items from template
  useEffect(() => {
    if (completion.template?.items) {
      // Try to load from localStorage first (offline support)
      const savedKey = `inspection_${completion.id}`
      const saved = localStorage.getItem(savedKey)

      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setItems(parsed.items || [])
          setPhotos(parsed.photos || [])
          return
        } catch {
          // Invalid saved data, start fresh
        }
      }

      // Start fresh
      setItems(completion.template.items.map(item => ({
        name: item.name,
        category: item.category,
        status: 'pending',
        notes: ''
      })))
    }
  }, [completion])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Save to localStorage whenever items or photos change
  useEffect(() => {
    const savedKey = `inspection_${completion.id}`
    localStorage.setItem(savedKey, JSON.stringify({ items, photos }))
  }, [items, photos, completion.id])

  // Load photos for this completion
  useEffect(() => {
    async function loadPhotos() {
      try {
        const res = await fetch(`/api/photos?checklist_completion_id=${completion.id}`)
        if (res.ok) {
          const data = await res.json()
          setPhotos(Array.isArray(data) ? data : [])
        }
      } catch {
        // Offline or error - photos will come from localStorage
      }
    }
    loadPhotos()
  }, [completion.id])

  const currentItem = items[currentIndex]
  const progress = items.filter(i => i.status !== 'pending').length
  const total = items.length
  const issueCount = items.filter(i => i.status === 'issue').length

  function markStatus(status: 'ok' | 'issue') {
    const updated = [...items]
    updated[currentIndex] = { ...updated[currentIndex], status }
    setItems(updated)

    // Auto-advance to next pending item after a short delay
    setTimeout(() => {
      const nextPending = items.findIndex((item, idx) => idx > currentIndex && item.status === 'pending')
      if (nextPending !== -1) {
        setCurrentIndex(nextPending)
      } else if (progress + 1 >= total) {
        setShowComplete(true)
      }
    }, 300)
  }

  function updateNotes(notes: string) {
    const updated = [...items]
    updated[currentIndex] = { ...updated[currentIndex], notes }
    setItems(updated)
  }

  function goNext() {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  async function capturePhoto() {
    fileInputRef.current?.click()
  }

  async function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !currentItem) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('checklist_completion_id', completion.id)
    formData.append('item_name', currentItem.name)
    formData.append('room_area', currentItem.category)

    if (isOnline) {
      try {
        const res = await fetch('/api/photos', {
          method: 'POST',
          body: formData
        })
        if (res.ok) {
          const photo = await res.json()
          setPhotos([...photos, photo])
        }
      } catch (err) {
        console.error('Photo upload failed:', err)
        // Save locally for later sync
        const reader = new FileReader()
        reader.onload = () => {
          const localPhoto = {
            id: `local_${Date.now()}`,
            photo_url: reader.result as string,
            item_name: currentItem.name,
            pending_upload: true
          }
          setPhotos([...photos, localPhoto as InspectionPhoto])
        }
        reader.readAsDataURL(file)
      }
    } else {
      // Offline - save as base64
      const reader = new FileReader()
      reader.onload = () => {
        const localPhoto = {
          id: `local_${Date.now()}`,
          photo_url: reader.result as string,
          item_name: currentItem.name,
          pending_upload: true
        }
        setPhotos([...photos, localPhoto as InspectionPhoto])
      }
      reader.readAsDataURL(file)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function completeInspection() {
    setSaving(true)

    try {
      // Save the completion
      const res = await fetch(`/api/checklist-completions/${completion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          results: items,
          completed_by: 'Mobile Inspector'
        })
      })

      if (res.ok) {
        // Clear localStorage
        localStorage.removeItem(`inspection_${completion.id}`)
        onComplete()
      } else {
        alert('Failed to save inspection. Please try again.')
      }
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save. Check your connection and try again.')
    }

    setSaving(false)
  }

  const currentPhotos = photos.filter(p => p.item_name === currentItem?.name)

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inspection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <Home className="h-5 w-5" />
        </Button>

        <div className="text-center">
          <h1 className="font-semibold text-sm truncate max-w-[200px]">
            {completion.template?.name}
          </h1>
          <p className="text-xs text-gray-500">
            {progress}/{total} completed
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white px-4 py-2 border-b">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {/* Item Card */}
        <Card className={`p-6 mb-4 ${
          currentItem.status === 'ok' ? 'border-green-500 bg-green-50' :
          currentItem.status === 'issue' ? 'border-red-500 bg-red-50' : ''
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge variant="outline" className="mb-2">{currentItem.category}</Badge>
              <h2 className="text-xl font-semibold">{currentItem.name}</h2>
              <p className="text-sm text-gray-500">Item {currentIndex + 1} of {total}</p>
            </div>
            {currentItem.status !== 'pending' && (
              currentItem.status === 'ok' ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Button
              size="lg"
              variant={currentItem.status === 'ok' ? 'default' : 'outline'}
              className={`h-20 text-lg ${currentItem.status === 'ok' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              onClick={() => markStatus('ok')}
            >
              <CheckCircle className="h-8 w-8 mr-2" />
              OK
            </Button>
            <Button
              size="lg"
              variant={currentItem.status === 'issue' ? 'default' : 'outline'}
              className={`h-20 text-lg ${currentItem.status === 'issue' ? 'bg-red-600 hover:bg-red-700' : ''}`}
              onClick={() => markStatus('issue')}
            >
              <XCircle className="h-8 w-8 mr-2" />
              Issue
            </Button>
          </div>

          {/* Notes */}
          {currentItem.status === 'issue' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Describe the issue:</label>
              <Textarea
                value={currentItem.notes}
                onChange={(e) => updateNotes(e.target.value)}
                placeholder="What's wrong? Be specific..."
                rows={3}
                className="text-base"
              />
            </div>
          )}

          {/* Camera Button */}
          <Button
            variant="outline"
            size="lg"
            className="w-full h-14"
            onClick={capturePhoto}
          >
            <Camera className="h-6 w-6 mr-2" />
            Take Photo ({currentPhotos.length})
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />

          {/* Photo Thumbnails */}
          {currentPhotos.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {currentPhotos.map((photo) => (
                <div key={photo.id} className="relative flex-shrink-0">
                  <img
                    src={photo.photo_url}
                    alt=""
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                  {(photo as { pending_upload?: boolean }).pending_upload && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <Upload className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-14"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-6 w-6 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-14"
            onClick={goNext}
            disabled={currentIndex === items.length - 1}
          >
            Next
            <ChevronRight className="h-6 w-6 ml-1" />
          </Button>
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="bg-white border-t px-4 py-3 sticky bottom-0">
        {progress >= total ? (
          <Button
            size="lg"
            className="w-full h-14 bg-green-600 hover:bg-green-700"
            onClick={() => setShowComplete(true)}
          >
            <Check className="h-6 w-6 mr-2" />
            Complete Inspection
          </Button>
        ) : (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {total - progress} items remaining
            </span>
            {issueCount > 0 && (
              <Badge variant="destructive">
                {issueCount} issue{issueCount !== 1 ? 's' : ''} found
              </Badge>
            )}
          </div>
        )}
      </footer>

      {/* Complete Confirmation Modal */}
      {showComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Complete Inspection?</h3>
            <div className="space-y-2 mb-6">
              <p className="text-gray-600">
                {progress} of {total} items checked
              </p>
              {issueCount > 0 ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{issueCount} issue{issueCount !== 1 ? 's' : ''} will be reported</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>No issues found</span>
                </div>
              )}
              <p className="text-sm text-gray-500">
                {photos.length} photo{photos.length !== 1 ? 's' : ''} captured
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowComplete(false)}
                disabled={saving}
              >
                Review
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={completeInspection}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// Standalone page wrapper for /mobile-inspection route
export function MobileInspectionPage() {
  const [completions, setCompletions] = useState<ChecklistCompletion[]>([])
  const [selectedCompletion, setSelectedCompletion] = useState<ChecklistCompletion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingInspections()
  }, [])

  async function fetchPendingInspections() {
    try {
      const res = await fetch('/api/checklist-completions?status=scheduled')
      if (res.ok) {
        const data = await res.json()
        setCompletions(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to fetch inspections:', err)
    }
    setLoading(false)
  }

  if (selectedCompletion) {
    return (
      <MobileInspection
        completion={selectedCompletion}
        onComplete={() => {
          setSelectedCompletion(null)
          fetchPendingInspections()
        }}
        onExit={() => setSelectedCompletion(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm px-4 py-4 sticky top-0">
        <h1 className="text-xl font-semibold">Inspections</h1>
        <p className="text-sm text-gray-500">Select an inspection to begin</p>
      </header>

      <main className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading inspections...</p>
          </div>
        ) : completions.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No pending inspections</p>
            <p className="text-sm text-gray-500 mt-1">All caught up!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {completions.map((comp) => (
              <Card
                key={comp.id}
                className="p-4 cursor-pointer hover:border-blue-500 active:bg-gray-50 transition-all"
                onClick={async () => {
                  // Start the inspection first
                  await fetch(`/api/checklist-completions/${comp.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'start' })
                  })
                  setSelectedCompletion({ ...comp, status: 'in_progress' })
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{comp.template?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {comp.template?.items?.length || 0} items • Scheduled: {new Date(comp.scheduled_date).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
