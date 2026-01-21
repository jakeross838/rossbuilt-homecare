import { useForm } from 'react-hook-form'
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
import { useSendInvoice } from '@/hooks/use-invoices'
import { useSendInvoiceEmail } from '@/hooks/use-email'
import { useToast } from '@/hooks/use-toast'
import { sendInvoiceSchema, type SendInvoiceFormData } from '@/lib/validations/billing'
import { formatCurrency } from '@/lib/helpers/billing'
import { Loader2, Send } from 'lucide-react'
import type { Resolver } from 'react-hook-form'

interface LineItem {
  description: string
  amount: number
}

interface SendInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string
  invoiceNumber: string
  clientEmail: string | null
  clientName: string
  total: number
  dueDate: string
  lineItems: LineItem[]
}

export function SendInvoiceDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  clientEmail,
  clientName,
  total,
  dueDate,
  lineItems,
}: SendInvoiceDialogProps) {
  const { toast } = useToast()
  const sendInvoice = useSendInvoice()
  const sendInvoiceEmail = useSendInvoiceEmail()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SendInvoiceFormData>({
    resolver: zodResolver(sendInvoiceSchema) as Resolver<SendInvoiceFormData>,
    defaultValues: {
      invoice_id: invoiceId,
      email: clientEmail || '',
      subject: `Invoice ${invoiceNumber} from Ross Built Home Services`,
      message: `Dear ${clientName},\n\nPlease find attached invoice ${invoiceNumber}.\n\nYou can pay online using the secure payment link in the invoice.\n\nThank you for your business.\n\nRoss Built Home Services`,
    },
  })

  const onSubmit = async (data: SendInvoiceFormData) => {
    try {
      // Generate payment URL for the portal
      const portalUrl = `${window.location.origin}/portal`
      const paymentUrl = `${portalUrl}/invoices/${invoiceId}`

      // Send the actual email
      await sendInvoiceEmail.send({
        to: data.email,
        client_name: clientName,
        invoice_number: invoiceNumber,
        amount: formatCurrency(total),
        due_date: new Date(dueDate).toLocaleDateString(),
        line_items: lineItems.map(item => ({
          description: item.description,
          amount: formatCurrency(item.amount),
        })),
        payment_url: paymentUrl,
        portal_url: portalUrl,
      })

      // Update invoice status to sent
      await sendInvoice.mutateAsync({
        id: invoiceId,
        email: data.email,
      })

      toast({
        title: 'Invoice Sent',
        description: `Invoice sent to ${data.email}`,
      })

      reset()
      onOpenChange(false)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send invoice. Please check email configuration.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Invoice</DialogTitle>
          <DialogDescription>
            Send invoice {invoiceNumber} to the client
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              {...register('email')}
              placeholder="client@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Input {...register('subject')} />
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea {...register('message')} rows={6} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={sendInvoice.isPending || sendInvoiceEmail.isPending}>
              {sendInvoice.isPending || sendInvoiceEmail.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
