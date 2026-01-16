import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
import { InvoiceStatusBadge } from '@/components/billing/invoice-status-badge'
import { RecordPaymentDialog } from '@/components/billing/record-payment-dialog'
import { SendInvoiceDialog } from '@/components/billing/send-invoice-dialog'
import { PaymentLinkButton } from '@/components/billing/payment-link-button'
import { useInvoice, useVoidInvoice, useDeleteInvoice } from '@/hooks/use-invoices'
import { useInvoicePayments } from '@/hooks/use-payments'
import { useToast } from '@/hooks/use-toast'
import { PAYMENT_METHODS } from '@/lib/constants/billing'
import {
  formatCurrency,
  getDaysUntilDue,
  isInvoiceOverdue,
  getPeriodDescription,
} from '@/lib/helpers/billing'
import {
  ArrowLeft,
  Send,
  CreditCard,
  Trash2,
  Ban,
  Printer,
  User,
  Calendar,
  Clock,
} from 'lucide-react'

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: invoice, isLoading } = useInvoice(id!)
  const { data: payments } = useInvoicePayments(id!)
  const voidInvoice = useVoidInvoice()
  const deleteInvoice = useDeleteInvoice()

  const [showPayment, setShowPayment] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [showVoid, setShowVoid] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (!invoice) {
    return <div className="p-8 text-center">Invoice not found</div>
  }

  const client = invoice.client as {
    first_name: string
    last_name: string
    email: string | null
    company_name: string | null
  }
  const clientName = client?.company_name || `${client?.first_name} ${client?.last_name}`
  const daysUntilDue = getDaysUntilDue(invoice.due_date)
  const overdue = isInvoiceOverdue(invoice.due_date, invoice.status)

  const handleVoid = async () => {
    try {
      await voidInvoice.mutateAsync(invoice.id)
      toast({
        title: 'Invoice Voided',
        description: 'The invoice has been marked as void',
      })
      setShowVoid(false)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to void invoice',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteInvoice.mutateAsync(invoice.id)
      toast({
        title: 'Invoice Deleted',
        description: 'The draft invoice has been deleted',
      })
      navigate('/billing/invoices')
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete invoice',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="text-muted-foreground">{invoice.invoice_type} invoice</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {invoice.status === 'draft' && (
            <>
              <Button variant="outline" onClick={() => setShowSend(true)}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button
                variant="outline"
                className="text-destructive"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}

          {invoice.status !== 'paid' &&
            invoice.status !== 'void' &&
            invoice.status !== 'draft' && (
              <>
                <Button variant="outline" onClick={() => setShowPayment(true)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
                <PaymentLinkButton invoiceId={invoice.id} />
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => setShowVoid(true)}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Void
                </Button>
              </>
            )}

          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client & Dates */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Bill To
                  </h3>
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{clientName}</p>
                      {client?.email && (
                        <p className="text-sm text-muted-foreground">
                          {client.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Invoice Date: {new Date(invoice.invoice_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className={`text-sm ${overdue ? 'text-destructive' : ''}`}>
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                      {overdue && ` (${Math.abs(daysUntilDue)} days overdue)`}
                    </span>
                  </div>
                  {invoice.period_start && invoice.period_end && (
                    <p className="text-sm text-muted-foreground">
                      Period: {getPeriodDescription(invoice.period_start, invoice.period_end)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Description</th>
                      <th className="text-right p-3 text-sm font-medium">Qty</th>
                      <th className="text-right p-3 text-sm font-medium">Price</th>
                      <th className="text-right p-3 text-sm font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.line_items?.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-3">
                          <p>{item.description}</p>
                          {item.line_type && (
                            <p className="text-xs text-muted-foreground">
                              {item.line_type}
                            </p>
                          )}
                        </td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">
                          {formatCurrency(Number(item.unit_price))}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatCurrency(Number(item.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-4 flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(Number(invoice.subtotal))}</span>
                  </div>
                  {Number(invoice.tax_amount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax ({(Number(invoice.tax_rate) * 100).toFixed(1)}%)</span>
                      <span>{formatCurrency(Number(invoice.tax_amount))}</span>
                    </div>
                  )}
                  {Number(invoice.discount_amount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>
                        Discount
                        {invoice.discount_description && (
                          <span className="text-xs"> ({invoice.discount_description})</span>
                        )}
                      </span>
                      <span>-{formatCurrency(Number(invoice.discount_amount))}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(Number(invoice.total))}</span>
                  </div>
                  {Number(invoice.amount_paid) > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Paid</span>
                        <span>-{formatCurrency(Number(invoice.amount_paid))}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Balance Due</span>
                        <span>{formatCurrency(Number(invoice.balance_due))}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <Card>
              <CardContent className="pt-6 grid grid-cols-2 gap-6">
                {invoice.notes && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {invoice.notes}
                    </p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Terms</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {invoice.terms}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Balance Due</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(Number(invoice.balance_due))}
              </p>
              {invoice.status !== 'paid' && invoice.status !== 'void' && (
                <p className={`text-sm mt-1 ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {overdue
                    ? `${Math.abs(daysUntilDue)} days overdue`
                    : daysUntilDue === 0
                    ? 'Due today'
                    : `Due in ${daysUntilDue} days`}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {!payments?.length ? (
                <p className="text-sm text-muted-foreground">No payments recorded</p>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => {
                    const method = PAYMENT_METHODS.find(
                      (m) => m.value === payment.payment_method
                    )
                    return (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">
                            {formatCurrency(Number(payment.amount))}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {method?.label || payment.payment_method}
                            {payment.last_four && ` **** ${payment.last_four}`}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
                </div>
                {invoice.sent_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sent</span>
                    <span>{new Date(invoice.sent_at).toLocaleDateString()}</span>
                  </div>
                )}
                {invoice.viewed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Viewed</span>
                    <span>{new Date(invoice.viewed_at).toLocaleDateString()}</span>
                  </div>
                )}
                {invoice.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid</span>
                    <span>{new Date(invoice.paid_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <RecordPaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoice_number}
        balanceDue={Number(invoice.balance_due)}
      />

      <SendInvoiceDialog
        open={showSend}
        onOpenChange={setShowSend}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoice_number}
        clientEmail={client?.email}
        clientName={clientName}
      />

      <AlertDialog open={showVoid} onOpenChange={setShowVoid}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the invoice as void. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVoid}
              className="bg-destructive text-destructive-foreground"
            >
              Void Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this draft invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
