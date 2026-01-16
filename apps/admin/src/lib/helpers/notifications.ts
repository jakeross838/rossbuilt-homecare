import type {
  Notification,
  NotificationType,
  PriorityLevel,
  NotificationChannel,
  NotificationPreferences,
  EmailTemplateType,
  CreateNotificationPayload,
} from '@/lib/types/notification'
import {
  NOTIFICATION_TYPE_CONFIG,
  PRIORITY_CONFIG,
  EMAIL_TEMPLATE_SUBJECTS,
  SMS_TEMPLATES,
  ENTITY_TYPE_ROUTES,
  NOTIFICATION_TIMING,
} from '@/lib/constants/notifications'

/**
 * Format notification timestamp for display
 */
export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get notification icon name based on type
 */
export function getNotificationIcon(type: NotificationType): string {
  return NOTIFICATION_TYPE_CONFIG[type]?.icon ?? 'Bell'
}

/**
 * Get notification color class based on type
 */
export function getNotificationColor(type: NotificationType): string {
  return NOTIFICATION_TYPE_CONFIG[type]?.color ?? 'text-gray-600'
}

/**
 * Get priority badge styles
 */
export function getPriorityStyles(priority: PriorityLevel): {
  color: string
  bgColor: string
  label: string
} {
  return PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium
}

/**
 * Sort notifications by priority and date
 */
export function sortNotifications(notifications: Notification[]): Notification[] {
  return [...notifications].sort((a, b) => {
    // First by unread status
    if (a.is_read !== b.is_read) {
      return a.is_read ? 1 : -1
    }

    // Then by priority
    const priorityA = PRIORITY_CONFIG[a.priority ?? 'medium'].sortOrder
    const priorityB = PRIORITY_CONFIG[b.priority ?? 'medium'].sortOrder
    if (priorityA !== priorityB) {
      return priorityB - priorityA
    }

    // Then by date (newest first)
    return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  })
}

/**
 * Group notifications by date
 */
export function groupNotificationsByDate(
  notifications: Notification[]
): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {}
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  notifications.forEach((notification) => {
    const date = new Date(notification.created_at ?? 0)
    let groupKey: string

    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday'
    } else if (date > new Date(today.getTime() - 7 * 86400000)) {
      groupKey = 'This Week'
    } else {
      groupKey = 'Earlier'
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(notification)
  })

  return groups
}

/**
 * Build action URL for notification
 */
export function buildActionUrl(
  entityType: string | null | undefined,
  entityId: string | null | undefined
): string | null {
  if (!entityType || !entityId) return null

  const baseRoute = ENTITY_TYPE_ROUTES[entityType]
  if (!baseRoute) return null

  return `${baseRoute}/${entityId}`
}

/**
 * Determine which channels to use based on preferences and notification type
 */
export function getActiveChannels(
  preferences: NotificationPreferences,
  type: NotificationType,
  priority: PriorityLevel = 'medium'
): NotificationChannel[] {
  const channels: NotificationChannel[] = ['in_app'] // Always in-app

  // Check type-specific overrides
  const typeEnabled =
    (type === 'inspection' && preferences.inspection_reminders) ||
    (type === 'work_order' && preferences.work_order_updates) ||
    (type === 'payment' && preferences.payment_alerts) ||
    type === 'reminder' // Always send reminders

  if (!typeEnabled && type !== 'reminder') {
    return channels
  }

  // Add channels based on preferences and priority
  if (preferences.email) {
    channels.push('email')
  }

  // SMS only for high priority or urgent
  if (preferences.sms && (priority === 'high' || priority === 'urgent')) {
    channels.push('sms')
  }

  // Push for medium and above
  if (preferences.push && priority !== 'low') {
    channels.push('push')
  }

  return channels
}

/**
 * Interpolate template variables
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string | number | boolean>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = variables[key]
    return value !== undefined ? String(value) : match
  })
}

/**
 * Get email subject for template type
 */
export function getEmailSubject(
  type: EmailTemplateType,
  variables: Record<string, string | number | boolean>
): string {
  const template = EMAIL_TEMPLATE_SUBJECTS[type]
  return interpolateTemplate(template, variables)
}

/**
 * Get SMS message for template
 */
export function getSMSMessage(
  templateKey: string,
  variables: Record<string, string | number | boolean>
): string {
  const template = SMS_TEMPLATES[templateKey]
  if (!template) return ''

  const message = interpolateTemplate(template, variables)

  // Truncate to SMS limit (160 chars)
  if (message.length > 160) {
    return message.substring(0, 157) + '...'
  }

  return message
}

