"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Wrench, Calendar, Clock, CheckCircle, AlertCircle, Edit2, X, Save,
  Tag, FolderOpen, User, CalendarDays, FileText
} from "lucide-react"

interface WorkOrder {
  id: string
  property_id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  assigned_to?: string
  scheduled_date?: string
  notes?: string
  created_at: string
}

interface WorkOrderDetailDialogProps {
  workOrder: WorkOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
  readOnly?: boolean
}

export function WorkOrderDetailDialog({
  workOrder,
  open,
  onOpenChange,
  onUpdate,
  readOnly = false
}: WorkOrderDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
    status: "new",
    assigned_to: "",
    scheduled_date: "",
    notes: ""
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (workOrder) {
      setForm({
        title: workOrder.title || "",
        description: workOrder.description || "",
        category: workOrder.category || "general",
        priority: workOrder.priority || "medium",
        status: workOrder.status || "new",
        assigned_to: workOrder.assigned_to || "",
        scheduled_date: workOrder.scheduled_date || "",
        notes: workOrder.notes || ""
      })
      setIsEditing(false)
    }
  }, [workOrder])

  const getPriorityColor = (p: string) => {
    if (p === "emergency") return "bg-red-600 text-white"
    if (p === "high") return "bg-orange-500 text-white"
    if (p === "medium") return "bg-yellow-500 text-black"
    return "bg-gray-400 text-white"
  }

  const getStatusColor = (s: string) => {
    if (s === "completed") return "bg-green-600 text-white"
    if (s === "in_progress") return "bg-blue-500 text-white"
    if (s === "scheduled") return "bg-purple-500 text-white"
    return "bg-gray-600 text-white"
  }

  const getStatusIcon = (s: string) => {
    if (s === "completed") return <CheckCircle className="h-5 w-5 text-green-600" />
    if (s === "in_progress") return <Clock className="h-5 w-5 text-blue-600" />
    return <AlertCircle className="h-5 w-5 text-yellow-600" />
  }

  async function handleSave() {
    if (!workOrder) return
    setSaving(true)

    try {
      await fetch(`/api/work-orders/${workOrder.id}`, {
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
    if (!workOrder) return

    try {
      await fetch(`/api/work-orders/${workOrder.id}`, {
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

  if (!workOrder) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {isEditing ? "Edit Work Order" : "Work Order Details"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Created {new Date(workOrder.created_at).toLocaleDateString()}
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
              Title
            </label>
            {isEditing ? (
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Work order title"
              />
            ) : (
              <p className="text-lg font-medium">{workOrder.title}</p>
            )}
          </div>

          {/* Status and Priority Badges */}
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Priority</label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {getStatusIcon(form.status)}
                  <Badge className={getStatusColor(form.status)}>{form.status.replace("_", " ")}</Badge>
                </div>
                <Badge className={getPriorityColor(form.priority)}>{form.priority}</Badge>
              </>
            )}
          </div>

          {/* Quick Status Actions (when not editing) */}
          {!isEditing && !readOnly && form.status !== "completed" && (
            <div className="flex gap-2">
              {form.status === "new" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange("scheduled")}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange("in_progress")}>
                    <Clock className="h-4 w-4 mr-2" />
                    Start Work
                  </Button>
                </>
              )}
              {form.status === "scheduled" && (
                <Button size="sm" variant="outline" onClick={() => handleStatusChange("in_progress")}>
                  <Clock className="h-4 w-4 mr-2" />
                  Start Work
                </Button>
              )}
              {form.status === "in_progress" && (
                <Button size="sm" onClick={() => handleStatusChange("completed")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <FolderOpen className="h-4 w-4" />
              Description
            </label>
            {isEditing ? (
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detailed description of the issue..."
                rows={4}
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">
                {workOrder.description || "No description provided"}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4" />
              Category
            </label>
            {isEditing ? (
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="appliance">Appliance</SelectItem>
                  <SelectItem value="exterior">Exterior</SelectItem>
                  <SelectItem value="interior">Interior</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="capitalize">{workOrder.category}</Badge>
            )}
          </div>

          {/* Assigned To & Scheduled Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                Assigned To
              </label>
              {isEditing ? (
                <Input
                  value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  placeholder="Technician name"
                />
              ) : (
                <p className="text-sm">{workOrder.assigned_to || "Unassigned"}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4" />
                Scheduled Date
              </label>
              {isEditing ? (
                <Input
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                />
              ) : (
                <p className="text-sm">
                  {workOrder.scheduled_date
                    ? new Date(workOrder.scheduled_date).toLocaleDateString()
                    : "Not scheduled"}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              Notes
            </label>
            {isEditing ? (
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Internal notes about this work order..."
                rows={3}
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">
                {workOrder.notes || "No notes"}
              </p>
            )}
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
