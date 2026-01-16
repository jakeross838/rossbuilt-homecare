import { useCreateNotification } from './use-notifications'
import { useSendEmail } from './use-email'
import { useNotificationPreferences } from './use-notification-preferences'
import { useAuthStore } from '@/stores/auth-store'
import {
  createWorkOrderNotificationPayload,
  createInvoiceNotificationPayload,
  getActiveChannels,
} from '@/lib/helpers/notifications'
import type {
  PriorityLevel,
  CreateNotificationPayload,
} from '@/lib/types/notification'

/**
 * Hook: Send notification with preferences check
 */
export function useSendNotificationWithPreferences() {
  const createNotification = useCreateNotification()
  const sendEmail = useSendEmail()
  const { data: preferences } = useNotificationPreferences()
  useAuthStore()

  const send = async (
    payload: CreateNotificationPayload,
    emailOptions?: {
      to: string
      template_type: string
      variables: Record<string, string | number | boolean>
    }
  ) => {
    if (!preferences) return

    const channels = getActiveChannels(
      preferences,
      payload.notification_type,
      payload.priority ?? 'medium'
    )

    // Always create in-app notification
    const notification = await createNotification.mutateAsync(payload)

    // Send email if channel is active
    if (channels.includes('email') && emailOptions) {
      try {
        await sendEmail.mutateAsync({
          ...emailOptions,
          template_type: emailOptions.template_type as Parameters<typeof sendEmail.mutateAsync>[0]['template_type'],
          notification_id: notification.id,
        })
      } catch (err) {
        console.error('Failed to send email notification:', err)
      }
    }

    return notification
  }

  return { send, isPending: createNotification.isPending || sendEmail.isPending }
}

/**
 * Hook: Notify about inspection scheduled
 */
export function useNotifyInspectionScheduled() {
  const sendWithPrefs = useSendNotificationWithPreferences()

  return {
    ...sendWithPrefs,
    notify: async (params: {
      userId: string
      userEmail: string
      clientName: string
      propertyName: string
      propertyAddress: string
      inspectionId: string
      inspectionDate: string
      inspectionTime: string
      inspectionType: string
      inspectorName: string
    }) => {
      const actionUrl = `/calendar?date=${params.inspectionDate.split('T')[0]}`

      const payload: CreateNotificationPayload = {
        user_id: params.userId,
        title: 'Inspection Scheduled',
        message: `Inspection scheduled at ${params.propertyName} on ${new Date(params.inspectionDate).toLocaleDateString()}`,
        notification_type: 'inspection',
        priority: 'medium',
        entity_type: 'inspection',
        entity_id: params.inspectionId,
        action_url: actionUrl,
      }

      return sendWithPrefs.send(payload, {
        to: params.userEmail,
        template_type: 'inspection_scheduled',
        variables: {
          client_name: params.clientName,
          property_name: params.propertyName,
          property_address: params.propertyAddress,
          inspection_date: new Date(params.inspectionDate).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          inspection_time: params.inspectionTime,
          inspection_type: params.inspectionType,
          inspector_name: params.inspectorName,
          action_url: `${window.location.origin}/portal/properties`,
        },
      })
    },
  }
}

/**
 * Hook: Notify about work order status change
 */
export function useNotifyWorkOrderStatus() {
  const sendWithPrefs = useSendNotificationWithPreferences()

  return {
    ...sendWithPrefs,
    notify: async (params: {
      userId: string
      userEmail: string
      userName: string
      workOrderNumber: string
      workOrderId: string
      propertyName: string
      propertyAddress: string
      category: string
      priority: PriorityLevel
      description: string
      status: string
    }) => {
      const payload = createWorkOrderNotificationPayload(
        params.userId,
        params.workOrderNumber,
        params.status,
        params.workOrderId,
        params.priority
      )

      return sendWithPrefs.send(payload, {
        to: params.userEmail,
        template_type: params.status === 'created' ? 'work_order_created' : 'work_order_status_update',
        variables: {
          recipient_name: params.userName,
          work_order_number: params.workOrderNumber,
          property_name: params.propertyName,
          property_address: params.propertyAddress,
          category: params.category,
          priority: params.priority,
          description: params.description,
          action_url: `${window.location.origin}/work-orders/${params.workOrderId}`,
        },
      })
    },
  }
}

