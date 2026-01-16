import { Home, Calendar, MessageSquare, CheckCircle, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/helpers/billing'
import type { PortalDashboardSummary } from '@/lib/types/portal'

interface DashboardSummaryProps {
  data: PortalDashboardSummary | undefined
  isLoading: boolean
}

export function DashboardSummary({ data, isLoading }: DashboardSummaryProps) {
  const items = [
    {
      label: 'Properties',
      value: data?.properties_count ?? 0,
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Upcoming Inspections',
      value: data?.upcoming_inspections ?? 0,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Open Requests',
      value: data?.open_service_requests ?? 0,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Pending Approvals',
      value: data?.pending_approvals ?? 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Outstanding Balance',
      value: formatCurrency(data?.outstanding_balance ?? 0),
      icon: DollarSign,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      isBalance: true,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {items.map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-10 w-10 rounded-full mb-3" />
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="pt-6">
            <div className={`inline-flex p-2 rounded-full ${item.bgColor} mb-3`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              {item.value}
            </p>
            <p className="text-sm text-gray-500">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
