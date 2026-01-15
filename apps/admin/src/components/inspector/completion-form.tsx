import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  useCompleteInspection,
  calculateInspectionProgress,
} from '@/hooks/use-inspection-execution'
import { useOffline } from '@/hooks/use-offline'
import { SyncStatus } from './sync-status'
import type { InspectorInspection } from '@/lib/types/inspector'
import type { CompleteInspectionInput } from '@/lib/validations/inspection-execution'
import { CONDITION_RATINGS } from '@/lib/constants/inspector'
import { cn } from '@/lib/utils'

interface CompletionFormProps {
  inspection: InspectorInspection
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompletionForm({
  inspection,
  open,
  onOpenChange,
}: CompletionFormProps) {
  const navigate = useNavigate()
  const { isOnline } = useOffline()
  const completeInspection = useCompleteInspection()
  const progress = calculateInspectionProgress(inspection)

  const [overallCondition, setOverallCondition] =
    useState<CompleteInspectionInput['overall_condition']>('good')
  const [summary, setSummary] = useState('')
  const [temperature, setTemperature] = useState<string>('')
  const [humidity, setHumidity] = useState<string>('')
  const [weatherConditions, setWeatherConditions] = useState('')

  const isComplete = progress.completed === progress.total
  const canComplete = isComplete && isOnline && summary.length >= 10

  const handleComplete = async () => {
    const data: CompleteInspectionInput = {
      overall_condition: overallCondition,
      summary,
      weather_conditions: {
        temperature: temperature ? parseFloat(temperature) : undefined,
        humidity: humidity ? parseFloat(humidity) : undefined,
        conditions: weatherConditions || undefined,
      },
    }

    await completeInspection.mutateAsync({
      inspectionId: inspection.id,
      data,
    })

    onOpenChange(false)
    navigate('/inspector')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Complete Inspection</SheetTitle>
          <SheetDescription>
            Review and submit your inspection findings
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Progress check */}
          <div
            className={cn(
              'p-4 rounded-lg border',
              isComplete
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            )}
          >
            <div className="flex items-center gap-3">
              {isComplete ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              )}
              <div>
                <p className="font-medium">
                  {isComplete
                    ? 'All items completed'
                    : `${progress.total - progress.completed} items remaining`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {progress.completed} of {progress.total} checklist items recorded
                </p>
              </div>
            </div>
          </div>

          {/* Sync status */}
          <SyncStatus />

          {/* Overall condition */}
          <div>
            <Label className="text-base">Overall Property Condition</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {CONDITION_RATINGS.map((rating) => (
                <button
                  key={rating.value}
                  onClick={() => setOverallCondition(rating.value as CompleteInspectionInput['overall_condition'])}
                  className={cn(
                    'p-3 rounded-lg border-2 text-sm transition-colors',
                    overallCondition === rating.value
                      ? 'border-rb-green bg-rb-green/10'
                      : 'border-muted hover:border-muted-foreground/50'
                  )}
                >
                  <span className={rating.color}>{rating.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <Label className="text-base">Inspection Summary</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-2">
              Provide an overview of the inspection findings (minimum 10 characters)
            </p>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe the overall condition of the property, key findings, and any recommendations..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {summary.length}/5000
            </p>
          </div>

          {/* Weather conditions (optional) */}
          <div>
            <Label className="text-base">Weather Conditions (Optional)</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <Label className="text-sm">Temperature (F)</Label>
                <Input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="72"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Humidity (%)</Label>
                <Input
                  type="number"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  placeholder="45"
                  min="0"
                  max="100"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-3">
              <Label className="text-sm">Conditions</Label>
              <Input
                value={weatherConditions}
                onChange={(e) => setWeatherConditions(e.target.value)}
                placeholder="Clear, partly cloudy, rainy..."
                className="mt-1"
              />
            </div>
          </div>

          {/* Offline warning */}
          {!isOnline && (
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    Cannot complete while offline
                  </p>
                  <p className="text-sm text-yellow-700">
                    Connect to the internet to submit your inspection.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit button */}
          <Button
            onClick={handleComplete}
            disabled={!canComplete || completeInspection.isPending}
            className="w-full bg-rb-green hover:bg-rb-green/90"
            size="lg"
          >
            {completeInspection.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Complete Inspection
          </Button>

          {!isComplete && (
            <p className="text-sm text-center text-muted-foreground">
              Complete all checklist items before submitting
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
