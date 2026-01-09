"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { WorkOrderDetailDialog } from "@/components/work-order-detail-dialog"
import { SpecialRequestDetailDialog } from "@/components/special-request-detail-dialog"
import { ServicesTab } from "@/components/services-tab"
import { VendorsTab } from "@/components/vendors-tab"
import { PropertyPlanTab } from "@/components/property-plan-tab"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Wrench, Building2, ClipboardCheck, AlertTriangle, Plus, Calendar,
  MapPin, ChevronLeft, ChevronRight, Play, CheckCircle, Trash2,
  FileText, Clock, AlertCircle, X, Edit2, GripVertical, Users, Settings,
  Package, Truck, Camera, Image, DollarSign, TrendingUp, BarChart3, UserPlus,
  LayoutDashboard, Bell, ArrowRight
} from "lucide-react"
import { PhotoCapture } from "@/components/photo-capture"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { BillingTab } from "@/components/billing-tab"
import { InspectionWalkthrough, ChecklistItemResult, ChecklistCompletion } from "@/components/inspection-walkthrough"

// Types
interface Client {
  id: string
  name: string
  email: string
  phone: string
  is_active: boolean
  properties?: { count: number }[]
}

interface Property {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  type: string
  client_id?: string
  client?: { id: string; name: string }
  current_plan_id?: string
}

interface WorkOrder {
  id: string
  property_id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  scheduled_date?: string
  created_at: string
}

interface SpecialRequest {
  id: string
  property_id: string
  title: string
  description: string
  status: string
  response: string
  created_at: string
}

interface ChecklistTemplate {
  id: string
  property_id: string
  name: string
  frequency: string
  items: {
    name: string
    category: string
    input_type?: string
    requires_photo?: boolean
    options?: string[]
    unit?: string
    description?: string
  }[]
}

// ChecklistCompletion is imported from inspection-walkthrough

interface InspectionPhoto {
  id: string
  photo_url: string
  caption?: string
  room_area?: string
  item_name?: string
  created_at: string
}

