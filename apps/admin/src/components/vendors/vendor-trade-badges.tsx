import { Badge } from '@/components/ui/badge'
import { getTradeCategoryLabel } from '@/lib/constants/vendor'

interface VendorTradeBadgesProps {
  trades: string[]
  maxShow?: number
  className?: string
}

export function VendorTradeBadges({
  trades,
  maxShow = 3,
  className,
}: VendorTradeBadgesProps) {
  if (!trades || trades.length === 0) {
    return null
  }

  const visibleTrades = trades.slice(0, maxShow)
  const remainingCount = trades.length - maxShow

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-1">
        {visibleTrades.map((trade) => (
          <Badge key={trade} variant="outline" className="text-xs">
            {getTradeCategoryLabel(trade)}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs">
            +{remainingCount} more
          </Badge>
        )}
      </div>
    </div>
  )
}
