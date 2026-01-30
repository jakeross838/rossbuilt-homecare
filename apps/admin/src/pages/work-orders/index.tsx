import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { WorkOrderCard } from '@/components/work-orders'
import { useWorkOrders, useWorkOrderCounts } from '@/hooks/use-work-orders'
import { useAdminServiceRequests } from '@/hooks/use-service-requests'
import { PRIORITY_LEVELS } from '@/lib/constants/work-order'
import type { WorkOrderStatus, WorkOrderFilters, PriorityLevel } from '@/lib/types/work-order'
import { Plus, Search, Filter, Loader2, MessageSquare, Wrench, Clock, User, Building2, ChevronRight } from 'lucide-react'

const REQUEST_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  acknowledged: { label: 'Acknowledged', color: 'bg-purple-100 text-purple-800' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  scheduled: { label: 'Scheduled', color: 'bg-indigo-100 text-indigo-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-gray-500' },
  medium: { label: 'Medium', color: 'text-yellow-600' },
  high: { label: 'High', color: 'text-orange-600' },
  urgent: { label: 'Urgent', color: 'text-red-600' },
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function WorkOrdersPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<WorkOrderFilters>({})
  const [mainTab, setMainTab] = useState<string>('work-orders')
  const [workOrderTab, setWorkOrderTab] = useState<string>('all')
  const [requestTab, setRequestTab] = useState<string>('open')
  const [search, setSearch] = useState('')

  // Filter by status based on tab
  const statusFilter =
    workOrderTab === 'all'
      ? undefined
      : workOrderTab === 'active'
        ? ['pending', 'vendor_assigned', 'scheduled', 'in_progress'] as WorkOrderStatus[]
        : workOrderTab === 'completed'
          ? ['completed'] as WorkOrderStatus[]
          : [workOrderTab] as WorkOrderStatus[]

  const { data: workOrders = [], isLoading: loadingWorkOrders } = useWorkOrders({
    ...filters,
    status: statusFilter,
  })
  const { data: counts } = useWorkOrderCounts()

  const { data: requests = [], isLoading: loadingRequests } = useAdminServiceRequests({
    search: search || undefined,
  })

  const openRequests = requests.filter((r) =>
    ['new', 'acknowledged', 'in_progress', 'scheduled'].includes(r.status)
  )
  const closedRequests = requests.filter((r) =>
    ['completed', 'cancelled'].includes(r.status)
  )
  const newRequestsCount = requests.filter((r) => r.status === 'new').length

  const handleSearch = (value: string) => {
    setSearch(value)
    setFilters((prev) => ({ ...prev, search: value || undefined }))
  }

  const handlePriorityFilter = (priority: string) => {
    setFilters((prev) => ({
      ...prev,
      priority: priority && priority !== 'all' ? [priority as PriorityLevel] : undefined,
    }))
  }

  const activeCount =
    (counts?.pending || 0) +
    (counts?.vendor_assigned || 0) +
    (counts?.scheduled || 0) +
    (counts?.in_progress || 0)

  const completedCount = counts?.completed || 0

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Work Orders & Requests</h1>
          <p className="text-muted-foreground">
            Manage work orders and client service requests
          </p>
        </div>
        <Button onClick={() => navigate('/work-orders/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Work Order
        </Button>
      </div>

      {/* Main Tabs: Work Orders vs Client Requests */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="work-orders" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Work Orders
            <Badge variant="secondary" className="ml-1">
              {Object.values(counts || {}).reduce((a, b) => a + b, 0)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Client Requests
            {newRequestsCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {newRequestsCount} new
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Work Orders Tab Content */}
        <TabsContent value="work-orders" className="space-y-4 mt-4">
          {/* Sub-tabs for work order status */}
          <Tabs value={workOrderTab} onValueChange={setWorkOrderTab}>
            <TabsList>
              <TabsTrigger value="all">
                All ({Object.values(counts || {}).reduce((a, b) => a + b, 0)})
              </TabsTrigger>
              <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
              <TabsTrigger value="on_hold">
                On Hold ({counts?.on_hold || 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search work orders..."
                className="pl-10"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Select onValueChange={handlePriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {Object.entries(PRIORITY_LEVELS).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Work Order List */}
          {loadingWorkOrders ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : workOrders.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No work orders found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/work-orders/new')}
              >
                Create your first work order
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {workOrders.map((workOrder) => (
                <WorkOrderCard
                  key={workOrder.id}
                  workOrder={workOrder}
                  onClick={() => navigate(`/work-orders/${workOrder.id}`)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Client Requests Tab Content */}
        <TabsContent value="requests" className="space-y-4 mt-4">
          {/* Sub-tabs for request status */}
          <Tabs value={requestTab} onValueChange={setRequestTab}>
            <TabsList>
              <TabsTrigger value="open">
                Open ({openRequests.length})
              </TabsTrigger>
              <TabsTrigger value="closed">
                Closed ({closedRequests.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-10"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Request List */}
          {loadingRequests ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (requestTab === 'open' ? openRequests : closedRequests).length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {requestTab === 'open' ? 'No open requests' : 'No closed requests'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {(requestTab === 'open' ? openRequests : closedRequests).map((request) => {
                const status = REQUEST_STATUS_CONFIG[request.status] || REQUEST_STATUS_CONFIG.new
                const priority = PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG.medium
                const clientName = request.client
                  ? `${request.client.first_name || ''} ${request.client.last_name || ''}`.trim() || request.client.email
                  : 'Unknown'

                return (
                  <Link key={request.id} to={`/service-requests/${request.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge className={status.color}>{status.label}</Badge>
                              <span className={`text-sm font-medium ${priority.color}`}>
                                {priority.label}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                #{request.request_number}
                              </span>
                            </div>
                            <h3 className="font-medium text-lg truncate">{request.title}</h3>
                            {request.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {request.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {request.property?.name || 'Unknown property'}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {clientName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatRelativeTime(request.created_at)}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
