import { Link } from 'react-router-dom'
import { Calendar, Clock, DollarSign, Home, CheckCircle, PauseCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePortalProperties } from '@/hooks/use-portal-dashboard'
import { formatCurrency } from '@/lib/helpers/billing'
import { format } from 'date-fns'

const tierLabels: Record<string, string> = {
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium',
  custom: 'Custom',
}

const frequencyLabels: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 Weeks',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semiannually: 'Semi-Annually',
  annually: 'Annually',
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  paused: { label: 'Paused', color: 'bg-gray-100 text-gray-800', icon: PauseCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle },
}

export default function PortalPlansPage() {
  const { data: properties, isLoading } = usePortalProperties()

  // Filter to only properties with programs
  const propertiesWithPrograms = properties?.filter(p => p.program) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Your Plans</h1>
        <div className="grid gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Your Plans</h1>
        <p className="text-gray-500 mt-1">
          View your inspection plans and maintenance schedules
        </p>
      </div>

      {propertiesWithPrograms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Plans</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              You don't have any active inspection plans. Contact us to set up a maintenance plan for your property.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {propertiesWithPrograms.map((property) => {
            const program = property.program!
            const status = statusConfig[program.status] || statusConfig.pending
            const StatusIcon = status.icon

            return (
              <Card key={property.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {property.address_line1}, {property.city}, {property.state}
                      </p>
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Plan Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Tier */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Plan Tier</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {tierLabels[program.tier] || program.tier}
                      </p>
                    </div>

                    {/* Frequency */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Inspection Frequency</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {frequencyLabels[program.frequency] || program.frequency}
                      </p>
                    </div>

                    {/* Monthly Cost */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Cost</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {program.monthly_price ? formatCurrency(program.monthly_price) : 'N/A'}
                      </p>
                    </div>

                    {/* Next Inspection */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Next Inspection</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {program.next_inspection_date
                          ? format(new Date(program.next_inspection_date), 'MMM d, yyyy')
                          : 'Not scheduled'}
                      </p>
                    </div>
                  </div>

                  {/* Property Stats */}
                  <div className="flex items-center gap-6 pt-2 border-t text-sm text-gray-600">
                    {property.last_inspection_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Last inspection: {format(new Date(property.last_inspection_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                    {property.overall_condition && (
                      <div className="flex items-center gap-1">
                        <span>Condition: </span>
                        <Badge variant="outline" className="capitalize">
                          {property.overall_condition}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/portal/properties/${property.id}`}>
                        <Home className="h-4 w-4 mr-2" />
                        View Property
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/portal/inspections">
                        <Calendar className="h-4 w-4 mr-2" />
                        View Inspections
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {propertiesWithPrograms.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Monthly Cost</p>
                  <p className="text-xs text-blue-700">
                    {propertiesWithPrograms.filter(p => p.program?.status === 'active').length} active plan(s)
                  </p>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(
                  propertiesWithPrograms
                    .filter(p => p.program?.status === 'active')
                    .reduce((sum, p) => sum + (p.program?.monthly_price || 0), 0)
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
