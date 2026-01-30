import { useState } from 'react'
import { Check, X, AlertTriangle, AlertCircle, Minus, Camera, Loader2, ChevronRight, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useSaveFinding } from '@/hooks/use-inspection-execution'
import { usePhotoCapture, CameraInput } from '@/hooks/use-photo-capture'
import { useToast } from '@/hooks/use-toast'
import type { ChecklistItem, ChecklistItemFinding } from '@/lib/types/inspector'
import type { ChecklistItemFindingInput } from '@/lib/validations/inspection-execution'
import { ITEM_STATUS_OPTIONS } from '@/lib/constants/inspector'

interface FindingFormProps {
  inspectionId: string
  item: ChecklistItem
  existingFinding?: ChecklistItemFinding
  onSaved?: () => void
  onSaveAndNext?: () => void
  hasNextItem?: boolean
}

const STATUS_ICONS = {
  pass: Check,
  fail: X,
  needs_attention: AlertTriangle,
  urgent: AlertCircle,
  na: Minus,
} as const

export function FindingForm({
  inspectionId,
  item,
  existingFinding,
  onSaved,
  onSaveAndNext,
  hasNextItem,
}: FindingFormProps) {
  const [status, setStatus] = useState<ChecklistItemFindingInput['status']>(
    existingFinding?.status || 'pass'
  )
  const [notes, setNotes] = useState(existingFinding?.notes || '')
  const [numericValue, setNumericValue] = useState<number | undefined>(
    existingFinding?.numeric_value
  )
  const [response, setResponse] = useState(existingFinding?.response || '')
  const [saveError, setSaveError] = useState<string | null>(null)

  const { toast } = useToast()
  const saveFinding = useSaveFinding()
  const {
    photos,
    isCapturing,
    canAddMore,
    openCamera,
    deletePhoto,
    fileInputRef,
    handleFileChange,
  } = usePhotoCapture(inspectionId, item.id)

  const handleSave = async (goToNext = false) => {
    setSaveError(null)

    const finding: ChecklistItemFindingInput = {
      status,
      notes: notes || undefined,
      numeric_value: numericValue,
      response: response || undefined,
    }

    try {
      await saveFinding.mutateAsync({
        inspectionId,
        itemId: item.id,
        finding,
      })

      toast({
        title: 'Finding saved',
        description: `${item.label} marked as ${status}`,
      })

      if (goToNext && onSaveAndNext) {
        onSaveAndNext()
      } else {
        onSaved?.()
      }
    } catch (err) {
      console.error('Failed to save finding:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to save finding'
      setSaveError(errorMsg)
      toast({
        title: 'Failed to save',
        description: errorMsg,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4 p-4 overflow-y-auto max-h-[calc(85vh-4rem)]">
      {/* Item info */}
      <div>
        <h3 className="font-medium">{item.label}</h3>
        {item.description && (
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        )}
      </div>

      {/* Status buttons - large touch targets */}
      <div className="grid grid-cols-5 gap-2">
        {ITEM_STATUS_OPTIONS.map((opt) => {
          const Icon = STATUS_ICONS[opt.value]
          const isSelected = status === opt.value

          return (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors',
                isSelected
                  ? 'border-rb-green bg-rb-green/10'
                  : 'border-muted hover:border-muted-foreground/50'
              )}
            >
              <Icon className={cn('h-6 w-6', opt.color)} />
              <span className="text-xs mt-1">{opt.label}</span>
            </button>
          )
        })}
      </div>

      {/* Type-specific input */}
      {item.item_type === 'numeric' && (
        <div>
          <Label>Value {item.unit && `(${item.unit})`}</Label>
          <Input
            type="number"
            value={numericValue ?? ''}
            onChange={(e) => setNumericValue(e.target.value ? Number(e.target.value) : undefined)}
            min={item.min_value}
            max={item.max_value}
            placeholder={`Enter ${item.label.toLowerCase()}`}
            className="mt-1"
          />
        </div>
      )}

      {item.item_type === 'text' && (
        <div>
          <Label>Response</Label>
          <Input
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Enter response"
            className="mt-1"
          />
        </div>
      )}

      {item.item_type === 'select' && item.options && (
        <div>
          <Label>Select Option</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {item.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setResponse(opt)}
                className={cn(
                  'p-2 text-sm rounded-lg border transition-colors',
                  response === opt
                    ? 'border-rb-green bg-rb-green/10'
                    : 'border-muted hover:border-muted-foreground/50'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <Label>Notes (optional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this item..."
          rows={3}
          className="mt-1"
        />
      </div>

      {/* Photos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Photos ({photos.length}/5)</Label>
          {canAddMore && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openCamera}
              disabled={isCapturing}
              className="gap-1"
            >
              {isCapturing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              Add Photo
            </Button>
          )}
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square">
                <img
                  src={photo.previewUrl}
                  alt="Finding photo"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <CameraInput inputRef={fileInputRef} onChange={handleFileChange} />
      </div>

      {/* Error message */}
      {saveError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{saveError}</p>
        </div>
      )}

      {/* Save buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => handleSave(false)}
          disabled={saveFinding.isPending}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          {saveFinding.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Save & Close
        </Button>
        {hasNextItem && (
          <Button
            onClick={() => handleSave(true)}
            disabled={saveFinding.isPending}
            className="flex-1 bg-rb-green hover:bg-rb-green/90"
            size="lg"
          >
            {saveFinding.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <>
                Save & Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        )}
        {!hasNextItem && (
          <Button
            onClick={() => handleSave(false)}
            disabled={saveFinding.isPending}
            className="flex-1 bg-rb-green hover:bg-rb-green/90"
            size="lg"
          >
            {saveFinding.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Save Finding
          </Button>
        )}
      </div>
    </div>
  )
}
