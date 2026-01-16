import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WorkOrderStatusBadge } from './work-order-status-badge'
import { WorkOrderPriorityBadge } from './work-order-priority-badge'
import { formatWorkOrderNumber } from '@/lib/constants/work-order'
import {
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  ChevronRight,
} from 'lucide-react'
import type { WorkOrderListItem } from '@/lib/types/work-order'
import { format } from 'date-fns'

interface WorkOrderCardProps {
  workOrder: WorkOrderListItem
  onClick?: () => void
}

export function WorkOrderCard({ workOrder, onClick }: WorkOrderCardProps) {
  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted-foreground">
                {formatWorkOrderNumber(workOrder.work_order_number)}
              </span>
              <WorkOrderStatusBadge status={workOrder.status} />
              <WorkOrderPriorityBadge priority={workOrder.priority} />
            </div>
            <h3 className="font-semibold leading-tight">{workOrder.title}</h3>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {workOrder.property_name} — {workOrder.property_address}
            </span>
          </div>
          {workOrder.vendor_name && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0" />
              <span>{workOrder.vendor_name}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {workOrder.scheduled_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{format(new Date(workOrder.scheduled_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            {workOrder.estimated_cost && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 shrink-0" />
                <span>${workOrder.estimated_cost.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
