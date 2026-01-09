"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Building2, Wrench, ClipboardCheck, FileText, LogOut, MapPin,
  CheckCircle, Clock, AlertCircle, Calendar, ChevronDown, Camera, Image, Plus,
  Eye, Shield, Star, Sparkles
} from "lucide-react"
import { PhotoGallery } from "@/components/photo-capture"
import { WorkOrderDetailDialog } from "@/components/work-order-detail-dialog"
import { SpecialRequestDetailDialog } from "@/components/special-request-detail-dialog"

interface Property {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  type: string
  current_plan?: {
    id: string
    tier_level: number
    name: string
  }
}

interface OwnerVisit {
  id: string
  property_id: string
  arrival_date: string
  departure_date: string | null
  special_requests: string | null
  status: string
  created_at: string
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  properties: Property[]
}

interface WorkOrder {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  created_at: string
}

interface ChecklistCompletion {
  id: string
  scheduled_date: string
  completed_at: string | null
  status: string
  results: { name: string; status: string; notes: string }[]
  notes: string
  template?: { name: string; frequency: string }
  photos?: InspectionPhoto[]
}

interface InspectionPhoto {
  id: string
  photo_url: string
  caption?: string
  room_area?: string
  item_name?: string
  created_at: string
}

interface SpecialRequest {
  id: string
  title: string
  description: string
  status: string
  response: string
  created_at: string
}

