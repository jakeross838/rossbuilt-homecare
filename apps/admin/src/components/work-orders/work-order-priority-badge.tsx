import { Badge } from '@/components/ui/badge'
import {
  ArrowDown,
  Minus,
  ArrowUp,
  AlertTriangle,
} from 'lucide-react'
import { PRIORITY_LEVELS, getPriorityBadgeVariant } from '@/lib/constants/work-order'
import type { PriorityLevel } from '@/lib/types/work-order'

interface WorkOrderPriorityBadgeProps {
  priority: PriorityLevel | null
  showIcon?: boolean
  className?: string
}

const PRIORITY_ICONS = {
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
  urgent: AlertTriangle,
}

export function WorkOrderPriorityBadge({
  priority,
  showIcon = true,
  className,
}: WorkOrderPriorityBadgeProps) {
  if (!priority) return null

  const config = PRIORITY_LEVELS[priority]
  const variant = getPriorityBadgeVariant(priority)
  const Icon = PRIORITY_ICONS[priority]

  return (
    <Badge variant={variant} className={className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  )
}
