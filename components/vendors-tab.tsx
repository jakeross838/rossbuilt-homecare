"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users, Plus, Edit2, Trash2, Star, Phone, Mail, Building2,
  Wrench, Shield, Home, Leaf, Car, Plane, ChevronDown, ChevronRight
} from "lucide-react"

interface VendorRate {
  id: string
  service_id: string | null
  description: string
  rate_type: string
  rate_amount: number
  service?: {
    id: string
    name: string
    category: string
  }
}

interface Vendor {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  service_categories: string[]
  notes: string | null
  is_preferred: boolean
  is_active: boolean
  rates?: VendorRate[]
}

const CATEGORY_INFO: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  property_maintenance: { icon: Wrench, label: "Property Maintenance", color: "bg-blue-100 text-blue-800" },
  safety_security: { icon: Shield, label: "Safety & Security", color: "bg-red-100 text-red-800" },
  exterior_maintenance: { icon: Home, label: "Exterior", color: "bg-amber-100 text-amber-800" },
  interior_maintenance: { icon: Home, label: "Interior", color: "bg-purple-100 text-purple-800" },
  landscaping_grounds: { icon: Leaf, label: "Landscaping", color: "bg-green-100 text-green-800" },
  arrival_departure: { icon: Plane, label: "Arrival/Departure", color: "bg-cyan-100 text-cyan-800" },
  concierge: { icon: Users, label: "Concierge", color: "bg-pink-100 text-pink-800" },
  vehicle_services: { icon: Car, label: "Vehicle", color: "bg-orange-100 text-orange-800" }
}

