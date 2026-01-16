import type { Enums, Tables } from '@/lib/supabase'

// Invoice status from database enum
export type InvoiceStatus = Enums<'invoice_status'>

// Invoice from database
export type Invoice = Tables<'invoices'>
export type InvoiceLineItem = Tables<'invoice_line_items'>
export type Payment = Tables<'payments'>

// Invoice with relations for display
export interface InvoiceWithRelations extends Invoice {
  client?: {
    id: string
    first_name: string
    last_name: string
    email: string | null
    company_name: string | null
  }
  line_items?: InvoiceLineItem[]
  payments?: Payment[]
}

// Invoice list item for list views
export interface InvoiceListItem {
  id: string
  invoice_number: string
  invoice_type: string
  invoice_date: string
  due_date: string
  total: number
  balance_due: number
  status: InvoiceStatus
  client_name: string
  client_email: string | null
  property_count: number
}

// Line item types
export type LineItemType = 'subscription' | 'addon' | 'service' | 'work_order' | 'materials' | 'other'
export type ReferenceType = 'program' | 'work_order' | 'service_request'

// Payment method types
export type PaymentMethod = 'card' | 'ach' | 'check' | 'cash' | 'other'

// Create invoice data
export interface CreateInvoiceData {
  client_id: string
  invoice_type: 'subscription' | 'service' | 'mixed'
  invoice_date: string
  due_date: string
  period_start?: string
  period_end?: string
  tax_rate?: number
  discount_amount?: number
  discount_description?: string
  notes?: string
  terms?: string
  line_items: CreateLineItemData[]
}

// Create line item data
export interface CreateLineItemData {
  description: string
  quantity: number
  unit_price: number
  line_type?: LineItemType
  reference_type?: ReferenceType
  reference_id?: string
  property_id?: string
}

// Record payment data
export interface RecordPaymentData {
  invoice_id: string
  amount: number
  payment_method: PaymentMethod
  payment_date?: string
  last_four?: string
  card_brand?: string
  check_number?: string
  notes?: string
}

// Invoice filter options
export interface InvoiceFilters {
  status?: InvoiceStatus[]
  client_id?: string
  invoice_type?: string
  date_from?: string
  date_to?: string
  overdue_only?: boolean
  search?: string
}

// Invoice summary for dashboard
export interface InvoiceSummary {
  total_outstanding: number
  total_overdue: number
  invoices_sent: number
  invoices_paid_this_month: number
  average_days_to_pay: number
}
