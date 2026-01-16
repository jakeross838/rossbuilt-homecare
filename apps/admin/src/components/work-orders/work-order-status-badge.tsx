import { Badge } from '@/components/ui/badge'
import { WORK_ORDER_STATUS, getStatusBadgeVariant } from '@/lib/constants/work-order'
import type { WorkOrderStatus } from '@/lib/types/work-order'

interface WorkOrderStatusBadgeProps {
  status: WorkOrderStatus
  className?: string
}

export function WorkOrderStatusBadge({
  status,
  className,
}: WorkOrderStatusBadgeProps) {
  const config = WORK_ORDER_STATUS[status]
  const variant = getStatusBadgeVariant(status)

  return (
    <Badge variant={variant} className={className}>
      {config.label}
    </Badge>
  )
}
