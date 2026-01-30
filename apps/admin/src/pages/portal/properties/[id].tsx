import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Home,
  Calendar,
  Settings,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { InspectionCard } from '@/components/portal/inspection-card'
import { RecommendationCard } from '@/components/portal/recommendation-card'
import { usePortalProperty } from '@/hooks/use-portal-property'
import {
  formatCondition,
  formatInspectionTier,
  formatFrequency,
  getPropertyHealth,
} from '@/lib/helpers/portal'
import { formatCurrency } from '@/lib/helpers/billing'
import { cn } from '@/lib/utils'

export default function PortalPropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: property, isLoading, error, isFetching, status, fetchStatus } = usePortalProperty(id)

  // Debug logging for troubleshooting
  console.log('[PortalPropertyDetail] id:', id, 'isLoading:', isLoading, 'isFetching:', isFetching, 'status:', status, 'fetchStatus:', fetchStatus, 'hasData:', !!property, 'error:', error?.message)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading property: {error.message}</p>
        <Link to="/portal/properties" className="text-blue-600 mt-4 inline-block">
          Back to properties
        </Link>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Property not found</p>
        <Link to="/portal/properties" className="text-blue-600 mt-4 inline-block">
          Back to properties
        </Link>
      </div>
    )
  }

  const health = getPropertyHealth(property)
  const condition = formatCondition(property.overall_condition)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/portal/properties"
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to properties
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">{property.name}</h1>
          <p className="text-gray-500">
            {property.address_line1}, {property.city}, {property.state} {property.zip}
          </p>
        </div>
        <div className={cn('px-3 py-1 rounded-full text-sm font-medium', health.color)}>
          {health.label}
        </div>
      </div>

      {/* Program & Condition Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        {property.program && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Program</span>
              </div>
              <p className="text-lg font-semibold">
                {formatInspectionTier(property.program.tier)}
              </p>
              <p className="text-sm text-gray-500">
                {formatFrequency(property.program.frequency)} • {formatCurrency(property.program.monthly_price)}/mo
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-5 w-5 text-gray-400" />
              <span className="font-medium">Condition</span>
            </div>
            <p className={cn('text-lg font-semibold', condition.color)}>
              {condition.label}
            </p>
            <p className="text-sm text-gray-500">{condition.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="font-medium">Next Inspection</span>
            </div>
            <p className="text-lg font-semibold">
              {property.program?.next_inspection_date
                ? new Date(property.program.next_inspection_date).toLocaleDateString()
                : 'Not scheduled'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="inspections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inspections">
            Inspections ({property.recent_inspections.length})
          </TabsTrigger>
          <TabsTrigger value="work-orders">
            Work Orders ({property.active_work_orders.length})
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            Recommendations ({property.pending_recommendations.length})
          </TabsTrigger>
          <TabsTrigger value="equipment">
            Equipment ({property.equipment.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inspections" className="space-y-4">
          {property.recent_inspections.length > 0 ? (
            property.recent_inspections.map((inspection) => (
              <InspectionCard key={inspection.id} inspection={inspection} />
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No inspections yet</p>
          )}
        </TabsContent>

        <TabsContent value="work-orders" className="space-y-4">
          {property.active_work_orders.length > 0 ? (
            property.active_work_orders.map((wo) => (
              <Card key={wo.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">#{wo.work_order_number}</p>
                      <CardTitle className="text-base">{wo.title}</CardTitle>
                    </div>
                    <Badge>{wo.status.replace('_', ' ')}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {wo.description && (
                    <p className="text-sm text-gray-600 mb-2">{wo.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{wo.category}</span>
                    {wo.client_cost && (
                      <span>Est. {formatCurrency(wo.client_cost)}</span>
                    )}
                    {wo.scheduled_date && (
                      <span>Scheduled: {new Date(wo.scheduled_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No active work orders</p>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {property.pending_recommendations.length > 0 ? (
            property.pending_recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">
              No pending recommendations
            </p>
          )}
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          {property.equipment.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {property.equipment.map((eq) => (
                <Card key={eq.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{eq.name}</p>
                        <p className="text-sm text-gray-500">{eq.category}</p>
                        {eq.location && (
                          <p className="text-sm text-muted-foreground">{eq.location}</p>
                        )}
                      </div>
                      {eq.condition && (
                        <Badge variant="outline">
                          {formatCondition(eq.condition).label}
                        </Badge>
                      )}
                    </div>
                    {eq.next_service_date && (
                      <p className="text-xs text-gray-500 mt-2">
                        Next service: {new Date(eq.next_service_date).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No equipment registered</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
