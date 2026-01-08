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
  Send, Trash2, Eye, Calendar
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
  current_plan?: { monthly_base_price: number; name: string }
}

interface WorkOrder {
  id: string
  title: string
  client_price: number | null
  vendor_cost: number | null
  status: string
}

interface BillingTabProps {
  selectedProperty: Property | null
}

export function BillingTab({ selectedProperty }: BillingTabProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Form state
  const [newInvoice, setNewInvoice] = useState({
    period_start: "",
    period_end: "",
    due_date: "",
    notes: "",
    include_subscription: true,
    selected_work_orders: [] as string[]
  })

  useEffect(() => {
    if (selectedProperty) {
      fetchInvoices()
      fetchBillableWorkOrders()
    }
  }, [selectedProperty])

  async function fetchInvoices() {
    if (!selectedProperty) return
    setLoading(true)
    try {
      const res = await fetch(`/api/invoices?property_id=${selectedProperty.id}`)
      const data = await res.json()
      setInvoices(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function fetchBillableWorkOrders() {
    if (!selectedProperty) return
    try {
      const res = await fetch(`/api/work-orders?property_id=${selectedProperty.id}&status=completed`)
      const data = await res.json()
      // Filter to only completed work orders with prices
      const billable = (Array.isArray(data) ? data : []).filter(
        (wo: WorkOrder) => wo.status === 'completed' && wo.client_price
      )
      setWorkOrders(billable)
    } catch (e) {
      console.error(e)
    }
  }

  async function createInvoice() {
    if (!selectedProperty) return

    const items: { description: string; unit_price: number; quantity: number; item_type: string; work_order_id?: string }[] = []

    // Add subscription fee if selected
    if (newInvoice.include_subscription && selectedProperty.current_plan) {
      items.push({
        description: `Monthly ${selectedProperty.current_plan.name} Subscription`,
        unit_price: selectedProperty.current_plan.monthly_base_price,
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

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: selectedProperty.id,
          client_id: selectedProperty.client_id,
          period_start: newInvoice.period_start || null,
          period_end: newInvoice.period_end || null,
          due_date: newInvoice.due_date || null,
          notes: newInvoice.notes || null,
          items
        })
      })

      if (res.ok) {
        setShowCreateDialog(false)
        setNewInvoice({
          period_start: "",
          period_end: "",
          due_date: "",
          notes: "",
          include_subscription: true,
          selected_work_orders: []
        })
        fetchInvoices()
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function updateInvoiceStatus(invoiceId: string, status: string) {
    try {
      await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      fetchInvoices()
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status })
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function deleteInvoice(invoiceId: string) {
    if (!confirm('Delete this invoice?')) return
    try {
      await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' })
      fetchInvoices()
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

  // Stats
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total), 0)
  const totalPending = invoices.filter(i => ['draft', 'sent'].includes(i.status)).reduce((sum, i) => sum + Number(i.total), 0)
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + Number(i.total), 0)

  if (!selectedProperty) {
    return (
      <Card className="p-8 text-center">
        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="text-muted-foreground">Select a property to manage billing</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-xl font-semibold">${totalPaid.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xl font-semibold">${totalPending.toFixed(2)}</p>
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
              <p className="text-xl font-semibold">${totalOverdue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Invoices</h3>
        <Button size="sm" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Invoice List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : invoices.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">No invoices yet</p>
          <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Invoice
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
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
                    <p className="text-sm text-muted-foreground mt-1">
                      {invoice.period_start && invoice.period_end
                        ? `${new Date(invoice.period_start).toLocaleDateString()} - ${new Date(invoice.period_end).toLocaleDateString()}`
                        : new Date(invoice.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">${Number(invoice.total).toFixed(2)}</p>
                  {invoice.due_date && invoice.status !== 'paid' && (
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={newInvoice.due_date}
                onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
              />
            </div>

            {/* Subscription */}
            {selectedProperty.current_plan && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <input
                  type="checkbox"
                  checked={newInvoice.include_subscription}
                  onChange={(e) => setNewInvoice({ ...newInvoice, include_subscription: e.target.checked })}
                  className="h-4 w-4"
                />
                <div className="flex-1">
                  <p className="font-medium">{selectedProperty.current_plan.name}</p>
                  <p className="text-sm text-muted-foreground">Monthly subscription</p>
                </div>
                <p className="font-semibold">${selectedProperty.current_plan.monthly_base_price}</p>
              </div>
            )}

            {/* Billable Work Orders */}
            {workOrders.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Completed Services</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {workOrders.map((wo) => (
                    <div key={wo.id} className="flex items-center gap-3 p-2 border rounded">
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
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={createInvoice}>Create Invoice</Button>
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
                <div className="text-sm">
                  <p className="font-medium">{selectedInvoice.client?.name}</p>
                  <p className="text-muted-foreground">{selectedInvoice.client?.email}</p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
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
                </div>

                {/* Items */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Description</th>
                        <th className="text-right p-2">Qty</th>
                        <th className="text-right p-2">Price</th>
                        <th className="text-right p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2">{item.description}</td>
                          <td className="text-right p-2">{item.quantity}</td>
                          <td className="text-right p-2">${Number(item.unit_price).toFixed(2)}</td>
                          <td className="text-right p-2">${Number(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/50">
                      <tr className="border-t">
                        <td colSpan={3} className="p-2 text-right font-medium">Subtotal</td>
                        <td className="p-2 text-right">${Number(selectedInvoice.subtotal).toFixed(2)}</td>
                      </tr>
                      {Number(selectedInvoice.tax) > 0 && (
                        <tr>
                          <td colSpan={3} className="p-2 text-right">Tax</td>
                          <td className="p-2 text-right">${Number(selectedInvoice.tax).toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="border-t font-semibold">
                        <td colSpan={3} className="p-2 text-right">Total</td>
                        <td className="p-2 text-right">${Number(selectedInvoice.total).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Notes */}
                {selectedInvoice.notes && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Notes</p>
                    <p>{selectedInvoice.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
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
                      onClick={() => updateInvoiceStatus(selectedInvoice.id, 'paid')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark as Paid
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
    </div>
  )
}
