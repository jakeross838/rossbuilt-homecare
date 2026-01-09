'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  Play, CheckCircle, XCircle, Camera, ChevronLeft, ChevronRight,
  AlertTriangle, FileText, X, Trash2, Clock, Building2, Edit
} from 'lucide-react'

// Enhanced checklist item type with different input types
export interface ChecklistItemTemplate {
  name: string
  category: string
  input_type: 'checkbox' | 'text' | 'number' | 'dropdown' | 'condition'
  options?: string[] // For dropdown type
  requires_photo?: boolean
  description?: string
  unit?: string // For number type (e.g., "°F", "PSI")
}

// Result for each item after inspection
export interface ChecklistItemResult {
  name: string
  category: string
  input_type: string
  status: 'ok' | 'issue' | 'pending'
  value?: string | number | boolean
  notes: string
  photos: { id: string; url: string }[]
}

export interface ChecklistCompletion {
  id: string
  template_id: string
  property_id: string
  scheduled_date: string
  status: string
  started_at?: string
  completed_at?: string
  completed_by?: string
  results?: ChecklistItemResult[]
  notes?: string
  items?: ChecklistItemTemplate[] // Per-job items (editable copy)
  template?: {
    id: string
    name: string
    frequency?: string
    items: ChecklistItemTemplate[]
  }
  property?: {
    id: string
    name: string
    address?: string
  }
}

interface InspectionWalkthroughProps {
  completion: ChecklistCompletion
  onComplete: () => void
  onCancel: () => void
}

