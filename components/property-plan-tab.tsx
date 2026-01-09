"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Package, Star, Check, Eye,
  Shield, Wrench, Home, Calendar, Camera, Thermometer, Droplets, ArrowUp
} from "lucide-react"

interface ServicePlan {
  id: string
  name: string
  tier_level: number
  description: string
  monthly_base_price: number | null
  inspection_frequency: string
  features: string[]
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

interface PropertyPlanTabProps {
  selectedProperty: Property
  onPropertyPlanChange?: () => void
}

const PLAN_INFO: Record<number, {
  tagline: string
  bestFor: string
  color: string
  bgColor: string
  borderColor: string
  icon: React.ElementType
}> = {
  1: {
    tagline: "Eyes on your property",
    bestFor: "Part-time residents, rental properties",
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    icon: Eye
  },
  2: {
    tagline: "Active property caretaker",
    bestFor: "Vacation homes, snowbirds",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Shield
  },
  3: {
    tagline: "Complete estate management",
    bestFor: "Luxury estates, complete care",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    icon: Star
  }
}

// Tier-specific features organized by category
const TIER_FEATURES: Record<number, { category: string; icon: React.ElementType; items: string[] }[]> = {
  1: [
    {
      category: "Inspections",
      icon: Eye,
      items: [
        "Monthly property inspection (15-20 min)",
        "Interior & exterior walkthrough",
        "Photo documentation report"
      ]
    },
    {
      category: "What We Check",
      icon: Home,
      items: [
        "HVAC system operation",
        "Water leak detection",
        "Pest activity inspection",
        "Security check (doors, windows)",
        "General property condition"
      ]
    },
    {
      category: "Communication",
      icon: Camera,
      items: [
        "Photo report after each visit",
        "Issue alerts via email",
        "Maintenance coordination available"
      ]
    }
  ],
  2: [
    {
      category: "Inspections",
      icon: Eye,
      items: [
        "Bi-weekly property inspection (45 min)",
        "Detailed interior & exterior walkthrough",
        "Comprehensive photo documentation",
        "Under-sink inspection all bathrooms/kitchen"
      ]
    },
    {
      category: "Preventive Maintenance",
      icon: Wrench,
      items: [
        "Run all water fixtures to prevent pipe issues",
        "Flush all toilets",
        "HVAC filter replacement",
        "Smoke/CO detector battery replacement",
        "Seasonal storm preparation"
      ]
    },
    {
      category: "Systems Monitoring",
      icon: Thermometer,
      items: [
        "HVAC performance testing",
        "Water heater inspection",
        "Basic appliance testing",
        "Electrical panel visual check"
      ]
    },
    {
      category: "Communication",
      icon: Camera,
      items: [
        "Detailed photo report after each visit",
        "Priority issue alerts",
        "Maintenance coordination included"
      ]
    }
  ],
  3: [
    {
      category: "Inspections",
      icon: Eye,
      items: [
        "Bi-weekly comprehensive inspection (60+ min)",
        "Full property walkthrough with documentation",
        "Quarterly attic/crawlspace inspection",
        "Custom property-specific checklist"
      ]
    },
    {
      category: "Preventive Maintenance",
      icon: Wrench,
      items: [
        "Run all water fixtures & flush toilets",
        "HVAC filter replacement",
        "Smoke/CO detector battery replacement",
        "Seasonal storm preparation",
        "Hurricane readiness (shutters, supplies)"
      ]
    },
    {
      category: "Systems Testing",
      icon: Thermometer,
      items: [
        "Test all major appliances",
        "Outlet testing throughout property",
        "HVAC comprehensive testing",
        "Water heater inspection",
        "Pool/spa equipment check (if applicable)"
      ]
    },
    {
      category: "Owner Visits",
      icon: Calendar,
      items: [
        "Pre-arrival property preparation",
        "Climate control adjustment",
        "Supplies stocking coordination",
        "Post-departure property securing",
        "Utility management"
      ]
    },
    {
      category: "Premium Service",
      icon: Star,
      items: [
        "Priority emergency response",
        "Dedicated property manager",
        "Vendor coordination fee waived",
        "Quarterly property condition report"
      ]
    }
  ]
}

export function PropertyPlanTab({ selectedProperty, onPropertyPlanChange }: PropertyPlanTabProps) {
  const [plans, setPlans] = useState<ServicePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")

  useEffect(() => {
    fetchPlans()
  }, [])

  async function fetchPlans() {
    setLoading(true)
    try {
      const res = await fetch("/api/plans")
      setPlans(await res.json())
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function assignPlan() {
    if (!selectedPlanId) return

    await fetch("/api/property-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_id: selectedProperty.id,
        plan_id: selectedPlanId
      })
    })

    setShowChangePlanDialog(false)
    setSelectedPlanId("")
    onPropertyPlanChange?.()
  }

