import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useInvoices, useInvoiceSummary } from '@/hooks/use-invoices'
import { usePaymentSummary } from '@/hooks/use-payments'
import { formatCurrency } from '@/lib/helpers/billing'
import {
  FileText,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  CreditCard,
} from 'lucide-react'

export default function BillingDashboard() {
  const { data: summary } = useInvoiceSummary()
  const { data: paymentSummary } = usePaymentSummary('month')
  const { data: recentInvoices } = useInvoices({})

  // Get overdue and recent
  const overdueInvoices = recentInvoices?.filter(
    (inv) => inv.status === 'overdue'
  ).slice(0, 3)
  const recentUnpaid = recentInvoices?.filter(
    (inv) => !['paid', 'void', 'draft'].includes(inv.status)
  ).slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage invoices, payments, and billing
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.total_outstanding || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.invoices_sent || 0} invoices awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(summary?.total_overdue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Collected (MTD)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(paymentSummary?.totalAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {paymentSummary?.totalPayments || 0} payments this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.invoices_paid_this_month || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Overdue Invoices</CardTitle>
              <CardDescription>Invoices past their due date</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/billing/invoices?status=overdue">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!overdueInvoices?.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No overdue invoices
              </p>
            ) : (
              <div className="space-y-4">
                {overdueInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <Link
                        to={`/billing/invoices/${invoice.id}`}
                        className="font-medium hover:underline"
                      >
                        {invoice.invoice_number}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {invoice.client_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">
                        {formatCurrency(invoice.balance_due)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Unpaid */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Awaiting Payment</CardTitle>
              <CardDescription>Recent sent invoices</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/billing/invoices">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!recentUnpaid?.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No invoices awaiting payment
              </p>
            ) : (
              <div className="space-y-4">
                {recentUnpaid.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <Link
                        to={`/billing/invoices/${invoice.id}`}
                        className="font-medium hover:underline"
                      >
                        {invoice.invoice_number}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {invoice.client_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {formatCurrency(invoice.balance_due)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild>
            <Link to="/billing/invoices">
              <FileText className="h-4 w-4 mr-2" />
              View All Invoices
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/billing/invoices?create=true">
              Create Invoice
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
