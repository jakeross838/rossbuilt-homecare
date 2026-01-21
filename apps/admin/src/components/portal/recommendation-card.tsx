import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatCurrency } from '@/lib/helpers/billing'
import { getPriorityStyles, formatRelativeDate } from '@/lib/helpers/portal'
import {
  useApproveRecommendation,
  useDeclineRecommendation,
} from '@/hooks/use-recommendation-response'
import { useToast } from '@/hooks/use-toast'
import type { PortalRecommendation } from '@/lib/types/portal'

interface RecommendationCardProps {
  recommendation: PortalRecommendation
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { toast } = useToast()
  const approve = useApproveRecommendation()
  const decline = useDeclineRecommendation()
  const [showDeclineDialog, setShowDeclineDialog] = useState(false)
  const [declineNotes, setDeclineNotes] = useState('')

  const priority = getPriorityStyles(recommendation.priority)

  const handleApprove = async () => {
    try {
      await approve.mutateAsync(recommendation.id)
      toast({
        title: 'Recommendation approved',
        description: 'We\'ll schedule this work and keep you updated.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to approve recommendation.',
        variant: 'destructive',
      })
    }
  }

  const handleDecline = async () => {
    try {
      await decline.mutateAsync(recommendation.id, declineNotes)
      toast({
        title: 'Recommendation declined',
        description: 'We\'ve noted your decision.',
      })
      setShowDeclineDialog(false)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to decline recommendation.',
        variant: 'destructive',
      })
    }
  }

  const isLoading = approve.isPending || decline.isPending

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={priority.color}>{priority.label}</Badge>
                <span className="text-sm text-gray-500">{recommendation.category}</span>
              </div>
              <CardTitle className="text-base">{recommendation.title}</CardTitle>
            </div>
            {recommendation.estimated_cost && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Est. Cost</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(recommendation.estimated_cost)}
                </p>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-gray-600">{recommendation.description}</p>

          {recommendation.inspection && (
            <p className="text-xs text-muted-foreground mt-3">
              From inspection on {formatRelativeDate(recommendation.inspection.inspection_date)}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-2 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeclineDialog(true)}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-1" />
            Decline
          </Button>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-1" />
            )}
            Approve
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Recommendation?</AlertDialogTitle>
            <AlertDialogDescription>
              You can optionally provide a reason for declining. This helps us understand
              your preferences for future recommendations.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Textarea
            placeholder="Reason for declining (optional)"
            value={declineNotes}
            onChange={(e) => setDeclineNotes(e.target.value)}
            rows={3}
          />

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDecline} disabled={decline.isPending}>
              {decline.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
