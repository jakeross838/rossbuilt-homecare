import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InvoiceStatusBadge } from '@/components/billing/invoice-status-badge'
import { CreateInvoiceDialog } from '@/components/billing/create-invoice-dialog'
import { useInvoices, useInvoiceSummary } from '@/hooks/use-invoices'
import { INVOICE_STATUS_CONFIG, INVOICE_TYPES } from '@/lib/constants/billing'
import { formatCurrency, getDaysUntilDue, isInvoiceOverdue } from '@/lib/helpers/billing'
import type { InvoiceFilters, InvoiceStatus } from '@/lib/types/billing'
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

export default function InvoicesPage() {
  const [filters, setFilters] = useState<InvoiceFilters>({})
  const [showCreate, setShowCreate] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  // Handle ?create=true query param from billing dashboard
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreate(true)
      // Remove the param from URL
      searchParams.delete('create')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const { data: invoices, isLoading } = useInvoices(filters)
  const { data: summary } = useInvoiceSummary()

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }))
  }

  const handleStatusFilter = (value: string) => {
    if (value === 'all') {
      setFilters((prev) => ({ ...prev, status: undefined }))
    } else {
      setFilters((prev) => ({ ...prev, status: [value as InvoiceStatus] }))
    }
  }

  const handleTypeFilter = (value: string) => {
    if (value === 'all') {
      setFilters((prev) => ({ ...prev, invoice_type: undefined }))
    } else {
      setFilters((prev) => ({ ...prev, invoice_type: value }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Manage invoices and track payments
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.invoices_sent || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.invoices_paid_this_month || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice #, client, or property..."
            className="pl-9"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <Select onValueChange={handleStatusFilter} defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(INVOICE_STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={handleTypeFilter} defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {INVOICE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : invoices?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices?.map((invoice) => {
                const daysUntilDue = getDaysUntilDue(invoice.due_date)
                const overdue = isInvoiceOverdue(invoice.due_date, invoice.status)
                const invoiceWithProps = invoice as typeof invoice & { property_names?: string[] }

                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link
                        to={`/billing/invoices/${invoice.id}`}
                        className="font-medium hover:underline"
                      >
                        {invoice.invoice_number}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {invoice.invoice_type}
                      </p>
                    </TableCell>
                    <TableCell>{invoice.client_name}</TableCell>
                    <TableCell>
                      {invoiceWithProps.property_names?.length ? (
                        <span className="text-sm">
                          {invoiceWithProps.property_names.slice(0, 2).join(', ')}
                          {invoiceWithProps.property_names.length > 2 && (
                            <span className="text-muted-foreground">
                              {' '}+{invoiceWithProps.property_names.length - 2} more
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={overdue ? 'text-destructive' : ''}>
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </span>
                      {overdue && (
                        <span className="text-xs text-destructive block">
                          {Math.abs(daysUntilDue)} days overdue
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.balance_due)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CreateInvoiceDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  )
}
