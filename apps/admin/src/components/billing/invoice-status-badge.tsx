import { Badge } from '@/components/ui/badge'
import type { InvoiceStatus } from '@/lib/types/billing'
import { INVOICE_STATUS_CONFIG } from '@/lib/constants/billing'

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
  showDot?: boolean
}

export function InvoiceStatusBadge({ status, showDot = false }: InvoiceStatusBadgeProps) {
  const config = INVOICE_STATUS_CONFIG[status]

  return (
    <Badge variant={config.variant}>
      {showDot && (
        <span
          className={`mr-1.5 h-2 w-2 rounded-full bg-${config.color}-500`}
          aria-hidden="true"
        />
      )}
      {config.label}
    </Badge>
  )
}
