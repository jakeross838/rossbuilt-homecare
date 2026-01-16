import { Receipt } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InvoiceCard } from '@/components/portal/invoice-card'
import { usePortalInvoices } from '@/hooks/use-portal-invoices'

export default function PortalInvoicesPage() {
  const { data: invoices, isLoading } = usePortalInvoices()

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
