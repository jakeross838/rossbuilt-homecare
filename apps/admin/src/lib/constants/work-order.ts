import type { WorkOrderStatus, PriorityLevel } from '@/lib/types/work-order'

// Note: VENDOR_MARKUP is 0.15 (15%) defined in app-config.ts
// We use the literal value here to avoid circular dependency
// (app-config.ts re-exports WORK_ORDER_STATUS from this file)

/**
 * Work order status configuration
 */
export const WORK_ORDER_STATUS: Record<
  WorkOrderStatus,
  {
    label: string
    color: 'default' | 'warning' | 'info' | 'success' | 'destructive'
    description: string
    allowedTransitions: WorkOrderStatus[]
  }
> = {
  pending: {
    label: 'Pending',
    color: 'default',
    description: 'Work order created, awaiting assignment',
    allowedTransitions: ['vendor_assigned', 'scheduled', 'cancelled'],
  },
  vendor_assigned: {
    label: 'Vendor Assigned',
    color: 'info',
    description: 'Vendor has been assigned, awaiting scheduling',
    allowedTransitions: ['scheduled', 'pending', 'cancelled'],
  },
  scheduled: {
    label: 'Scheduled',
    color: 'warning',
    description: 'Work has been scheduled',
    allowedTransitions: ['in_progress', 'vendor_assigned', 'cancelled'],
  },
  in_progress: {
    label: 'In Progress',
    color: 'warning',
    description: 'Work is currently being performed',
    allowedTransitions: ['completed', 'on_hold'],
  },
  completed: {
    label: 'Completed',
    color: 'success',
    description: 'Work has been completed',
    allowedTransitions: [],
  },
  on_hold: {
    label: 'On Hold',
    color: 'destructive',
    description: 'Work is temporarily paused',
    allowedTransitions: ['in_progress', 'cancelled'],
  },
  cancelled: {
    label: 'Cancelled',
    color: 'destructive',
    description: 'Work order has been cancelled',
    allowedTransitions: [],
  },
}

/**
 * Priority level configuration
 */
export const PRIORITY_LEVELS: Record<
  PriorityLevel,
  {
    label: string
    color: 'default' | 'warning' | 'destructive' | 'info'
    icon: string
    sortOrder: number
  }
> = {
  low: {
    label: 'Low',
    color: 'default',
    icon: 'ArrowDown',
    sortOrder: 1,
  },
  medium: {
    label: 'Medium',
    color: 'info',
    icon: 'Minus',
    sortOrder: 2,
  },
  high: {
    label: 'High',
    color: 'warning',
    icon: 'ArrowUp',
    sortOrder: 3,
  },
  urgent: {
    label: 'Urgent',
    color: 'destructive',
    icon: 'AlertTriangle',
    sortOrder: 4,
  },
}

/**
 * Work order statuses as array for dropdowns
 */
export const WORK_ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'vendor_assigned', label: 'Vendor Assigned' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

/**
 * Work order categories (aligned with equipment categories and vendor trades)
 */
export const WORK_ORDER_CATEGORIES = [
  { value: 'hvac', label: 'HVAC' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'appliance', label: 'Appliance Repair' },
  { value: 'pool_spa', label: 'Pool & Spa' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'painting', label: 'Painting' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'security', label: 'Security Systems' },
  { value: 'general', label: 'General Maintenance' },
  { value: 'other', label: 'Other' },
] as const

export type WorkOrderCategory = (typeof WORK_ORDER_CATEGORIES)[number]['value']

/**
 * Default markup percentage for vendor work
 * This matches VENDOR_MARKUP (0.15) from app-config.ts converted to percent
 * Note: Using literal to avoid circular dependency with app-config.ts
 */
export const DEFAULT_MARKUP_PERCENT = 15

/**
 * Work order number prefix
 */
export const WORK_ORDER_PREFIX = 'WO'

/**
 * Calculate total client cost with markup
 */
export function calculateClientCost(
  actualCost: number,
  markupPercent: number = DEFAULT_MARKUP_PERCENT
): { markupAmount: number; totalCost: number } {
  const markupAmount = actualCost * (markupPercent / 100)
  const totalCost = actualCost + markupAmount
  return {
    markupAmount: Math.round(markupAmount * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
  }
}

/**
 * Format work order number for display
 */
export function formatWorkOrderNumber(number: string): string {
  return number.startsWith(WORK_ORDER_PREFIX) ? number : `${WORK_ORDER_PREFIX}-${number}`
}

/**
 * Get status badge variant
 */
export function getStatusBadgeVariant(
  status: WorkOrderStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const config = WORK_ORDER_STATUS[status]
  switch (config.color) {
    case 'success':
    case 'info':
      return 'default'
    case 'warning':
      return 'secondary'
    case 'destructive':
      return 'destructive'
    default:
      return 'outline'
  }
}

/**
 * Get priority badge variant
 */
export function getPriorityBadgeVariant(
  priority: PriorityLevel
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const config = PRIORITY_LEVELS[priority]
  switch (config.color) {
    case 'destructive':
      return 'destructive'
    case 'warning':
      return 'secondary'
    case 'info':
      return 'default'
    default:
      return 'outline'
  }
}
