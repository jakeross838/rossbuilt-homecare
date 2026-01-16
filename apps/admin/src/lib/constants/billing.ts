// Invoice status configuration
export const INVOICE_STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    description: 'Not yet sent to client',
    color: 'gray',
    variant: 'secondary' as const,
    allowedTransitions: ['sent', 'void'],
    canEdit: true,
    canDelete: true,
  },
  sent: {
    label: 'Sent',
    description: 'Sent to client, awaiting payment',
    color: 'blue',
    variant: 'default' as const,
    allowedTransitions: ['viewed', 'paid', 'partial', 'overdue', 'void'],
    canEdit: false,
    canDelete: false,
  },
  viewed: {
    label: 'Viewed',
    description: 'Client has viewed the invoice',
    color: 'purple',
    variant: 'default' as const,
    allowedTransitions: ['paid', 'partial', 'overdue', 'void'],
    canEdit: false,
    canDelete: false,
  },
  paid: {
    label: 'Paid',
    description: 'Payment received in full',
    color: 'green',
    variant: 'success' as const,
    allowedTransitions: ['void'],
    canEdit: false,
    canDelete: false,
  },
  partial: {
    label: 'Partial',
    description: 'Partial payment received',
    color: 'yellow',
    variant: 'warning' as const,
    allowedTransitions: ['paid', 'overdue', 'void'],
    canEdit: false,
    canDelete: false,
  },
  overdue: {
    label: 'Overdue',
    description: 'Past due date without full payment',
    color: 'red',
    variant: 'destructive' as const,
    allowedTransitions: ['paid', 'partial', 'void'],
    canEdit: false,
    canDelete: false,
  },
  void: {
    label: 'Void',
    description: 'Cancelled, no longer valid',
    color: 'gray',
    variant: 'outline' as const,
    allowedTransitions: [],
    canEdit: false,
    canDelete: false,
  },
} as const

// Invoice types
export const INVOICE_TYPES = [
  { value: 'subscription', label: 'Subscription', description: 'Monthly program fees' },
  { value: 'service', label: 'Service', description: 'One-time services or work orders' },
  { value: 'mixed', label: 'Mixed', description: 'Subscription + additional services' },
] as const

// Line item types
export const LINE_ITEM_TYPES = [
  { value: 'subscription', label: 'Subscription' },
  { value: 'addon', label: 'Add-on' },
  { value: 'service', label: 'Service' },
  { value: 'work_order', label: 'Work Order' },
  { value: 'materials', label: 'Materials' },
  { value: 'other', label: 'Other' },
] as const

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'card', label: 'Credit/Debit Card', icon: 'CreditCard' },
  { value: 'ach', label: 'Bank Transfer (ACH)', icon: 'Building' },
  { value: 'check', label: 'Check', icon: 'FileText' },
  { value: 'cash', label: 'Cash', icon: 'Banknote' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' },
] as const

// Card brands
export const CARD_BRANDS = [
  'visa',
  'mastercard',
  'amex',
  'discover',
  'other',
] as const

// Default payment terms (days)
export const DEFAULT_PAYMENT_TERMS = 30

// Default tax rate (as decimal, e.g., 0.07 for 7%)
export const DEFAULT_TAX_RATE = 0

// Invoice number prefix
export const INVOICE_NUMBER_PREFIX = 'INV-'

// Due date options
export const DUE_DATE_OPTIONS = [
  { value: 0, label: 'Due on receipt' },
  { value: 15, label: 'Net 15' },
  { value: 30, label: 'Net 30' },
  { value: 45, label: 'Net 45' },
  { value: 60, label: 'Net 60' },
] as const

// Invoice terms template
export const DEFAULT_INVOICE_TERMS = `Payment is due within 30 days of invoice date.
Late payments may be subject to a 1.5% monthly finance charge.
Please make checks payable to Ross Built Home Services.`

// Invoice status order for sorting
export const INVOICE_STATUS_ORDER: Record<string, number> = {
  overdue: 0,
  sent: 1,
  viewed: 2,
  partial: 3,
  draft: 4,
  paid: 5,
  void: 6,
}
