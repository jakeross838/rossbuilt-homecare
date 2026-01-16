import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WorkOrderCard } from '@/components/work-orders'
import { useWorkOrders, useWorkOrderCounts } from '@/hooks/use-work-orders'
import { PRIORITY_LEVELS } from '@/lib/constants/work-order'
import type { WorkOrderStatus, WorkOrderFilters, PriorityLevel } from '@/lib/types/work-order'
import { Plus, Search, Filter, Loader2 } from 'lucide-react'

export default function WorkOrdersPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<WorkOrderFilters>({})
  const [activeTab, setActiveTab] = useState<string>('all')

  // Filter by status based on tab
  const statusFilter =
    activeTab === 'all'
      ? undefined
      : activeTab === 'active'
        ? ['pending', 'vendor_assigned', 'scheduled', 'in_progress'] as WorkOrderStatus[]
        : activeTab === 'completed'
          ? ['completed'] as WorkOrderStatus[]
          : [activeTab] as WorkOrderStatus[]

  const { data: workOrders = [], isLoading } = useWorkOrders({
    ...filters,
    status: statusFilter,
  })
  const { data: counts } = useWorkOrderCounts()

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }))
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
          <h1 className="text-2xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground">
            Manage maintenance and repair work orders
          </p>
        </div>
        <Button onClick={() => navigate('/work-orders/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Work Order
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : workOrders.length === 0 ? (
        <div className="text-center py-12">
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
    </div>
  )
}
