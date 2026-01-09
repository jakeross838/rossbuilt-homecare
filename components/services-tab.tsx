"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package, Star, Check, Plus, Edit2, Trash2, Wrench, Shield, Home, Leaf,
  ChevronDown, ChevronRight, Settings, DollarSign,
  Clock, Percent, Phone, Palmtree, Receipt, Calendar, FileText
} from "lucide-react"

interface Service {
  id: string
  name: string
  category: string
  description: string
  default_frequency: string
  estimated_duration_minutes: number
  requires_vendor: boolean
  is_add_on: boolean
  is_active: boolean
  billing_type: 'managed_markup' | 'schedule_only' | 'direct_task'
  materials_billable: boolean
}

interface PlanService {
  id: string
  service: Service
  included_quantity: number
  frequency_override: string | null
}

interface ServicePlan {
  id: string
  name: string
  tier_level: number
  description: string
  monthly_base_price: number | null
  price_small: number | null
  price_medium: number | null
  price_large: number | null
  inspection_frequency: string
  features: string[]
  services: PlanService[]
  vendor_markup_percent: number
  hourly_rate: number | null
  coordination_fee_waived: boolean
  emergency_response_time: string
}

interface Property {
  id: string
  name: string
  current_plan_id?: string
}

interface ServicesTabProps {
  selectedProperty: Property | null
  onPropertyPlanChange?: () => void
}

const CATEGORY_INFO: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  property_maintenance: { icon: Wrench, label: "Property Maintenance", color: "bg-blue-100 text-blue-800" },
  safety_security: { icon: Shield, label: "Safety & Security", color: "bg-red-100 text-red-800" },
  exterior_maintenance: { icon: Home, label: "Exterior Maintenance", color: "bg-amber-100 text-amber-800" },
  interior_maintenance: { icon: Home, label: "Interior Maintenance", color: "bg-purple-100 text-purple-800" },
  landscaping_grounds: { icon: Leaf, label: "Landscaping & Grounds", color: "bg-green-100 text-green-800" }
}

const BILLING_TYPE_INFO: Record<string, { label: string; description: string; color: string; icon: React.ElementType }> = {
  managed_markup: {
    label: "Coordinated Services",
    description: "We schedule vendors, oversee the work, and handle billing",
    color: "bg-blue-100 text-blue-800",
    icon: Receipt
  },
  direct_task: {
    label: "Minor Tasks",
    description: "Small tasks we handle during inspections",
    color: "bg-purple-100 text-purple-800",
    icon: FileText
  }
}

const TIER_COLORS: Record<number, { border: string; bg: string; accent: string }> = {
  1: { border: "border-gray-300", bg: "bg-gradient-to-br from-gray-50 to-gray-100", accent: "text-gray-700" },
  2: { border: "border-blue-300", bg: "bg-gradient-to-br from-blue-50 to-blue-100", accent: "text-blue-700" },
  3: { border: "border-amber-300", bg: "bg-gradient-to-br from-amber-50 to-amber-100", accent: "text-amber-700" }
}

const TIER_BADGES: Record<number, string> = {
  1: "bg-gray-600",
  2: "bg-blue-600",
  3: "bg-amber-500"
}

const TIER_SUBTITLES: Record<number, string> = {
  1: "Check & Report",
  2: "Check & Coordinate",
  3: "Weekly Protection"
}

const SQFT_RANGES = {
  small: { label: "Under 2,000 sqft", max: 2000 },
  medium: { label: "2,000 - 3,500 sqft", min: 2000, max: 3500 },
  large: { label: "3,500+ sqft", min: 3500 }
}

