import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Search,
  Filter,
  ChevronRight,
  Clock,
  User,
  Building2,
  AlertCircle,
} from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAdminServiceRequests } from '@/hooks/use-service-requests'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
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

export default function ServiceRequestsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('open')
  const [priorityFilters, setPriorityFilters] = useState<string[]>([])

  const { data: requests, isLoading } = useAdminServiceRequests({
    search: search || undefined,
    priority: priorityFilters.length > 0 ? priorityFilters : undefined,
  })

  const openRequests = requests?.filter((r) =>
    ['new', 'acknowledged', 'in_progress', 'scheduled'].includes(r.status)
  ) || []

  const closedRequests = requests?.filter((r) =>
    ['completed', 'cancelled'].includes(r.status)
  ) || []

  const filteredRequests = statusFilter === 'open' ? openRequests : closedRequests

  const newCount = requests?.filter((r) => r.status === 'new').length || 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Requests"
        description="Client-submitted service requests and issues"
      >
        {newCount > 0 && (
          <Badge variant="destructive" className="ml-2">
            {newCount} new
          </Badge>
        )}
      </PageHeader>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Priority
              {priorityFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {priorityFilters.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={priorityFilters.includes(key)}
                onCheckedChange={(checked) => {
                  setPriorityFilters(
                    checked
                      ? [...priorityFilters, key]
                      : priorityFilters.filter((p) => p !== key)
                  )
                }}
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((request) => {
              const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.new
              const priority = PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG.medium
              const clientName = request.client
                ? `${request.client.first_name || ''} ${request.client.last_name || ''}`.trim() || request.client.email
                : 'Unknown'

              return (
                <Link
                  key={request.id}
                  to={`/service-requests/${request.id}`}
                >
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
            })
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-medium text-lg">No requests found</h3>
              <p className="text-muted-foreground">
                {statusFilter === 'open'
                  ? 'No open service requests at this time'
                  : 'No closed service requests found'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      {requests && requests.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {requests.filter((r) => r.status === 'new').length}
                </div>
                <div className="text-sm text-muted-foreground">New</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {requests.filter((r) => r.status === 'in_progress').length}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {requests.filter((r) => r.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {requests.filter((r) => r.priority === 'urgent').length}
                </div>
                <div className="text-sm text-muted-foreground">Urgent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
