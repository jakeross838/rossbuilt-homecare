import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Clock, MapPin, Send, User, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useServiceRequest, useAddServiceRequestComment } from '@/hooks/use-service-requests'
import { useToast } from '@/hooks/use-toast'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }> = {
  new: { label: 'New', variant: 'default' },
  acknowledged: { label: 'Acknowledged', variant: 'secondary' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  resolved: { label: 'Resolved', variant: 'success' },
  closed: { label: 'Closed', variant: 'secondary' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-gray-600 bg-gray-50' },
  medium: { label: 'Medium', color: 'text-blue-600 bg-blue-50' },
  high: { label: 'High', color: 'text-orange-600 bg-orange-50' },
  urgent: { label: 'Urgent', color: 'text-red-600 bg-red-50' },
}

export default function PortalRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const { data: request, isLoading, error } = useServiceRequest(id)
  const addComment = useAddServiceRequestComment()
  const [newComment, setNewComment] = useState('')

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return

    try {
      await addComment.mutateAsync({
        service_request_id: id,
        comment: newComment.trim(),
      })
      setNewComment('')
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading request...</div>
  }

  if (error || !request) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive mb-4">Request not found</p>
        <Link to="/portal/requests" className="text-blue-600">
          Back to Requests
        </Link>
      </div>
    )
  }

  const status = statusConfig[request.status] || statusConfig.new
  const priority = priorityConfig[request.priority] || priorityConfig.medium

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/portal/requests">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{request.request_number}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
            <span className={`text-xs px-2 py-0.5 rounded-full ${priority.color}`}>
              {priority.label} Priority
            </span>
          </div>
          <p className="text-muted-foreground">{request.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-medium">
                      {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>

                {request.property && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Property</p>
                      <p className="font-medium">{request.property.name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">
                      {request.request_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {request.acknowledged_at && (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Acknowledged</p>
                      <p className="font-medium">
                        {format(new Date(request.acknowledged_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {request.description}
                </p>
              </div>

              {/* Photos */}
              {request.photos && request.photos.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Photos ({request.photos.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {request.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Request photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90"
                          onClick={() => window.open(photo, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Resolution */}
          {request.resolution && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Resolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {request.resolution}
                </p>
                {request.resolved_at && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Resolved on {format(new Date(request.resolved_at), 'MMMM d, yyyy')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.comments && request.comments.length > 0 ? (
                <div className="space-y-4">
                  {request.comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-muted pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">
                          {comment.user
                            ? `${comment.user.first_name} ${comment.user.last_name}`
                            : 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No comments yet
                </p>
              )}

              {/* Add Comment */}
              {request.status !== 'closed' && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || addComment.isPending}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {addComment.isPending ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>

                {request.acknowledged_at && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Acknowledged</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(request.acknowledged_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                )}

                {request.resolved_at && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">Resolved</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(request.resolved_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Work Order Link */}
          {request.work_order_id && (
            <Card>
              <CardHeader>
                <CardTitle>Related Work Order</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  A work order has been created to address this request.
                </p>
                <Badge variant="outline">Work Order Created</Badge>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {request.property && (
                <Link to={`/portal/properties/${request.property.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Property
                  </Button>
                </Link>
              )}
              <Link to="/portal/requests">
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  All Requests
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
