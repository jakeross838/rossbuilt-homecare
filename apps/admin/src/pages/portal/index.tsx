import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, AlertCircle, Calendar, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardSummary } from '@/components/portal/dashboard-summary'
import { PropertyCard } from '@/components/portal/property-card'
import { ServiceRequestForm } from '@/components/portal/service-request-form'
import { ErrorState } from '@/components/shared'
import { usePortalDashboard, usePortalProperties } from '@/hooks/use-portal-dashboard'
import { usePortalInspections } from '@/hooks/use-portal-inspections'
import { useServiceRequests } from '@/hooks/use-service-requests'
import { formatRelativeDate } from '@/lib/helpers/portal'
import { usePortalAuth } from '@/hooks/use-portal-auth'

export default function PortalDashboardPage() {
  const { profile } = usePortalAuth()
  const { data: summary, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } = usePortalDashboard()
  const { data: properties, isLoading: propertiesLoading, error: propertiesError, refetch: refetchProperties } = usePortalProperties()
  const { data: inspections } = usePortalInspections({ limit: 3 })
  const { data: requests } = useServiceRequests()
  const [showRequestForm, setShowRequestForm] = useState(false)

  // Error state - show if main dashboard data fails to load
  if (summaryError) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        error={summaryError}
        onRetry={() => refetchSummary()}
      />
    )
  }

  // Error state for properties
  if (propertiesError) {
    return (
      <ErrorState
        title="Failed to load properties"
        error={propertiesError}
        onRetry={() => refetchProperties()}
      />
    )
  }

  // Get upcoming inspections
  const upcomingInspections = inspections?.filter(
    (i) => i.status === 'scheduled'
  ) || []

  // Get open requests
  const openRequests = requests?.filter(
    (r) => ['new', 'acknowledged', 'in_progress', 'scheduled'].includes(r.status)
  ) || []

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome, {profile?.first_name}
          </h1>
          <p className="text-gray-500">Here's an overview of your properties</p>
        </div>
        <Button onClick={() => setShowRequestForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Summary Cards */}
      <DashboardSummary data={summary} isLoading={summaryLoading} />

      {/* Properties Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Properties</h2>
          <Link
            to="/portal/properties"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {propertiesLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-48" />
              </Card>
            ))}
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {properties.slice(0, 4).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500">No properties assigned to your account yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Contact your property manager to get started.
            </p>
          </div>
        )}
      </section>

      {/* Pending Approvals */}
      {summary && summary.pending_approvals > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Approvals ({summary.pending_approvals})
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Review recommendations from recent inspections
          </p>
          <Link
            to="/portal/properties"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View property details to review recommendations →
          </Link>
        </section>
      )}

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Upcoming Inspections */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Inspections
              </h2>
            </div>
            <Link
              to="/portal/inspections"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all
            </Link>
          </div>
          {upcomingInspections.length > 0 ? (
            <ul className="space-y-2">
              {upcomingInspections.slice(0, 3).map((inspection) => (
                <li
                  key={inspection.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {formatRelativeDate(inspection.inspection_date)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {inspection.inspection_type} inspection
                    </p>
                  </div>
                  <Link
                    to={`/portal/inspections/${inspection.id}`}
                    className="text-blue-600 text-sm"
                  >
                    Details
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
              No upcoming inspections scheduled
            </p>
          )}
        </section>

        {/* Recent Requests */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Requests
              </h2>
            </div>
            <Link
              to="/portal/requests"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all
            </Link>
          </div>
          {openRequests.length > 0 ? (
            <ul className="space-y-2">
              {openRequests.slice(0, 3).map((request) => (
                <li
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div>
                    <p className="font-medium text-sm">{request.title}</p>
                    <p className="text-xs text-gray-500">
                      {request.status} • {request.property.name}
                    </p>
                  </div>
                  <Link
                    to={`/portal/requests/${request.id}`}
                    className="text-blue-600 text-sm"
                  >
                    Details
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
              No open service requests
            </p>
          )}
        </section>
      </div>

      {/* Service Request Form Dialog */}
      <ServiceRequestForm
        open={showRequestForm}
        onOpenChange={setShowRequestForm}
      />
    </div>
  )
}