export function ServicesTab({ selectedProperty, onPropertyPlanChange }: ServicesTabProps) {
  const [services, setServices] = useState<Service[]>([])
  const [plans, setPlans] = useState<ServicePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSubTab, setActiveSubTab] = useState("plans")
  const [expandedBillingType, setExpandedBillingType] = useState<string | null>("managed_markup")
  const [propertySize, setPropertySize] = useState<"small" | "medium" | "large">("medium")

  // Dialog states
  const [showAssignPlanDialog, setShowAssignPlanDialog] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "property_maintenance",
    description: "",
    default_frequency: "as_needed",
    estimated_duration_minutes: 60,
    requires_vendor: true,
    is_add_on: false,
    billing_type: "managed_markup" as 'managed_markup' | 'schedule_only' | 'direct_task',
    materials_billable: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [servicesRes, plansRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/plans")
      ])
      const servicesData = await servicesRes.json()
      const plansData = await plansRes.json()
      setServices(Array.isArray(servicesData) ? servicesData : [])
      setPlans(Array.isArray(plansData) ? plansData : [])
    } catch (e) {
      console.error(e)
      setServices([])
      setPlans([])
    }
    setLoading(false)
  }

  async function assignPlanToProperty() {
    if (!selectedProperty || !selectedPlanId) return

    await fetch("/api/property-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_id: selectedProperty.id,
        plan_id: selectedPlanId
      })
    })

    setShowAssignPlanDialog(false)
    setSelectedPlanId("")
    onPropertyPlanChange?.()
  }

  function openNewService() {
    setEditingService(null)
    setServiceForm({
      name: "",
      category: "property_maintenance",
      description: "",
      default_frequency: "as_needed",
      estimated_duration_minutes: 60,
      requires_vendor: true,
      is_add_on: false,
      billing_type: "managed_markup",
      materials_billable: false
    })
    setShowServiceDialog(true)
  }

  function openEditService(service: Service) {
    setEditingService(service)
    setServiceForm({
      name: service.name,
      category: service.category,
      description: service.description || "",
      default_frequency: service.default_frequency || "as_needed",
      estimated_duration_minutes: service.estimated_duration_minutes || 60,
      requires_vendor: service.requires_vendor,
      is_add_on: service.is_add_on,
      billing_type: service.billing_type || "managed_markup",
      materials_billable: service.materials_billable || false
    })
    setShowServiceDialog(true)
  }

  async function saveService() {
    if (!serviceForm.name) return

    if (editingService) {
      await fetch(`/api/services/${editingService.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceForm)
      })
    } else {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceForm)
      })
    }

    setShowServiceDialog(false)
    fetchData()
  }

  async function deleteService(id: string) {
    if (!confirm("Remove this service from the catalog?")) return
    await fetch(`/api/services/${id}`, { method: "DELETE" })
    fetchData()
  }

  // Group services by billing type
  const servicesByBillingType = services.reduce((acc, service) => {
    const type = service.billing_type || 'managed_markup'
    if (!acc[type]) acc[type] = []
    acc[type].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  const currentPlan = plans.find(p => p.id === selectedProperty?.current_plan_id)

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading services...</div>
  }

  return (
    <div>
      {/* Header with location badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-full text-sm">
          <Palmtree className="h-4 w-4" />
          Anna Maria Island, FL
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="plans">
              <Package className="h-4 w-4 mr-2" />
              Service Plans
            </TabsTrigger>
            <TabsTrigger value="catalog">
              <Settings className="h-4 w-4 mr-2" />
              Services ({services.length})
            </TabsTrigger>
          </TabsList>

          {selectedProperty && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Current Plan:</span>
              {currentPlan ? (
                <Badge className={TIER_BADGES[currentPlan.tier_level]}>
                  {currentPlan.name}
                </Badge>
              ) : (
                <Badge variant="outline">No Plan</Badge>
              )}
              <Button size="sm" variant="outline" onClick={() => setShowAssignPlanDialog(true)}>
                {currentPlan ? "Change Plan" : "Assign Plan"}
              </Button>
            </div>
          )}
        </div>

        {/* Service Plans Tab */}
        <TabsContent value="plans">
          {/* How It Works Section */}
          <Card className="p-6 mb-6 bg-muted/30">
            <h3 className="text-lg font-semibold mb-4">How Our Service Works</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800 h-fit">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Coordinated Services</h4>
                  <p className="text-sm text-muted-foreground">
                    Cleanings, repairs, window washing, and other services - we coordinate trusted vendors and handle everything.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-800 h-fit">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Minor Tasks</h4>
                  <p className="text-sm text-muted-foreground">
                    Filter changes, battery replacements, and small items we handle during our regular inspections.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Property Size Toggle */}
          <div className="flex items-center justify-end gap-4 mb-4">
            <span className="text-sm text-muted-foreground">Property Size:</span>
            <div className="flex rounded-lg border overflow-hidden">
              <button
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  propertySize === "small"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
                onClick={() => setPropertySize("small")}
              >
                Under 2,000 sqft
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  propertySize === "medium"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
                onClick={() => setPropertySize("medium")}
              >
                2,000–3,500 sqft
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  propertySize === "large"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
                onClick={() => setPropertySize("large")}
              >
                3,500+ sqft
              </button>
            </div>
          </div>

          {/* Plans Comparison Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-muted-foreground w-1/5"></th>
                    {plans.sort((a, b) => a.tier_level - b.tier_level).map((plan) => {
                      const colors = TIER_COLORS[plan.tier_level]
                      const price = propertySize === "small" ? plan.price_small
                        : propertySize === "large" ? plan.price_large
                        : plan.price_medium
                      return (
                        <th key={plan.id} className={`p-4 text-center ${colors?.bg || ''}`}>
                          <div className="flex flex-col items-center gap-1">
                            {plan.tier_level === 3 && <Star className="h-5 w-5 text-amber-500 fill-amber-500" />}
                            <span className="font-bold text-lg">{plan.name}</span>
                            <span className="text-xs font-medium mt-1 text-muted-foreground">
                              {TIER_SUBTITLES[plan.tier_level]}
                            </span>
                            {price && (
                              <span className="text-2xl font-bold mt-1">${price}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                            )}
                            {currentPlan?.id === plan.id && (
                              <Badge className="bg-primary mt-1">Current Plan</Badge>
                            )}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {/* Inspections */}
                  <tr className="bg-primary/10">
                    <td colSpan={4} className="p-3 font-semibold text-primary text-sm">
                      Inspections
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Frequency</td>
                    <td className="p-4 text-center text-sm">Every 14 days</td>
                    <td className="p-4 text-center text-sm">Every 14 days</td>
                    <td className="p-4 text-center text-sm font-medium text-amber-700">Weekly</td>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 font-medium">Inspection Type</td>
                    <td className="p-4 text-center text-sm">Quick Check</td>
                    <td className="p-4 text-center text-sm">Standard + Quick</td>
                    <td className="p-4 text-center text-sm">Standard + Quick</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Quarterly Deep Inspection</td>
                    <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
                    <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  </tr>

                  {/* Response */}
                  <tr className="bg-slate-100">
                    <td colSpan={4} className="p-3 font-semibold text-slate-700 text-sm">
                      Response Time
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Issue Alerts</td>
                    <td className="p-4 text-center text-sm">Same day</td>
                    <td className="p-4 text-center text-sm">Same day</td>
                    <td className="p-4 text-center text-sm">Same day</td>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 font-medium">Repair Coordination</td>
                    <td className="p-4 text-center text-sm text-muted-foreground">You handle</td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  </tr>

                  {/* Services */}
                  <tr className="bg-blue-50">
                    <td colSpan={4} className="p-3 font-semibold text-blue-800 text-sm">
                      Services Included
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Pre-Arrival Service</td>
                    <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
                    <td className="p-4 text-center text-sm">1x/month</td>
                    <td className="p-4 text-center text-sm font-medium text-green-700">Unlimited</td>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 font-medium">Post-Departure Service</td>
                    <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
                    <td className="p-4 text-center text-sm">1x/month</td>
                    <td className="p-4 text-center text-sm font-medium text-green-700">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Vendor Coordination</td>
                    <td className="p-4 text-center text-sm text-muted-foreground">Recommendations</td>
                    <td className="p-4 text-center text-sm">We schedule</td>
                    <td className="p-4 text-center text-sm font-medium">Full management</td>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 font-medium">Minor Maintenance</td>
                    <td className="p-4 text-center text-sm text-muted-foreground">Report only</td>
                    <td className="p-4 text-center text-sm">Basic</td>
                    <td className="p-4 text-center text-sm">&lt;$75 included</td>
                  </tr>

                  {/* Storm Services */}
                  <tr className="bg-amber-50">
                    <td colSpan={4} className="p-3 font-semibold text-amber-800 text-sm">
                      Storm Services
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Storm Monitoring</td>
                    <td className="p-4 text-center text-sm">Alerts only</td>
                    <td className="p-4 text-center text-sm">+ Recommendations</td>
                    <td className="p-4 text-center text-sm">+ Discounted prep</td>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 font-medium">Post-Storm Assessment</td>
                    <td className="p-4 text-center text-sm text-muted-foreground">Add-on</td>
                    <td className="p-4 text-center text-sm text-muted-foreground">Add-on</td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  </tr>

                  {/* Best For */}
                  <tr className="bg-slate-50">
                    <td className="p-4 font-medium text-slate-600">Best For</td>
                    <td className="p-4 text-center text-xs text-muted-foreground">Insurance compliance & basic monitoring</td>
                    <td className="p-4 text-center text-xs text-muted-foreground">Hands-off owners who want issues handled</td>
                    <td className="p-4 text-center text-xs text-muted-foreground">Frequent visitors wanting peace of mind</td>
                  </tr>

                  {/* Action Row */}
                  {selectedProperty && (
                    <tr className="border-t-2">
                      <td className="p-4"></td>
                      {plans.sort((a, b) => a.tier_level - b.tier_level).map((plan) => (
                        <td key={plan.id} className="p-4 text-center">
                          {currentPlan?.id === plan.id ? (
                            <Badge variant="outline" className="text-green-700">Current Plan</Badge>
                          ) : (
                            <Button
                              variant={plan.tier_level === 3 ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSelectedPlanId(plan.id)
                                setShowAssignPlanDialog(true)
                              }}
                            >
                              Select Plan
                            </Button>
                          )}
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Note at bottom */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-muted-foreground text-center">
              All plans include maintenance coordination with consolidated billing. Materials for minor tasks billed at cost.
              Hurricane preparation services are subject to expedited rates.
            </p>
          </div>
        </TabsContent>

        {/* Service Catalog Tab - Grouped by Billing Type */}
        <TabsContent value="catalog">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold">Service Catalog</h3>
              <p className="text-sm text-muted-foreground">
                {services.length} services organized by billing type
              </p>
            </div>
            <Button size="sm" onClick={openNewService}>
              <Plus className="h-4 w-4 mr-2" />Add Service
            </Button>
          </div>

          <div className="space-y-4">
            {Object.entries(BILLING_TYPE_INFO).map(([billingType, info]) => {
              const typeServices = servicesByBillingType[billingType] || []
              if (typeServices.length === 0) return null

              const Icon = info.icon
              const isExpanded = expandedBillingType === billingType

              return (
                <Card key={billingType} className="overflow-hidden">
                  <button
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedBillingType(isExpanded ? null : billingType)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${info.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{info.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {info.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{typeServices.length} services</Badge>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t">
                      <div className="divide-y">
                        {typeServices.map((service) => {
                          const categoryInfo = CATEGORY_INFO[service.category]
                          return (
                            <div key={service.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{service.name}</span>
                                  {categoryInfo && (
                                    <Badge variant="outline" className={`text-xs ${categoryInfo.color}`}>
                                      {categoryInfo.label}
                                    </Badge>
                                  )}
                                  {service.materials_billable && (
                                    <Badge variant="secondary" className="text-xs">Materials billed</Badge>
                                  )}
                                </div>
                                {service.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => openEditService(service)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => deleteService(service.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Assign Plan Dialog */}
      <Dialog open={showAssignPlanDialog} onOpenChange={setShowAssignPlanDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {currentPlan ? "Change Service Plan" : "Assign Service Plan"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a service plan for <strong>{selectedProperty?.name}</strong>
            </p>

            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex items-center gap-2">
                      <Badge className={TIER_BADGES[plan.tier_level]} variant="secondary">
                        T{plan.tier_level}
                      </Badge>
                      {plan.name}
                      {plan.monthly_base_price && (
                        <span className="text-muted-foreground ml-2">
                          ${plan.monthly_base_price}/mo
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedPlanId && (
              <Card className="p-4 bg-muted/50">
                {(() => {
                  const plan = plans.find(p => p.id === selectedPlanId)
                  if (!plan) return null
                  const features = plan.features as string[]
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{plan.name}</p>
                        {plan.monthly_base_price && (
                          <p className="font-bold">${plan.monthly_base_price}/mo</p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        {features.slice(0, 4).map((feature, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <Check className="h-3 w-3 text-green-600" />
                            <span className="text-xs">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignPlanDialog(false)}>
              Cancel
            </Button>
            <Button onClick={assignPlanToProperty} disabled={!selectedPlanId}>
              {currentPlan ? "Change Plan" : "Assign Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Editor Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Add Service"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Service Name *</label>
              <Input
                placeholder="e.g., Deep Cleaning"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={serviceForm.category}
                  onValueChange={(v) => setServiceForm({ ...serviceForm, category: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                      <SelectItem key={key} value={key}>{info.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Billing Type</label>
                <Select
                  value={serviceForm.billing_type}
                  onValueChange={(v: 'managed_markup' | 'schedule_only' | 'direct_task') =>
                    setServiceForm({
                      ...serviceForm,
                      billing_type: v,
                      requires_vendor: v !== 'direct_task',
                      materials_billable: v === 'direct_task'
                    })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="managed_markup">Coordinated Service</SelectItem>
                    <SelectItem value="direct_task">Minor Task (we do it)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Brief description of the service..."
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Default Frequency</label>
              <Select
                value={serviceForm.default_frequency}
                onValueChange={(v) => setServiceForm({ ...serviceForm, default_frequency: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One Time</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="as_needed">As Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {serviceForm.billing_type === 'direct_task' && (
              <div className="p-3 bg-purple-50 rounded-lg text-sm">
                <p className="font-medium text-purple-800">Minor Task</p>
                <p className="text-purple-600">
                  Small tasks handled during inspections. Materials billed at cost.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServiceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveService} disabled={!serviceForm.name}>
              {editingService ? "Save Changes" : "Add Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
