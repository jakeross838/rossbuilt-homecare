import { useState } from 'react'
import { ExternalLink, CreditCard, Check, Download, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/helpers/billing'
import { INVOICE_STATUS_CONFIG } from '@/lib/constants/billing'
import { useCreatePaymentLink, openPaymentLink } from '@/hooks/use-stripe'
import type { PortalInvoice } from '@/lib/types/portal'

interface InvoiceCardProps {
  invoice: PortalInvoice
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const statusConfig = INVOICE_STATUS_CONFIG[invoice.status]
  const isPaid = invoice.status === 'paid'
  const canPay = ['sent', 'viewed', 'partial', 'overdue'].includes(invoice.status) && invoice.balance_due > 0
  const hasPdf = !!invoice.pdf_url

  const createPaymentLink = useCreatePaymentLink()
  const [isCreatingPaymentLink, setIsCreatingPaymentLink] = useState(false)

  const handlePayNow = async () => {
    setIsCreatingPaymentLink(true)
    try {
      const result = await createPaymentLink.mutateAsync({
        invoiceId: invoice.id,
        // Use portal-specific URLs for success/cancel
        successUrl: `${window.location.origin}/portal/invoices?payment=success&invoice=${invoice.id}`,
        cancelUrl: `${window.location.origin}/portal/invoices?payment=cancelled&invoice=${invoice.id}`,
      })
      // Open Stripe checkout in new tab
      openPaymentLink(result.url)
    } catch (error) {
      console.error('Failed to create payment link:', error)
    } finally {
      setIsCreatingPaymentLink(false)
    }
  }

  const handleDownloadPdf = () => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Invoice #{invoice.invoice_number}</p>
            <CardTitle className="text-lg mt-1">
              {formatCurrency(invoice.total)}
            </CardTitle>
          </div>
          <Badge className={statusConfig?.variant === 'success' ? 'bg-green-100 text-green-800' :
                          statusConfig?.variant === 'destructive' ? 'bg-red-100 text-red-800' :
                          statusConfig?.variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}>
            {statusConfig?.label || invoice.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Dates */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>Issued: {new Date(invoice.issue_date).toLocaleDateString()}</span>
          <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
        </div>

        {/* Balance Due */}
        {!isPaid && invoice.balance_due > 0 && (
          <div className="flex items-center justify-between py-2 border-t">
            <span className="font-medium">Balance Due</span>
            <span className="text-lg font-semibold">
              {formatCurrency(invoice.balance_due)}
            </span>
          </div>
        )}

        {/* Line Items Preview */}
        {invoice.line_items.length > 0 && (
          <div className="border-t pt-3 mt-3">
            <p className="text-sm text-muted-foreground mb-2">Items:</p>
            <ul className="text-sm space-y-1">
              {invoice.line_items.slice(0, 3).map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-foreground/80">{item.description}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </li>
              ))}
              {invoice.line_items.length > 3 && (
                <li className="text-muted-foreground">
                  +{invoice.line_items.length - 3} more items
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {/* PDF Download Button */}
          {hasPdf && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownloadPdf}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}

          {/* Pay Button - generates payment link on-demand */}
          {canPay && (
            <Button
              className="flex-1"
              onClick={handlePayNow}
              disabled={isCreatingPaymentLink}
            >
              {isCreatingPaymentLink ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                  <ExternalLink className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>

        {isPaid && (
          <div className="flex items-center justify-center gap-2 text-green-600 mt-4 py-2 bg-green-50 rounded-md">
            <Check className="h-5 w-5" />
            <span className="font-medium">Paid in Full</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
