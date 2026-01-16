import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VendorRating } from './vendor-rating'
import { VendorTradeBadges } from './vendor-trade-badges'
import { Phone, Mail, Star, ChevronRight } from 'lucide-react'
import type { VendorListItem } from '@/lib/types/vendor'

interface VendorCardProps {
  vendor: VendorListItem
  onClick?: () => void
}

export function VendorCard({ vendor, onClick }: VendorCardProps) {
  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{vendor.company_name}</h3>
              {vendor.is_preferred && (
                <Badge variant="secondary">
                  <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                  Preferred
                </Badge>
              )}
            </div>
            {vendor.contact_name && (
              <p className="text-sm text-muted-foreground">
                {vendor.contact_name}
              </p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <VendorTradeBadges trades={vendor.trade_categories} />

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {vendor.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {vendor.phone}
              </div>
            )}
            {vendor.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {vendor.email}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <VendorRating rating={vendor.average_rating} size="sm" />
            <span className="text-sm text-muted-foreground">
              {vendor.completed_jobs} / {vendor.total_jobs} jobs completed
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