export function VendorsTab() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null)

  // Dialog states
  const [showVendorDialog, setShowVendorDialog] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [vendorForm, setVendorForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    service_categories: [] as string[],
    notes: "",
    is_preferred: false
  })

  useEffect(() => {
    fetchVendors()
  }, [])

  async function fetchVendors() {
    setLoading(true)
    try {
      const res = await fetch("/api/vendors")
      setVendors(await res.json())
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  function openNewVendor() {
    setEditingVendor(null)
    setVendorForm({
      name: "",
      company: "",
      email: "",
      phone: "",
      service_categories: [],
      notes: "",
      is_preferred: false
    })
    setShowVendorDialog(true)
  }

  function openEditVendor(vendor: Vendor) {
    setEditingVendor(vendor)
    setVendorForm({
      name: vendor.name,
      company: vendor.company || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      service_categories: vendor.service_categories || [],
      notes: vendor.notes || "",
      is_preferred: vendor.is_preferred
    })
    setShowVendorDialog(true)
  }

  async function saveVendor() {
    if (!vendorForm.name) return

    const payload = {
      ...vendorForm,
      company: vendorForm.company || null,
      email: vendorForm.email || null,
      phone: vendorForm.phone || null,
      notes: vendorForm.notes || null
    }

    if (editingVendor) {
      await fetch(`/api/vendors/${editingVendor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    } else {
      await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    }

    setShowVendorDialog(false)
    fetchVendors()
  }

  async function deleteVendor(id: string) {
    if (!confirm("Remove this vendor?")) return
    await fetch(`/api/vendors/${id}`, { method: "DELETE" })
    fetchVendors()
  }

  async function togglePreferred(vendor: Vendor) {
    await fetch(`/api/vendors/${vendor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_preferred: !vendor.is_preferred })
    })
    fetchVendors()
  }

  function toggleCategory(category: string) {
    setVendorForm(prev => ({
      ...prev,
      service_categories: prev.service_categories.includes(category)
        ? prev.service_categories.filter(c => c !== category)
        : [...prev.service_categories, category]
    }))
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading vendors...</div>
  }

  const preferredVendors = vendors.filter(v => v.is_preferred)
  const otherVendors = vendors.filter(v => !v.is_preferred)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Vendor Directory</h3>
          <p className="text-sm text-muted-foreground">
            {vendors.length} vendors • {preferredVendors.length} preferred
          </p>
        </div>
        <Button onClick={openNewVendor}>
          <Plus className="h-4 w-4 mr-2" />Add Vendor
        </Button>
      </div>

      {vendors.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground mb-4">No vendors yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Add vendors to coordinate services for your properties.
          </p>
          <Button onClick={openNewVendor}>
            <Plus className="h-4 w-4 mr-2" />Add Your First Vendor
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Preferred Vendors */}
          {preferredVendors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Preferred Vendors
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {preferredVendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    isExpanded={expandedVendor === vendor.id}
                    onToggleExpand={() => setExpandedVendor(
                      expandedVendor === vendor.id ? null : vendor.id
                    )}
                    onEdit={() => openEditVendor(vendor)}
                    onDelete={() => deleteVendor(vendor.id)}
                    onTogglePreferred={() => togglePreferred(vendor)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Vendors */}
          {otherVendors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                All Vendors
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherVendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    isExpanded={expandedVendor === vendor.id}
                    onToggleExpand={() => setExpandedVendor(
                      expandedVendor === vendor.id ? null : vendor.id
                    )}
                    onEdit={() => openEditVendor(vendor)}
                    onDelete={() => deleteVendor(vendor.id)}
                    onTogglePreferred={() => togglePreferred(vendor)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vendor Dialog */}
      <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVendor ? "Edit Vendor" : "Add Vendor"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Contact Name *</label>
                <Input
                  placeholder="John Smith"
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Company</label>
                <Input
                  placeholder="ABC Plumbing"
                  value={vendorForm.company}
                  onChange={(e) => setVendorForm({ ...vendorForm, company: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="vendor@example.com"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  placeholder="555-123-4567"
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Service Categories</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                  const Icon = info.icon
                  const isSelected = vendorForm.service_categories.includes(key)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleCategory(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                        isSelected
                          ? info.color
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {info.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Any notes about this vendor..."
                value={vendorForm.notes}
                onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
                rows={2}
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={vendorForm.is_preferred}
                onChange={(e) => setVendorForm({ ...vendorForm, is_preferred: e.target.checked })}
                className="rounded"
              />
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-sm">Mark as preferred vendor</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVendorDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveVendor} disabled={!vendorForm.name}>
              {editingVendor ? "Save Changes" : "Add Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Vendor Card Component
interface VendorCardProps {
  vendor: Vendor
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
  onTogglePreferred: () => void
}

function VendorCard({ vendor, isExpanded, onToggleExpand, onEdit, onDelete, onTogglePreferred }: VendorCardProps) {
  return (
    <Card className={`overflow-hidden ${vendor.is_preferred ? "border-amber-300" : ""}`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{vendor.name}</span>
                {vendor.is_preferred && (
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                )}
              </div>
              {vendor.company && (
                <p className="text-sm text-muted-foreground">{vendor.company}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onTogglePreferred}>
              <Star className={`h-4 w-4 ${vendor.is_preferred ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-1 text-sm mb-3">
          {vendor.email && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {vendor.email}
            </p>
          )}
          {vendor.phone && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              {vendor.phone}
            </p>
          )}
        </div>

        {/* Categories */}
        {vendor.service_categories && vendor.service_categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {vendor.service_categories.map((cat) => {
              const info = CATEGORY_INFO[cat]
              if (!info) return null
              return (
                <Badge key={cat} variant="secondary" className={`text-xs ${info.color}`}>
                  {info.label}
                </Badge>
              )
            })}
          </div>
        )}

        {/* Expand/Collapse for notes */}
        {vendor.notes && (
          <button
            className="w-full mt-3 pt-3 border-t flex items-center justify-between text-sm text-muted-foreground hover:text-foreground"
            onClick={onToggleExpand}
          >
            <span>Notes</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {isExpanded && vendor.notes && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
            {vendor.notes}
          </p>
        </div>
      )}
    </Card>
  )
}
