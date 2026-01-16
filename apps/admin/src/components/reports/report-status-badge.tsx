import { FileText, Clock, CheckCircle, Send, Eye, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReportStatus } from '@/lib/types/report'

const STATUS_CONFIG: Record<
  ReportStatus,
  {
    label: string
    icon: typeof FileText
    variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning'
  }
> = {
  pending: {
    label: 'Not Generated',
    icon: FileText,
    variant: 'outline',
  },
  generating: {
    label: 'Generating...',
    icon: Loader2,
    variant: 'secondary',
  },
  ready: {
    label: 'Ready',
    icon: CheckCircle,
    variant: 'success',
  },
  sent: {
    label: 'Sent',
    icon: Send,
    variant: 'default',
  },
  viewed: {
    label: 'Viewed',
    icon: Eye,
    variant: 'default',
  },
}

interface ReportStatusBadgeProps {
  status: ReportStatus
  className?: string
  showIcon?: boolean
}

export function ReportStatusBadge({
  status,
  className,
  showIcon = true,
}: ReportStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={cn('gap-1.5', className)}>
      {showIcon && (
        <Icon
          className={cn(
            'h-3 w-3',
            status === 'generating' && 'animate-spin'
          )}
        />
      )}
      {config.label}
    </Badge>
  )
}

// Simpler version for tables
export function ReportStatusDot({ status }: { status: ReportStatus }) {
  const colorMap: Record<ReportStatus, string> = {
    pending: 'bg-gray-400',
    generating: 'bg-yellow-400 animate-pulse',
    ready: 'bg-green-500',
    sent: 'bg-blue-500',
    viewed: 'bg-purple-500',
  }

  return (
    <span
      className={cn('inline-block w-2 h-2 rounded-full', colorMap[status])}
      title={STATUS_CONFIG[status].label}
    />
  )
}
