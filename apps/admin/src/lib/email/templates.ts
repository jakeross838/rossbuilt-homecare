import type { EmailTemplateType } from '@/lib/types/notification'

/**
 * Base email layout wrapper
 */
export function getEmailLayout(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Ross Built Home Care</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f5;
      color: #18181b;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .card {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 24px;
      border-bottom: 1px solid #e4e4e7;
      margin-bottom: 24px;
    }
    .logo {
      height: 40px;
      margin-bottom: 8px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 600;
      color: #166534;
    }
    h1 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #18181b;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 16px 0;
      color: #3f3f46;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #166534;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      font-size: 16px;
      margin: 16px 0;
    }
    .button:hover {
      background-color: #14532d;
    }
    .info-box {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 16px;
      margin: 16px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e4e4e7;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #71717a;
      font-size: 14px;
    }
    .info-value {
      font-weight: 500;
      color: #18181b;
    }
    .footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #e4e4e7;
      margin-top: 24px;
    }
    .footer p {
      font-size: 14px;
      color: #71717a;
    }
    .footer a {
      color: #166534;
      text-decoration: none;
    }
    .preheader {
      display: none;
      max-height: 0;
      overflow: hidden;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    .badge-green { background-color: #dcfce7; color: #166534; }
    .badge-yellow { background-color: #fef9c3; color: #854d0e; }
    .badge-red { background-color: #fee2e2; color: #991b1b; }
    .badge-blue { background-color: #dbeafe; color: #1e40af; }
  </style>
</head>
<body>
  ${preheader ? `<div class="preheader">${preheader}</div>` : ''}
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="brand-name">Ross Built</div>
        <div style="font-size: 14px; color: #71717a;">Home Care Management</div>
      </div>
      ${content}
      <div class="footer">
        <p>Ross Built Home Care</p>
        <p>Tampa Bay, Florida</p>
        <p style="margin-top: 16px; font-size: 12px;">
          <a href="{unsubscribe_url}">Manage notification preferences</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`
}

/**
 * Inspection scheduled email template
 */
export function getInspectionScheduledTemplate(vars: {
  client_name: string
  property_name: string
  property_address: string
  inspection_date: string
  inspection_time: string
  inspection_type: string
  inspector_name: string
  action_url: string
}): string {
  const content = `
    <h1>Inspection Scheduled</h1>
    <p>Hello ${vars.client_name},</p>
    <p>An inspection has been scheduled for your property. Here are the details:</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Property</span>
        <span class="info-value">${vars.property_name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Address</span>
        <span class="info-value">${vars.property_address}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date</span>
        <span class="info-value">${vars.inspection_date}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time</span>
        <span class="info-value">${vars.inspection_time}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Type</span>
        <span class="info-value">${vars.inspection_type}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Inspector</span>
        <span class="info-value">${vars.inspector_name}</span>
      </div>
    </div>

    <p>Please ensure the property is accessible at the scheduled time. If you need to reschedule, please contact us as soon as possible.</p>

    <div style="text-align: center;">
      <a href="${vars.action_url}" class="button">View in Portal</a>
    </div>
  `

  return getEmailLayout(content, `Inspection scheduled for ${vars.property_name} on ${vars.inspection_date}`)
}

/**
 * Inspection reminder email template
 */
export function getInspectionReminderTemplate(vars: {
  client_name: string
  property_name: string
  property_address: string
  inspection_date: string
  inspection_time: string
  inspector_name: string
  action_url: string
}): string {
  const content = `
    <h1>Inspection Tomorrow</h1>
    <p>Hello ${vars.client_name},</p>
    <p>This is a friendly reminder that your property inspection is scheduled for <strong>tomorrow</strong>.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Property</span>
        <span class="info-value">${vars.property_name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Address</span>
        <span class="info-value">${vars.property_address}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date</span>
        <span class="info-value">${vars.inspection_date}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time</span>
        <span class="info-value">${vars.inspection_time}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Inspector</span>
        <span class="info-value">${vars.inspector_name}</span>
      </div>
    </div>

    <p>Please ensure the property is accessible at the scheduled time.</p>

    <div style="text-align: center;">
      <a href="${vars.action_url}" class="button">View Details</a>
    </div>
  `

  return getEmailLayout(content, `Reminder: Inspection tomorrow at ${vars.property_name}`)
}

/**
 * Report ready email template
 */
export function getReportReadyTemplate(vars: {
  client_name: string
  property_name: string
  inspection_date: string
  overall_condition: string
  findings_summary: string
  recommendations_count: number
  report_url: string
  portal_url: string
}): string {
  const conditionBadge =
    vars.overall_condition === 'good'
      ? '<span class="badge badge-green">Good Condition</span>'
      : vars.overall_condition === 'fair'
      ? '<span class="badge badge-yellow">Fair Condition</span>'
      : '<span class="badge badge-red">Needs Attention</span>'

  const content = `
    <h1>Your Inspection Report is Ready</h1>
    <p>Hello ${vars.client_name},</p>
    <p>The inspection report for your property is now available.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Property</span>
        <span class="info-value">${vars.property_name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Inspection Date</span>
        <span class="info-value">${vars.inspection_date}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Overall Condition</span>
        <span class="info-value">${conditionBadge}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Recommendations</span>
        <span class="info-value">${vars.recommendations_count} item${vars.recommendations_count !== 1 ? 's' : ''}</span>
      </div>
    </div>

    <p>${vars.findings_summary}</p>

    <div style="text-align: center;">
      <a href="${vars.report_url}" class="button">Download Report (PDF)</a>
    </div>

    <p style="text-align: center; margin-top: 8px;">
      <a href="${vars.portal_url}" style="color: #166534;">View in client portal &rarr;</a>
    </p>
  `

  return getEmailLayout(content, `Your inspection report for ${vars.property_name} is ready`)
}

/**
 * Invoice created email template
 */
export function getInvoiceCreatedTemplate(vars: {
  client_name: string
  invoice_number: string
  amount: string
  due_date: string
  line_items: Array<{ description: string; amount: string }>
  payment_url: string
  portal_url: string
}): string {
  const lineItemsHtml = vars.line_items
    .map(
      (item) => `
      <div class="info-row">
        <span class="info-label">${item.description}</span>
        <span class="info-value">${item.amount}</span>
      </div>
    `
    )
    .join('')

  const content = `
    <h1>New Invoice</h1>
    <p>Hello ${vars.client_name},</p>
    <p>A new invoice has been created for your account.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Invoice #</span>
        <span class="info-value">${vars.invoice_number}</span>
      </div>
      ${lineItemsHtml}
      <div class="info-row" style="border-top: 2px solid #e4e4e7; margin-top: 8px; padding-top: 8px;">
        <span class="info-label" style="font-weight: 600;">Total Due</span>
        <span class="info-value" style="font-size: 18px;">${vars.amount}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Due Date</span>
        <span class="info-value">${vars.due_date}</span>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${vars.payment_url}" class="button">Pay Now</a>
    </div>

    <p style="text-align: center; margin-top: 8px;">
      <a href="${vars.portal_url}" style="color: #166534;">View in client portal &rarr;</a>
    </p>
  `

  return getEmailLayout(content, `Invoice #${vars.invoice_number} - ${vars.amount} due ${vars.due_date}`)
}

/**
 * Invoice overdue email template
 */
export function getInvoiceOverdueTemplate(vars: {
  client_name: string
  invoice_number: string
  amount: string
  due_date: string
  days_overdue: number
  payment_url: string
}): string {
  const content = `
    <h1 style="color: #991b1b;">Invoice Overdue</h1>
    <p>Hello ${vars.client_name},</p>
    <p>Your invoice is now <strong>${vars.days_overdue} day${vars.days_overdue !== 1 ? 's' : ''} overdue</strong>. Please remit payment at your earliest convenience to avoid any service interruption.</p>

    <div class="info-box" style="background-color: #fef2f2; border-color: #fecaca;">
      <div class="info-row">
        <span class="info-label">Invoice #</span>
        <span class="info-value">${vars.invoice_number}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Amount Due</span>
        <span class="info-value" style="font-size: 18px; color: #991b1b;">${vars.amount}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Original Due Date</span>
        <span class="info-value">${vars.due_date}</span>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${vars.payment_url}" class="button" style="background-color: #991b1b;">Pay Now</a>
    </div>

    <p style="font-size: 14px; color: #71717a;">If you've already made this payment, please disregard this notice. If you have any questions, please contact us.</p>
  `

  return getEmailLayout(content, `OVERDUE: Invoice #${vars.invoice_number} - ${vars.amount}`)
}

/**
 * Work order created email template
 */
export function getWorkOrderCreatedTemplate(vars: {
  recipient_name: string
  work_order_number: string
  property_name: string
  property_address: string
  category: string
  priority: string
  description: string
  action_url: string
}): string {
  const priorityBadge =
    vars.priority === 'urgent'
      ? '<span class="badge badge-red">Urgent</span>'
      : vars.priority === 'high'
      ? '<span class="badge badge-yellow">High Priority</span>'
      : '<span class="badge badge-blue">Normal</span>'

  const content = `
    <h1>New Work Order</h1>
    <p>Hello ${vars.recipient_name},</p>
    <p>A new work order has been created and requires attention.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Work Order #</span>
        <span class="info-value">${vars.work_order_number}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Property</span>
        <span class="info-value">${vars.property_name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Address</span>
        <span class="info-value">${vars.property_address}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Category</span>
        <span class="info-value">${vars.category}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Priority</span>
        <span class="info-value">${priorityBadge}</span>
      </div>
    </div>

    <p><strong>Description:</strong></p>
    <p style="background-color: #f4f4f5; padding: 12px; border-radius: 4px;">${vars.description}</p>

    <div style="text-align: center;">
      <a href="${vars.action_url}" class="button">View Work Order</a>
    </div>
  `

  return getEmailLayout(content, `Work Order #${vars.work_order_number} - ${vars.category}`)
}

/**
 * Payment received email template
 */
export function getPaymentReceivedTemplate(vars: {
  client_name: string
  amount: string
  invoice_number: string
  payment_method: string
  payment_date: string
  remaining_balance: string
}): string {
  const content = `
    <h1 style="color: #166534;">Payment Received</h1>
    <p>Hello ${vars.client_name},</p>
    <p>Thank you! We've received your payment.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Amount Received</span>
        <span class="info-value" style="font-size: 20px; color: #166534;">${vars.amount}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Invoice #</span>
        <span class="info-value">${vars.invoice_number}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Method</span>
        <span class="info-value">${vars.payment_method}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date</span>
        <span class="info-value">${vars.payment_date}</span>
      </div>
      ${
        vars.remaining_balance !== '$0.00'
          ? `
      <div class="info-row">
        <span class="info-label">Remaining Balance</span>
        <span class="info-value">${vars.remaining_balance}</span>
      </div>
      `
          : ''
      }
    </div>

    <p>We appreciate your business. If you have any questions about this payment, please don't hesitate to contact us.</p>
  `

  return getEmailLayout(content, `Payment received: ${vars.amount} - Thank you!`)
}

/**
 * Get template function by type
 */
export function getEmailTemplate(
  type: EmailTemplateType,
  variables: Record<string, unknown>
): string {
  const templateMap: Record<EmailTemplateType, (vars: Record<string, unknown>) => string> = {
    inspection_scheduled: (v) => getInspectionScheduledTemplate(v as Parameters<typeof getInspectionScheduledTemplate>[0]),
    inspection_reminder: (v) => getInspectionReminderTemplate(v as Parameters<typeof getInspectionReminderTemplate>[0]),
    inspection_completed: (v) => getReportReadyTemplate(v as Parameters<typeof getReportReadyTemplate>[0]),
    report_ready: (v) => getReportReadyTemplate(v as Parameters<typeof getReportReadyTemplate>[0]),
    work_order_created: (v) => getWorkOrderCreatedTemplate(v as Parameters<typeof getWorkOrderCreatedTemplate>[0]),
    work_order_status_update: (v) => getWorkOrderCreatedTemplate(v as Parameters<typeof getWorkOrderCreatedTemplate>[0]),
    work_order_completed: (v) => getWorkOrderCreatedTemplate(v as Parameters<typeof getWorkOrderCreatedTemplate>[0]),
    invoice_created: (v) => getInvoiceCreatedTemplate(v as Parameters<typeof getInvoiceCreatedTemplate>[0]),
    invoice_due_soon: (v) => getInvoiceCreatedTemplate(v as Parameters<typeof getInvoiceCreatedTemplate>[0]),
    invoice_overdue: (v) => getInvoiceOverdueTemplate(v as Parameters<typeof getInvoiceOverdueTemplate>[0]),
    payment_received: (v) => getPaymentReceivedTemplate(v as Parameters<typeof getPaymentReceivedTemplate>[0]),
    recommendation_approved: (v) => getEmailLayout(`<h1>Recommendation Approved</h1><p>${JSON.stringify(v)}</p>`),
    service_request_received: (v) => getEmailLayout(`<h1>Service Request Received</h1><p>${JSON.stringify(v)}</p>`),
    service_request_update: (v) => getEmailLayout(`<h1>Service Request Update</h1><p>${JSON.stringify(v)}</p>`),
    daily_digest: (v) => getEmailLayout(`<h1>Daily Summary</h1><p>${JSON.stringify(v)}</p>`),
    weekly_summary: (v) => getEmailLayout(`<h1>Weekly Summary</h1><p>${JSON.stringify(v)}</p>`),
  }

  const templateFn = templateMap[type]
  if (!templateFn) {
    return getEmailLayout(`<h1>Notification</h1><p>${JSON.stringify(variables)}</p>`)
  }

  return templateFn(variables)
}
