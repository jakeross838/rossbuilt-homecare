# Stripe Integration Setup

## Prerequisites

1. Stripe account (https://stripe.com)
2. Supabase project with Edge Functions enabled

## Configuration Steps

### 1. Get Stripe API Keys

1. Log into Stripe Dashboard
2. Go to Developers > API Keys
3. Copy your Secret Key (starts with `sk_`)
4. For production, use live keys; for testing, use test keys

### 2. Set Supabase Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set APP_URL=https://your-app-url.com
```

### 3. Configure Webhook Endpoint

1. In Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. Enter URL: `https://[project-ref].supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the Signing Secret (starts with `whsec_`)
6. Set as `STRIPE_WEBHOOK_SECRET` in Supabase

### 4. Deploy Edge Functions

```bash
supabase functions deploy create-payment-link --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
```

### 5. Test the Integration

1. Create a test invoice
2. Generate a payment link
3. Complete payment with Stripe test card: 4242 4242 4242 4242
4. Verify invoice status updates to "paid"

## Test Cards

- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Requires Auth: 4000 0025 0000 3155

Use any future expiry date and any 3-digit CVC.
