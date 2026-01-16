import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InvoiceStatusBadge } from '@/components/billing/invoice-status-badge'
import { useClientInvoices } from '@/hooks/use-invoices'
import { formatCurrency } from '@/lib/helpers/billing'
import { FileText, Plus } from 'lucide-react'

interface ClientBillingSectionProps {
  clientId: string
}

export function ClientBillingSection({ clientId }: ClientBillingSectionProps) {
  const { data: invoices, isLoading } = useClientInvoices(clientId)

  const outstanding = invoices?.reduce(
    (sum, inv) => sum + inv.balance_due,
    0
  ) || 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Billing
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/billing/invoices?client=${clientId}&create=true`}>
            <Plus className="h-4 w-4 mr-1" />
            New Invoice
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {outstanding > 0 && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Outstanding Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(outstanding)}</p>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !invoices?.length ? (
          <p className="text-sm text-muted-foreground">No invoices</p>
        ) : (
          <div className="space-y-2">
            {invoices.slice(0, 5).map((invoice) => (
              <Link
                key={invoice.id}
                to={`/billing/invoices/${invoice.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div>
                  <p className="font-medium">{invoice.invoice_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(invoice.invoice_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(invoice.balance_due)}</p>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
              </Link>
            ))}
            {invoices.length > 5 && (
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to={`/billing/invoices?client=${clientId}`}>
                  View all {invoices.length} invoices
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
