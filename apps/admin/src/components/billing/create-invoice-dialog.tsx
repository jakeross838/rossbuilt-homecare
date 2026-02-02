import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InvoiceLineItemRow } from './invoice-line-item-row'
import { useClients } from '@/hooks/use-clients'
import { useCreateInvoice, useClientBillableItems, useMarkInvoiceSent } from '@/hooks/use-invoices'
import { useToast } from '@/hooks/use-toast'
import { createInvoiceSchema, type CreateInvoiceFormData } from '@/lib/validations/billing'
import {
  INVOICE_TYPES,
  DUE_DATE_OPTIONS,
  DEFAULT_INVOICE_TERMS,
} from '@/lib/constants/billing'
import {
  calculateSubtotal,
  calculateInvoiceTotal,
  getDueDate,
  formatCurrency,
} from '@/lib/helpers/billing'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Loader2, Download, Wrench, Calendar } from 'lucide-react'
import type { Resolver } from 'react-hook-form'
import { VENDOR_MARKUP } from '@/config/app-config'

interface CreateInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultClientId?: string
}

interface LineItemData {
  description: string
  quantity: number
  unit_price: number
  line_type?: 'subscription' | 'addon' | 'service' | 'work_order' | 'materials' | 'other'
}

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  defaultClientId,
}: CreateInvoiceDialogProps) {
  const { toast } = useToast()
  const { data: clients } = useClients()
  const createInvoice = useCreateInvoice()
  const markSent = useMarkInvoiceSent()

  const [lineItems, setLineItems] = useState<LineItemData[]>([
    { description: '', quantity: 1, unit_price: 0 },
  ])
  const [taxRate, setTaxRate] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [markupPercent, setMarkupPercent] = useState(VENDOR_MARKUP * 100)
  const [applyMarkup, setApplyMarkup] = useState(false)
  const [publishToPortal, setPublishToPortal] = useState(true) // Default to publish

  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<CreateInvoiceFormData>({
    resolver: zodResolver(createInvoiceSchema) as Resolver<CreateInvoiceFormData>,
    defaultValues: {
      client_id: defaultClientId || '',
      invoice_type: 'service',
      invoice_date: today,
      due_date: getDueDate(today, 30),
      terms: DEFAULT_INVOICE_TERMS,
      line_items: [],
    },
  })

  const invoiceDate = watch('invoice_date')
  const selectedClientId = watch('client_id')

  // Fetch unbilled items when client is selected
  const { data: billableItems, isLoading: loadingBillable } = useClientBillableItems(
    selectedClientId || undefined
  )

  // Import all unbilled items for the selected client
  const handleImportBillableItems = () => {
    if (!billableItems) return

    const newLineItems: LineItemData[] = []

    // Add work orders
    billableItems.workOrders.forEach((wo) => {
      newLineItems.push({
        description: `Work Order #${wo.work_order_number}: ${wo.title} (${wo.property_name})`,
        quantity: 1,
        unit_price: wo.amount,
        line_type: 'work_order',
      })
    })

    // Add subscription/program fees
    billableItems.programs.forEach((prog) => {
      const tierLabel = prog.inspection_tier.charAt(0).toUpperCase() + prog.inspection_tier.slice(1)
      const freqLabel = prog.inspection_frequency.replace('_', ' ')
      newLineItems.push({
        description: `${tierLabel} Inspection Program - ${freqLabel} (${prog.property_name})`,
        quantity: 1,
        unit_price: prog.monthly_total,
        line_type: 'subscription',
      })
    })

    if (newLineItems.length === 0) {
      toast({
        title: 'No billable items',
        description: 'This client has no unbilled work orders or active subscriptions.',
      })
      return
    }

    setLineItems(newLineItems)

    // Auto-set invoice type based on items
    const hasWorkOrders = billableItems.workOrders.length > 0
    const hasPrograms = billableItems.programs.length > 0
    if (hasWorkOrders && hasPrograms) {
      setValue('invoice_type', 'mixed')
    } else if (hasPrograms) {
      setValue('invoice_type', 'subscription')
    } else {
      setValue('invoice_type', 'service')
    }

    toast({
      title: 'Items imported',
      description: `Added ${newLineItems.length} line items from work orders and subscriptions.`,
    })
  }

  // Calculate totals with optional markup (markup shown separately, not added to subtotal)
  const rawSubtotal = calculateSubtotal(lineItems)
  const markupAmount = applyMarkup ? rawSubtotal * (markupPercent / 100) : 0
  const subtotal = rawSubtotal + markupAmount
  // Tax and total are calculated from subtotal (which includes markup if enabled)
  const { taxAmount, total } = calculateInvoiceTotal(subtotal, taxRate, discountAmount)

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0 }])
  }

  const handleLineItemChange = (
    index: number,
    field: keyof LineItemData,
    value: string | number
  ) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const handleDueDatePreset = (days: number) => {
    setValue('due_date', getDueDate(invoiceDate, days))
  }

  const onSubmit = async (data: CreateInvoiceFormData) => {
    try {
      // Validate line items
      const validLineItems = lineItems.filter(
        (item) => item.description && item.quantity > 0 && item.unit_price >= 0
      )
      if (validLineItems.length === 0) {
        toast({
          title: 'Error',
          description: 'Please add at least one line item',
          variant: 'destructive',
        })
        return
      }

      // Add service fee as a line item if enabled
      const allLineItems = [...validLineItems]
      if (applyMarkup && markupAmount > 0) {
        allLineItems.push({
          description: `Service Fee (${markupPercent}%)`,
          quantity: 1,
          unit_price: markupAmount,
          line_type: 'service' as const,
        })
      }

      const invoice = await createInvoice.mutateAsync({
        ...data,
        tax_rate: taxRate,
        discount_amount: discountAmount,
        line_items: allLineItems,
      })

      // If publish to portal is checked, mark as sent immediately
      if (publishToPortal && invoice?.id) {
        await markSent.mutateAsync(invoice.id)
      }

      toast({
        title: 'Invoice Created',
        description: publishToPortal
          ? 'Invoice created and published to client portal'
          : 'Invoice has been created as a draft',
      })

      reset()
      setLineItems([{ description: '', quantity: 1, unit_price: 0 }])
      setTaxRate(0)
      setDiscountAmount(0)
      setMarkupPercent(VENDOR_MARKUP * 100)
      setApplyMarkup(false)
      setPublishToPortal(true)
      onOpenChange(false)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for a client
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Client & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Controller
                name="client_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {`${client.first_name} ${client.last_name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.client_id && (
                <p className="text-sm text-destructive">{errors.client_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Invoice Type</Label>
              <Controller
                name="invoice_type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVOICE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Unbilled Items Alert */}
          {selectedClientId && billableItems && (billableItems.workOrders.length > 0 || billableItems.programs.length > 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">Unbilled Items Available</p>
                  <div className="flex gap-3 mt-1 text-sm text-blue-700">
                    {billableItems.workOrders.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Wrench className="h-4 w-4" />
                        {billableItems.workOrders.length} work order{billableItems.workOrders.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {billableItems.programs.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {billableItems.programs.length} subscription{billableItems.programs.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleImportBillableItems}
                  disabled={loadingBillable}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Import All
                </Button>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Input type="date" {...register('invoice_date')} />
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" {...register('due_date')} />
              <div className="flex gap-2 mt-1">
                {DUE_DATE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDueDatePreset(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <Label>Line Items</Label>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 pb-2 border-b text-sm font-medium text-muted-foreground">
                <div className="flex-1">Description</div>
                <div className="w-24">Type</div>
                <div className="w-20">Qty</div>
                <div className="w-28">Price</div>
                <div className="w-24 text-right">Amount</div>
                <div className="w-10" />
              </div>

              {lineItems.map((item, index) => (
                <InvoiceLineItemRow
                  key={index}
                  item={item}
                  index={index}
                  onChange={handleLineItemChange}
                  onRemove={handleRemoveLineItem}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLineItem}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Line Item
              </Button>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between">
                <span>Line Items:</span>
                <span>{formatCurrency(rawSubtotal)}</span>
              </div>

              {/* Service Fee / Markup */}
              <div className="flex items-center justify-between gap-2 py-2 border-y">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="apply-markup"
                    checked={applyMarkup}
                    onCheckedChange={(checked) => setApplyMarkup(checked === true)}
                  />
                  <label htmlFor="apply-markup" className="text-sm cursor-pointer">
                    Service Fee
                  </label>
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  className="w-16 text-center"
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(parseFloat(e.target.value) || 0)}
                  disabled={!applyMarkup}
                />
                <span className="w-20 text-right">
                  {applyMarkup ? `+${formatCurrency(markupAmount)}` : '-'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span>Tax %:</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-16 text-center"
                  value={taxRate * 100}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) / 100 || 0)}
                />
                <span className="w-20 text-right">{formatCurrency(taxAmount)}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span>Discount:</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-16 text-center"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                />
                <span className="w-20 text-right">-{formatCurrency(discountAmount)}</span>
              </div>

              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                {...register('notes')}
                placeholder="Additional notes for the client"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Textarea {...register('terms')} rows={3} />
            </div>
          </div>

          {/* Publish Option */}
          <div className="flex items-center gap-2 py-2 border-t">
            <Checkbox
              id="publish-to-portal"
              checked={publishToPortal}
              onCheckedChange={(checked) => setPublishToPortal(checked === true)}
            />
            <label htmlFor="publish-to-portal" className="text-sm cursor-pointer">
              Publish to client portal immediately
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createInvoice.isPending || markSent.isPending}>
              {(createInvoice.isPending || markSent.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {publishToPortal ? 'Create & Publish' : 'Create Draft'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
