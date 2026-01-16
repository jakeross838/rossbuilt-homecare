import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InvoiceStatusBadge } from './invoice-status-badge'
import { formatCurrency, getDaysUntilDue, isInvoiceOverdue } from '@/lib/helpers/billing'
import type { InvoiceListItem } from '@/lib/types/billing'
import { Calendar, User, AlertTriangle, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

interface InvoiceCardProps {
  invoice: InvoiceListItem
  onPaymentLink?: () => void
}

export function InvoiceCard({ invoice, onPaymentLink }: InvoiceCardProps) {
  const daysUntilDue = getDaysUntilDue(invoice.due_date)
  const isOverdue = isInvoiceOverdue(invoice.due_date, invoice.status)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <Link
              to={`/billing/invoices/${invoice.id}`}
              className="font-semibold hover:underline"
            >
              {invoice.invoice_number}
            </Link>
            <p className="text-sm text-muted-foreground">
              {invoice.invoice_type === 'subscription' ? 'Subscription' : 'Service'}
            </p>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{invoice.client_name}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Due {new Date(invoice.due_date).toLocaleDateString()}</span>
          {isOverdue && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="h-3 w-3" />
              {Math.abs(daysUntilDue)} days overdue
            </span>
          )}
          {!isOverdue && daysUntilDue <= 7 && daysUntilDue > 0 && (
            <span className="text-warning">Due in {daysUntilDue} days</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-2xl font-bold">{formatCurrency(invoice.balance_due)}</p>
            {invoice.balance_due < invoice.total && (
              <p className="text-xs text-muted-foreground">
                of {formatCurrency(invoice.total)} total
              </p>
            )}
          </div>

          {invoice.status !== 'paid' && invoice.status !== 'void' && onPaymentLink && (
            <Button variant="outline" size="sm" onClick={onPaymentLink}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Pay Online
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
