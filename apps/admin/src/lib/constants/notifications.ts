import type {
  NotificationType,
  NotificationChannel,
  PriorityLevel,
  EmailTemplateType,
} from '@/lib/types/notification'

/**
 * Notification type display configuration
 */
export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  {
    label: string
    icon: string
    color: string
    defaultPriority: PriorityLevel
  }
> = {
  inspection: {
    label: 'Inspection',
    icon: 'ClipboardCheck',
    color: 'text-blue-600',
    defaultPriority: 'medium',
  },
  work_order: {
    label: 'Work Order',
    icon: 'Wrench',
    color: 'text-orange-600',
    defaultPriority: 'medium',
  },
  payment: {
    label: 'Payment',
    icon: 'CreditCard',
    color: 'text-green-600',
    defaultPriority: 'high',
  },
  reminder: {
    label: 'Reminder',
    icon: 'Bell',
    color: 'text-purple-600',
    defaultPriority: 'low',
  },
  alert: {
    label: 'Alert',
    icon: 'AlertTriangle',
    color: 'text-red-600',
    defaultPriority: 'high',
  },
  message: {
    label: 'Message',
    icon: 'MessageSquare',
    color: 'text-gray-600',
    defaultPriority: 'low',
  },
}

/**
 * Notification priority display configuration
 */
export const PRIORITY_CONFIG: Record<
  PriorityLevel,
  {
    label: string
    color: string
    bgColor: string
    sortOrder: number
  }
> = {
  low: {
    label: 'Low',
    color: 'text-slate-700',
    bgColor: 'bg-slate-200',
    sortOrder: 1,
  },
  medium: {
    label: 'Medium',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    sortOrder: 2,
  },
  high: {
    label: 'High',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    sortOrder: 3,
  },
  urgent: {
    label: 'Urgent',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    sortOrder: 4,
  },
}

/**
 * Notification channel configuration
 */
export const CHANNEL_CONFIG: Record<
  NotificationChannel,
  {
    label: string
    icon: string
    description: string
    requiresSetup: boolean
  }
> = {
  email: {
    label: 'Email',
    icon: 'Mail',
    description: 'Receive notifications via email',
    requiresSetup: false,
  },
  sms: {
    label: 'SMS',
    icon: 'Smartphone',
    description: 'Receive text message notifications',
    requiresSetup: true,
  },
  push: {
    label: 'Push',
    icon: 'Bell',
    description: 'Receive browser push notifications',
    requiresSetup: true,
  },
  in_app: {
    label: 'In-App',
    icon: 'Inbox',
    description: 'View notifications in the app',
    requiresSetup: false,
  },
}

/**
 * Default notification preferences
 */
export const DEFAULT_NOTIFICATION_PREFERENCES = {
  email: true,
  push: true,
  sms: false,
  inspection_reminders: true,
  work_order_updates: true,
  payment_alerts: true,
  daily_digest: false,
  weekly_summary: true,
}

/**
 * Email template subjects (default)
 */
export const EMAIL_TEMPLATE_SUBJECTS: Record<EmailTemplateType, string> = {
  inspection_scheduled: 'Inspection Scheduled: {property_name}',
  inspection_reminder: 'Reminder: Inspection Tomorrow at {property_name}',
  inspection_completed: 'Inspection Complete: {property_name}',
  report_ready: 'Your Inspection Report is Ready: {property_name}',
  work_order_created: 'New Work Order: {work_order_number}',
  work_order_status_update: 'Work Order Update: {work_order_number}',
  work_order_completed: 'Work Order Completed: {work_order_number}',
  invoice_created: 'New Invoice: {invoice_number}',
  invoice_due_soon: 'Invoice Due Soon: {invoice_number}',
  invoice_overdue: 'Invoice Overdue: {invoice_number}',
  payment_received: 'Payment Received: Thank You!',
  recommendation_approved: 'Recommendation Approved: {recommendation_title}',
  service_request_received: 'Service Request Received: #{request_number}',
  service_request_update: 'Service Request Update: #{request_number}',
  daily_digest: 'Ross Built Daily Summary - {date}',
  weekly_summary: 'Ross Built Weekly Summary - Week of {date}',
}

/**
 * SMS message templates (character-limited)
 */
export const SMS_TEMPLATES: Record<string, string> = {
  inspection_reminder:
    'Ross Built: Reminder - Inspection at {property_name} tomorrow at {time}. Reply STOP to unsubscribe.',
  inspection_completed:
    'Ross Built: Inspection complete at {property_name}. View report: {report_url}',
  work_order_urgent:
    'Ross Built URGENT: Work order #{work_order_number} requires immediate attention. {action_url}',
  invoice_overdue:
    'Ross Built: Invoice #{invoice_number} is overdue. Pay now: {payment_url}',
  payment_received:
    'Ross Built: Payment of {amount} received. Thank you!',
}

/**
 * Notification timing configuration
 */
export const NOTIFICATION_TIMING = {
  // How far ahead to send reminders
  inspection_reminder_hours: 24,
  invoice_due_reminder_days: 3,
  invoice_overdue_grace_days: 7,

  // Digest timing
  daily_digest_hour: 8, // 8 AM
  weekly_summary_day: 1, // Monday
  weekly_summary_hour: 9, // 9 AM

  // Retry configuration
  max_email_retries: 3,
  max_sms_retries: 2,
  retry_delay_minutes: 5,
}

/**
 * Activity log action labels
 */
export const ACTIVITY_ACTION_LABELS: Record<string, string> = {
  created: 'created',
  updated: 'updated',
  deleted: 'deleted',
  viewed: 'viewed',
  sent: 'sent',
  completed: 'completed',
  assigned: 'assigned to',
  approved: 'approved',
  declined: 'declined',
  scheduled: 'scheduled',
  cancelled: 'cancelled',
}

/**
 * Entity type labels for activity log
 */
export const ENTITY_TYPE_LABELS: Record<string, string> = {
  client: 'Client',
  property: 'Property',
  inspection: 'Inspection',
  work_order: 'Work Order',
  invoice: 'Invoice',
  payment: 'Payment',
  vendor: 'Vendor',
  report: 'Report',
  recommendation: 'Recommendation',
  service_request: 'Service Request',
  user: 'User',
}

/**
 * Entity type routes for building action URLs
 */
export const ENTITY_TYPE_ROUTES: Record<string, string> = {
  client: '/clients',
  property: '/properties',
  inspection: '/calendar',
  work_order: '/work-orders',
  invoice: '/billing',
  vendor: '/vendors',
  report: '/inspections',
  service_request: '/portal/requests',
}