  const currentPlan = plans.find(p => p.id === selectedProperty.current_plan_id)

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>
  }

  // No plan assigned yet
  if (!currentPlan) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center border-dashed border-2">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Service Plan</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Choose a service plan to start managing this property.
          </p>
          <Button onClick={() => setShowChangePlanDialog(true)}>
            Select a Plan
          </Button>
        </Card>

        <PlanDialog
          open={showChangePlanDialog}
          onOpenChange={setShowChangePlanDialog}
          plans={plans}
          selectedPlanId={selectedPlanId}
          onSelectPlan={setSelectedPlanId}
          onConfirm={assignPlan}
          currentPlan={null}
        />
      </div>
    )
  }

  // Has a plan - show current plan features
  const info = PLAN_INFO[currentPlan.tier_level]
  const Icon = info.icon
  const tierFeatures = TIER_FEATURES[currentPlan.tier_level] || []

  return (
    <div className="space-y-6">
      {/* Current Plan Header */}
      <Card className={`overflow-hidden ${info.borderColor} border-2`}>
        <div className={`p-6 ${info.bgColor}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-6 w-6 ${info.color}`} />
                <h3 className="text-xl font-bold">{currentPlan.name}</h3>
                <Badge variant="secondary" className="bg-white">Active</Badge>
              </div>
              <p className={`${info.color}`}>{info.tagline}</p>
              {currentPlan.monthly_base_price && (
                <p className="text-2xl font-bold mt-2">${currentPlan.monthly_base_price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowChangePlanDialog(true)}>
              Change Plan
            </Button>
          </div>
        </div>
      </Card>

      {/* Plan Features by Category */}
      <div className="grid md:grid-cols-2 gap-4">
        {tierFeatures.map((category, idx) => {
          const CategoryIcon = category.icon
          return (
            <Card key={idx} className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg ${info.bgColor}`}>
                  <CategoryIcon className={`h-5 w-5 ${info.color}`} />
                </div>
                <h4 className="font-semibold">{category.category}</h4>
              </div>
              <ul className="space-y-2">
                {category.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className={`h-4 w-4 mt-0.5 ${info.color} flex-shrink-0`} />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>

      {/* Upgrade Prompt for non-Luxury tiers */}
      {currentPlan.tier_level < 3 && (
        <Card className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <ArrowUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-900">Upgrade Your Protection</h4>
                <p className="text-sm text-amber-700">
                  {currentPlan.tier_level === 1
                    ? "Get bi-weekly visits and preventive maintenance with Premium Care"
                    : "Get pre-arrival prep and complete estate management with Luxury Care"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={() => setShowChangePlanDialog(true)}
            >
              View Options
            </Button>
          </div>
        </Card>
      )}

      <PlanDialog
        open={showChangePlanDialog}
        onOpenChange={setShowChangePlanDialog}
        plans={plans}
        selectedPlanId={selectedPlanId}
        onSelectPlan={setSelectedPlanId}
        onConfirm={assignPlan}
        currentPlan={currentPlan}
      />
    </div>
  )
}

// Plan Selection Dialog
interface PlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plans: ServicePlan[]
  selectedPlanId: string
  onSelectPlan: (id: string) => void
  onConfirm: () => void
  currentPlan: ServicePlan | null
}

function PlanDialog({ open, onOpenChange, plans, selectedPlanId, onSelectPlan, onConfirm, currentPlan }: PlanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {currentPlan ? "Change Service Plan" : "Select Service Plan"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {plans.sort((a, b) => a.tier_level - b.tier_level).map((plan) => {
            const info = PLAN_INFO[plan.tier_level]
            const PlanIcon = info.icon
            const isSelected = selectedPlanId === plan.id
            const isCurrent = plan.id === currentPlan?.id

            return (
              <div
                key={plan.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected ? `${info.borderColor} ${info.bgColor}` : "border-gray-200 hover:border-gray-300"
                } ${isCurrent ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => !isCurrent && onSelectPlan(plan.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlanIcon className={`h-5 w-5 ${info.color}`} />
                    <span className="font-medium">{plan.name}</span>
                    {isCurrent && <Badge variant="outline">Current</Badge>}
                  </div>
                  {plan.monthly_base_price && (
                    <span className="font-semibold">${plan.monthly_base_price}/mo</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{info.tagline}</p>
              </div>
            )
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={!selectedPlanId || selectedPlanId === currentPlan?.id}>
            {currentPlan ? "Change Plan" : "Select Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
