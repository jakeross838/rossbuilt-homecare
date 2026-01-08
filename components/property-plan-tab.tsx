"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Package, Star, Check, Eye, X,
  Shield, Users, CloudRain, Camera, Wrench
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

  // No plan assigned yet - show comparison
  if (!currentPlan) {
    return (
      <div className="space-y-8">
        <Card className="p-8 text-center border-dashed border-2">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Service Plan</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Choose a service plan to start managing this property.
          </p>
        </Card>

        {/* Plan Comparison */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Compare Plans</h3>
          <ComparisonTable plans={plans} onSelectPlan={(id) => {
            setSelectedPlanId(id)
            setShowChangePlanDialog(true)
          }} />
        </div>

        {/* How It Works */}
        <HowItWorksSection tierLevel={null} />

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

  // Has a plan - show current plan details
  const info = PLAN_INFO[currentPlan.tier_level]
  const Icon = info.icon
  const features = currentPlan.features as string[]

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <Card className={`overflow-hidden ${info.borderColor} border-2`}>
        <div className={`p-6 ${info.bgColor}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-6 w-6 ${info.color}`} />
                <h3 className="text-xl font-bold">{currentPlan.name}</h3>
                <Badge variant="secondary" className="bg-white">Active</Badge>
              </div>
              <p className={`${info.color}`}>{info.tagline}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowChangePlanDialog(true)}>
              Change Plan
            </Button>
          </div>

        </div>

        {/* What's Included */}
        <div className="p-6">
          <h4 className="font-medium mb-4">What's Included</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className={`h-4 w-4 mt-0.5 ${info.color}`} />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* How We Work - Expanded */}
      <HowItWorksSection tierLevel={currentPlan.tier_level} />

      {/* Plan Comparison */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Plan Comparison</h3>
        <ComparisonTable
          plans={plans}
          currentPlanId={currentPlan.id}
          onSelectPlan={(id) => {
            setSelectedPlanId(id)
            setShowChangePlanDialog(true)
          }}
        />
      </div>

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

// How It Works Section Component
function HowItWorksSection({ tierLevel }: { tierLevel: number | null }) {
  return (
    <Card className="p-6">
      <h4 className="text-lg font-semibold mb-2">How Our Service Works</h4>
      <p className="text-sm text-muted-foreground mb-6">
        We serve as your eyes on the ground, identifying issues and coordinating any work needed.
      </p>

      {/* The Process Flow */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
              <h5 className="font-medium">We Inspect</h5>
            </div>
            <p className="text-sm text-muted-foreground">
              We walk through your property, checking rooms, systems, and documenting with photos.
            </p>
          </div>
          <div className="flex-1 p-4 rounded-lg bg-purple-50 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">2</div>
              <h5 className="font-medium">We Report</h5>
            </div>
            <p className="text-sm text-muted-foreground">
              You receive a detailed report with photos highlighting anything that needs attention.
            </p>
          </div>
          <div className="flex-1 p-4 rounded-lg bg-green-50 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">3</div>
              <h5 className="font-medium">You Decide</h5>
            </div>
            <p className="text-sm text-muted-foreground">
              Review our recommendations and approve the services you want us to coordinate.
            </p>
          </div>
          <div className="flex-1 p-4 rounded-lg bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-bold">4</div>
              <h5 className="font-medium">We Handle It</h5>
            </div>
            <p className="text-sm text-muted-foreground">
              We schedule the vendor, oversee the work, and send you one simple bill.
            </p>
          </div>
        </div>
      </div>

      {/* Tier Descriptions */}
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-slate-600" />
            <h5 className="font-semibold">Essential Care — $349/mo</h5>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Monthly 15-20 minute visual inspections. We check for obvious issues like water damage,
            pest activity, HVAC operation, and security. Photo report after each visit.
          </p>
          <p className="text-xs text-slate-500">Best for: Part-time residents, rental properties with regular guests</p>
        </div>

        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h5 className="font-semibold">Premium Care — $649/mo</h5>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Bi-weekly 45 minute detailed inspections. Everything in Essential plus: run all water fixtures,
            flush toilets, HVAC filter replacement, smoke/CO detector batteries, seasonal prep, and under-sink inspections.
          </p>
          <p className="text-xs text-blue-600">Best for: Vacation homes, snowbirds, properties sitting vacant</p>
        </div>

        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-amber-600" />
            <h5 className="font-semibold">Luxury Care — $1,199/mo</h5>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Bi-weekly 60+ minute comprehensive inspections. Everything in Premium plus: test all appliances,
            outlet testing, quarterly attic/crawlspace inspection, pre-arrival preparation, post-departure securing,
            and custom property checklist.
          </p>
          <p className="text-xs text-amber-600">Best for: Luxury estates, high-value properties, owners who want complete care</p>
        </div>
      </div>
    </Card>
  )
}

// Comparison Table Component
function ComparisonTable({
  plans,
  currentPlanId,
  onSelectPlan
}: {
  plans: ServicePlan[]
  currentPlanId?: string
  onSelectPlan: (id: string) => void
}) {
  const sortedPlans = [...plans].sort((a, b) => a.tier_level - b.tier_level)

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium text-muted-foreground"></th>
              {sortedPlans.map((plan) => {
                const info = PLAN_INFO[plan.tier_level]
                const Icon = info.icon
                return (
                  <th key={plan.id} className={`p-4 text-center ${info.bgColor}`}>
                    <div className="flex flex-col items-center gap-1">
                      <Icon className={`h-5 w-5 ${info.color}`} />
                      <span className="font-semibold">{plan.name}</span>
                      <span className="text-xs text-muted-foreground italic">"{info.tagline}"</span>
                      {plan.monthly_base_price && (
                        <span className="text-xl font-bold mt-1">
                          ${plan.monthly_base_price}<span className="text-sm font-normal">/mo</span>
                        </span>
                      )}
                      {currentPlanId === plan.id && (
                        <Badge variant="secondary" className="text-xs mt-1">Current</Badge>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {/* Visit Schedule */}
            <tr className="bg-slate-100">
              <td colSpan={4} className="p-3 font-semibold text-slate-700 text-sm">Visit Schedule</td>
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Inspection Frequency</td>
              <td className="p-4 text-center font-medium">Monthly</td>
              <td className="p-4 text-center font-medium">Bi-weekly</td>
              <td className="p-4 text-center font-medium">Bi-weekly</td>
            </tr>
            <tr className="border-b bg-muted/30">
              <td className="p-4 font-medium">Visit Duration</td>
              <td className="p-4 text-center">15-20 min</td>
              <td className="p-4 text-center">45 min</td>
              <td className="p-4 text-center">60+ min</td>
            </tr>

            {/* What We Inspect */}
            <tr className="bg-blue-50">
              <td colSpan={4} className="p-3 font-semibold text-blue-800 text-sm">What We Inspect</td>
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Interior & Exterior Walkthrough</td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
            </tr>
            <tr className="border-b bg-muted/30">
              <td className="p-4 font-medium">Photo Report</td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Detailed Under-Sink Inspection</td>
              <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
            </tr>
            <tr className="border-b bg-muted/30">
              <td className="p-4 font-medium">Appliance Testing</td>
              <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
              <td className="p-4 text-center text-sm">Basic</td>
              <td className="p-4 text-center text-sm">Comprehensive</td>
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Attic/Crawlspace Inspection</td>
              <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
              <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
              <td className="p-4 text-center text-sm">Quarterly</td>
            </tr>

            {/* Preventive Maintenance */}
            <tr className="bg-green-50">
              <td colSpan={4} className="p-3 font-semibold text-green-800 text-sm">Preventive Maintenance Included</td>
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Run Water Fixtures</td>
              <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
            </tr>
            <tr className="border-b bg-muted/30">
              <td className="p-4 font-medium">HVAC Filter Replacement</td>
              <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Smoke/CO Detector Batteries</td>
              <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
            </tr>
            <tr className="border-b bg-muted/30">
              <td className="p-4 font-medium">Seasonal Prep (Hurricane, etc.)</td>
              <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
            </tr>

            {/* Premium Services */}
            <tr className="bg-amber-50">
              <td colSpan={4} className="p-3 font-semibold text-amber-800 text-sm">Premium Services</td>
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Pre-Arrival Preparation</td>
              <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
              <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
            </tr>
            <tr className="border-b bg-muted/30">
              <td className="p-4 font-medium">Post-Departure Securing</td>
              <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
              <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium">Custom Property Checklist</td>
              <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
              <td className="p-4 text-center"><span className="text-gray-400">—</span></td>
              <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
            </tr>

            {/* Best For */}
            <tr className="bg-slate-50">
              <td className="p-4 font-medium text-slate-600">Best For</td>
              <td className="p-4 text-center text-sm text-muted-foreground">Part-time residents, rentals</td>
              <td className="p-4 text-center text-sm text-muted-foreground">Vacation homes, snowbirds</td>
              <td className="p-4 text-center text-sm text-muted-foreground">Luxury estates</td>
            </tr>

            {/* Action Row */}
            <tr className="border-t-2">
              <td className="p-4"></td>
              {sortedPlans.map((plan) => {
                const isCurrent = currentPlanId === plan.id
                return (
                  <td key={plan.id} className="p-4 text-center">
                    <Button
                      variant={plan.tier_level === 3 ? "default" : "outline"}
                      size="sm"
                      disabled={isCurrent}
                      onClick={() => onSelectPlan(plan.id)}
                      className={isCurrent ? "opacity-50" : ""}
                    >
                      {isCurrent ? "Current Plan" : `Select`}
                    </Button>
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
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
            const Icon = info.icon
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
                    <Icon className={`h-5 w-5 ${info.color}`} />
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
