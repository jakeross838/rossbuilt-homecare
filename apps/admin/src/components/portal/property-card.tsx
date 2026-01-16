import { Link } from 'react-router-dom'
import { Home, Wrench, AlertCircle, Calendar, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  formatCondition,
  formatInspectionTier,
  formatFrequency,
  getPropertyHealth,
  formatRelativeDate,
} from '@/lib/helpers/portal'
import type { PortalProperty } from '@/lib/types/portal'

interface PropertyCardProps {
  property: PortalProperty
}

export function PropertyCard({ property }: PropertyCardProps) {
  const health = getPropertyHealth(property)
  const condition = formatCondition(property.overall_condition)

  return (
    <Link to={`/portal/properties/${property.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {property.primary_photo_url ? (
                <img
                  src={property.primary_photo_url}
                  alt={property.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Home className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div>
                <CardTitle className="text-base">{property.name}</CardTitle>
                <p className="text-sm text-gray-500">
                  {property.address_line1}, {property.city}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Program Info */}
          {property.program && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">
                {formatInspectionTier(property.program.tier)}
              </Badge>
              <Badge variant="outline">
                {formatFrequency(property.program.frequency)}
              </Badge>
            </div>
          )}

          {/* Health & Condition */}
          <div className="flex items-center justify-between text-sm mb-4">
            <span className={cn('font-medium', health.color)}>{health.label}</span>
            <span className={cn(condition.color)}>{condition.label}</span>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {property.open_work_order_count > 0 && (
              <div className="flex items-center gap-1">
                <Wrench className="h-4 w-4 text-yellow-500" />
                <span>{property.open_work_order_count} work orders</span>
              </div>
            )}
            {property.pending_recommendation_count > 0 && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span>{property.pending_recommendation_count} pending</span>
              </div>
            )}
          </div>

          {/* Next Inspection */}
          {property.program?.next_inspection_date && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-3 pt-3 border-t">
              <Calendar className="h-4 w-4" />
              <span>
                Next inspection: {formatRelativeDate(property.program.next_inspection_date)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
