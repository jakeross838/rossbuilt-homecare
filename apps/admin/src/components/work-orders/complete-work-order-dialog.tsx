import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  completeWorkOrderSchema,
  type CompleteWorkOrderFormData,
} from '@/lib/validations/work-order'
import { calculateClientCost, DEFAULT_MARKUP_PERCENT } from '@/lib/constants/work-order'
import type { Resolver } from 'react-hook-form'

interface CompleteWorkOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workOrderId: string
  estimatedCost: number | null
  onComplete: (data: CompleteWorkOrderFormData) => void
  isLoading?: boolean
}

export function CompleteWorkOrderDialog({
  open,
  onOpenChange,
  estimatedCost,
  onComplete,
  isLoading,
}: CompleteWorkOrderDialogProps) {
  const form = useForm<CompleteWorkOrderFormData>({
    resolver: zodResolver(completeWorkOrderSchema) as Resolver<CompleteWorkOrderFormData>,
    defaultValues: {
      actual_cost: estimatedCost || 0,
      markup_percent: DEFAULT_MARKUP_PERCENT,
      completion_notes: '',
    },
  })

  const actualCost = form.watch('actual_cost')
  const markupPercent = form.watch('markup_percent')
  const { markupAmount, totalCost } = calculateClientCost(
    actualCost || 0,
    markupPercent || DEFAULT_MARKUP_PERCENT
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Work Order</DialogTitle>
          <DialogDescription>
            Enter the final costs and any completion notes
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onComplete)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="actual_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Cost</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Amount paid to vendor</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="markup_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Markup %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Ross Built markup</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Cost Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Vendor Cost:</span>
                  <span>${(actualCost || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Markup ({markupPercent || DEFAULT_MARKUP_PERCENT}%):</span>
                  <span>${markupAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t">
                  <span>Client Total:</span>
                  <span>${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="completion_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completion Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes about the completed work..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Completing...' : 'Mark Complete'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
