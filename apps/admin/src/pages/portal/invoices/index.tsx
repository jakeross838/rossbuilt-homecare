import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Receipt, CheckCircle, XCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { InvoiceCard } from '@/components/portal/invoice-card'
import { usePortalInvoices } from '@/hooks/use-portal-invoices'

export default function PortalInvoicesPage() {
  const { data: invoices, isLoading, error, refetch } = usePortalInvoices()
  const [searchParams, setSearchParams] = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | null>(null)

  // Handle payment return from Stripe
  useEffect(() => {
    const payment = searchParams.get('payment')
    if (payment === 'success') {
      setPaymentStatus('success')
      // Refetch invoices to get updated status
      refetch()
      // Clear query params after a delay
      const timeout = setTimeout(() => {
        setSearchParams({})
        setPaymentStatus(null)
      }, 10000)
      return () => clearTimeout(timeout)
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled')
      // Clear query params after a delay
      const timeout = setTimeout(() => {
        setSearchParams({})
        setPaymentStatus(null)
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [searchParams, refetch, setSearchParams])

  // Loading state
  if (isLoading) {
    return <LoadingState message="Loading invoices..." />
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load invoices"
        error={error}
        onRetry={() => refetch()}
      />
    )
  }

  const unpaidInvoices = invoices?.filter((i) =>
    ['sent', 'viewed', 'partial', 'overdue'].includes(i.status)
  ) || []

  const paidInvoices = invoices?.filter((i) =>
    ['paid', 'void'].includes(i.status)
  ) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
        <p className="text-gray-500">View and pay your invoices</p>
      </div>

      {/* Payment status feedback */}
      {paymentStatus === 'success' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Payment Successful</AlertTitle>
          <AlertDescription className="text-green-700">
            Thank you for your payment. Your invoice status will be updated shortly.
          </AlertDescription>
        </Alert>
      )}

      {paymentStatus === 'cancelled' && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <XCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Payment Cancelled</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Your payment was cancelled. You can try again when ready.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="unpaid">
        <TabsList>
          <TabsTrigger value="unpaid">
            Outstanding ({unpaidInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid ({paidInvoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unpaid" className="mt-4">
          {unpaidInvoices.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {unpaidInvoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title="No outstanding invoices"
              description="All invoices have been paid. Thank you!"
            />
          )}
        </TabsContent>

        <TabsContent value="paid" className="mt-4">
          {paidInvoices.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {paidInvoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title="No payment history"
              description="Paid invoices will appear here once payments are processed."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