/**
 * Calculate next reminder time
 */
export function calculateReminderTime(
  eventTime: Date,
  reminderHours: number = NOTIFICATION_TIMING.inspection_reminder_hours
): Date {
  const reminderTime = new Date(eventTime)
  reminderTime.setHours(reminderTime.getHours() - reminderHours)
  return reminderTime
}

/**
 * Check if invoice is due soon
 */
export function isInvoiceDueSoon(dueDate: string): boolean {
  const due = new Date(dueDate)
  const now = new Date()
  const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / 86400000)
  return daysUntilDue > 0 && daysUntilDue <= NOTIFICATION_TIMING.invoice_due_reminder_days
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(dueDate: string): boolean {
  const due = new Date(dueDate)
  const now = new Date()
  return now > due
}

/**
 * Format currency for notification messages
 */
export function formatNotificationCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Generate notification payload for common events
 */
export function createInspectionReminderPayload(
  userId: string,
  propertyName: string,
  inspectionDate: string,
  inspectionId: string
): CreateNotificationPayload {
  const date = new Date(inspectionDate)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return {
    user_id: userId,
    title: `Inspection Reminder`,
    message: `Upcoming inspection at ${propertyName} on ${formattedDate} at ${formattedTime}`,
    notification_type: 'reminder',
    priority: 'medium',
    entity_type: 'inspection',
    entity_id: inspectionId,
    action_url: `/calendar?date=${inspectionDate.split('T')[0]}`,
  }
}

/**
 * Generate work order notification payload
 */
export function createWorkOrderNotificationPayload(
  userId: string,
  workOrderNumber: string,
  status: string,
  workOrderId: string,
  priority: PriorityLevel = 'medium'
): CreateNotificationPayload {
  const statusMessages: Record<string, string> = {
    created: `New work order #${workOrderNumber} has been created`,
    assigned: `Work order #${workOrderNumber} has been assigned to you`,
    in_progress: `Work order #${workOrderNumber} is now in progress`,
    completed: `Work order #${workOrderNumber} has been completed`,
    cancelled: `Work order #${workOrderNumber} has been cancelled`,
  }

  return {
    user_id: userId,
    title: `Work Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: statusMessages[status] ?? `Work order #${workOrderNumber} status updated to ${status}`,
    notification_type: 'work_order',
    priority,
    entity_type: 'work_order',
    entity_id: workOrderId,
    action_url: `/work-orders/${workOrderId}`,
  }
}

/**
 * Generate invoice notification payload
 */
export function createInvoiceNotificationPayload(
  userId: string,
  invoiceNumber: string,
  invoiceId: string,
  eventType: 'created' | 'due_soon' | 'overdue' | 'paid',
  amount?: number
): CreateNotificationPayload {
  const messages: Record<string, { title: string; message: string; priority: PriorityLevel }> = {
    created: {
      title: 'New Invoice',
      message: `Invoice #${invoiceNumber} has been created${amount ? ` for ${formatNotificationCurrency(amount)}` : ''}`,
      priority: 'medium',
    },
    due_soon: {
      title: 'Invoice Due Soon',
      message: `Invoice #${invoiceNumber} is due in ${NOTIFICATION_TIMING.invoice_due_reminder_days} days`,
      priority: 'high',
    },
    overdue: {
      title: 'Invoice Overdue',
      message: `Invoice #${invoiceNumber} is now overdue. Please remit payment.`,
      priority: 'urgent',
    },
    paid: {
      title: 'Payment Received',
      message: `Payment received for invoice #${invoiceNumber}${amount ? ` - ${formatNotificationCurrency(amount)}` : ''}`,
      priority: 'low',
    },
  }

  const config = messages[eventType]

  return {
    user_id: userId,
    ...config,
    notification_type: 'payment',
    entity_type: 'invoice',
    entity_id: invoiceId,
    action_url: `/billing/${invoiceId}`,
  }
}

/**
 * Count unread notifications by type
 */
export function countUnreadByType(
  notifications: Notification[]
): Record<NotificationType, number> {
  const counts: Record<string, number> = {
    inspection: 0,
    work_order: 0,
    payment: 0,
    reminder: 0,
    alert: 0,
    message: 0,
  }

  notifications.forEach((n) => {
    if (!n.is_read && n.notification_type) {
      counts[n.notification_type] = (counts[n.notification_type] ?? 0) + 1
    }
  })

  return counts as Record<NotificationType, number>
}
