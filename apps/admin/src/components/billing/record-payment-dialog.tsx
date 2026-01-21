import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRecordPayment } from '@/hooks/use-payments'
import { useToast } from '@/hooks/use-toast'
import { recordPaymentSchema, type RecordPaymentFormData } from '@/lib/validations/billing'
import { PAYMENT_METHODS } from '@/lib/constants/billing'
import { formatCurrency } from '@/lib/helpers/billing'
import { Loader2 } from 'lucide-react'
import type { Resolver } from 'react-hook-form'

interface RecordPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string
  invoiceNumber: string
  balanceDue: number
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  balanceDue,
}: RecordPaymentDialogProps) {
  const { toast } = useToast()
  const recordPayment = useRecordPayment()

  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<RecordPaymentFormData>({
    resolver: zodResolver(recordPaymentSchema) as Resolver<RecordPaymentFormData>,
    defaultValues: {
      invoice_id: invoiceId,
      amount: balanceDue,
      payment_method: 'check',
      payment_date: today,
    },
  })

  const paymentMethod = watch('payment_method')

  const onSubmit = async (data: RecordPaymentFormData) => {
    try {
      await recordPayment.mutateAsync(data)

      toast({
        title: 'Payment Recorded',
        description: `Payment of ${formatCurrency(data.amount)} has been recorded`,
      })

      reset()
      onOpenChange(false)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for invoice {invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Balance Due</p>
            <p className="text-2xl font-bold">{formatCurrency(balanceDue)}</p>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              max={balanceDue}
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setValue('amount', balanceDue)}
            >
              Pay in Full
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Controller
              name="payment_method"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Date</Label>
            <Input type="date" {...register('payment_date')} />
          </div>

          {paymentMethod === 'check' && (
            <div className="space-y-2">
              <Label>Check Number</Label>
              <Input {...register('check_number')} placeholder="Check #" />
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Last 4 Digits</Label>
                <Input
                  {...register('last_four')}
                  placeholder="1234"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Card Brand</Label>
                <Input {...register('card_brand')} placeholder="Visa" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea {...register('notes')} placeholder="Optional notes" rows={2} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={recordPayment.isPending}>
              {recordPayment.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
