import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MessageSquare, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { ServiceRequestForm } from '@/components/portal/service-request-form'
import { useServiceRequests } from '@/hooks/use-service-requests'
import { getServiceRequestStatus, formatRelativeDate } from '@/lib/helpers/portal'

export default function PortalRequestsPage() {
  const { data: requests, isLoading, error, refetch } = useServiceRequests()
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('open')

  // Loading state
  if (isLoading) {
    return <LoadingState message="Loading service requests..." />
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load service requests"
        error={error}
        onRetry={() => refetch()}
      />
    )
  }

  const openRequests = requests?.filter((r) =>
    ['new', 'acknowledged', 'in_progress', 'scheduled'].includes(r.status)
  ) || []

  const closedRequests = requests?.filter((r) =>
    ['completed', 'cancelled'].includes(r.status)
  ) || []

  const filteredRequests = statusFilter === 'open' ? openRequests : closedRequests

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Service Requests</h1>
          <p className="text-gray-500">Submit and track your service requests</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="open">
            Open ({openRequests.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed ({closedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4 mt-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => {
              const status = getServiceRequestStatus(request.status)
              return (
                <Link
                  key={request.id}
                  to={`/portal/requests/${request.id}`}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={status.color}>{status.label}</Badge>
                            <span className="text-sm text-gray-500">
                              #{request.request_number}
                            </span>
                          </div>
                          <h3 className="font-medium">{request.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {request.property.name} • {formatRelativeDate(request.created_at)}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          ) : (
            <EmptyState
              icon={MessageSquare}
              title={statusFilter === 'open' ? 'No open requests' : 'No closed requests'}
              description={
                statusFilter === 'open'
                  ? 'Submit a new service request to get started.'
                  : 'Completed requests will appear here.'
              }
              action={
                statusFilter === 'open'
                  ? { label: 'New Request', onClick: () => setShowForm(true) }
                  : undefined
              }
            />
          )}
        </TabsContent>
      </Tabs>

      <ServiceRequestForm open={showForm} onOpenChange={setShowForm} />
    </div>
  )
}
