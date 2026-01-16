import { ExternalLink, CreditCard, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/helpers/billing'
import { INVOICE_STATUS_CONFIG } from '@/lib/constants/billing'
import type { PortalInvoice } from '@/lib/types/portal'

interface InvoiceCardProps {
  invoice: PortalInvoice
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const statusConfig = INVOICE_STATUS_CONFIG[invoice.status]
  const isPaid = invoice.status === 'paid'
  const canPay = ['sent', 'viewed', 'partial', 'overdue'].includes(invoice.status)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">Invoice #{invoice.invoice_number}</p>
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
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
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
            <p className="text-sm text-gray-500 mb-2">Items:</p>
            <ul className="text-sm space-y-1">
              {invoice.line_items.slice(0, 3).map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-gray-600">{item.description}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </li>
              ))}
              {invoice.line_items.length > 3 && (
                <li className="text-gray-400">
                  +{invoice.line_items.length - 3} more items
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Pay Button */}
        {canPay && invoice.stripe_payment_url && (
          <Button className="w-full mt-4" asChild>
            <a href={invoice.stripe_payment_url} target="_blank" rel="noopener noreferrer">
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Now
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        )}

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
