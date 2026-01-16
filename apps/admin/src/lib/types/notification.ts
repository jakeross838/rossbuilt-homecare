import type { Enums, Tables } from '@/lib/supabase'

/**
 * Notification type from database enum
 */
export type NotificationType = Enums<'notification_type'>

/**
 * Priority level from database enum
 */
export type PriorityLevel = Enums<'priority_level'>

/**
 * Notification delivery channel
 */
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app'

/**
 * Notification delivery status
 */
export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'skipped'

/**
 * Base notification from database
 */
export type Notification = Tables<'notifications'>

/**
 * Notification with computed fields
 */
export interface NotificationWithStatus extends Notification {
  delivery_channels: NotificationChannel[]
  delivery_status: Record<NotificationChannel, DeliveryStatus>
}

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  // Per-type overrides
  inspection_reminders: boolean
  work_order_updates: boolean
  payment_alerts: boolean
  daily_digest: boolean
  weekly_summary: boolean
}

/**
 * Email template types
 */
export type EmailTemplateType =
  | 'inspection_scheduled'
  | 'inspection_reminder'
  | 'inspection_completed'
  | 'report_ready'
  | 'work_order_created'
  | 'work_order_status_update'
  | 'work_order_completed'
  | 'invoice_created'
  | 'invoice_due_soon'
  | 'invoice_overdue'
  | 'payment_received'
  | 'recommendation_approved'
  | 'service_request_received'
  | 'service_request_update'
  | 'daily_digest'
  | 'weekly_summary'

/**
 * Email template data structure
 */
export interface EmailTemplate {
  type: EmailTemplateType
  subject: string
  body_html: string
  body_text: string
  variables: string[]
}

/**
 * Email send request
 */
export interface SendEmailRequest {
  to: string | string[]
  cc?: string[]
  bcc?: string[]
  template_type: EmailTemplateType
  variables: Record<string, string | number | boolean>
  attachments?: Array<{
    filename: string
    content: string | Uint8Array
    contentType: string
  }>
}

/**
 * Email send response
 */
export interface SendEmailResponse {
  success: boolean
  message_id?: string
  error?: string
}

/**
 * SMS send request
 */
export interface SendSMSRequest {
  to: string
  message: string
  notification_type: NotificationType
}

/**
 * SMS send response
 */
export interface SendSMSResponse {
  success: boolean
  message_sid?: string
  error?: string
}

/**
 * Notification creation payload
 */
export interface CreateNotificationPayload {
  user_id: string
  title: string
  message: string
  notification_type: NotificationType
  priority?: PriorityLevel
  entity_type?: string
  entity_id?: string
  action_url?: string
  channels?: NotificationChannel[]
}

/**
 * Batch notification payload
 */
export interface BatchNotificationPayload {
  user_ids: string[]
  title: string
  message: string
  notification_type: NotificationType
  priority?: PriorityLevel
  entity_type?: string
  entity_id?: string
  action_url?: string
}

/**
 * Scheduled notification
 */
export interface ScheduledNotification {
  id: string
  scheduled_for: string
  payload: CreateNotificationPayload
  status: 'pending' | 'sent' | 'cancelled'
  created_at: string
}

/**
 * Notification summary for dashboard
 */
export interface NotificationSummary {
  total_unread: number
  by_type: Record<NotificationType, number>
  recent: Notification[]
}

/**
 * Activity log entry type
 */
export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'viewed'
  | 'sent'
  | 'completed'
  | 'assigned'
  | 'approved'
  | 'declined'
  | 'scheduled'
  | 'cancelled'

/**
 * Entity types for activity log
 */
export type ActivityEntityType =
  | 'client'
  | 'property'
  | 'inspection'
  | 'work_order'
  | 'invoice'
  | 'payment'
  | 'vendor'
  | 'report'
  | 'recommendation'
  | 'service_request'
  | 'user'

/**
 * Activity log entry with user info
 */
export interface ActivityLogEntry {
  id: string
  user_id: string | null
  user_name?: string
  action: ActivityAction
  entity_type: ActivityEntityType
  entity_id: string
  entity_name?: string
  changes?: Record<string, { old: unknown; new: unknown }>
  metadata?: Record<string, unknown>
  created_at: string
}
