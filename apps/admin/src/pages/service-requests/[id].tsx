import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  User,
  Clock,
  MessageSquare,
  Send,
  Wrench,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import {
  useAdminServiceRequest,
  useUpdateServiceRequestStatus,
  useAddAdminComment,
} from '@/hooks/use-service-requests'

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

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

export default function ServiceRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: request, isLoading, error } = useAdminServiceRequest(id)
  const updateStatus = useUpdateServiceRequestStatus()
  const addComment = useAddAdminComment()

  const [comment, setComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [resolution, setResolution] = useState('')

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'completed') {
      setShowCompleteDialog(true)
      return
    }

    try {
      await updateStatus.mutateAsync({ id: id!, status: newStatus })
      toast({
        title: 'Status updated',
        description: `Request marked as ${STATUS_CONFIG[newStatus]?.label || newStatus}`,
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      })
    }
  }

  const handleComplete = async () => {
    try {
      await updateStatus.mutateAsync({
        id: id!,
        status: 'completed',
        resolution: resolution || undefined,
      })
      setShowCompleteDialog(false)
      setResolution('')
      toast({
        title: 'Request completed',
        description: 'The service request has been marked as completed',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to complete request',
        variant: 'destructive',
      })
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return

    try {
      await addComment.mutateAsync({
        service_request_id: id!,
        comment: comment.trim(),
        is_internal: isInternal,
      })
      setComment('')
      setIsInternal(false)
      toast({
        title: 'Comment added',
        description: isInternal ? 'Internal note added' : 'Comment added and visible to client',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="font-medium text-lg">Request not found</h3>
        <p className="text-muted-foreground">
          {error?.message || 'The requested service request could not be found'}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/service-requests')}>
          Back to Service Requests
        </Button>
      </div>
    )
  }

  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.new
  const priority = PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG.medium
  const clientName = request.client
    ? `${request.client.first_name || ''} ${request.client.last_name || ''}`.trim() || request.client.email
    : 'Unknown'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/service-requests')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={`Request #${request.request_number}`}
          description={request.title}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Request Details</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={status.color}>{status.label}</Badge>
                  <span className={`text-sm font-medium ${priority.color}`}>
                    {priority.label} Priority
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {request.description || 'No description provided'}
                </p>
              </div>

              {request.photos && request.photos.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {request.photos.map((photo, index) => (
                      <a
                        key={index}
                        href={photo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-video rounded-lg overflow-hidden bg-muted"
                      >
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {request.resolution && (
                <div>
                  <h4 className="font-medium mb-1">Resolution</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {request.resolution}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.comments && request.comments.length > 0 ? (
                <div className="space-y-4">
                  {request.comments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-lg ${
                        c.user?.role === 'client'
                          ? 'bg-blue-50 border border-blue-100'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">
                          {c.user
                            ? `${c.user.first_name} ${c.user.last_name}`
                            : 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(c.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{c.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No comments yet
                </p>
              )}

              <Separator />

              {/* Add Comment */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="internal"
                      checked={isInternal}
                      onCheckedChange={(checked) => setIsInternal(checked === true)}
                    />
                    <Label htmlFor="internal" className="text-sm text-muted-foreground">
                      Internal note (not visible to client)
                    </Label>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!comment.trim() || addComment.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm">Update Status</Label>
                <Select
                  value={request.status}
                  onValueChange={handleStatusChange}
                  disabled={updateStatus.isPending}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to={`/work-orders/new?property=${request.property?.id}&from_request=${request.id}`}>
                    <Wrench className="h-4 w-4 mr-2" />
                    Create Work Order
                  </Link>
                </Button>

                {request.work_order_id && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to={`/work-orders/${request.work_order_id}`}>
                      <Wrench className="h-4 w-4 mr-2" />
                      View Work Order
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{request.property?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.property?.address_line1 || 'No address'}
                  </p>
                  <Link
                    to={`/properties/${request.property?.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View property
                  </Link>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.client?.email || 'No email'}
                  </p>
                  <Link
                    to={`/clients/${request.client?.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View client
                  </Link>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p>
                    <span className="text-muted-foreground">Submitted:</span>{' '}
                    {formatDate(request.created_at)}
                  </p>
                  {request.acknowledged_at && (
                    <p>
                      <span className="text-muted-foreground">Acknowledged:</span>{' '}
                      {formatDate(request.acknowledged_at)}
                    </p>
                  )}
                  {request.resolved_at && (
                    <p>
                      <span className="text-muted-foreground">Resolved:</span>{' '}
                      {formatDate(request.resolved_at)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Service Request</DialogTitle>
            <DialogDescription>
              Add a resolution note to describe how this request was resolved.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="resolution">Resolution (optional)</Label>
            <Textarea
              id="resolution"
              placeholder="Describe how the issue was resolved..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleComplete} disabled={updateStatus.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
