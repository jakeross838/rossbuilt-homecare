import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InspectionHeader } from '@/components/inspector/inspection-header'
import { InspectionChecklist } from '@/components/inspector/inspection-checklist'
import { CompletionForm } from '@/components/inspector/completion-form'
import { useInspectorInspection } from '@/hooks/use-inspector-schedule'
import {
  useStartInspection,
  calculateInspectionProgress,
} from '@/hooks/use-inspection-execution'

export default function InspectionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: inspection, isLoading, error } = useInspectorInspection(id)
  const startInspection = useStartInspection()
  const [showCompletion, setShowCompletion] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rb-green" />
      </div>
    )
  }

  if (error || !inspection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-lg font-medium text-destructive">
          Inspection not found
        </p>
        <Button
          variant="outline"
          onClick={() => navigate('/inspector')}
          className="mt-4"
        >
          Back to Schedule
        </Button>
      </div>
    )
  }

  const isScheduled = inspection.status === 'scheduled'
  const isInProgress = inspection.status === 'in_progress'
  const progress = calculateInspectionProgress(inspection)

  const handleStart = async () => {
    await startInspection.mutateAsync(inspection.id)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with property info and progress */}
      <InspectionHeader inspection={inspection} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isScheduled ? (
          // Start inspection screen
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-full bg-rb-green/10 flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-rb-green" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Ready to Begin</h2>
              <p className="text-muted-foreground mb-6">
                Start the inspection to begin recording findings for{' '}
                {inspection.checklist?.sections?.reduce(
                  (acc, s) => acc + s.items.length,
                  0
                ) || 0}{' '}
                checklist items.
              </p>

              {/* Property access info */}
              {inspection.property?.access_codes && (
                <div className="bg-muted rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-medium mb-2">Access Information</p>
                  {Object.entries(inspection.property.access_codes).map(
                    ([key, value]) => (
                      <p key={key} className="text-sm">
                        <span className="text-muted-foreground">{key}:</span>{' '}
                        <span className="font-mono">{value}</span>
                      </p>
                    )
                  )}
                </div>
              )}

              {/* Special instructions */}
              {inspection.property?.special_instructions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Special Instructions
                  </p>
                  <p className="text-sm text-yellow-700">
                    {inspection.property.special_instructions}
                  </p>
                </div>
              )}

              <Button
                onClick={handleStart}
                disabled={startInspection.isPending}
                className="w-full bg-rb-green hover:bg-rb-green/90"
                size="lg"
              >
                {startInspection.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Start Inspection
              </Button>
            </div>
          </div>
        ) : isInProgress ? (
          // Checklist view
          <>
            <div className="flex-1 overflow-hidden">
              <InspectionChecklist inspection={inspection} />
            </div>

            {/* Complete button */}
            <div className="border-t p-4">
              <Button
                onClick={() => setShowCompletion(true)}
                disabled={progress.completed === 0}
                className="w-full bg-rb-green hover:bg-rb-green/90"
                size="lg"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Inspection ({progress.percentage}%)
              </Button>
            </div>

            {/* Completion form sheet */}
            <CompletionForm
              inspection={inspection}
              open={showCompletion}
              onOpenChange={setShowCompletion}
            />
          </>
        ) : (
          // Completed state
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Inspection Complete</h2>
            <p className="text-muted-foreground mb-6 text-center">
              This inspection has been completed and submitted.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/inspector')}
            >
              Back to Schedule
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
