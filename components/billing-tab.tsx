"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  DollarSign, Plus, FileText, CheckCircle, Clock, AlertCircle,
  Send, Trash2, Calendar, TrendingUp, Users, Building2, Filter,
  CreditCard, Zap, Download, Search
} from "lucide-react"

interface Invoice {
  id: string
  invoice_number: string
  property_id: string
  client_id: string
  period_start: string | null
  period_end: string | null
  subtotal: number
  tax: number
  total: number
  status: string
  due_date: string | null
  paid_date: string | null
  payment_method: string | null
  payment_reference: string | null
  notes: string | null
  created_at: string
  property?: { id: string; name: string; address: string }
  client?: { id: string; name: string; email: string }
  items?: InvoiceItem[]
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
  item_type: string
  work_order_id?: string
}

interface Property {
  id: string
  name: string
  client_id?: string
  client?: { id: string; name: string; email: string }
  current_plan_id?: string
  current_plan?: { id: string; monthly_base_price: number; name: string }
}

interface Client {
  id: string
  name: string
  email: string
}

interface WorkOrder {
  id: string
  title: string
  client_price: number | null
  vendor_cost: number | null
  status: string
  property_id: string
}

interface BillingTabProps {
  selectedProperty: Property | null
}

export function BillingTab({ selectedProperty }: BillingTabProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [allClients, setAllClients] = useState<Client[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Filter state
  const [filterClient, setFilterClient] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Form state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("")
  const [newInvoice, setNewInvoice] = useState({
    period_start: "",
    period_end: "",
    due_date: "",
    notes: "",
    include_subscription: true,
    selected_work_orders: [] as string[],
    custom_items: [] as { description: string; amount: number }[]
  })
  const [newCustomItem, setNewCustomItem] = useState({ description: "", amount: "" })

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    method: "check",
    reference: "",
    paid_date: new Date().toISOString().split('T')[0]
  })

  // Global view mode (no property selected)
  const isGlobalView = !selectedProperty

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    if (selectedProperty) {
      setSelectedPropertyId(selectedProperty.id)
      fetchPropertyWorkOrders(selectedProperty.id)
    }
  }, [selectedProperty])

  async function fetchAllData() {
    setLoading(true)
    try {
      const [invoicesRes, propertiesRes, clientsRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/properties'),
        fetch('/api/clients')
      ])

      const invoicesData = await invoicesRes.json()
      const propertiesData = await propertiesRes.json()
      const clientsData = await clientsRes.json()

      setInvoices(Array.isArray(invoicesData) ? invoicesData : [])
      setAllProperties(Array.isArray(propertiesData) ? propertiesData : [])
      setAllClients(Array.isArray(clientsData) ? clientsData : [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function fetchPropertyWorkOrders(propertyId: string) {
    try {
      const res = await fetch(`/api/work-orders?property_id=${propertyId}&status=completed`)
      const data = await res.json()
      const billable = (Array.isArray(data) ? data : []).filter(
        (wo: WorkOrder) => wo.status === 'completed' && wo.client_price
      )
      setWorkOrders(billable)
    } catch (e) {
      console.error(e)
    }
  }

  function addCustomItem() {
    if (!newCustomItem.description || !newCustomItem.amount) return
    setNewInvoice({
      ...newInvoice,
      custom_items: [...newInvoice.custom_items, {
        description: newCustomItem.description,
        amount: parseFloat(newCustomItem.amount)
      }]
    })
    setNewCustomItem({ description: "", amount: "" })
  }

  function removeCustomItem(index: number) {
    setNewInvoice({
      ...newInvoice,
      custom_items: newInvoice.custom_items.filter((_, i) => i !== index)
    })
  }

  async function createInvoice() {
    const property = allProperties.find(p => p.id === selectedPropertyId)
    if (!property || !property.client_id) return

    const items: { description: string; unit_price: number; quantity: number; item_type: string; work_order_id?: string }[] = []

    // Add subscription fee if selected
    if (newInvoice.include_subscription && property.current_plan) {
      items.push({
        description: `Monthly ${property.current_plan.name} Subscription`,
        unit_price: property.current_plan.monthly_base_price,
        quantity: 1,
        item_type: 'subscription'
      })
    }

    // Add selected work orders
    for (const woId of newInvoice.selected_work_orders) {
      const wo = workOrders.find(w => w.id === woId)
      if (wo && wo.client_price) {
        items.push({
          description: wo.title,
          unit_price: wo.client_price,
          quantity: 1,
          item_type: 'service',
          work_order_id: wo.id
        })
      }
    }

    // Add custom items
    for (const item of newInvoice.custom_items) {
      items.push({
        description: item.description,
        unit_price: item.amount,
        quantity: 1,
        item_type: 'custom'
      })
    }

    if (items.length === 0) {
      alert('Please add at least one item to the invoice')
      return
    }

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          client_id: property.client_id,
          period_start: newInvoice.period_start || null,
          period_end: newInvoice.period_end || null,
          due_date: newInvoice.due_date || null,
          notes: newInvoice.notes || null,
          items
        })
      })

      if (res.ok) {
        setShowCreateDialog(false)
        resetInvoiceForm()
        fetchAllData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  function resetInvoiceForm() {
    setNewInvoice({
      period_start: "",
      period_end: "",
      due_date: "",
      notes: "",
      include_subscription: true,
      selected_work_orders: [],
      custom_items: []
    })
    setNewCustomItem({ description: "", amount: "" })
  }

  async function generateMonthlyInvoices() {
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
    const dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 15).toISOString().split('T')[0]

    let created = 0
    let skipped = 0

    for (const property of allProperties) {
      if (!property.client_id || !property.current_plan) {
        skipped++
        continue
      }

      // Check if invoice already exists for this month
      const existingInvoice = invoices.find(inv =>
        inv.property_id === property.id &&
        inv.period_start === monthStart
      )

      if (existingInvoice) {
        skipped++
        continue
      }

      try {
        await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id: property.id,
            client_id: property.client_id,
            period_start: monthStart,
            period_end: monthEnd,
            due_date: dueDate,
            items: [{
              description: `Monthly ${property.current_plan.name} Subscription - ${property.name}`,
              unit_price: property.current_plan.monthly_base_price,
              quantity: 1,
              item_type: 'subscription'
            }]
          })
        })
        created++
      } catch (e) {
        console.error(e)
      }
    }

    alert(`Generated ${created} invoices. ${skipped} skipped (no plan or already invoiced).`)
    setShowGenerateDialog(false)
    fetchAllData()
  }

  async function updateInvoiceStatus(invoiceId: string, status: string, additionalData?: Record<string, unknown>) {
    try {
      await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...additionalData })
      })
      fetchAllData()
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status, ...additionalData } as Invoice)
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function recordPayment() {
    if (!selectedInvoice) return
    await updateInvoiceStatus(selectedInvoice.id, 'paid', {
      paid_date: paymentForm.paid_date,
      payment_method: paymentForm.method,
      payment_reference: paymentForm.reference
    })
    setShowPaymentDialog(false)
    setPaymentForm({ method: "check", reference: "", paid_date: new Date().toISOString().split('T')[0] })
  }

  async function deleteInvoice(invoiceId: string) {
    if (!confirm('Delete this invoice?')) return
    try {
      await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' })
      fetchAllData()
      setShowDetailDialog(false)
    } catch (e) {
      console.error(e)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-600 text-white'
      case 'sent': return 'bg-blue-500 text-white'
      case 'overdue': return 'bg-red-600 text-white'
      case 'cancelled': return 'bg-gray-500 text-white'
      default: return 'bg-yellow-500 text-black'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'sent': return <Send className="h-4 w-4" />
      case 'overdue': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    // If property selected, filter by property
    if (selectedProperty && inv.property_id !== selectedProperty.id) return false

    // Filter by client
    if (filterClient !== "all" && inv.client_id !== filterClient) return false

    // Filter by status
    if (filterStatus !== "all" && inv.status !== filterStatus) return false

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        inv.invoice_number.toLowerCase().includes(term) ||
        inv.client?.name?.toLowerCase().includes(term) ||
        inv.property?.name?.toLowerCase().includes(term)
      )
    }

    return true
  })

  // Revenue calculations
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total), 0)
  const thisMonthRevenue = invoices
    .filter(i => {
      if (i.status !== 'paid' || !i.paid_date) return false
      const paidMonth = new Date(i.paid_date).getMonth()
      const currentMonth = new Date().getMonth()
      return paidMonth === currentMonth
    })
    .reduce((sum, i) => sum + Number(i.total), 0)
  const outstanding = invoices
    .filter(i => ['draft', 'sent', 'overdue'].includes(i.status))
    .reduce((sum, i) => sum + Number(i.total), 0)
  const overdueAmount = invoices
    .filter(i => i.status === 'overdue')
    .reduce((sum, i) => sum + Number(i.total), 0)

  // Get selected property for form
  const formProperty = allProperties.find(p => p.id === selectedPropertyId)

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-semibold">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-xl font-semibold">${thisMonthRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-xl font-semibold">${outstanding.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-xl font-semibold text-red-600">${overdueAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {isGlobalView && (
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {allClients.map(client => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {isGlobalView && (
            <Button variant="outline" onClick={() => setShowGenerateDialog(true)}>
              <Zap className="h-4 w-4 mr-2" />
              Generate Monthly
            </Button>
          )}
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Invoice List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filteredInvoices.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">No invoices found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => (
            <Card
              key={invoice.id}
              className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => {
                setSelectedInvoice(invoice)
                setShowDetailDialog(true)
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{invoice.invoice_number}</span>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">{invoice.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {invoice.client?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {invoice.property?.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">${Number(invoice.total).toFixed(2)}</p>
                  {invoice.due_date && invoice.status !== 'paid' && (
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  )}
                  {invoice.paid_date && invoice.status === 'paid' && (
                    <p className="text-xs text-green-600">
                      Paid: {new Date(invoice.paid_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Property Selection (if global view) */}
            {isGlobalView && (
              <div>
                <label className="text-sm font-medium">Property *</label>
                <Select
                  value={selectedPropertyId}
                  onValueChange={(v) => {
                    setSelectedPropertyId(v)
                    fetchPropertyWorkOrders(v)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProperties.filter(p => p.client_id).map(prop => (
                      <SelectItem key={prop.id} value={prop.id}>
                        {prop.name} - {prop.client?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Period Start</label>
                <Input
                  type="date"
                  value={newInvoice.period_start}
                  onChange={(e) => setNewInvoice({ ...newInvoice, period_start: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Period End</label>
                <Input
                  type="date"
                  value={newInvoice.period_end}
                  onChange={(e) => setNewInvoice({ ...newInvoice, period_end: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={newInvoice.due_date}
                  onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                />
              </div>
            </div>

            {/* Subscription */}
            {formProperty?.current_plan && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <input
                  type="checkbox"
                  checked={newInvoice.include_subscription}
                  onChange={(e) => setNewInvoice({ ...newInvoice, include_subscription: e.target.checked })}
                  className="h-4 w-4"
                />
                <div className="flex-1">
                  <p className="font-medium">{formProperty.current_plan.name}</p>
                  <p className="text-sm text-muted-foreground">Monthly subscription</p>
                </div>
                <p className="font-semibold">${formProperty.current_plan.monthly_base_price}</p>
              </div>
            )}

            {/* Billable Work Orders */}
            {workOrders.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Completed Services</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                  {workOrders.map((wo) => (
                    <div key={wo.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded">
                      <input
                        type="checkbox"
                        checked={newInvoice.selected_work_orders.includes(wo.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewInvoice({
                              ...newInvoice,
                              selected_work_orders: [...newInvoice.selected_work_orders, wo.id]
                            })
                          } else {
                            setNewInvoice({
                              ...newInvoice,
                              selected_work_orders: newInvoice.selected_work_orders.filter(id => id !== wo.id)
                            })
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{wo.title}</p>
                      </div>
                      <p className="font-semibold">${wo.client_price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Line Items */}
            <div>
              <label className="text-sm font-medium mb-2 block">Custom Line Items</label>
              {newInvoice.custom_items.length > 0 && (
                <div className="space-y-2 mb-3">
                  {newInvoice.custom_items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="flex-1 text-sm">{item.description}</span>
                      <span className="font-medium">${item.amount.toFixed(2)}</span>
                      <Button size="sm" variant="ghost" onClick={() => removeCustomItem(idx)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Description"
                  value={newCustomItem.description}
                  onChange={(e) => setNewCustomItem({ ...newCustomItem, description: e.target.value })}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newCustomItem.amount}
                  onChange={(e) => setNewCustomItem({ ...newCustomItem, amount: e.target.value })}
                  className="w-28"
                />
                <Button variant="outline" onClick={addCustomItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Invoice notes..."
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetInvoiceForm() }}>Cancel</Button>
            <Button onClick={createInvoice} disabled={!selectedPropertyId && isGlobalView}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Monthly Invoices Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Monthly Invoices</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will generate subscription invoices for all properties with active service plans that don&apos;t already have an invoice for this month.
            </p>
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">Properties with plans: {allProperties.filter(p => p.current_plan && p.client_id).length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Invoice period: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>Cancel</Button>
            <Button onClick={generateMonthlyInvoices}>
              <Zap className="h-4 w-4 mr-2" />
              Generate Invoices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedInvoice.invoice_number}
                  <Badge className={getStatusColor(selectedInvoice.status)}>
                    {selectedInvoice.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Client Info */}
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{selectedInvoice.client?.name}</p>
                    <p className="text-muted-foreground">{selectedInvoice.client?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{selectedInvoice.property?.name}</p>
                    <p className="text-muted-foreground">{selectedInvoice.property?.address}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-3 gap-4 text-sm p-3 bg-muted rounded-lg">
                  {selectedInvoice.period_start && (
                    <div>
                      <p className="text-muted-foreground">Period</p>
                      <p>{new Date(selectedInvoice.period_start).toLocaleDateString()} - {selectedInvoice.period_end ? new Date(selectedInvoice.period_end).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  )}
                  {selectedInvoice.due_date && (
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p>{new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedInvoice.paid_date && (
                    <div>
                      <p className="text-muted-foreground">Paid Date</p>
                      <p className="text-green-600">{new Date(selectedInvoice.paid_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {/* Payment Info */}
                {selectedInvoice.status === 'paid' && selectedInvoice.payment_method && (
                  <div className="flex items-center gap-2 text-sm p-3 bg-green-50 rounded-lg">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span>Paid via {selectedInvoice.payment_method}</span>
                    {selectedInvoice.payment_reference && (
                      <span className="text-muted-foreground">• Ref: {selectedInvoice.payment_reference}</span>
                    )}
                  </div>
                )}

                {/* Items */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Description</th>
                        <th className="text-right p-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2">{item.description}</td>
                          <td className="text-right p-2">${Number(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/50 font-semibold">
                      <tr className="border-t">
                        <td className="p-2 text-right">Total</td>
                        <td className="p-2 text-right">${Number(selectedInvoice.total).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Notes */}
                {selectedInvoice.notes && (
                  <div className="text-sm p-3 bg-muted rounded-lg">
                    <p className="text-muted-foreground mb-1">Notes</p>
                    <p>{selectedInvoice.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {selectedInvoice.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => updateInvoiceStatus(selectedInvoice.id, 'sent')}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Mark as Sent
                    </Button>
                  )}
                  {['draft', 'sent', 'overdue'].includes(selectedInvoice.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600"
                      onClick={() => setShowPaymentDialog(true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Record Payment
                    </Button>
                  )}
                  {selectedInvoice.status === 'draft' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteInvoice(selectedInvoice.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Recording Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Payment Date</label>
              <Input
                type="date"
                value={paymentForm.paid_date}
                onChange={(e) => setPaymentForm({ ...paymentForm, paid_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentForm.method} onValueChange={(v) => setPaymentForm({ ...paymentForm, method: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Reference Number (optional)</label>
              <Input
                placeholder="Check #, transaction ID, etc."
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onClick={recordPayment}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