/**
 * Hook: Notify about invoice
 */
export function useNotifyInvoice() {
  const sendWithPrefs = useSendNotificationWithPreferences()

  return {
    ...sendWithPrefs,
    notify: async (params: {
      userId: string
      userEmail: string
      clientName: string
      invoiceNumber: string
      invoiceId: string
      amount: number
      dueDate: string
      lineItems: Array<{ description: string; amount: string }>
      eventType: 'created' | 'due_soon' | 'overdue' | 'paid'
      paymentUrl?: string
    }) => {
      const payload = createInvoiceNotificationPayload(
        params.userId,
        params.invoiceNumber,
        params.invoiceId,
        params.eventType,
        params.amount
      )

      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(params.amount)

      let templateType: 'invoice_created' | 'invoice_overdue' | 'payment_received' = 'invoice_created'
      if (params.eventType === 'overdue') templateType = 'invoice_overdue'
      if (params.eventType === 'paid') templateType = 'payment_received'

      return sendWithPrefs.send(payload, {
        to: params.userEmail,
        template_type: templateType,
        variables: {
          client_name: params.clientName,
          invoice_number: params.invoiceNumber,
          amount: formattedAmount,
          due_date: new Date(params.dueDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          payment_url: params.paymentUrl ?? `${window.location.origin}/portal/invoices`,
          portal_url: `${window.location.origin}/portal/invoices`,
          line_items: params.lineItems,
        },
      })
    },
  }
}

/**
 * Hook: Notify about payment received
 */
export function useNotifyPaymentReceived() {
  const sendWithPrefs = useSendNotificationWithPreferences()

  return {
    ...sendWithPrefs,
    notify: async (params: {
      userId: string
      userEmail: string
      clientName: string
      invoiceNumber: string
      invoiceId: string
      amount: number
      paymentMethod: string
      remainingBalance: number
    }) => {
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(params.amount)

      const formattedBalance = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(params.remainingBalance)

      const payload = createInvoiceNotificationPayload(
        params.userId,
        params.invoiceNumber,
        params.invoiceId,
        'paid',
        params.amount
      )

      return sendWithPrefs.send(payload, {
        to: params.userEmail,
        template_type: 'payment_received',
        variables: {
          client_name: params.clientName,
          amount: formattedAmount,
          invoice_number: params.invoiceNumber,
          payment_method: params.paymentMethod,
          payment_date: new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          remaining_balance: formattedBalance,
        },
      })
    },
  }
}

/**
 * Hook: Notify about report ready
 */
export function useNotifyReportReady() {
  const sendWithPrefs = useSendNotificationWithPreferences()

  return {
    ...sendWithPrefs,
    notify: async (params: {
      userId: string
      userEmail: string
      clientName: string
      propertyName: string
      inspectionId: string
      inspectionDate: string
      overallCondition: string
      findingsSummary: string
      recommendationsCount: number
      reportUrl: string
    }) => {
      const payload: CreateNotificationPayload = {
        user_id: params.userId,
        title: 'Inspection Report Ready',
        message: `Your inspection report for ${params.propertyName} is now available`,
        notification_type: 'inspection',
        priority: 'medium',
        entity_type: 'inspection',
        entity_id: params.inspectionId,
        action_url: `/inspections/${params.inspectionId}/report`,
      }

      return sendWithPrefs.send(payload, {
        to: params.userEmail,
        template_type: 'report_ready',
        variables: {
          client_name: params.clientName,
          property_name: params.propertyName,
          inspection_date: new Date(params.inspectionDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          overall_condition: params.overallCondition,
          findings_summary: params.findingsSummary,
          recommendations_count: params.recommendationsCount,
          report_url: params.reportUrl,
          portal_url: `${window.location.origin}/portal/properties`,
        },
      })
    },
  }
}
