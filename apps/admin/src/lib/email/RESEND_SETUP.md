# Resend Email Setup

## Overview

This application uses [Resend](https://resend.com) for transactional email delivery.

## Setup Steps

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email address

### 2. Configure Domain (Production)

1. In Resend dashboard, go to **Domains**
2. Add your domain (e.g., `rossbuilt.com`)
3. Add the required DNS records:
   - SPF record
   - DKIM records (2)
   - Optional: DMARC record

### 3. Get API Key

1. In Resend dashboard, go to **API Keys**
2. Create a new API key with "Sending access"
3. Copy the key (starts with `re_`)

### 4. Configure Supabase

Add the following secrets to your Supabase project:

```bash
# Via Supabase CLI
supabase secrets set RESEND_API_KEY=re_your_api_key_here
supabase secrets set EMAIL_FROM="Ross Built <noreply@rossbuilt.com>"

# Or via Dashboard
# Go to: Project Settings > Edge Functions > Secrets
```

### 5. Deploy Edge Function

```bash
supabase functions deploy send-email --no-verify-jwt
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key | `re_123abc...` |
| `EMAIL_FROM` | Default sender address | `Ross Built <noreply@rossbuilt.com>` |

## Testing

### Test via curl

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello World</h1>"
  }'
```

### Test in Development

Use Resend's test email address for development:
- To: `delivered@resend.dev` (always succeeds)
- To: `bounced@resend.dev` (simulates bounce)

## Email Templates

Templates are defined in `apps/admin/src/lib/email/templates.ts`:

- `inspection_scheduled` - New inspection notification
- `inspection_reminder` - Day-before reminder
- `report_ready` - Inspection report available
- `invoice_created` - New invoice
- `invoice_overdue` - Overdue payment reminder
- `payment_received` - Payment confirmation
- `work_order_created` - New work order

## Rate Limits

| Plan | Rate Limit |
|------|------------|
| Free | 100 emails/day, 1 email/second |
| Pro | 50,000 emails/month, 10 emails/second |
| Growth | 100 emails/second |

## Webhooks (Optional)

To track email delivery:

1. In Resend dashboard, go to **Webhooks**
2. Add endpoint: `https://your-project.supabase.co/functions/v1/resend-webhook`
3. Select events: `email.sent`, `email.delivered`, `email.bounced`

## Troubleshooting

### Email not sending
- Check RESEND_API_KEY is set correctly
- Verify domain DNS records are propagated
- Check Resend dashboard for error logs

### Emails going to spam
- Ensure SPF, DKIM, DMARC are configured
- Avoid spam trigger words in subject/content
- Include unsubscribe link

### Rate limited
- Implement queuing for bulk sends
- Upgrade Resend plan if needed
