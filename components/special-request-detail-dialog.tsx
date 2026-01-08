"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText, Calendar, CheckCircle, Clock, XCircle, Edit2, X, Save,
  MessageSquare, AlertCircle
} from "lucide-react"

interface SpecialRequest {
  id: string
  property_id: string
  title: string
  description: string
  status: string
  response: string
  created_at: string
}

interface SpecialRequestDetailDialogProps {
  request: SpecialRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
  readOnly?: boolean
}

export function SpecialRequestDetailDialog({
  request,
  open,
  onOpenChange,
  onUpdate,
  readOnly = false
}: SpecialRequestDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    response: ""
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (request) {
      setForm({
        title: request.title || "",
        description: request.description || "",
        status: request.status || "pending",
        response: request.response || ""
      })
      setIsEditing(false)
    }
  }, [request])

  const getStatusColor = (s: string) => {
    if (s === "completed") return "bg-green-600 text-white"
    if (s === "approved") return "bg-green-500 text-white"
    if (s === "denied") return "bg-red-500 text-white"
    if (s === "in_progress") return "bg-blue-500 text-white"
    return "bg-gray-500 text-white"
  }

  const getStatusIcon = (s: string) => {
    if (s === "completed" || s === "approved") return <CheckCircle className="h-5 w-5 text-green-600" />
    if (s === "denied") return <XCircle className="h-5 w-5 text-red-600" />
    if (s === "in_progress") return <Clock className="h-5 w-5 text-blue-600" />
    return <AlertCircle className="h-5 w-5 text-yellow-600" />
  }

  async function handleSave() {
    if (!request) return
    setSaving(true)

    try {
      await fetch(`/api/special-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      setIsEditing(false)
      onUpdate?.()
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  async function handleStatusChange(newStatus: string) {
    if (!request) return

    try {
      await fetch(`/api/special-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      setForm({ ...form, status: newStatus })
      onUpdate?.()
    } catch (e) {
      console.error(e)
    }
  }

  async function handleQuickResponse(status: string, response: string) {
    if (!request) return

    try {
      await fetch(`/api/special-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, response })
      })
      setForm({ ...form, status, response })
      onUpdate?.()
    } catch (e) {
      console.error(e)
    }
  }

  if (!request) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {isEditing ? "Edit Special Request" : "Special Request Details"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Submitted {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {!readOnly && !isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              Request Title
            </label>
            {isEditing ? (
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Request title"
              />
            ) : (
              <p className="text-lg font-medium">{request.title}</p>
            )}
          </div>

          {/* Status Badge */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
            {isEditing ? (
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                {getStatusIcon(form.status)}
                <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
              </div>
            )}
          </div>

          {/* Quick Actions (when not editing) */}
          {!isEditing && !readOnly && form.status === "pending" && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-3">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleStatusChange("in_progress")}>
                  <Clock className="h-4 w-4 mr-2" />
                  Review
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleQuickResponse("approved", "Your request has been approved.")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleQuickResponse("denied", "Unfortunately, we cannot accommodate this request at this time.")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny
                </Button>
              </div>
            </div>
          )}

          {!isEditing && !readOnly && form.status === "in_progress" && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-3">Complete Review</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleQuickResponse("approved", "Your request has been approved.")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleQuickResponse("denied", "Unfortunately, we cannot accommodate this request at this time.")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("completed")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Completed
                </Button>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4" />
              Request Details
            </label>
            {isEditing ? (
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detailed description of the request..."
                rows={4}
              />
            ) : (
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">
                  {request.description || "No description provided"}
                </p>
              </div>
            )}
          </div>

          {/* Response */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4" />
              Response
            </label>
            {isEditing ? (
              <Textarea
                value={form.response}
                onChange={(e) => setForm({ ...form, response: e.target.value })}
                placeholder="Your response to this request..."
                rows={4}
              />
            ) : form.response ? (
              <div className={`rounded-lg p-4 ${
                form.status === "approved" ? "bg-green-50 border border-green-200" :
                form.status === "denied" ? "bg-red-50 border border-red-200" :
                "bg-blue-50 border border-blue-200"
              }`}>
                <p className="text-sm whitespace-pre-wrap">{form.response}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No response yet</p>
            )}
          </div>

          {/* Timeline */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </label>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                <span>Submitted on {new Date(request.created_at).toLocaleString()}</span>
              </div>
              {form.status !== "pending" && (
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    form.status === "approved" || form.status === "completed" ? "bg-green-500" :
                    form.status === "denied" ? "bg-red-500" : "bg-blue-500"
                  }`}></div>
                  <span>Status updated to {form.status}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.title}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