export default function AdminDashboard() {
  // State
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [specialRequests, setSpecialRequests] = useState<SpecialRequest[]>([])
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([])
  const [completions, setCompletions] = useState<ChecklistCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("maintenance")

  // Client management
  const [clients, setClients] = useState<Client[]>([])
  const [sidebarView, setSidebarView] = useState<"dashboard" | "properties" | "clients" | "vendors" | "settings" | "analytics" | "billing">("dashboard")

  // Dashboard state
  const [dashboardData, setDashboardData] = useState<{
    todayInspections: { id: string; property_name: string; template_name: string; status: string; scheduled_date: string }[]
    overdueWorkOrders: { id: string; title: string; property_name: string; priority: string; created_at: string; days_old: number }[]
    pendingRequests: { id: string; title: string; property_name: string; created_at: string }[]
    stats: { totalProperties: number; totalClients: number; activeWorkOrders: number; completedThisMonth: number }
  }>({
    todayInspections: [],
    overdueWorkOrders: [],
    pendingRequests: [],
    stats: { totalProperties: 0, totalClients: 0, activeWorkOrders: 0, completedThisMonth: 0 }
  })
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [clientForm, setClientForm] = useState({ name: "", email: "", phone: "", password: "" })
  const [showPropertyDialog, setShowPropertyDialog] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [propertyForm, setPropertyForm] = useState({ name: "", address: "", city: "", state: "", zip: "", type: "residential", client_id: "" })

  // Onboarding flow state
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState<"client" | "properties" | "plans">("client")
  const [newClientId, setNewClientId] = useState<string | null>(null)
  const [onboardingProperties, setOnboardingProperties] = useState<{ name: string; address: string; city: string; state: string; zip: string }[]>([])
  const [newOnboardingProperty, setNewOnboardingProperty] = useState({ name: "", address: "", city: "", state: "", zip: "" })
  const [createdPropertyIds, setCreatedPropertyIds] = useState<string[]>([])
  const [propertyPlanSelections, setPropertyPlanSelections] = useState<Record<number, string>>({})
  const [servicePlans, setServicePlans] = useState<{ id: string; name: string; tier_level: number; monthly_base_price: number }[]>([])

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [scheduleFilter, setScheduleFilter] = useState<"all" | "work_orders" | "checklists">("all")

  // Dialog states
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false)
  const [showChecklistDialog, setShowChecklistDialog] = useState(false)
  const [activeChecklist, setActiveChecklist] = useState<ChecklistCompletion | null>(null)
  const [checklistResults, setChecklistResults] = useState<{ name: string; status: string; notes: string; category: string }[]>([])
  const [checklistPhotos, setChecklistPhotos] = useState<InspectionPhoto[]>([])

  // Form states
  const [woForm, setWoForm] = useState({ title: "", description: "", category: "general", priority: "medium" })

  // Detail dialog states
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const [showWorkOrderDetail, setShowWorkOrderDetail] = useState(false)
  const [selectedSpecialRequest, setSelectedSpecialRequest] = useState<SpecialRequest | null>(null)
  const [showSpecialRequestDetail, setShowSpecialRequestDetail] = useState(false)

  // Template editor state
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null)
  const [templateForm, setTemplateForm] = useState({
    name: "",
    frequency: "weekly",
    items: [] as { name: string; category: string; input_type: string; requires_photo: boolean; options?: string[]; unit?: string; description?: string }[]
  })
  const [newItemName, setNewItemName] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("general")
  const [newItemInputType, setNewItemInputType] = useState("checkbox")
  const [newItemRequiresPhoto, setNewItemRequiresPhoto] = useState(false)

  useEffect(() => {
    fetchProperties()
    fetchClients()
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (selectedProperty) {
      fetchPropertyData(selectedProperty.id)
    }
  }, [selectedProperty])

  async function fetchProperties() {
    try {
      const res = await fetch("/api/properties")
      const data = await res.json()
      const propArray = Array.isArray(data) ? data : []
      setProperties(propArray)
      if (propArray.length > 0 && !selectedProperty) {
        setSelectedProperty(propArray[0])
      }
    } catch (e) {
      console.error(e)
      setProperties([])
    }
    setLoading(false)
  }

  async function fetchPropertyData(propertyId: string) {
    try {
      const [woRes, srRes, clRes, compRes] = await Promise.all([
        fetch(`/api/work-orders?property_id=${propertyId}`),
        fetch(`/api/special-requests?property_id=${propertyId}`),
        fetch(`/api/checklists?property_id=${propertyId}`),
        fetch(`/api/checklist-completions?property_id=${propertyId}`)
      ])
      setWorkOrders(await woRes.json())
      setSpecialRequests(await srRes.json())
      setChecklists(await clRes.json())
      setCompletions(await compRes.json())
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchClients() {
    try {
      const res = await fetch("/api/clients")
      const data = await res.json()
      setClients(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchDashboardData() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

      // Fetch all data in parallel
      const [propsRes, clientsRes, workOrdersRes, completionsRes, requestsRes] = await Promise.all([
        fetch("/api/properties"),
        fetch("/api/clients"),
        fetch("/api/work-orders"),
        fetch(`/api/checklist-completions?from=${today}&to=${today}`),
        fetch("/api/special-requests")
      ])

      const allProps = await propsRes.json()
      const allClients = await clientsRes.json()
      const allWorkOrders = await workOrdersRes.json()
      const todayCompletions = await completionsRes.json()
      const allRequests = await requestsRes.json()

      // Get property name lookup
      const propLookup: Record<string, string> = {}
      if (Array.isArray(allProps)) {
        allProps.forEach((p: { id: string; name: string }) => { propLookup[p.id] = p.name })
      }

      // Today's inspections
      const todayInspections = Array.isArray(todayCompletions)
        ? todayCompletions.map((c: { id: string; property_id: string; status: string; scheduled_date: string; template?: { name: string } }) => ({
            id: c.id,
            property_name: propLookup[c.property_id] || 'Unknown',
            template_name: c.template?.name || 'Inspection',
            status: c.status,
            scheduled_date: c.scheduled_date
          }))
        : []

      // Overdue work orders (not completed, older than 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const overdueWorkOrders = Array.isArray(allWorkOrders)
        ? allWorkOrders
            .filter((wo: { status: string; created_at: string }) =>
              wo.status !== 'completed' && wo.status !== 'cancelled' && new Date(wo.created_at) < sevenDaysAgo
            )
            .map((wo: { id: string; title: string; property_id: string; priority: string; created_at: string }) => ({
              id: wo.id,
              title: wo.title,
              property_name: propLookup[wo.property_id] || 'Unknown',
              priority: wo.priority,
              created_at: wo.created_at,
              days_old: Math.floor((Date.now() - new Date(wo.created_at).getTime()) / (1000 * 60 * 60 * 24))
            }))
            .sort((a: { days_old: number }, b: { days_old: number }) => b.days_old - a.days_old)
            .slice(0, 10)
        : []

      // Pending special requests
      const pendingRequests = Array.isArray(allRequests)
        ? allRequests
            .filter((r: { status: string }) => r.status === 'pending')
            .map((r: { id: string; title: string; property_id: string; created_at: string }) => ({
              id: r.id,
              title: r.title,
              property_name: propLookup[r.property_id] || 'Unknown',
              created_at: r.created_at
            }))
            .slice(0, 10)
        : []

      // Stats
      const activeWorkOrders = Array.isArray(allWorkOrders)
        ? allWorkOrders.filter((wo: { status: string }) => wo.status !== 'completed' && wo.status !== 'cancelled').length
        : 0

      // Get completed inspections this month
      const monthCompletionsRes = await fetch(`/api/checklist-completions?from=${monthStart}&status=completed`)
      const monthCompletions = await monthCompletionsRes.json()
      const completedThisMonth = Array.isArray(monthCompletions) ? monthCompletions.length : 0

      setDashboardData({
        todayInspections,
        overdueWorkOrders,
        pendingRequests,
        stats: {
          totalProperties: Array.isArray(allProps) ? allProps.length : 0,
          totalClients: Array.isArray(allClients) ? allClients.length : 0,
          activeWorkOrders,
          completedThisMonth
        }
      })
    } catch (e) {
      console.error("Failed to fetch dashboard data", e)
    }
  }

  // Client management
  function openNewClient() {
    setEditingClient(null)
    setClientForm({ name: "", email: "", phone: "", password: "" })
    setShowClientDialog(true)
  }

  function openEditClient(client: Client) {
    setEditingClient(client)
    setClientForm({ name: client.name, email: client.email, phone: client.phone || "", password: "" })
    setShowClientDialog(true)
  }

  async function saveClient() {
    if (!clientForm.name || !clientForm.email) return
    if (!editingClient && !clientForm.password) {
      alert("Password is required for new clients")
      return
    }

    const payload: Record<string, string> = {
      name: clientForm.name,
      email: clientForm.email,
      phone: clientForm.phone
    }
    if (clientForm.password) payload.password = clientForm.password

    if (editingClient) {
      await fetch(`/api/clients/${editingClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    } else {
      await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    }

    setShowClientDialog(false)
    fetchClients()
  }

  async function deleteClient(id: string) {
    if (!confirm("Delete this client? Their properties will be unassigned.")) return
    await fetch(`/api/clients/${id}`, { method: "DELETE" })
    fetchClients()
    fetchProperties() // Refresh to show unassigned properties
  }

  // Property management
  function openNewProperty() {
    setEditingProperty(null)
    setPropertyForm({ name: "", address: "", city: "", state: "", zip: "", type: "residential", client_id: "" })
    setShowPropertyDialog(true)
  }

  function openEditProperty(property: Property) {
    setEditingProperty(property)
    setPropertyForm({
      name: property.name,
      address: property.address,
      city: property.city || "",
      state: property.state || "",
      zip: property.zip || "",
      type: property.type || "residential",
      client_id: property.client_id || ""
    })
    setShowPropertyDialog(true)
  }

  async function saveProperty() {
    if (!propertyForm.name || !propertyForm.address) return

    if (editingProperty) {
      await fetch(`/api/properties/${editingProperty.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...propertyForm,
          client_id: propertyForm.client_id || null
        })
      })
      // Update selected property if we edited it
      if (selectedProperty?.id === editingProperty.id) {
        setSelectedProperty({
          ...selectedProperty,
          name: propertyForm.name,
          address: propertyForm.address,
          city: propertyForm.city,
          state: propertyForm.state,
          zip: propertyForm.zip,
          type: propertyForm.type,
          client_id: propertyForm.client_id || undefined
        })
      }
    } else {
      await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...propertyForm,
          client_id: propertyForm.client_id || null
        })
      })
    }

    setShowPropertyDialog(false)
    setEditingProperty(null)
    fetchProperties()
    fetchClients() // Refresh client property counts
  }

  async function deleteProperty(id: string) {
    if (!confirm("Delete this property? All work orders, checklists, and related data will be permanently deleted.")) return
    await fetch(`/api/properties/${id}`, { method: "DELETE" })
    if (selectedProperty?.id === id) {
      setSelectedProperty(null)
    }
    fetchProperties()
    fetchClients() // Refresh client property counts
  }

  async function assignClientToProperty(propertyId: string, clientId: string | null) {
    await fetch(`/api/properties/${propertyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId })
    })
    fetchProperties()
  }

  // Onboarding flow functions
  async function startOnboarding() {
    setOnboardingStep("client")
    setClientForm({ name: "", email: "", phone: "", password: "" })
    setOnboardingProperties([])
    setNewOnboardingProperty({ name: "", address: "", city: "", state: "", zip: "" })
    setNewClientId(null)
    setCreatedPropertyIds([])
    setPropertyPlanSelections({})
    setShowOnboardingDialog(true)

    // Fetch service plans for step 3
    try {
      const res = await fetch("/api/plans")
      const plans = await res.json()
      setServicePlans(Array.isArray(plans) ? plans.sort((a: { tier_level: number }, b: { tier_level: number }) => a.tier_level - b.tier_level) : [])
    } catch (e) {
      console.error("Failed to fetch plans", e)
    }
  }

  function addOnboardingProperty() {
    if (!newOnboardingProperty.name || !newOnboardingProperty.address) return
    setOnboardingProperties([...onboardingProperties, { ...newOnboardingProperty }])
    setNewOnboardingProperty({ name: "", address: "", city: "", state: "", zip: "" })
  }

  function removeOnboardingProperty(index: number) {
    setOnboardingProperties(onboardingProperties.filter((_, i) => i !== index))
    // Also remove any plan selection for this property
    const newSelections = { ...propertyPlanSelections }
    delete newSelections[index]
    // Shift remaining selections down
    const updated: Record<number, string> = {}
    Object.keys(newSelections).forEach(key => {
      const idx = parseInt(key)
      if (idx > index) {
        updated[idx - 1] = newSelections[idx]
      } else {
        updated[idx] = newSelections[idx]
      }
    })
    setPropertyPlanSelections(updated)
  }

  async function saveOnboardingClient() {
    if (!clientForm.name || !clientForm.email || !clientForm.password) return

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: clientForm.name,
        email: clientForm.email,
        phone: clientForm.phone,
        password: clientForm.password
      })
    })
    const newClient = await res.json()
    if (newClient.id) {
      setNewClientId(newClient.id)
      setOnboardingStep("properties")
      fetchClients()
    }
  }

  async function saveOnboardingProperties() {
    if (onboardingProperties.length === 0) {
      finishOnboarding()
      return
    }

    // Create all properties and store their IDs
    const propertyIds: string[] = []
    for (const prop of onboardingProperties) {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prop.name,
          address: prop.address,
          city: prop.city,
          state: prop.state,
          zip: prop.zip,
          type: "residential",
          client_id: newClientId
        })
      })
      const created = await res.json()
      if (created.id) {
        propertyIds.push(created.id)
      }
    }

    setCreatedPropertyIds(propertyIds)
    fetchProperties()

    // Go to plan selection step
    setOnboardingStep("plans")
  }

  async function saveOnboardingPlans() {
    // Assign plans to properties
    for (let i = 0; i < createdPropertyIds.length; i++) {
      const planId = propertyPlanSelections[i]
      if (planId) {
        await fetch("/api/property-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            property_id: createdPropertyIds[i],
            plan_id: planId
          })
        })
      }
    }

    fetchProperties()
    finishOnboarding()
  }

  function finishOnboarding() {
    setShowOnboardingDialog(false)
    setOnboardingStep("client")
    setNewClientId(null)
    setOnboardingProperties([])
    setCreatedPropertyIds([])
    setPropertyPlanSelections({})
  }

  // Work Order Actions
  async function createWorkOrder() {
    if (!woForm.title || !selectedProperty) return
    await fetch("/api/work-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...woForm, property_id: selectedProperty.id })
    })
    setShowWorkOrderDialog(false)
    setWoForm({ title: "", description: "", category: "general", priority: "medium" })
    fetchPropertyData(selectedProperty.id)
  }

  async function updateWorkOrderStatus(id: string, status: string) {
    await fetch(`/api/work-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    })
    if (selectedProperty) fetchPropertyData(selectedProperty.id)
  }

  async function deleteWorkOrder(id: string) {
    if (!confirm("Delete this work order?")) return
    await fetch(`/api/work-orders/${id}`, { method: "DELETE" })
    if (selectedProperty) fetchPropertyData(selectedProperty.id)
  }

  // Checklist Actions
  async function startChecklist(completion: ChecklistCompletion) {
    await fetch(`/api/checklist-completions/${completion.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start" })
    })

    // Initialize results from template items
    const items = completion.template?.items || []
    setChecklistResults(items.map(item => ({
      name: item.name,
      category: item.category,
      status: "pending",
      notes: ""
    })))

    // Fetch existing photos for this checklist
    try {
      const photosRes = await fetch(`/api/photos?checklist_completion_id=${completion.id}`)
      const photos = await photosRes.json()
      setChecklistPhotos(Array.isArray(photos) ? photos : [])
    } catch {
      setChecklistPhotos([])
    }

    setActiveChecklist({ ...completion, status: "in_progress" })
    setShowChecklistDialog(true)
  }

  async function completeChecklist() {
    if (!activeChecklist) return

    await fetch(`/api/checklist-completions/${activeChecklist.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "complete",
        results: checklistResults,
        completed_by: "Admin"
      })
    })

    setShowChecklistDialog(false)
    setActiveChecklist(null)
    setChecklistResults([])
    if (selectedProperty) fetchPropertyData(selectedProperty.id)
  }

  function updateChecklistItem(index: number, field: string, value: string) {
    const updated = [...checklistResults]
    updated[index] = { ...updated[index], [field]: value }
    setChecklistResults(updated)
  }

  // Calendar helpers
  function getCalendarDays() {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPad = firstDay.getDay()
    const days: (Date | null)[] = []

    for (let i = 0; i < startPad; i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  function getCompletionsForDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0]
    return completions.filter(c => c.scheduled_date === dateStr)
  }

  function getWorkOrdersForDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0]
    return workOrders.filter(wo => wo.scheduled_date === dateStr)
  }

  function prevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const getPriorityColor = (p: string) => {
    if (p === "emergency") return "bg-red-600 text-white"
    if (p === "high") return "bg-orange-500 text-white"
    if (p === "medium") return "bg-yellow-500 text-black"
    return "bg-gray-400 text-white"
  }

  const getStatusColor = (s: string) => {
    if (s === "completed") return "bg-green-600 text-white"
    if (s === "in_progress") return "bg-blue-500 text-white"
    if (s === "scheduled" || s === "pending") return "bg-purple-500 text-white"
    return "bg-gray-600 text-white"
  }

  const getFrequencyColor = (f: string) => {
    if (f === "weekly") return "bg-blue-100 text-blue-800"
    if (f === "biweekly") return "bg-cyan-100 text-cyan-800"
    if (f === "monthly") return "bg-green-100 text-green-800"
    if (f === "quarterly") return "bg-orange-100 text-orange-800"
    return "bg-purple-100 text-purple-800"
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Template management
  function openNewTemplate() {
    setEditingTemplate(null)
    setTemplateForm({ name: "", frequency: "weekly", items: [] })
    setNewItemName("")
    setNewItemCategory("general")
    setNewItemInputType("checkbox")
    setNewItemRequiresPhoto(false)
    setShowTemplateDialog(true)
  }

  function openEditTemplate(template: ChecklistTemplate) {
    setEditingTemplate(template)
    // Ensure items have new fields with defaults
    const itemsWithDefaults = template.items.map(item => ({
      ...item,
      input_type: item.input_type || 'checkbox',
      requires_photo: item.requires_photo || false
    }))
    setTemplateForm({
      name: template.name,
      frequency: template.frequency,
      items: itemsWithDefaults
    })
    setNewItemName("")
    setNewItemCategory("general")
    setNewItemInputType("checkbox")
    setNewItemRequiresPhoto(false)
    setShowTemplateDialog(true)
  }

  function addTemplateItem() {
    if (!newItemName.trim()) return
    setTemplateForm({
      ...templateForm,
      items: [...templateForm.items, {
        name: newItemName.trim(),
        category: newItemCategory,
        input_type: newItemInputType,
        requires_photo: newItemRequiresPhoto
      }]
    })
    setNewItemName("")
    setNewItemCategory("general")
    setNewItemInputType("checkbox")
    setNewItemRequiresPhoto(false)
  }

  function removeTemplateItem(index: number) {
    setTemplateForm({
      ...templateForm,
      items: templateForm.items.filter((_, i) => i !== index)
    })
  }

  async function saveTemplate() {
    if (!templateForm.name || !selectedProperty) return
    if (templateForm.items.length === 0) {
      alert("Please add at least one item to the checklist")
      return
    }

    const payload = {
      property_id: selectedProperty.id,
      name: templateForm.name,
      frequency: templateForm.frequency,
      items: templateForm.items
    }

    if (editingTemplate) {
      await fetch(`/api/checklists/${editingTemplate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    } else {
      await fetch("/api/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    }

    setShowTemplateDialog(false)
    setEditingTemplate(null)
    fetchPropertyData(selectedProperty.id)
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Delete this checklist template? This will also delete all scheduled completions.")) return
    await fetch(`/api/checklists/${id}`, { method: "DELETE" })
    if (selectedProperty) fetchPropertyData(selectedProperty.id)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">PropMaint</h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Dashboard Button */}
        <div className="p-3 border-b border-border">
          <button
            onClick={() => setSidebarView("dashboard")}
            className={`w-full text-sm py-2.5 px-3 rounded-lg transition-colors flex items-center gap-2 ${
              sidebarView === "dashboard"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="font-medium">Dashboard</span>
            {(dashboardData.overdueWorkOrders.length > 0 || dashboardData.pendingRequests.length > 0) && sidebarView !== "dashboard" && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {dashboardData.overdueWorkOrders.length + dashboardData.pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* View Toggle */}
        <div className="p-3 border-b border-border">
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setSidebarView("properties")}
              className={`flex-1 text-xs py-1.5 px-1.5 rounded-md transition-colors flex items-center justify-center gap-1 ${
                sidebarView === "properties" ? "bg-background shadow-sm" : "hover:bg-background/50"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              Properties
            </button>
            <button
              onClick={() => setSidebarView("clients")}
              className={`flex-1 text-xs py-1.5 px-1.5 rounded-md transition-colors flex items-center justify-center gap-1 ${
                sidebarView === "clients" ? "bg-background shadow-sm" : "hover:bg-background/50"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Clients
            </button>
            <button
              onClick={() => setSidebarView("vendors")}
              className={`flex-1 text-xs py-1.5 px-1.5 rounded-md transition-colors flex items-center justify-center gap-1 ${
                sidebarView === "vendors" ? "bg-background shadow-sm" : "hover:bg-background/50"
              }`}
            >
              <Truck className="h-3.5 w-3.5" />
              Vendors
            </button>
          </div>
        </div>

        {/* Properties View */}
        {sidebarView === "properties" && (
          <>
            <div className="p-3 flex justify-between items-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">Properties</p>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={openNewProperty}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3">
              {loading ? (
                <p className="text-sm text-muted-foreground px-2">Loading...</p>
              ) : properties.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground mb-2">No properties</p>
                  <Button size="sm" onClick={openNewProperty}>
                    <Plus className="h-4 w-4 mr-1" />Add Property
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {properties.map((prop) => (
                    <div
                      key={prop.id}
                      className={`px-3 py-2 rounded-lg transition-colors group ${
                        selectedProperty?.id === prop.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setSelectedProperty(prop)}
                          className="flex items-center gap-2 min-w-0 flex-1 text-left"
                        >
                          <Building2 className="h-4 w-4 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{prop.name}</p>
                            <p className={`text-xs truncate ${selectedProperty?.id === prop.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {prop.city}, {prop.state}
                            </p>
                          </div>
                        </button>
                        <div className={`flex gap-1 transition-opacity ${
                          selectedProperty?.id === prop.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-6 w-6 p-0 ${selectedProperty?.id === prop.id ? "hover:bg-primary-foreground/20" : ""}`}
                            onClick={(e) => { e.stopPropagation(); openEditProperty(prop) }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-6 w-6 p-0 ${selectedProperty?.id === prop.id ? "hover:bg-primary-foreground/20 text-red-300" : "text-red-500"}`}
                            onClick={(e) => { e.stopPropagation(); deleteProperty(prop.id) }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {prop.client?.name && (
                        <p className={`text-xs mt-1 pl-6 truncate ${selectedProperty?.id === prop.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          Client: {prop.client.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </nav>
          </>
        )}

        {/* Clients View */}
        {sidebarView === "clients" && (
          <>
            <div className="p-3 flex justify-between items-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">Clients</p>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={startOnboarding} title="Onboard new client with properties">
                  <UserPlus className="h-4 w-4 mr-1" />Onboard
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={openNewClient} title="Quick add client">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3">
              {clients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground mb-2">No clients</p>
                  <Button size="sm" onClick={startOnboarding}>
                    <UserPlus className="h-4 w-4 mr-1" />Onboard Client
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className="px-3 py-2 rounded-lg hover:bg-muted group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{client.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => openEditClient(client)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => deleteClient(client.id)}>
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {client.properties?.[0]?.count || 0} properties
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </nav>
          </>
        )}

        {/* Vendors View */}
        {sidebarView === "vendors" && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <Truck className="h-10 w-10 mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Vendor Management</p>
            <p className="text-xs text-muted-foreground">
              View vendors in the main panel
            </p>
          </div>
        )}

        {sidebarView === "settings" && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <Settings className="h-10 w-10 mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Service Plans & Settings</p>
            <p className="text-xs text-muted-foreground">
              Manage plans and service catalog
            </p>
          </div>
        )}

        {/* Global Navigation at Bottom */}
        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={() => setSidebarView("analytics")}
            className={`w-full text-xs py-2 px-3 rounded-md transition-colors flex items-center gap-2 ${
              sidebarView === "analytics" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics Dashboard
          </button>
          <button
            onClick={() => setSidebarView("billing")}
            className={`w-full text-xs py-2 px-3 rounded-md transition-colors flex items-center gap-2 ${
              sidebarView === "billing" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Billing & Invoices
          </button>
          <button
            onClick={() => setSidebarView("settings")}
            className={`w-full text-xs py-2 px-3 rounded-md transition-colors flex items-center gap-2 ${
              sidebarView === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <Settings className="h-4 w-4" />
            Service Plans & Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {sidebarView === "dashboard" ? (
          <div className="p-6">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Dashboard</h2>
                <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening today.</p>
              </div>
              <Button onClick={() => fetchDashboardData()} variant="outline" size="sm">
                Refresh
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dashboardData.stats.totalProperties}</p>
                    <p className="text-sm text-muted-foreground">Properties</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dashboardData.stats.totalClients}</p>
                    <p className="text-sm text-muted-foreground">Clients</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Wrench className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dashboardData.stats.activeWorkOrders}</p>
                    <p className="text-sm text-muted-foreground">Active Work Orders</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dashboardData.stats.completedThisMonth}</p>
                    <p className="text-sm text-muted-foreground">Inspections This Month</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-4 mb-6">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={startOnboarding}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Onboard Client
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setSidebarView("properties"); openNewProperty() }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSidebarView("analytics")}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSidebarView("billing")}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Billing
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              {/* Today's Inspections */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Today&apos;s Inspections
                  </h3>
                  <Badge variant="secondary">{dashboardData.todayInspections.length}</Badge>
                </div>
                {dashboardData.todayInspections.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No inspections scheduled for today</p>
                ) : (
                  <div className="space-y-2">
                    {dashboardData.todayInspections.map((inspection) => (
                      <div
                        key={inspection.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer"
                        onClick={() => {
                          const prop = properties.find(p => p.name === inspection.property_name)
                          if (prop) {
                            setSelectedProperty(prop)
                            setSidebarView("properties")
                            setActiveTab("checklists")
                          }
                        }}
                      >
                        <div>
                          <p className="font-medium">{inspection.property_name}</p>
                          <p className="text-sm text-muted-foreground">{inspection.template_name}</p>
                        </div>
                        <Badge className={getStatusColor(inspection.status)}>{inspection.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Pending Requests */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Pending Client Requests
                  </h3>
                  <Badge variant="secondary">{dashboardData.pendingRequests.length}</Badge>
                </div>
                {dashboardData.pendingRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No pending requests</p>
                ) : (
                  <div className="space-y-2">
                    {dashboardData.pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer"
                        onClick={() => {
                          const prop = properties.find(p => p.name === request.property_name)
                          if (prop) {
                            setSelectedProperty(prop)
                            setSidebarView("properties")
                            setActiveTab("special")
                          }
                        }}
                      >
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-muted-foreground">{request.property_name}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Overdue Work Orders */}
            {dashboardData.overdueWorkOrders.length > 0 && (
              <Card className="p-4 mt-6 border-red-200 bg-red-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    Overdue Work Orders
                  </h3>
                  <Badge variant="destructive">{dashboardData.overdueWorkOrders.length}</Badge>
                </div>
                <div className="space-y-2">
                  {dashboardData.overdueWorkOrders.map((wo) => (
                    <div
                      key={wo.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100 hover:border-red-200 cursor-pointer"
                      onClick={() => {
                        const prop = properties.find(p => p.name === wo.property_name)
                        if (prop) {
                          setSelectedProperty(prop)
                          setSidebarView("properties")
                          setActiveTab("maintenance")
                        }
                      }}
                    >
                      <div>
                        <p className="font-medium">{wo.title}</p>
                        <p className="text-sm text-muted-foreground">{wo.property_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(wo.priority)}>{wo.priority}</Badge>
                        <span className="text-sm text-red-600 font-medium">{wo.days_old}d old</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : sidebarView === "settings" ? (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Service Plans & Settings</h2>
            <ServicesTab selectedProperty={null} />
          </div>
        ) : sidebarView === "vendors" ? (
          <div className="p-6">
            <VendorsTab />
          </div>
        ) : sidebarView === "analytics" ? (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Analytics Dashboard</h2>
            <AnalyticsDashboard />
          </div>
        ) : sidebarView === "billing" ? (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Billing & Invoices</h2>
            <BillingTab selectedProperty={null} />
          </div>
        ) : !selectedProperty ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a property</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Property Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">{selectedProperty.name}</h2>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip}
              </p>
              <Badge variant="outline" className="mt-2">{selectedProperty.type}</Badge>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="maintenance">
                  <Wrench className="h-4 w-4 mr-2" />
                  Maintenance ({workOrders.filter(w => w.status !== 'completed').length})
                </TabsTrigger>
                <TabsTrigger value="checklists">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Checklists ({checklists.length})
                </TabsTrigger>
                <TabsTrigger value="schedule">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="special">
                  <FileText className="h-4 w-4 mr-2" />
                  Special Requests ({specialRequests.filter(s => s.status === 'pending').length})
                </TabsTrigger>
                <TabsTrigger value="plan">
                  <Package className="h-4 w-4 mr-2" />
                  Plan
                </TabsTrigger>
              </TabsList>

              {/* Maintenance Tab */}
              <TabsContent value="maintenance">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Maintenance Requests</h3>
                  <Button size="sm" onClick={() => setShowWorkOrderDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />Add Request
                  </Button>
                </div>

                {workOrders.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Wrench className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground">No maintenance requests</p>
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
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{wo.title}</span>
                              <Badge className={getPriorityColor(wo.priority)}>{wo.priority}</Badge>
                              <Badge className={getStatusColor(wo.status)}>{wo.status.replace("_", " ")}</Badge>
                            </div>
                            {wo.description && <p className="text-sm text-muted-foreground line-clamp-2">{wo.description}</p>}
                            <p className="text-xs text-muted-foreground mt-2">
                              {wo.category} • {new Date(wo.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {wo.status === "new" && (
                              <Button size="sm" variant="outline" onClick={() => updateWorkOrderStatus(wo.id, "in_progress")}>
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {wo.status === "in_progress" && (
                              <Button size="sm" variant="outline" onClick={() => updateWorkOrderStatus(wo.id, "completed")}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => deleteWorkOrder(wo.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Special Requests Tab */}
              <TabsContent value="special">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Special Requests</h3>
                </div>

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
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{sr.title}</span>
                              <Badge className={getStatusColor(sr.status)}>{sr.status}</Badge>
                            </div>
                            {sr.description && <p className="text-sm text-muted-foreground line-clamp-2">{sr.description}</p>}
                            {sr.response && (
                              <div className="bg-muted rounded p-2 mt-2">
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  <span className="font-medium">Response:</span> {sr.response}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(sr.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                if (!confirm("Delete this special request?")) return
                                await fetch(`/api/special-requests/${sr.id}`, { method: "DELETE" })
                                if (selectedProperty) fetchPropertyData(selectedProperty.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Checklists Tab - Templates Only */}
              <TabsContent value="checklists">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Checklist Templates</h3>
                  <Button size="sm" onClick={openNewTemplate}>
                    <Plus className="h-4 w-4 mr-2" />Add Template
                  </Button>
                </div>
                {checklists.length === 0 ? (
                  <Card className="p-8 text-center">
                    <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground mb-4">No checklist templates yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create templates for recurring inspections. They'll automatically appear on the Schedule.
                    </p>
                    <Button onClick={openNewTemplate}>
                      <Plus className="h-4 w-4 mr-2" />Create Your First Template
                    </Button>
                  </Card>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {checklists.map((cl) => (
                      <Card key={cl.id} className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all" onClick={() => openEditTemplate(cl)}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{cl.name}</span>
                              <Badge className={getFrequencyColor(cl.frequency)}>{cl.frequency}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {cl.items.length} items to check
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {cl.items.slice(0, 3).map((item, i) => (
                                <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">{item.name}</span>
                              ))}
                              {cl.items.length > 3 && (
                                <span className="text-xs text-muted-foreground">+{cl.items.length - 3} more</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="ghost" onClick={() => openEditTemplate(cl)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteTemplate(cl.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Schedule Tab - Calendar View */}
              <TabsContent value="schedule">
                {/* Today's Inspections - Prominent Start Section */}
                {(() => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const todayStr = today.toISOString().split('T')[0]
                  const todaysInspections = completions.filter(c =>
                    c.scheduled_date === todayStr && (c.status === 'scheduled' || c.status === 'in_progress')
                  )
                  const inProgressInspections = completions.filter(c => c.status === 'in_progress')

                  if (todaysInspections.length > 0 || inProgressInspections.length > 0) {
                    return (
                      <Card className="mb-6 p-4 border-2 border-primary/30 bg-primary/5">
                        <div className="flex items-center gap-2 mb-3">
                          <Play className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg">
                            {inProgressInspections.length > 0 ? 'Continue Inspection' : "Today's Inspections"}
                          </h3>
                          {todaysInspections.length > 0 && (
                            <Badge variant="secondary">{todaysInspections.length} pending</Badge>
                          )}
                        </div>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {/* Show in-progress first */}
                          {inProgressInspections.map(comp => (
                            <Card key={comp.id} className="p-3 border-blue-300 bg-blue-50">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium">{comp.template?.name || 'Inspection'}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Started {comp.started_at ? new Date(comp.started_at).toLocaleTimeString() : 'earlier'}
                                  </p>
                                </div>
                                <Badge className="bg-blue-500">In Progress</Badge>
                              </div>
                              <Button
                                className="w-full"
                                onClick={() => {
                                  setActiveChecklist(comp)
                                  setChecklistResults(comp.results || [])
                                  setShowChecklistDialog(true)
                                }}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Continue Walkthrough
                              </Button>
                            </Card>
                          ))}
                          {/* Show today's scheduled */}
                          {todaysInspections.filter(c => c.status === 'scheduled').map(comp => (
                            <Card key={comp.id} className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium">{comp.template?.name || 'Inspection'}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {comp.template?.items?.length || 0} items • {comp.template?.frequency}
                                  </p>
                                </div>
                                <Badge className={getFrequencyColor(comp.template?.frequency || '')}>
                                  {comp.template?.frequency}
                                </Badge>
                              </div>
                              <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => startChecklist(comp)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Start Inspection
                              </Button>
                            </Card>
                          ))}
                        </div>
                      </Card>
                    )
                  }
                  return null
                })()}

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold">Schedule</h3>
                    {/* Filter Toggle */}
                    <div className="flex gap-1 bg-muted rounded-lg p-1" data-testid="schedule-filter">
                      <button
                        onClick={() => setScheduleFilter("all")}
                        className={`text-xs py-1 px-3 rounded-md transition-colors ${
                          scheduleFilter === "all" ? "bg-background shadow-sm font-medium" : "hover:bg-background/50"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setScheduleFilter("work_orders")}
                        className={`text-xs py-1 px-3 rounded-md transition-colors ${
                          scheduleFilter === "work_orders" ? "bg-background shadow-sm font-medium" : "hover:bg-background/50"
                        }`}
                      >
                        Work Orders
                      </button>
                      <button
                        onClick={() => setScheduleFilter("checklists")}
                        className={`text-xs py-1 px-3 rounded-md transition-colors ${
                          scheduleFilter === "checklists" ? "bg-background shadow-sm font-medium" : "hover:bg-background/50"
                        }`}
                      >
                        Checklists
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={prevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-medium min-w-[140px] text-center">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <Button size="sm" variant="outline" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  {(scheduleFilter === "all" || scheduleFilter === "work_orders") && (
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200"></span> Work Order</span>
                  )}
                  {(scheduleFilter === "all" || scheduleFilter === "checklists") && (
                    <>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100"></span> Weekly</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-cyan-100"></span> Bi-weekly</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100"></span> Monthly</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-100"></span> Quarterly</span>
                    </>
                  )}
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"></span> Completed</span>
                </div>

                {/* Calendar Grid */}
                <Card className="p-4">
                  <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                    {getCalendarDays().map((date, i) => {
                      const dayWorkOrders = date ? getWorkOrdersForDate(date) : []
                      const dayCompletions = date ? getCompletionsForDate(date) : []

                      return (
                        <div
                          key={i}
                          className={`min-h-[100px] border rounded-lg p-1 ${
                            date ? (isToday(date) ? 'bg-primary/10 border-primary' : 'border-border') : 'bg-muted/30'
                          }`}
                        >
                          {date && (
                            <>
                              <div className={`text-sm font-medium mb-1 ${isToday(date) ? 'text-primary' : ''}`}>
                                {date.getDate()}
                              </div>
                              <div className="space-y-1">
                                {/* Work Orders */}
                                {(scheduleFilter === "all" || scheduleFilter === "work_orders") && dayWorkOrders.map((wo) => (
                                  <button
                                    key={`wo-${wo.id}`}
                                    onClick={() => {
                                      setSelectedWorkOrder(wo)
                                      setShowWorkOrderDetail(true)
                                    }}
                                    className={`w-full text-left text-xs p-1 rounded truncate ${
                                      wo.status === 'completed'
                                        ? 'bg-green-100 text-green-800 line-through'
                                        : 'bg-amber-100 text-amber-800'
                                    } hover:opacity-80 cursor-pointer`}
                                    title={wo.title}
                                  >
                                    <Wrench className="h-3 w-3 inline mr-1" />
                                    {wo.title}
                                  </button>
                                ))}

                                {/* Checklists */}
                                {(scheduleFilter === "all" || scheduleFilter === "checklists") && dayCompletions.map((comp) => (
                                  <button
                                    key={`cl-${comp.id}`}
                                    onClick={() => {
                                      if (comp.status === 'scheduled' && !isPast(date)) {
                                        startChecklist(comp)
                                      } else if (comp.status === 'in_progress') {
                                        setActiveChecklist(comp)
                                        setChecklistResults(comp.results || [])
                                        setShowChecklistDialog(true)
                                      }
                                    }}
                                    className={`w-full text-left text-xs p-1 rounded truncate ${
                                      comp.status === 'completed'
                                        ? 'bg-green-100 text-green-800 line-through'
                                        : comp.status === 'in_progress'
                                        ? 'bg-blue-100 text-blue-800'
                                        : getFrequencyColor(comp.template?.frequency || '')
                                    } ${comp.status !== 'completed' ? 'hover:opacity-80 cursor-pointer' : ''}`}
                                    title={comp.template?.name}
                                  >
                                    {comp.status === 'in_progress' && <Clock className="h-3 w-3 inline mr-1" />}
                                    {comp.status === 'completed' && <CheckCircle className="h-3 w-3 inline mr-1" />}
                                    {isPast(date) && comp.status === 'scheduled' && <AlertCircle className="h-3 w-3 inline mr-1 text-red-500" />}
                                    {comp.template?.name}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {/* Upcoming Items */}
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  {/* Upcoming Work Orders */}
                  {(scheduleFilter === "all" || scheduleFilter === "work_orders") && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Scheduled Work Orders
                      </h4>
                      {workOrders.filter(wo => wo.scheduled_date && wo.status !== 'completed').length === 0 ? (
                        <Card className="p-4 text-center text-sm text-muted-foreground">
                          No scheduled work orders
                        </Card>
                      ) : (
                        <div className="space-y-2">
                          {workOrders
                            .filter(wo => wo.scheduled_date && wo.status !== 'completed')
                            .sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime())
                            .slice(0, 5)
                            .map(wo => (
                              <Card
                                key={wo.id}
                                className="p-3 cursor-pointer hover:border-primary/50 transition-all"
                                onClick={() => {
                                  setSelectedWorkOrder(wo)
                                  setShowWorkOrderDetail(true)
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">{wo.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(wo.scheduled_date!).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Badge className={getPriorityColor(wo.priority)}>{wo.priority}</Badge>
                                </div>
                              </Card>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upcoming Checklists */}
                  {(scheduleFilter === "all" || scheduleFilter === "checklists") && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4" />
                        Upcoming Checklists
                      </h4>
                      {completions.filter(c => c.status === 'scheduled').length === 0 ? (
                        <Card className="p-4 text-center text-sm text-muted-foreground">
                          No upcoming checklists
                        </Card>
                      ) : (
                        <div className="space-y-2">
                          {completions
                            .filter(c => c.status === 'scheduled')
                            .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
                            .slice(0, 5)
                            .map(comp => (
                              <Card
                                key={comp.id}
                                className="p-3 cursor-pointer hover:border-primary/50 transition-all"
                                onClick={() => {
                                  const schedDate = new Date(comp.scheduled_date)
                                  if (!isPast(schedDate)) {
                                    startChecklist(comp)
                                  }
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">{comp.template?.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(comp.scheduled_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Badge className={getFrequencyColor(comp.template?.frequency || '')}>
                                    {comp.template?.frequency}
                                  </Badge>
                                </div>
                              </Card>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Services Tab - Property's Plan */}
              <TabsContent value="plan">
                <PropertyPlanTab
                  selectedProperty={selectedProperty}
                  onPropertyPlanChange={() => fetchProperties()}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Work Order Dialog */}
      <Dialog open={showWorkOrderDialog} onOpenChange={setShowWorkOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Maintenance Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="e.g., Fix leaky faucet"
                value={woForm.title}
                onChange={(e) => setWoForm({...woForm, title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Additional details..."
                value={woForm.description}
                onChange={(e) => setWoForm({...woForm, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={woForm.category} onValueChange={(v) => setWoForm({...woForm, category: v})}>
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
                <label className="text-sm font-medium">Priority</label>
                <Select value={woForm.priority} onValueChange={(v) => setWoForm({...woForm, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkOrderDialog(false)}>Cancel</Button>
            <Button onClick={createWorkOrder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inspection Walkthrough Dialog */}
      <Dialog open={showChecklistDialog} onOpenChange={setShowChecklistDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {activeChecklist && (
            <InspectionWalkthrough
              completion={activeChecklist}
              onComplete={() => {
                setShowChecklistDialog(false)
                setActiveChecklist(null)
                if (selectedProperty) fetchPropertyData(selectedProperty.id)
              }}
              onCancel={() => {
                setShowChecklistDialog(false)
                setActiveChecklist(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Template Editor Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Checklist Template" : "New Checklist Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Template Name *</label>
                <Input
                  placeholder="e.g., Weekly Safety Check"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <Select
                  value={templateForm.frequency}
                  onValueChange={(v) => setTemplateForm({ ...templateForm, frequency: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Checklist Items</label>

              {/* Add new item */}
              <div className="space-y-2 mb-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex gap-2">
                  <Input
                    placeholder="Item name (e.g., Check fire extinguishers)"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTemplateItem()}
                    className="flex-1"
                  />
                  <Button onClick={addTemplateItem} disabled={!newItemName.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                    <SelectTrigger className="w-[130px]"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="hvac">HVAC</SelectItem>
                      <SelectItem value="exterior">Exterior</SelectItem>
                      <SelectItem value="interior">Interior</SelectItem>
                      <SelectItem value="landscaping">Landscaping</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newItemInputType} onValueChange={setNewItemInputType}>
                    <SelectTrigger className="w-[130px]"><SelectValue placeholder="Input Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkbox">OK/Issue</SelectItem>
                      <SelectItem value="condition">Condition</SelectItem>
                      <SelectItem value="text">Text Input</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="dropdown">Dropdown</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="requiresPhoto"
                      checked={newItemRequiresPhoto}
                      onCheckedChange={(checked) => setNewItemRequiresPhoto(checked === true)}
                    />
                    <label htmlFor="requiresPhoto" className="text-sm cursor-pointer flex items-center gap-1">
                      <Camera className="h-3 w-3" /> Photo Required
                    </label>
                  </div>
                </div>
              </div>

              {/* Items list */}
              {templateForm.items.length === 0 ? (
                <div className="text-center py-8 border rounded-lg border-dashed">
                  <ClipboardCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground">No items yet. Add items above.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {templateForm.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.input_type === 'checkbox' ? 'OK/Issue' :
                             item.input_type === 'condition' ? 'Condition' :
                             item.input_type === 'text' ? 'Text' :
                             item.input_type === 'number' ? 'Number' :
                             item.input_type === 'dropdown' ? 'Dropdown' : 'OK/Issue'}
                          </Badge>
                          {item.requires_photo && (
                            <Badge variant="secondary" className="text-xs">
                              <Camera className="h-3 w-3 mr-1" />Photo
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTemplateItem(index)}
                        className="h-7 w-7 p-0"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Tip: When you walk through a checklist, any items marked as "Issue" will automatically
              create maintenance requests.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveTemplate} disabled={!templateForm.name || templateForm.items.length === 0}>
              {editingTemplate ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Dialog */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClient ? "Edit Client" : "New Client"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                placeholder="Client name"
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                placeholder="client@example.com"
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                placeholder="555-123-4567"
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {editingClient ? "New Password (leave blank to keep current)" : "Password *"}
              </label>
              <Input
                type="password"
                placeholder={editingClient ? "Enter new password" : "Create password"}
                value={clientForm.password}
                onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Clients use these credentials to log into the portal at <span className="font-mono">/portal</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClientDialog(false)}>Cancel</Button>
            <Button onClick={saveClient} disabled={!clientForm.name || !clientForm.email}>
              {editingClient ? "Save Changes" : "Create Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Property Dialog */}
      <Dialog open={showPropertyDialog} onOpenChange={(open) => { setShowPropertyDialog(open); if (!open) setEditingProperty(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProperty ? "Edit Property" : "New Property"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Property Name *</label>
              <Input
                placeholder="e.g., Sunrise Apartments"
                value={propertyForm.name}
                onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Address *</label>
              <Input
                placeholder="123 Main St"
                value={propertyForm.address}
                onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-sm font-medium">City</label>
                <Input
                  placeholder="City"
                  value={propertyForm.city}
                  onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <Input
                  placeholder="State"
                  value={propertyForm.state}
                  onChange={(e) => setPropertyForm({ ...propertyForm, state: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">ZIP</label>
                <Input
                  placeholder="ZIP"
                  value={propertyForm.zip}
                  onChange={(e) => setPropertyForm({ ...propertyForm, zip: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={propertyForm.type} onValueChange={(v) => setPropertyForm({ ...propertyForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="mixed">Mixed Use</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Assign to Client</label>
                <Select value={propertyForm.client_id || "none"} onValueChange={(v) => setPropertyForm({ ...propertyForm, client_id: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select client (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPropertyDialog(false)}>Cancel</Button>
            <Button onClick={saveProperty} disabled={!propertyForm.name || !propertyForm.address}>
              {editingProperty ? "Save Changes" : "Create Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onboarding Dialog - New Client with Properties and Plans */}
      <Dialog open={showOnboardingDialog} onOpenChange={setShowOnboardingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {onboardingStep === "client" && "Step 1: New Client"}
              {onboardingStep === "properties" && "Step 2: Add Properties"}
              {onboardingStep === "plans" && "Step 3: Select Service Plans"}
            </DialogTitle>
          </DialogHeader>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`flex-1 h-2 rounded-full ${["client", "properties", "plans"].includes(onboardingStep) ? "bg-primary" : "bg-muted"}`} />
            <div className={`flex-1 h-2 rounded-full ${["properties", "plans"].includes(onboardingStep) ? "bg-primary" : "bg-muted"}`} />
            <div className={`flex-1 h-2 rounded-full ${onboardingStep === "plans" ? "bg-primary" : "bg-muted"}`} />
          </div>

          {onboardingStep === "client" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the client&apos;s information. They&apos;ll use these credentials to access the portal.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    placeholder="Client name"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    placeholder="client@example.com"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    placeholder="555-123-4567"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Password *</label>
                  <Input
                    type="password"
                    placeholder="Create password"
                    value={clientForm.password}
                    onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {onboardingStep === "properties" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add properties for this client. You can also add more properties later.
              </p>

              {/* Properties added list */}
              {onboardingProperties.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Properties to create:</label>
                  {onboardingProperties.map((prop, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{prop.name}</p>
                        <p className="text-sm text-muted-foreground">{prop.address}, {prop.city}, {prop.state} {prop.zip}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeOnboardingProperty(idx)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new property form */}
              <div className="p-4 border border-dashed rounded-lg space-y-3">
                <label className="text-sm font-medium">Add a property:</label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Property name *"
                    value={newOnboardingProperty.name}
                    onChange={(e) => setNewOnboardingProperty({ ...newOnboardingProperty, name: e.target.value })}
                  />
                  <Input
                    placeholder="Address *"
                    value={newOnboardingProperty.address}
                    onChange={(e) => setNewOnboardingProperty({ ...newOnboardingProperty, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="City"
                    value={newOnboardingProperty.city}
                    onChange={(e) => setNewOnboardingProperty({ ...newOnboardingProperty, city: e.target.value })}
                  />
                  <Input
                    placeholder="State"
                    value={newOnboardingProperty.state}
                    onChange={(e) => setNewOnboardingProperty({ ...newOnboardingProperty, state: e.target.value })}
                  />
                  <Input
                    placeholder="ZIP"
                    value={newOnboardingProperty.zip}
                    onChange={(e) => setNewOnboardingProperty({ ...newOnboardingProperty, zip: e.target.value })}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOnboardingProperty}
                  disabled={!newOnboardingProperty.name || !newOnboardingProperty.address}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Property
                </Button>
              </div>
            </div>
          )}

          {onboardingStep === "plans" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select a service plan for each property. You can change plans later from the property&apos;s Plan tab.
              </p>

              {onboardingProperties.map((prop, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{prop.name}</p>
                      <p className="text-sm text-muted-foreground">{prop.address}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {servicePlans.map((plan) => {
                      const isSelected = propertyPlanSelections[idx] === plan.id
                      const tierColors: Record<number, string> = {
                        1: "border-slate-300 bg-slate-50",
                        2: "border-blue-300 bg-blue-50",
                        3: "border-amber-300 bg-amber-50"
                      }
                      return (
                        <button
                          key={plan.id}
                          onClick={() => setPropertyPlanSelections({ ...propertyPlanSelections, [idx]: plan.id })}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? `${tierColors[plan.tier_level]} ring-2 ring-primary`
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <p className="font-medium text-sm">{plan.name}</p>
                          <p className="text-lg font-bold">${plan.monthly_base_price}<span className="text-xs font-normal">/mo</span></p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {onboardingProperties.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No properties to assign plans to.</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOnboardingDialog(false)}>Cancel</Button>
            {onboardingStep === "client" && (
              <Button
                onClick={saveOnboardingClient}
                disabled={!clientForm.name || !clientForm.email || !clientForm.password}
              >
                Next: Add Properties
              </Button>
            )}
            {onboardingStep === "properties" && (
              <Button onClick={saveOnboardingProperties} disabled={onboardingProperties.length === 0}>
                Next: Select Plans
              </Button>
            )}
            {onboardingStep === "plans" && (
              <Button onClick={saveOnboardingPlans}>
                {Object.keys(propertyPlanSelections).length === 0
                  ? "Finish Without Plans"
                  : `Assign ${Object.keys(propertyPlanSelections).length} ${Object.keys(propertyPlanSelections).length === 1 ? "Plan" : "Plans"} & Finish`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Work Order Detail Dialog */}
      <WorkOrderDetailDialog
        workOrder={selectedWorkOrder}
        open={showWorkOrderDetail}
        onOpenChange={setShowWorkOrderDetail}
        onUpdate={() => {
          if (selectedProperty) fetchPropertyData(selectedProperty.id)
        }}
      />

      {/* Special Request Detail Dialog */}
      <SpecialRequestDetailDialog
        request={selectedSpecialRequest}
        open={showSpecialRequestDetail}
        onOpenChange={setShowSpecialRequestDetail}
        onUpdate={() => {
          if (selectedProperty) fetchPropertyData(selectedProperty.id)
        }}
      />
    </div>
  )
}
