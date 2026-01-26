import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  WorkOrderStatusBadge,
  WorkOrderPriorityBadge,
  AssignVendorDialog,
  CompleteWorkOrderDialog,
} from '@/components/work-orders'
import {
  useWorkOrder,
  useUpdateWorkOrderStatus,
  useAssignVendor,
  useCompleteWorkOrder,
  useCancelWorkOrder,
} from '@/hooks/use-work-orders'
import { formatWorkOrderNumber } from '@/lib/constants/work-order'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  MapPin,
  User,
  Building2,
  Calendar,
  Clock,
  Loader2,
  Play,
  CheckCircle,
  XCircle,
  UserPlus,
} from 'lucide-react'
import { WORK_ORDER_STATUSES } from '@/lib/constants/work-order'
import type {
  AssignVendorFormData,
  CompleteWorkOrderFormData,
} from '@/lib/validations/work-order'

export default function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const { data: workOrder, isLoading } = useWorkOrder(id)
  const updateStatus = useUpdateWorkOrderStatus()
  const assignVendor = useAssignVendor()
  const completeWorkOrder = useCompleteWorkOrder()
  const cancelWorkOrder = useCancelWorkOrder()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!workOrder) {
    return (
      <div className="container py-6">
        <p className="text-muted-foreground">Work order not found</p>
      </div>
    )
  }

  const status = workOrder.status || 'pending'
  const canAssignVendor =
    !workOrder.vendor_id &&
    ['pending'].includes(status)
  const canStart =
    workOrder.vendor_id && ['vendor_assigned', 'scheduled'].includes(status)
  const canComplete = ['in_progress'].includes(status)
  const canCancel = !['completed', 'cancelled'].includes(status)

  const handleStartWork = async () => {
    try {
      await updateStatus.mutateAsync({
        id: workOrder.id,
        status: 'in_progress',
      })
      toast({
        title: 'Work started',
        description: 'Work order is now in progress',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update work order status',
      })
    }
  }

  const handleAssignVendor = async (data: AssignVendorFormData) => {
    try {
      await assignVendor.mutateAsync({
        workOrderId: workOrder.id,
        ...data,
      })
      setShowAssignDialog(false)
      toast({
        title: 'Vendor assigned',
        description: 'Vendor has been assigned to this work order',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to assign vendor',
      })
    }
  }

  const handleComplete = async (data: CompleteWorkOrderFormData) => {
    try {
      await completeWorkOrder.mutateAsync({
        id: workOrder.id,
        ...data,
      })
      setShowCompleteDialog(false)
      toast({
        title: 'Work order completed',
        description: 'Work order has been marked as complete',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to complete work order',
      })
    }
  }

  const handleCancel = async () => {
    try {
      await cancelWorkOrder.mutateAsync({
        id: workOrder.id,
      })
      setShowCancelDialog(false)
      toast({
        title: 'Work order cancelled',
        description: 'Work order has been cancelled',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to cancel work order',
      })
    }
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/work-orders')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Orders
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-muted-foreground">
              {formatWorkOrderNumber(workOrder.work_order_number)}
            </span>
            <Select
              value={status}
              onValueChange={async (newStatus) => {
                try {
                  await updateStatus.mutateAsync({
                    id: workOrder.id,
                    status: newStatus as typeof status,
                  })
                  toast({
                    title: 'Status updated',
                    description: `Work order status changed to ${newStatus.replace('_', ' ')}`,
                  })
                } catch {
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to update status',
                  })
                }
              }}
              disabled={updateStatus.isPending || ['completed', 'cancelled'].includes(status)}
            >
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue>
                  <WorkOrderStatusBadge status={status} />
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {WORK_ORDER_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <WorkOrderPriorityBadge priority={workOrder.priority} />
          </div>
          <h1 className="text-2xl font-bold">{workOrder.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {canAssignVendor && (
            <Button onClick={() => setShowAssignDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Vendor
            </Button>
          )}
          {canStart && (
            <Button onClick={handleStartWork} disabled={updateStatus.isPending}>
              <Play className="mr-2 h-4 w-4" />
              Start Work
            </Button>
          )}
          {canComplete && (
            <Button onClick={() => setShowCompleteDialog(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{workOrder.description}</p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(workOrder.created_at!), 'PPP p')}
                    </p>
                  </div>
                </div>
                {workOrder.scheduled_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Scheduled</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(workOrder.scheduled_date), 'PPP')}
                        {workOrder.scheduled_time_start &&
                          ` at ${workOrder.scheduled_time_start}`}
                      </p>
                    </div>
                  </div>
                )}
                {workOrder.started_at && (
                  <div className="flex items-center gap-3">
                    <Play className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Started</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(workOrder.started_at), 'PPP p')}
                      </p>
                    </div>
                  </div>
                )}
                {workOrder.completed_at && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">Completed</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(workOrder.completed_at), 'PPP p')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Costs */}
          {(workOrder.estimated_cost || workOrder.actual_cost) && (
            <Card>
              <CardHeader>
                <CardTitle>Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {workOrder.estimated_cost && (
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated</p>
                      <p className="text-lg font-semibold">
                        ${workOrder.estimated_cost.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {workOrder.actual_cost && (
                    <div>
                      <p className="text-sm text-muted-foreground">Vendor Cost</p>
                      <p className="text-lg font-semibold">
                        ${workOrder.actual_cost.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {workOrder.total_client_cost && (
                    <div>
                      <p className="text-sm text-muted-foreground">Client Total</p>
                      <p className="text-lg font-semibold">
                        ${workOrder.total_client_cost.toLocaleString()}
                      </p>
                      {workOrder.markup_percent && (
                        <p className="text-xs text-muted-foreground">
                          ({workOrder.markup_percent}% markup)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workOrder.property ? (
                <div>
                  <p className="font-medium">{workOrder.property.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {workOrder.property.address_line1}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {workOrder.property.city}, {workOrder.property.state}{' '}
                    {workOrder.property.zip}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No property</p>
              )}
            </CardContent>
          </Card>

          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workOrder.client ? (
                <div>
                  <p className="font-medium">
                    {workOrder.client.first_name} {workOrder.client.last_name}
                  </p>
                  {workOrder.client.email && (
                    <p className="text-sm text-muted-foreground">
                      {workOrder.client.email}
                    </p>
                  )}
                  {workOrder.client.phone && (
                    <p className="text-sm text-muted-foreground">
                      {workOrder.client.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No client</p>
              )}
            </CardContent>
          </Card>

          {/* Vendor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Vendor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workOrder.vendor ? (
                <div>
                  <p className="font-medium">{workOrder.vendor.company_name}</p>
                  {workOrder.vendor.contact_first_name && (
                    <p className="text-sm text-muted-foreground">
                      {workOrder.vendor.contact_first_name}{' '}
                      {workOrder.vendor.contact_last_name}
                    </p>
                  )}
                  {workOrder.vendor.phone && (
                    <p className="text-sm text-muted-foreground">
                      {workOrder.vendor.phone}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-muted-foreground">No vendor assigned</p>
                  {canAssignVendor && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setShowAssignDialog(true)}
                    >
                      Assign Vendor
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AssignVendorDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        workOrderId={workOrder.id}
        category={workOrder.category}
        onAssign={handleAssignVendor}
        isLoading={assignVendor.isPending}
      />

      <CompleteWorkOrderDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        workOrderId={workOrder.id}
        estimatedCost={workOrder.estimated_cost}
        onComplete={handleComplete}
        isLoading={completeWorkOrder.isPending}
      />

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Work Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the work order. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Work Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Work Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
