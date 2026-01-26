import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Receipt, CheckCircle, XCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InvoiceCard } from '@/components/portal/invoice-card'
import { usePortalInvoices } from '@/hooks/use-portal-invoices'

export default function PortalInvoicesPage() {
  const { data: invoices, isLoading, refetch } = usePortalInvoices()
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
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : unpaidInvoices.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {unpaidInvoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No outstanding invoices</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="paid" className="mt-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : paidInvoices.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {paidInvoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No payment history</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
