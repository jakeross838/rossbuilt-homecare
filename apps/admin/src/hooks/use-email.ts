import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { EmailTemplateType } from '@/lib/types/notification'
import { getEmailTemplate } from '@/lib/email/templates'
import { getEmailSubject } from '@/lib/helpers/notifications'

interface SendEmailOptions {
  to: string | string[]
  cc?: string[]
  bcc?: string[]
  template_type: EmailTemplateType
  variables: Record<string, string | number | boolean>
  attachments?: Array<{
    filename: string
    content: string
  }>
  notification_id?: string
}

interface SendEmailResult {
  success: boolean
  message_id?: string
  error?: string
}

/**
 * Send email via edge function
 */
async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const subject = getEmailSubject(options.template_type, options.variables)
  const html = getEmailTemplate(options.template_type, options.variables)

  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject,
      html,
      attachments: options.attachments,
      notification_id: options.notification_id,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * Hook for sending emails
 */
export function useSendEmail() {
  return useMutation({
    mutationFn: sendEmail,
  })
}

/**
 * Send inspection scheduled email
 */
export function useSendInspectionScheduledEmail() {
  const { mutateAsync: send, ...rest } = useSendEmail()

  return {
    ...rest,
    send: async (params: {
      to: string
      client_name: string
      property_name: string
      property_address: string
      inspection_date: string
      inspection_time: string
      inspection_type: string
      inspector_name: string
      action_url: string
    }) => {
      return send({
        to: params.to,
        template_type: 'inspection_scheduled',
        variables: params,
      })
    },
  }
}

/**
 * Send inspection reminder email
 */
export function useSendInspectionReminderEmail() {
  const { mutateAsync: send, ...rest } = useSendEmail()

  return {
    ...rest,
    send: async (params: {
      to: string
      client_name: string
      property_name: string
      property_address: string
      inspection_date: string
      inspection_time: string
      inspector_name: string
      action_url: string
    }) => {
      return send({
        to: params.to,
        template_type: 'inspection_reminder',
        variables: params,
      })
    },
  }
}

/**
 * Send report ready email
 */
export function useSendReportReadyEmail() {
  const { mutateAsync: send, ...rest } = useSendEmail()

  return {
    ...rest,
    send: async (params: {
      to: string
      client_name: string
      property_name: string
      inspection_date: string
      overall_condition: string
      findings_summary: string
      recommendations_count: number
      report_url: string
      portal_url: string
      attachments?: Array<{ filename: string; content: string }>
    }) => {
      return send({
        to: params.to,
        template_type: 'report_ready',
        variables: {
          client_name: params.client_name,
          property_name: params.property_name,
          inspection_date: params.inspection_date,
          overall_condition: params.overall_condition,
          findings_summary: params.findings_summary,
          recommendations_count: params.recommendations_count,
          report_url: params.report_url,
          portal_url: params.portal_url,
        },
        attachments: params.attachments,
      })
    },
  }
}

/**
 * Send invoice email
 */
export function useSendInvoiceEmail() {
  const { mutateAsync: send, ...rest } = useSendEmail()

  return {
    ...rest,
    send: async (params: {
      to: string
      client_name: string
      invoice_number: string
      amount: string
      due_date: string
      line_items: Array<{ description: string; amount: string }>
      payment_url: string
      portal_url: string
    }) => {
      return send({
        to: params.to,
        template_type: 'invoice_created',
        variables: params,
      })
    },
  }
}

/**
 * Send invoice overdue email
 */
export function useSendInvoiceOverdueEmail() {
  const { mutateAsync: send, ...rest } = useSendEmail()

  return {
    ...rest,
    send: async (params: {
      to: string
      client_name: string
      invoice_number: string
      amount: string
      due_date: string
      days_overdue: number
      payment_url: string
    }) => {
      return send({
        to: params.to,
        template_type: 'invoice_overdue',
        variables: params,
      })
    },
  }
}

/**
 * Send payment received email
 */
export function useSendPaymentReceivedEmail() {
  const { mutateAsync: send, ...rest } = useSendEmail()

  return {
    ...rest,
    send: async (params: {
      to: string
      client_name: string
      amount: string
      invoice_number: string
      payment_method: string
      payment_date: string
      remaining_balance: string
    }) => {
      return send({
        to: params.to,
        template_type: 'payment_received',
        variables: params,
      })
    },
  }
}

/**
 * Send work order notification email
 */
export function useSendWorkOrderEmail() {
  const { mutateAsync: send, ...rest } = useSendEmail()

  return {
    ...rest,
    send: async (params: {
      to: string
      recipient_name: string
      work_order_number: string
      property_name: string
      property_address: string
      category: string
      priority: string
      description: string
      action_url: string
      template_type?: 'work_order_created' | 'work_order_status_update' | 'work_order_completed'
    }) => {
      return send({
        to: params.to,
        template_type: params.template_type ?? 'work_order_created',
        variables: params,
      })
    },
  }
}
