import type { InvoiceStatus } from '@/lib/types/billing'
import { INVOICE_STATUS_CONFIG, DEFAULT_PAYMENT_TERMS } from '@/lib/constants/billing'

/**
 * Calculate line item amount
 */
export function calculateLineItemAmount(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100
}

/**
 * Calculate invoice subtotal from line items
 */
export function calculateSubtotal(lineItems: Array<{ quantity: number; unit_price: number }>): number {
  return lineItems.reduce((sum, item) => {
    return sum + calculateLineItemAmount(item.quantity, item.unit_price)
  }, 0)
}

/**
 * Calculate tax amount
 */
export function calculateTaxAmount(subtotal: number, taxRate: number): number {
  return Math.round(subtotal * taxRate * 100) / 100
}

/**
 * Calculate invoice total
 */
export function calculateInvoiceTotal(
  subtotal: number,
  taxRate: number = 0,
  discountAmount: number = 0
): { taxAmount: number; total: number } {
  const taxAmount = calculateTaxAmount(subtotal, taxRate)
  const total = Math.round((subtotal + taxAmount - discountAmount) * 100) / 100
  return { taxAmount, total: Math.max(0, total) }
}

/**
 * Calculate balance due
 */
export function calculateBalanceDue(total: number, amountPaid: number): number {
  return Math.round((total - amountPaid) * 100) / 100
}

/**
 * Get due date from invoice date and terms
 */
export function getDueDate(invoiceDate: string, terms: number = DEFAULT_PAYMENT_TERMS): string {
  const date = new Date(invoiceDate)
  date.setDate(date.getDate() + terms)
  return date.toISOString().split('T')[0]
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(dueDate: string, status: InvoiceStatus): boolean {
  if (status === 'paid' || status === 'void') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return due < today
}

/**
 * Get days until due / days overdue
 */
export function getDaysUntilDue(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Check if status transition is allowed
 */
export function canTransitionTo(currentStatus: InvoiceStatus, newStatus: InvoiceStatus): boolean {
  const config = INVOICE_STATUS_CONFIG[currentStatus]
  return (config.allowedTransitions as readonly InvoiceStatus[]).includes(newStatus)
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Format invoice number
 */
export function formatInvoiceNumber(sequenceNum: number): string {
  return `INV-${sequenceNum.toString().padStart(5, '0')}`
}

/**
 * Generate period description for subscription invoices
 */
export function getPeriodDescription(periodStart: string, periodEnd: string): string {
  const start = new Date(periodStart)
  const end = new Date(periodEnd)
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startStr} - ${endStr}`
}
