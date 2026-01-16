import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string | string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  html: string
  text?: string
  reply_to?: string
  attachments?: Array<{
    filename: string
    content: string
  }>
  // Tracking
  notification_id?: string
  organization_id?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payload: EmailRequest = await req.json()

    // Validate required fields
    if (!payload.to || !payload.subject || !payload.html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare Resend request
    const fromEmail = Deno.env.get('EMAIL_FROM') || 'Ross Built <noreply@rossbuilt.com>'

    const resendPayload = {
      from: fromEmail,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.subject,
      html: payload.html,
      text: payload.text || stripHtml(payload.html),
      reply_to: payload.reply_to,
      attachments: payload.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    }

    // Send via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendPayload),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', result)

      // Update notification status if tracking
      if (payload.notification_id) {
        await updateNotificationStatus(payload.notification_id, false, result.message)
      }

      return new Response(
        JSON.stringify({ error: result.message || 'Failed to send email' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update notification status if tracking
    if (payload.notification_id) {
      await updateNotificationStatus(payload.notification_id, true)
    }

    // Log to activity if org provided
    if (payload.organization_id) {
      await logEmailSent(payload.organization_id, payload.to, payload.subject)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_id: result.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Email send error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Update notification record with email status
 */
async function updateNotificationStatus(
  notificationId: string,
  success: boolean,
  error?: string
) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabase
      .from('notifications')
      .update({
        email_sent: success,
        email_sent_at: success ? new Date().toISOString() : null,
      })
      .eq('id', notificationId)
  } catch (err) {
    console.error('Failed to update notification status:', err)
  }
}

/**
 * Log email sent to activity log
 */
async function logEmailSent(
  organizationId: string,
  recipients: string | string[],
  subject: string
) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabase.from('activity_log').insert({
      organization_id: organizationId,
      action: 'sent',
      entity_type: 'email',
      entity_id: crypto.randomUUID(),
      entity_name: subject,
      metadata: {
        recipients: Array.isArray(recipients) ? recipients : [recipients],
        sent_at: new Date().toISOString(),
      },
    })
  } catch (err) {
    console.error('Failed to log email activity:', err)
  }
}