export function InspectionWalkthrough({ completion, onComplete, onCancel }: InspectionWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState<'start' | 'walkthrough' | 'review' | 'complete' | 'edit'>('start')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<ChecklistItemResult[]>([])
  const [overallNotes, setOverallNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Per-job editable items - prefer completion.items, fall back to template
  const [editableItems, setEditableItems] = useState<ChecklistItemTemplate[]>(
    completion.items || completion.template?.items || []
  )

  const items = editableItems
  const currentItem = items[currentIndex]
  const progress = results.filter(r => r.status !== 'pending').length
  const issueCount = results.filter(r => r.status === 'issue').length

  // Initialize results from items
  useEffect(() => {
    if (items.length > 0 && results.length === 0) {
      // Check if there are existing results from a resumed inspection
      if (completion.results && completion.results.length > 0) {
        setResults(completion.results)
        setCurrentStep('walkthrough')
      } else {
        setResults(items.map(item => ({
          name: item.name,
          category: item.category,
          input_type: item.input_type || 'checkbox',
          status: 'pending',
          value: undefined,
          notes: '',
          photos: []
        })))
      }
    }
  }, [items, completion.results, results.length])

  // Sync results when items change (e.g., after editing)
  function syncResultsWithItems() {
    setResults(editableItems.map(item => ({
      name: item.name,
      category: item.category,
      input_type: item.input_type || 'checkbox',
      status: 'pending',
      value: undefined,
      notes: '',
      photos: []
    })))
  }

  // Save edited items to the database
  async function saveItemEdits() {
    setSaving(true)
    try {
      await fetch(`/api/checklist-completions/${completion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: editableItems })
      })
      syncResultsWithItems()
      setCurrentStep('start')
    } catch (err) {
      console.error('Failed to save items:', err)
    }
    setSaving(false)
  }

  // Add a new item
  function addItem() {
    setEditableItems([...editableItems, {
      name: 'New Item',
      category: 'general',
      input_type: 'checkbox',
      requires_photo: false
    }])
  }

  // Remove an item
  function removeItem(index: number) {
    setEditableItems(editableItems.filter((_, i) => i !== index))
  }

  // Update an item
  function updateItem(index: number, updates: Partial<ChecklistItemTemplate>) {
    const newItems = [...editableItems]
    newItems[index] = { ...newItems[index], ...updates }
    setEditableItems(newItems)
  }

  async function startInspection() {
    // Mark as in_progress
    await fetch(`/api/checklist-completions/${completion.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start' })
    })
    setCurrentStep('walkthrough')
  }

  function updateCurrentResult(updates: Partial<ChecklistItemResult>) {
    const newResults = [...results]
    newResults[currentIndex] = { ...newResults[currentIndex], ...updates }
    setResults(newResults)
  }

  function markStatus(status: 'ok' | 'issue') {
    updateCurrentResult({ status })
  }

  async function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('checklist_completion_id', completion.id)
    formData.append('item_name', currentItem?.name || '')
    formData.append('room_area', currentItem?.category || '')

    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const photo = await res.json()
        const currentPhotos = results[currentIndex]?.photos || []
        updateCurrentResult({
          photos: [...currentPhotos, { id: photo.id, url: photo.photo_url }]
        })
      }
    } catch (err) {
      console.error('Photo upload failed:', err)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function deletePhoto(photoId: string) {
    try {
      await fetch(`/api/photos/${photoId}`, { method: 'DELETE' })
      const currentPhotos = results[currentIndex]?.photos || []
      updateCurrentResult({
        photos: currentPhotos.filter(p => p.id !== photoId)
      })
    } catch (err) {
      console.error('Photo delete failed:', err)
    }
  }

  function goNext() {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentStep('review')
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  function goToItem(index: number) {
    setCurrentIndex(index)
    setCurrentStep('walkthrough')
  }

  async function completeInspection() {
    setSaving(true)

    try {
      const res = await fetch(`/api/checklist-completions/${completion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          results: results,
          notes: overallNotes,
          completed_by: 'Inspector'
        })
      })

      if (res.ok) {
        setCurrentStep('complete')
        setShowReport(true)
      } else {
        alert('Failed to save inspection. Please try again.')
      }
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save. Check your connection.')
    }

    setSaving(false)
  }

  // Render input based on item type
  function renderItemInput() {
    if (!currentItem) return null
    const result = results[currentIndex]
    const inputType = currentItem.input_type || 'checkbox'

    switch (inputType) {
      case 'checkbox':
        return (
          <div className="grid grid-cols-2 gap-4">
            <Button
              size="lg"
              variant={result?.status === 'ok' ? 'default' : 'outline'}
              className={`h-20 text-lg ${result?.status === 'ok' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              onClick={() => markStatus('ok')}
            >
              <CheckCircle className="h-8 w-8 mr-2" />
              OK
            </Button>
            <Button
              size="lg"
              variant={result?.status === 'issue' ? 'default' : 'outline'}
              className={`h-20 text-lg ${result?.status === 'issue' ? 'bg-red-600 hover:bg-red-700' : ''}`}
              onClick={() => markStatus('issue')}
            >
              <XCircle className="h-8 w-8 mr-2" />
              Issue
            </Button>
          </div>
        )

      case 'condition':
        return (
          <div className="space-y-3">
            <Select
              value={result?.value as string || ''}
              onValueChange={(val) => {
                updateCurrentResult({
                  value: val,
                  status: val === 'poor' || val === 'needs_repair' ? 'issue' : 'ok'
                })
              }}
            >
              <SelectTrigger className="h-14 text-lg">
                <SelectValue placeholder="Select condition..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="needs_repair">Needs Repair</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 'dropdown':
        return (
          <div className="space-y-3">
            <Select
              value={result?.value as string || ''}
              onValueChange={(val) => {
                updateCurrentResult({ value: val, status: 'ok' })
              }}
            >
              <SelectTrigger className="h-14 text-lg">
                <SelectValue placeholder="Select option..." />
              </SelectTrigger>
              <SelectContent>
                {(currentItem.options || []).map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Button
                size="lg"
                variant={result?.status === 'ok' ? 'default' : 'outline'}
                className={`h-14 ${result?.status === 'ok' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => markStatus('ok')}
              >
                <CheckCircle className="h-6 w-6 mr-2" />
                OK
              </Button>
              <Button
                size="lg"
                variant={result?.status === 'issue' ? 'default' : 'outline'}
                className={`h-14 ${result?.status === 'issue' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                onClick={() => markStatus('issue')}
              >
                <XCircle className="h-6 w-6 mr-2" />
                Issue
              </Button>
            </div>
          </div>
        )

      case 'number':
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                value={result?.value as number || ''}
                onChange={(e) => updateCurrentResult({ value: parseFloat(e.target.value) || 0, status: 'ok' })}
                placeholder="Enter value..."
                className="h-14 text-lg flex-1"
              />
              {currentItem.unit && (
                <div className="h-14 px-4 flex items-center bg-muted rounded-md text-lg font-medium">
                  {currentItem.unit}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                size="lg"
                variant={result?.status === 'ok' ? 'default' : 'outline'}
                className={`h-14 ${result?.status === 'ok' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => markStatus('ok')}
              >
                <CheckCircle className="h-6 w-6 mr-2" />
                OK
              </Button>
              <Button
                size="lg"
                variant={result?.status === 'issue' ? 'default' : 'outline'}
                className={`h-14 ${result?.status === 'issue' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                onClick={() => markStatus('issue')}
              >
                <XCircle className="h-6 w-6 mr-2" />
                Issue
              </Button>
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="space-y-3">
            <Input
              value={result?.value as string || ''}
              onChange={(e) => updateCurrentResult({ value: e.target.value, status: 'ok' })}
              placeholder="Enter observation..."
              className="h-14 text-lg"
            />
            <div className="grid grid-cols-2 gap-4">
              <Button
                size="lg"
                variant={result?.status === 'ok' ? 'default' : 'outline'}
                className={`h-14 ${result?.status === 'ok' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => markStatus('ok')}
              >
                <CheckCircle className="h-6 w-6 mr-2" />
                OK
              </Button>
              <Button
                size="lg"
                variant={result?.status === 'issue' ? 'default' : 'outline'}
                className={`h-14 ${result?.status === 'issue' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                onClick={() => markStatus('issue')}
              >
                <XCircle className="h-6 w-6 mr-2" />
                Issue
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // START SCREEN
  if (currentStep === 'start') {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold mb-2">{completion.template?.name}</h2>
          <p className="text-muted-foreground">
            {completion.property?.name}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Scheduled: {new Date(completion.scheduled_date).toLocaleDateString()}
          </p>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Inspection Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Items:</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Categories:</span>
              <span className="font-medium">
                {[...new Set(items.map(i => i.category))].length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Photo Required:</span>
              <span className="font-medium">
                {items.filter(i => i.requires_photo).length} items
              </span>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => setCurrentStep('edit')}>
            Edit Items
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={startInspection}>
            <Play className="h-5 w-5 mr-2" />
            Start Inspection
          </Button>
        </div>
      </div>
    )
  }

  // EDIT ITEMS SCREEN
  if (currentStep === 'edit') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Checklist Items</h2>
          <Badge variant="secondary">{editableItems.length} items</Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Customize this inspection. Add, remove, or modify items as needed for this specific job.
        </p>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {editableItems.map((item, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(index, { name: e.target.value })}
                    placeholder="Item name"
                    className="font-medium"
                  />
                  <div className="flex gap-2">
                    <Select
                      value={item.category}
                      onValueChange={(val) => updateItem(index, { category: val })}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="pool">Pool</SelectItem>
                        <SelectItem value="hvac">HVAC</SelectItem>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="appliance">Appliance</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="exterior">Exterior</SelectItem>
                        <SelectItem value="interior">Interior</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="linens">Linens</SelectItem>
                        <SelectItem value="provisions">Provisions</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={item.input_type}
                      onValueChange={(val) => updateItem(index, { input_type: val as ChecklistItemTemplate['input_type'] })}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="condition">Condition</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                      <Checkbox
                        checked={item.requires_photo || false}
                        onCheckedChange={(checked) => updateItem(index, { requires_photo: !!checked })}
                      />
                      <Camera className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Button variant="outline" className="w-full" onClick={addItem}>
          + Add Item
        </Button>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentStep('start')}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={saveItemEdits} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    )
  }

  // WALKTHROUGH SCREEN
  if (currentStep === 'walkthrough' && currentItem) {
    const result = results[currentIndex]

    return (
      <div className="space-y-4">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Item {currentIndex + 1} of {items.length}
          </div>
          <Badge variant={issueCount > 0 ? 'destructive' : 'secondary'}>
            {issueCount} issue{issueCount !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
          />
        </div>

        {/* Item Card */}
        <Card className={`p-6 ${
          result?.status === 'ok' ? 'border-green-500 bg-green-50' :
          result?.status === 'issue' ? 'border-red-500 bg-red-50' : ''
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge variant="outline" className="mb-2">{currentItem.category}</Badge>
              <h3 className="text-xl font-semibold">{currentItem.name}</h3>
              {currentItem.description && (
                <p className="text-sm text-muted-foreground mt-1">{currentItem.description}</p>
              )}
            </div>
            {result?.status !== 'pending' && (
              result?.status === 'ok' ? (
                <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
              )
            )}
          </div>

          {/* Input based on type */}
          {renderItemInput()}

          {/* Notes */}
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">
              Notes {result?.status === 'issue' && <span className="text-red-500">*</span>}
            </label>
            <Textarea
              value={result?.notes || ''}
              onChange={(e) => updateCurrentResult({ notes: e.target.value })}
              placeholder={result?.status === 'issue' ? "Describe the issue..." : "Optional notes..."}
              rows={2}
            />
          </div>

          {/* Photo Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                Photos {currentItem.requires_photo && <span className="text-red-500">*</span>}
              </label>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
            </div>
            {result?.photos && result.photos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {result.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt=""
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous
          </Button>
          <Button
            className="flex-1"
            onClick={goNext}
          >
            {currentIndex === items.length - 1 ? 'Review' : 'Next'}
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  // REVIEW SCREEN
  if (currentStep === 'review') {
    const pendingItems = results.filter(r => r.status === 'pending')
    const okItems = results.filter(r => r.status === 'ok')
    const issueItems = results.filter(r => r.status === 'issue')

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Review Inspection</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center bg-green-50 border-green-200">
            <CheckCircle className="h-6 w-6 mx-auto mb-1 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{okItems.length}</div>
            <div className="text-xs text-green-700">OK</div>
          </Card>
          <Card className="p-4 text-center bg-red-50 border-red-200">
            <XCircle className="h-6 w-6 mx-auto mb-1 text-red-600" />
            <div className="text-2xl font-bold text-red-600">{issueItems.length}</div>
            <div className="text-xs text-red-700">Issues</div>
          </Card>
          <Card className="p-4 text-center bg-yellow-50 border-yellow-200">
            <Clock className="h-6 w-6 mx-auto mb-1 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-600">{pendingItems.length}</div>
            <div className="text-xs text-yellow-700">Pending</div>
          </Card>
        </div>

        {/* Warning if pending items */}
        {pendingItems.length > 0 && (
          <Card className="p-4 bg-yellow-50 border-yellow-300">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Incomplete Items</p>
                <p className="text-sm text-yellow-700">
                  {pendingItems.length} item(s) haven't been checked. Tap to complete.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Issues List */}
        {issueItems.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 text-red-600">Issues Found</h3>
            <div className="space-y-2">
              {issueItems.map((item, idx) => (
                <Card
                  key={idx}
                  className="p-3 cursor-pointer hover:border-red-400"
                  onClick={() => goToItem(results.indexOf(item))}
                >
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.name}</p>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground truncate">{item.notes}</p>
                      )}
                      {item.photos.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.photos.length} photo(s)
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Items List */}
        <div>
          <h3 className="font-semibold mb-2">All Items</h3>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {results.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer"
                onClick={() => goToItem(idx)}
              >
                {item.status === 'ok' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {item.status === 'issue' && <XCircle className="h-4 w-4 text-red-500" />}
                {item.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                <span className="flex-1 truncate text-sm">{item.name}</span>
                {item.photos.length > 0 && (
                  <Camera className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Overall Notes */}
        <div>
          <label className="text-sm font-medium mb-2 block">Overall Notes</label>
          <Textarea
            value={overallNotes}
            onChange={(e) => setOverallNotes(e.target.value)}
            placeholder="Any additional observations about this inspection..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentStep('walkthrough')}>
            Back to Items
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={completeInspection}
            disabled={saving || pendingItems.length > 0}
          >
            {saving ? 'Saving...' : 'Complete Inspection'}
          </Button>
        </div>
      </div>
    )
  }

  // COMPLETE SCREEN WITH REPORT
  if (currentStep === 'complete') {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
          <h2 className="text-2xl font-bold mb-2">Inspection Complete</h2>
          <p className="text-muted-foreground">
            {new Date().toLocaleString()}
          </p>
        </div>

        <Button className="w-full" onClick={() => setShowReport(true)}>
          <FileText className="h-5 w-5 mr-2" />
          View Report
        </Button>

        <Button variant="outline" className="w-full" onClick={onComplete}>
          Done
        </Button>

        {/* Report Dialog */}
        <Dialog open={showReport} onOpenChange={setShowReport}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Inspection Report</DialogTitle>
            </DialogHeader>
            <InspectionReport
              completion={completion}
              results={results}
              overallNotes={overallNotes}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReport(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return null
}

// Report Component
function InspectionReport({
  completion,
  results,
  overallNotes
}: {
  completion: ChecklistCompletion
  results: ChecklistItemResult[]
  overallNotes: string
}) {
  const okItems = results.filter(r => r.status === 'ok')
  const issueItems = results.filter(r => r.status === 'issue')
  const totalPhotos = results.reduce((sum, r) => sum + r.photos.length, 0)

  return (
    <div className="space-y-6 text-sm">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-lg font-bold">{completion.template?.name}</h2>
        <p className="text-muted-foreground">{completion.property?.name}</p>
        <p className="text-muted-foreground">{completion.property?.address}</p>
        <div className="flex gap-4 mt-2 text-xs">
          <span>Date: {new Date().toLocaleDateString()}</span>
          <span>Inspector: {completion.completed_by || 'Inspector'}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{results.length}</div>
          <div className="text-xs text-muted-foreground">Total Items</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{okItems.length}</div>
          <div className="text-xs text-green-700">Passed</div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{issueItems.length}</div>
          <div className="text-xs text-red-700">Issues</div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalPhotos}</div>
          <div className="text-xs text-blue-700">Photos</div>
        </div>
      </div>

      {/* Issues Section */}
      {issueItems.length > 0 && (
        <div>
          <h3 className="font-semibold text-red-600 mb-2">Issues Requiring Attention</h3>
          <div className="space-y-3">
            {issueItems.map((item, idx) => (
              <Card key={idx} className="p-3 border-red-200 bg-red-50">
                <div className="font-medium">{item.name}</div>
                <Badge variant="outline" className="text-xs mt-1">{item.category}</Badge>
                {item.value && (
                  <p className="text-sm mt-1">Value: {String(item.value)}</p>
                )}
                {item.notes && (
                  <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                )}
                {item.photos.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {item.photos.map(photo => (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt=""
                        className="h-16 w-16 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Items by Category */}
      <div>
        <h3 className="font-semibold mb-2">Detailed Results</h3>
        {Object.entries(
          results.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = []
            acc[item.category].push(item)
            return acc
          }, {} as Record<string, ChecklistItemResult[]>)
        ).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
              {category}
            </h4>
            <div className="space-y-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 py-1">
                  {item.status === 'ok' ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span>{item.name}</span>
                    {item.value && (
                      <span className="text-muted-foreground ml-2">({String(item.value)})</span>
                    )}
                    {item.notes && (
                      <p className="text-xs text-muted-foreground">{item.notes}</p>
                    )}
                  </div>
                  {item.photos.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {item.photos.length} photo{item.photos.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Notes */}
      {overallNotes && (
        <div>
          <h3 className="font-semibold mb-2">Inspector Notes</h3>
          <Card className="p-3 bg-muted">
            <p className="whitespace-pre-wrap">{overallNotes}</p>
          </Card>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-4 text-xs text-muted-foreground text-center">
        Report generated on {new Date().toLocaleString()}
      </div>
    </div>
  )
}
