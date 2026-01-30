import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, CheckCircle2, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InspectionHeader } from '@/components/inspector/inspection-header'
import { InspectionChecklist } from '@/components/inspector/inspection-checklist'
import { CompletionForm } from '@/components/inspector/completion-form'
import { useInspectorInspection } from '@/hooks/use-inspector-schedule'
import {
  useStartInspection,
  calculateInspectionProgress,
} from '@/hooks/use-inspection-execution'
import { useGlobalRealtimeSync } from '@/hooks/use-realtime-sync'
import { useToast } from '@/hooks/use-toast'

/**
 * Inspection Execution Page
 * Used by admin/inspectors to conduct inspections
 * Integrated into the admin layout for unified experience
 */
export default function InspectionExecutionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: inspection, isLoading, error } = useInspectorInspection(id)
  const startInspection = useStartInspection()
  const { toast } = useToast()
  const [showCompletion, setShowCompletion] = useState(false)

  // Enable real-time sync (uses global sync since we're in admin layout)
  useGlobalRealtimeSync()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-rb-green" />
      </div>
    )
  }

  if (error || !inspection) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-lg font-medium text-destructive">
          Inspection not found
        </p>
        <Button
          variant="outline"
          onClick={() => navigate('/inspections')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inspections
        </Button>
      </div>
    )
  }

  const isScheduled = inspection.status === 'scheduled'
  const isInProgress = inspection.status === 'in_progress'
  const progress = calculateInspectionProgress(inspection)

  const handleStart = async () => {
    try {
      await startInspection.mutateAsync(inspection.id)
      toast({
        title: 'Inspection started',
        description: 'You can now record findings.',
      })
    } catch (err) {
      console.error('[InspectionPage] Failed to start inspection:', err)
      toast({
        title: 'Failed to start inspection',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container py-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/inspections')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Inspections
      </Button>

      {/* Header with property info and progress */}
      <InspectionHeader inspection={inspection} />

      {/* Main content */}
      <div className="mt-6">
        {isScheduled ? (
          // Start inspection screen
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center max-w-md">
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

              {/* Error message */}
              {startInspection.error && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">
                        Failed to start inspection
                      </p>
                      <p className="text-sm text-red-700">
                        {startInspection.error instanceof Error
                          ? startInspection.error.message
                          : 'An error occurred. Please try again.'}
                      </p>
                    </div>
                  </div>
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
          <div className="space-y-6">
            <InspectionChecklist inspection={inspection} />

            {/* Complete button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setShowCompletion(true)}
                disabled={progress.completed === 0}
                className="bg-rb-green hover:bg-rb-green/90"
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
          </div>
        ) : (
          // Completed state
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Inspection Complete</h2>
            <p className="text-muted-foreground mb-6 text-center">
              This inspection has been completed and submitted.
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/inspections')}
              >
                Back to Inspections
              </Button>
              <Button
                onClick={() => navigate(`/inspections/${inspection.id}/report`)}
              >
                View Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
