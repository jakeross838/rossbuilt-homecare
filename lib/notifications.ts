import { supabase } from './supabase'

// Notification types
export type NotificationType =
  | 'inspection_complete'
  | 'issue_found'
  | 'work_order_update'
  | 'invoice_sent'
  | 'visit_scheduled'
  | 'request_response'

interface NotificationPayload {
  clientId: string
  propertyId?: string
  type: NotificationType
  subject: string
  body: string
  metadata?: Record<string, unknown>
}

interface ClientNotificationPrefs {
  id: string
  name: string
  email: string
  phone?: string
  email_notifications: boolean
  sms_notifications: boolean
}

// Email sending via Resend (or fallback to console log for dev)
async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY

  if (!RESEND_API_KEY) {
    // Development mode - log to console
    console.log('=== EMAIL (dev mode) ===')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body: ${body}`)
    console.log('========================')
    return true
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'PropertyCare <notifications@resend.dev>',
        to: [to],
        subject,
        html: body,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

// SMS sending via Twilio (optional)
async function sendSMS(to: string, body: string): Promise<boolean> {
  const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
  const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN
  const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER

  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
    console.log('=== SMS (dev mode) ===')
    console.log(`To: ${to}`)
    console.log(`Body: ${body}`)
    console.log('======================')
    return true
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: TWILIO_FROM,
          Body: body,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Twilio API error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('SMS send error:', error)
    return false
  }
}

// Log notification to database
async function logNotification(
  payload: NotificationPayload,
  channel: 'email' | 'sms',
  status: 'sent' | 'failed',
  errorMessage?: string
) {
  await supabase.from('pm_notifications').insert({
    client_id: payload.clientId,
    property_id: payload.propertyId,
    type: payload.type,
    subject: payload.subject,
    body: payload.body,
    metadata: payload.metadata,
    channel,
    status,
    error_message: errorMessage,
  })
}

// Get client notification preferences
async function getClientPrefs(clientId: string): Promise<ClientNotificationPrefs | null> {
  const { data, error } = await supabase
    .from('pm_clients')
    .select('id, name, email, phone, email_notifications, sms_notifications')
    .eq('id', clientId)
    .single()

  if (error || !data) return null
  return data
}

// Main notification function
export async function sendNotification(payload: NotificationPayload): Promise<{ success: boolean; channels: string[] }> {
  const client = await getClientPrefs(payload.clientId)
  if (!client) {
    return { success: false, channels: [] }
  }

  const sentChannels: string[] = []

  // Send email if enabled
  if (client.email_notifications && client.email) {
    const htmlBody = formatEmailBody(payload)
    const success = await sendEmail(client.email, payload.subject, htmlBody)
    await logNotification(payload, 'email', success ? 'sent' : 'failed')
    if (success) sentChannels.push('email')
  }

  // Send SMS if enabled and phone is available
  if (client.sms_notifications && client.phone) {
    const smsBody = formatSMSBody(payload)
    const success = await sendSMS(client.phone, smsBody)
    await logNotification(payload, 'sms', success ? 'sent' : 'failed')
    if (success) sentChannels.push('sms')
  }

  return { success: sentChannels.length > 0, channels: sentChannels }
}

// Format email body with HTML
function formatEmailBody(payload: NotificationPayload): string {
  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #333;
    line-height: 1.6;
  `

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="${baseStyle} padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 24px;">PropertyCare</h1>
        </div>

        <h2 style="color: #1f2937; margin-bottom: 16px;">${payload.subject}</h2>

        <div style="color: #4b5563;">
          ${payload.body.replace(/\n/g, '<br>')}
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This is an automated notification from your property management service.
          <br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal" style="color: #2563eb;">View in Portal</a>
        </p>
      </div>
    </body>
    </html>
  `
}

// Format SMS body (keep it short)
function formatSMSBody(payload: NotificationPayload): string {
  // SMS should be concise - under 160 chars if possible
  let message = `PropertyCare: ${payload.subject}`

  // Add abbreviated body if there's room
  if (message.length < 120 && payload.body) {
    const shortBody = payload.body.substring(0, 120 - message.length - 3)
    message += ` - ${shortBody}`
    if (payload.body.length > shortBody.length) {
      message += '...'
    }
  }

  return message
}

// Convenience functions for specific notification types

export async function notifyInspectionComplete(
  clientId: string,
  propertyId: string,
  propertyName: string,
  inspectionDate: string,
  issuesFound: number
) {
  const subject = `Inspection Complete: ${propertyName}`
  const body = issuesFound > 0
    ? `Your property inspection on ${inspectionDate} has been completed.\n\n${issuesFound} issue(s) were found and documented. Please log into your portal to view the full report and photos.`
    : `Your property inspection on ${inspectionDate} has been completed.\n\nGreat news! No issues were found. Your property is in excellent condition. View the full report and photos in your portal.`

  return sendNotification({
    clientId,
    propertyId,
    type: 'inspection_complete',
    subject,
    body,
    metadata: { inspectionDate, issuesFound }
  })
}

export async function notifyIssueFound(
  clientId: string,
  propertyId: string,
  propertyName: string,
  issueSummary: string
) {
  return sendNotification({
    clientId,
    propertyId,
    type: 'issue_found',
    subject: `Issue Found at ${propertyName}`,
    body: `An issue was discovered during inspection:\n\n${issueSummary}\n\nOur team will follow up with recommended actions. You can view details in your portal.`,
    metadata: { issueSummary }
  })
}

export async function notifyWorkOrderUpdate(
  clientId: string,
  propertyId: string,
  workOrderTitle: string,
  newStatus: string,
  notes?: string
) {
  const statusText = newStatus.replace('_', ' ')
  const body = notes
    ? `Your maintenance request "${workOrderTitle}" has been updated to: ${statusText}\n\nNotes: ${notes}`
    : `Your maintenance request "${workOrderTitle}" has been updated to: ${statusText}`

  return sendNotification({
    clientId,
    propertyId,
    type: 'work_order_update',
    subject: `Work Order Update: ${workOrderTitle}`,
    body,
    metadata: { workOrderTitle, newStatus }
  })
}

export async function notifyInvoiceSent(
  clientId: string,
  propertyId: string,
  invoiceNumber: string,
  total: number,
  dueDate?: string
) {
  const formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)
  const body = dueDate
    ? `A new invoice #${invoiceNumber} for ${formattedTotal} has been generated.\n\nDue Date: ${dueDate}\n\nView and pay your invoice in the client portal.`
    : `A new invoice #${invoiceNumber} for ${formattedTotal} has been generated.\n\nView and pay your invoice in the client portal.`

  return sendNotification({
    clientId,
    propertyId,
    type: 'invoice_sent',
    subject: `New Invoice: ${invoiceNumber}`,
    body,
    metadata: { invoiceNumber, total, dueDate }
  })
}

export async function notifyVisitScheduled(
  clientId: string,
  propertyId: string,
  propertyName: string,
  arrivalDate: string,
  specialRequests?: string
) {
  const body = specialRequests
    ? `Your visit to ${propertyName} has been scheduled for ${arrivalDate}.\n\nSpecial requests noted:\n${specialRequests}\n\nWe'll have everything ready for your arrival!`
    : `Your visit to ${propertyName} has been scheduled for ${arrivalDate}.\n\nWe'll have everything ready for your arrival!`

  return sendNotification({
    clientId,
    propertyId,
    type: 'visit_scheduled',
    subject: `Visit Scheduled: ${propertyName}`,
    body,
    metadata: { arrivalDate, specialRequests }
  })
}

export async function notifyRequestResponse(
  clientId: string,
  propertyId: string,
  requestTitle: string,
  response: string
) {
  return sendNotification({
    clientId,
    propertyId,
    type: 'request_response',
    subject: `Response to Your Request: ${requestTitle}`,
    body: `Your request "${requestTitle}" has received a response:\n\n${response}`,
    metadata: { requestTitle }
  })
}
