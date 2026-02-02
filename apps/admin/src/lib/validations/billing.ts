import { z } from 'zod'

// Line item schema
export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(0.01, 'Quantity must be greater than 0'),
  unit_price: z.coerce.number().min(0, 'Unit price must be 0 or greater'),
  line_type: z.enum(['subscription', 'addon', 'service', 'work_order', 'materials', 'other']).optional(),
  reference_type: z.enum(['program', 'work_order', 'service_request']).optional(),
  reference_id: z.string().uuid().optional(),
  property_id: z.string().uuid().optional(),
})

// Create invoice form schema (line_items validated separately in component)
export const createInvoiceSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  invoice_type: z.enum(['subscription', 'service', 'mixed']),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  period_start: z.string().optional(),
  period_end: z.string().optional(),
  tax_rate: z.coerce.number().min(0).max(1).optional(),
  discount_amount: z.coerce.number().min(0).optional(),
  discount_description: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  line_items: z.array(lineItemSchema).optional(), // Validated separately in component
})

// Update invoice schema (draft only)
export const updateInvoiceSchema = createInvoiceSchema.partial()

// Record payment schema
export const recordPaymentSchema = z.object({
  invoice_id: z.string().uuid('Invalid invoice'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  payment_method: z.enum(['card', 'ach', 'check', 'cash', 'other']),
  payment_date: z.string().optional(),
  last_four: z.string().length(4).optional(),
  card_brand: z.string().optional(),
  check_number: z.string().optional(),
  notes: z.string().optional(),
})

// Send invoice schema
export const sendInvoiceSchema = z.object({
  invoice_id: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  subject: z.string().optional(),
  message: z.string().optional(),
})

// Types
export type LineItemFormData = z.infer<typeof lineItemSchema>
export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>
export type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>
export type SendInvoiceFormData = z.infer<typeof sendInvoiceSchema>