export default function ClientPortal() {
  const [client, setClient] = useState<Client | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [loading, setLoading] = useState(false)

  // Property data
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [completions, setCompletions] = useState<ChecklistCompletion[]>([])
  const [specialRequests, setSpecialRequests] = useState<SpecialRequest[]>([])

  // Detail dialog states
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const [showWorkOrderDetail, setShowWorkOrderDetail] = useState(false)
  const [selectedSpecialRequest, setSelectedSpecialRequest] = useState<SpecialRequest | null>(null)
  const [showSpecialRequestDetail, setShowSpecialRequestDetail] = useState(false)

  // Request submission dialog
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [requestForm, setRequestForm] = useState({
    title: "",
    description: "",
    category: "general",
    priority: "medium"
  })
  const [submitting, setSubmitting] = useState(false)

  // Owner visits (Luxury tier)
  const [ownerVisits, setOwnerVisits] = useState<OwnerVisit[]>([])
  const [showVisitDialog, setShowVisitDialog] = useState(false)
  const [visitForm, setVisitForm] = useState({
    arrival_date: "",
    departure_date: "",
    special_requests: ""
  })

  useEffect(() => {
    // Check for saved session
    const saved = localStorage.getItem("client_session")
    if (saved) {
      const parsed = JSON.parse(saved)
      setClient(parsed)
      if (parsed.properties?.length > 0) {
        setSelectedProperty(parsed.properties[0])
      }
    }
  }, [])

  useEffect(() => {
    if (selectedProperty) {
      fetchPropertyData(selectedProperty.id)
    }
  }, [selectedProperty])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setLoginError("")

    try {
      const res = await fetch("/api/clients/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      })

      if (!res.ok) {
        const err = await res.json()
        setLoginError(err.error || "Login failed")
        setLoading(false)
        return
      }

      const data = await res.json()
      setClient(data)
      localStorage.setItem("client_session", JSON.stringify(data))

      if (data.properties?.length > 0) {
        setSelectedProperty(data.properties[0])
      }
    } catch {
      setLoginError("Login failed")
    }
    setLoading(false)
  }

  function handleLogout() {
    setClient(null)
    setSelectedProperty(null)
    localStorage.removeItem("client_session")
  }

  async function fetchPropertyData(propertyId: string) {
    try {
      const [woRes, compRes, srRes, visitsRes] = await Promise.all([
        fetch(`/api/work-orders?property_id=${propertyId}`),
        fetch(`/api/checklist-completions?property_id=${propertyId}`),
        fetch(`/api/special-requests?property_id=${propertyId}`),
        fetch(`/api/owner-visits?property_id=${propertyId}&upcoming=true`)
      ])
      setWorkOrders(await woRes.json())
      const completionsData = await compRes.json()

      // Fetch photos for each completed checklist
      const completionsWithPhotos = await Promise.all(
        completionsData.map(async (comp: ChecklistCompletion) => {
          if (comp.status === 'completed') {
            try {
              const photosRes = await fetch(`/api/photos?checklist_completion_id=${comp.id}`)
              const photos = await photosRes.json()
              return { ...comp, photos: Array.isArray(photos) ? photos : [] }
            } catch {
              return comp
            }
          }
          return comp
        })
      )

      setCompletions(completionsWithPhotos)
      setSpecialRequests(await srRes.json())

      // Fetch owner visits for Luxury tier properties
      const visitsData = await visitsRes.json()
      setOwnerVisits(Array.isArray(visitsData) ? visitsData : [])
    } catch (e) {
      console.error(e)
    }
  }

  async function submitRequest() {
    if (!selectedProperty || !requestForm.title) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: selectedProperty.id,
          title: requestForm.title,
          description: requestForm.description,
          category: requestForm.category,
          priority: requestForm.priority,
          source: 'client_request'
        })
      })

      if (res.ok) {
        setShowRequestDialog(false)
        setRequestForm({ title: "", description: "", category: "general", priority: "medium" })
        fetchPropertyData(selectedProperty.id)
      }
    } catch (e) {
      console.error(e)
    }
    setSubmitting(false)
  }

  async function submitVisit() {
    if (!selectedProperty || !visitForm.arrival_date || !client) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/owner-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: selectedProperty.id,
          client_id: client.id,
          arrival_date: visitForm.arrival_date,
          departure_date: visitForm.departure_date || null,
          special_requests: visitForm.special_requests || null
        })
      })

      if (res.ok) {
        setShowVisitDialog(false)
        setVisitForm({ arrival_date: "", departure_date: "", special_requests: "" })
        fetchPropertyData(selectedProperty.id)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to schedule visit')
      }
    } catch (e) {
      console.error(e)
    }
    setSubmitting(false)
  }

  // Tier level helpers
  const tierLevel = selectedProperty?.current_plan?.tier_level || 0
  const isLuxuryTier = tierLevel === 3
  const isPremiumOrAbove = tierLevel >= 2

  // Tier info for display
  const TIER_INFO: Record<number, { tagline: string; serviceModel: string; icon: React.ElementType; color: string; bgColor: string }> = {
    1: {
      tagline: "Check & Report",
      serviceModel: "We inspect and report — you coordinate repairs",
      icon: Eye,
      color: "text-slate-600",
      bgColor: "bg-slate-100"
    },
    2: {
      tagline: "Check, Report & Manage",
      serviceModel: "We handle all repair coordination for you",
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    3: {
      tagline: "Full Property Concierge",
      serviceModel: "Complete care — repairs, visits, any request",
      icon: Star,
      color: "text-amber-600",
      bgColor: "bg-amber-100"
    }
  }

  const currentTierInfo = selectedProperty?.current_plan ? TIER_INFO[tierLevel] : null

  const getStatusColor = (s: string) => {
    if (s === "completed") return "bg-green-600 text-white"
    if (s === "in_progress") return "bg-blue-500 text-white"
    if (s === "approved") return "bg-green-500 text-white"
    if (s === "denied") return "bg-red-500 text-white"
    return "bg-gray-500 text-white"
  }

  const getPriorityColor = (p: string) => {
    if (p === "emergency") return "bg-red-600 text-white"
    if (p === "high") return "bg-orange-500 text-white"
    if (p === "medium") return "bg-yellow-500 text-black"
    return "bg-gray-400 text-white"
  }

  // Login Screen
  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary mx-auto mb-4">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-semibold">Client Portal</h1>
            <p className="text-muted-foreground mt-1">Sign in to view your properties</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  // Logged in view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">Client Portal</h1>
              <p className="text-sm text-muted-foreground">Welcome, {client.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Property Switcher */}
            {client.properties.length > 1 && (
              <Select
                value={selectedProperty?.id}
                onValueChange={(id) => {
                  const prop = client.properties.find(p => p.id === id)
                  if (prop) setSelectedProperty(prop)
                }}
              >
                <SelectTrigger className="w-[250px]">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {client.properties.map((prop) => (
                    <SelectItem key={prop.id} value={prop.id}>
                      {prop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4">
        {!selectedProperty ? (
          <Card className="p-8 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">No properties assigned to your account</p>
          </Card>
        ) : (
          <>
            {/* Property Header */}
            <Card className="p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedProperty.name}</h2>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedProperty.type}</Badge>
                    {currentTierInfo && (
                      <Badge className={`${currentTierInfo.bgColor} ${currentTierInfo.color} border-0`}>
                        {React.createElement(currentTierInfo.icon, { className: "h-3 w-3 mr-1" })}
                        {selectedProperty.current_plan?.name}
                      </Badge>
                    )}
                  </div>
                  {currentTierInfo && (
                    <p className="text-xs text-muted-foreground mt-2">{currentTierInfo.serviceModel}</p>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-2xl font-semibold">{workOrders.filter(w => w.status !== 'completed').length}</div>
                    <div className="text-xs text-muted-foreground">Open Requests</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">{completions.filter(c => c.status === 'completed').length}</div>
                    <div className="text-xs text-muted-foreground">Completed Checks</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="reports">
              <TabsList className="mb-4">
                <TabsTrigger value="reports">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Inspection Reports
                </TabsTrigger>
                <TabsTrigger value="maintenance">
                  <Wrench className="h-4 w-4 mr-2" />
                  Maintenance ({workOrders.filter(w => w.status !== 'completed').length})
                </TabsTrigger>
                {isLuxuryTier && (
                  <TabsTrigger value="visits">
                    <Calendar className="h-4 w-4 mr-2" />
                    My Visits ({ownerVisits.length})
                  </TabsTrigger>
                )}
                <TabsTrigger value="requests">
                  <FileText className="h-4 w-4 mr-2" />
                  Special Requests
                </TabsTrigger>
              </TabsList>

              {/* Reports Tab */}
              <TabsContent value="reports">
                <h3 className="font-semibold mb-4">Completed Inspection Reports</h3>
                {completions.filter(c => c.status === 'completed').length === 0 ? (
                  <Card className="p-8 text-center">
                    <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground">No completed inspections yet</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {completions
                      .filter(c => c.status === 'completed')
                      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
                      .map((comp) => {
                        const issues = comp.results?.filter(r => r.status === 'issue') || []
                        const okCount = comp.results?.filter(r => r.status === 'ok').length || 0

                        return (
                          <Card key={comp.id} className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{comp.template?.name}</span>
                                  <Badge variant="outline">{comp.template?.frequency}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  <Calendar className="h-3 w-3 inline mr-1" />
                                  Completed {new Date(comp.completed_at!).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {okCount} OK
                                </Badge>
                                {issues.length > 0 && (
                                  <Badge className="bg-red-100 text-red-800">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {issues.length} Issues
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Show issues if any */}
                            {issues.length > 0 && (
                              <div className="bg-red-50 rounded-lg p-3 mt-2">
                                <p className="text-sm font-medium text-red-800 mb-2">Issues Found:</p>
                                <ul className="space-y-1">
                                  {issues.map((issue, i) => (
                                    <li key={i} className="text-sm text-red-700">
                                      <span className="font-medium">{issue.name}</span>
                                      {issue.notes && <span className="text-red-600"> - {issue.notes}</span>}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Photo Documentation */}
                            {comp.photos && comp.photos.length > 0 && (
                              <div className="mt-3 border-t pt-3">
                                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                                  <Camera className="h-4 w-4" />
                                  Photo Documentation ({comp.photos.length})
                                </p>
                                <PhotoGallery photos={comp.photos} />
                              </div>
                            )}

                            {comp.notes && (
                              <div className="bg-muted rounded-lg p-3 mt-2">
                                <p className="text-sm"><span className="font-medium">Notes:</span> {comp.notes}</p>
                              </div>
                            )}
                          </Card>
                        )
                      })}
                  </div>
                )}
              </TabsContent>

              {/* Maintenance Tab */}
              <TabsContent value="maintenance">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Maintenance Requests</h3>
                  <Button size="sm" onClick={() => setShowRequestDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                </div>
                {workOrders.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Wrench className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground">No maintenance requests</p>
                    <Button className="mt-4" onClick={() => setShowRequestDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Your First Request
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {workOrders.map((wo) => (
                      <Card
                        key={wo.id}
                        className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                        onClick={() => {
                          setSelectedWorkOrder(wo)
                          setShowWorkOrderDetail(true)
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{wo.title}</span>
                              <Badge className={getPriorityColor(wo.priority)}>{wo.priority}</Badge>
                              <Badge className={getStatusColor(wo.status)}>{wo.status.replace("_", " ")}</Badge>
                            </div>
                            {wo.description && <p className="text-sm text-muted-foreground line-clamp-2">{wo.description}</p>}
                            <p className="text-xs text-muted-foreground mt-2">
                              {wo.category} • Created {new Date(wo.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            {wo.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : wo.status === 'in_progress' ? (
                              <Clock className="h-5 w-5 text-blue-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-yellow-600" />
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Special Requests Tab */}
              <TabsContent value="requests">
                <h3 className="font-semibold mb-4">Special Requests</h3>
                {specialRequests.length === 0 ? (
                  <Card className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground">No special requests</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {specialRequests.map((sr) => (
                      <Card
                        key={sr.id}
                        className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                        onClick={() => {
                          setSelectedSpecialRequest(sr)
                          setShowSpecialRequestDetail(true)
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{sr.title}</span>
                              <Badge className={getStatusColor(sr.status)}>{sr.status}</Badge>
                            </div>
                            {sr.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{sr.description}</p>}
                          </div>
                        </div>
                        {sr.response && (
                          <div className="bg-muted rounded-lg p-3 mt-2">
                            <p className="text-sm line-clamp-2"><span className="font-medium">Response:</span> {sr.response}</p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Visits Tab (Luxury tier only) */}
              {isLuxuryTier && (
                <TabsContent value="visits">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Scheduled Visits</h3>
                    <Button size="sm" onClick={() => setShowVisitDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Visit
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    As a Luxury Care member, you receive pre-arrival and post-departure services.
                    Schedule your visits and we'll prepare your property for your arrival.
                  </p>
                  {ownerVisits.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p className="text-muted-foreground">No upcoming visits scheduled</p>
                      <Button className="mt-4" onClick={() => setShowVisitDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Your Visit
                      </Button>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {ownerVisits.map((visit) => (
                        <Card key={visit.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
                                  {new Date(visit.arrival_date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                                <Badge className={getStatusColor(visit.status)}>
                                  {visit.status.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              {visit.departure_date && (
                                <p className="text-sm text-muted-foreground">
                                  Departing: {new Date(visit.departure_date).toLocaleDateString()}
                                </p>
                              )}
                              {visit.special_requests && (
                                <p className="text-sm mt-2 text-muted-foreground">
                                  <span className="font-medium">Special requests:</span> {visit.special_requests}
                                </p>
                              )}
                            </div>
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </>
        )}
      </main>

      {/* Work Order Detail Dialog (read-only for clients) */}
      <WorkOrderDetailDialog
        workOrder={selectedWorkOrder}
        open={showWorkOrderDetail}
        onOpenChange={setShowWorkOrderDetail}
        readOnly={true}
      />

      {/* Special Request Detail Dialog (read-only for clients) */}
      <SpecialRequestDetailDialog
        request={selectedSpecialRequest}
        open={showSpecialRequestDetail}
        onOpenChange={setShowSpecialRequestDetail}
        readOnly={true}
      />

      {/* Submit Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Maintenance Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Tier-based info banner */}
            {tierLevel === 1 && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                  <Eye className="h-4 w-4" />
                  Check & Report Plan
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  We'll document the issue and provide vendor recommendations. You'll coordinate the repair directly.
                </p>
              </div>
            )}
            {tierLevel === 2 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  We'll Handle It
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  We'll coordinate the entire repair process — get quotes, schedule vendors, and oversee the work.
                </p>
              </div>
            )}
            {tierLevel === 3 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                  <Star className="h-4 w-4" />
                  Concierge Service
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  We'll handle everything — repairs, vendor coordination, and any follow-up. No action needed from you.
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">What needs attention? *</label>
              <Input
                placeholder="e.g., Leaking faucet in bathroom"
                value={requestForm.title}
                onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Please provide details about the issue..."
                value={requestForm.description}
                onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={requestForm.category}
                  onValueChange={(v) => setRequestForm({ ...requestForm, category: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="appliance">Appliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Urgency</label>
                <Select
                  value={requestForm.priority}
                  onValueChange={(v) => setRequestForm({ ...requestForm, priority: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Can wait</SelectItem>
                    <SelectItem value="medium">Medium - Within a week</SelectItem>
                    <SelectItem value="high">High - Within 24-48 hours</SelectItem>
                    <SelectItem value="emergency">Emergency - Immediate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {isPremiumOrAbove
                ? "We'll take care of coordinating the repair. You'll receive updates as we progress."
                : "We'll document the issue and send you a report with our recommendations."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitRequest} disabled={!requestForm.title || submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Visit Dialog (Luxury tier) */}
      <Dialog open={showVisitDialog} onOpenChange={setShowVisitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Your Visit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Let us know when you're coming and we'll have your property ready for your arrival.
            </p>
            <div>
              <label className="text-sm font-medium">Arrival Date *</label>
              <Input
                type="date"
                value={visitForm.arrival_date}
                onChange={(e) => setVisitForm({ ...visitForm, arrival_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Departure Date (optional)</label>
              <Input
                type="date"
                value={visitForm.departure_date}
                onChange={(e) => setVisitForm({ ...visitForm, departure_date: e.target.value })}
                min={visitForm.arrival_date || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Special Requests</label>
              <Textarea
                placeholder="Any special preparations? (e.g., stock groceries, turn on AC, etc.)"
                value={visitForm.special_requests}
                onChange={(e) => setVisitForm({ ...visitForm, special_requests: e.target.value })}
                rows={3}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium">Pre-arrival service includes:</p>
              <ul className="list-disc list-inside mt-1 text-xs">
                <li>Full property inspection</li>
                <li>AC/Heat adjustment</li>
                <li>Fresh linens and towels</li>
                <li>Basic grocery stocking (upon request)</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVisitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitVisit} disabled={!visitForm.arrival_date || submitting}>
              {submitting ? "Scheduling..." : "Schedule Visit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
