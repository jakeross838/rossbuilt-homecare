import type { Enums } from '@/lib/supabase'
import { CONDITION_DISPLAY, PRIORITY_DISPLAY, SERVICE_REQUEST_STATUS_CONFIG } from '@/lib/constants/portal'

/**
 * Portal helper functions
 */

// Format condition for client-friendly display
export function formatCondition(condition: Enums<'condition_rating'> | null): {
  label: string
  description: string
  color: string
} {
  if (!condition) {
    return { label: 'Not Rated', description: 'Condition not yet assessed', color: 'text-gray-400' }
  }
  return CONDITION_DISPLAY[condition]
}

// Get priority badge styles
export function getPriorityStyles(priority: Enums<'priority_level'>): {
  label: string
  color: string
} {
  return PRIORITY_DISPLAY[priority]
}

// Get service request status display
export function getServiceRequestStatus(status: Enums<'service_request_status'>): {
  label: string
  color: string
  description: string
} {
  return SERVICE_REQUEST_STATUS_CONFIG[status]
}

// Format inspection tier for display
export function formatInspectionTier(tier: Enums<'inspection_tier'>): string {
  const labels: Record<Enums<'inspection_tier'>, string> = {
    visual: 'Visual Inspection',
    functional: 'Functional Inspection',
    comprehensive: 'Comprehensive Inspection',
    preventative: 'Preventative Care',
  }
  return labels[tier]
}

// Format frequency for display
export function formatFrequency(frequency: Enums<'inspection_frequency'>): string {
  const labels: Record<Enums<'inspection_frequency'>, string> = {
    annual: 'Annual',
    semi_annual: 'Semi-Annual',
    quarterly: 'Quarterly',
    monthly: 'Monthly',
    bi_weekly: 'Bi-Weekly',
  }
  return labels[frequency]
}

// Calculate days until next inspection
export function getDaysUntilInspection(nextDate: string | null): number | null {
  if (!nextDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const inspection = new Date(nextDate)
  inspection.setHours(0, 0, 0, 0)
  const diffTime = inspection.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Format relative date for client display
export function formatRelativeDate(date: string): string {
  const now = new Date()
  const target = new Date(date)
  const diffDays = Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`

  return target.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: target.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

// Get property health summary
export function getPropertyHealth(property: {
  open_work_order_count: number
  pending_recommendation_count: number
  overall_condition: Enums<'condition_rating'> | null
}): {
  status: 'good' | 'attention' | 'urgent'
  label: string
  color: string
} {
  // Urgent if any urgent work orders or poor condition
  if (property.overall_condition === 'poor') {
    return { status: 'urgent', label: 'Needs Attention', color: 'text-red-600' }
  }

  // Attention needed if work orders or recommendations pending
  if (property.open_work_order_count > 0 || property.pending_recommendation_count > 0) {
    return { status: 'attention', label: 'Action Items Pending', color: 'text-yellow-600' }
  }

  // Good if no issues
  return { status: 'good', label: 'All Good', color: 'text-green-600' }
}
