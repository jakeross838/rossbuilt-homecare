# Home Care OS - Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Project** - An existing Supabase project with:
   - PostgreSQL database with migrations applied
   - Authentication configured
   - Storage buckets created (`inspection-photos`, `inspection-reports`)
   - Edge Functions deployed

2. **Vercel Account** - For hosting the admin application

3. **External Services** (optional but recommended):
   - Anthropic API key (for AI features)
   - Stripe account (for payment processing)
   - Resend account (for email delivery)

---

## Deployment Steps

### Step 1: Configure Supabase

#### 1.1 Database Setup
```bash
# From project root
cd supabase
supabase db push
```

#### 1.2 Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy generate-equipment-ai
supabase functions deploy generate-report-summary
supabase functions deploy create-payment-link
supabase functions deploy stripe-webhook
supabase functions deploy send-email
```

#### 1.3 Set Edge Function Secrets
In Supabase Dashboard > Edge Functions > Secrets, add:

| Secret Name | Description |
|------------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key for AI features |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend API key for emails |
| `APP_URL` | Your deployed app URL (e.g., https://app.rossbuilt.com) |

### Step 2: Deploy to Vercel

#### 2.1 Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set the root directory to `apps/admin`

#### 2.2 Configure Environment Variables
In Vercel Project Settings > Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview |
| `VITE_APP_URL` | Your deployed URL | Production |

#### 2.3 Deploy
```bash
# Using Vercel CLI (optional)
cd apps/admin
vercel --prod
```

Or push to your connected branch to trigger automatic deployment.

---

## Post-Deployment Checklist

### Verify Core Functionality
- [ ] Login/logout works
- [ ] Dashboard loads with data
- [ ] Navigation works (all routes accessible)
- [ ] PWA installs correctly on mobile

### Verify Features
- [ ] Client CRUD operations
- [ ] Property management
- [ ] Calendar scheduling
- [ ] Inspection execution (mobile)
- [ ] Report generation
- [ ] Billing/invoices
- [ ] Client portal access

### Verify Integrations
- [ ] AI equipment generation works (requires ANTHROPIC_API_KEY)
- [ ] AI report summaries work
- [ ] Stripe payment links work (requires STRIPE keys)
- [ ] Email notifications send (requires RESEND_API_KEY)

---

## Troubleshooting

### Build Failures
1. Check that all dependencies are installed: `npm install`
2. Verify TypeScript compiles: `npm run build:typecheck`
3. Check for missing environment variables

### Edge Function Errors
1. Check function logs in Supabase Dashboard
2. Verify all secrets are configured
3. Test function locally: `supabase functions serve`

### PWA Issues
1. Clear browser cache and service worker
2. Verify `manifest.json` is accessible
3. Check HTTPS is enabled (required for PWA)

### Database Connection Issues
1. Verify `VITE_SUPABASE_URL` is correct
2. Check RLS policies allow access
3. Verify API keys are valid

---

## Environment Summary

### Frontend (Vercel)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Public anonymous key |
| `VITE_APP_URL` | Yes | Deployed application URL |

### Edge Functions (Supabase)
| Secret | Required | Feature |
|--------|----------|---------|
| `ANTHROPIC_API_KEY` | For AI | Equipment AI, Report summaries |
| `STRIPE_SECRET_KEY` | For payments | Payment link generation |
| `STRIPE_WEBHOOK_SECRET` | For payments | Webhook validation |
| `RESEND_API_KEY` | For email | Email notifications |
| `APP_URL` | For payments | Payment redirect URLs |

---

## Rollback Procedure

### Vercel Rollback
1. Go to Vercel Dashboard > Deployments
2. Find the previous stable deployment
3. Click "..." > "Promote to Production"

### Database Rollback
```bash
# List migrations
supabase migration list

# Revert last migration
supabase migration repair <version> --status reverted
supabase db reset
```

---

## Monitoring

### Recommended Monitoring Setup
1. **Vercel Analytics** - Built-in, enable in project settings
2. **Supabase Logs** - Database and Edge Function logs
3. **Error Tracking** - Consider adding Sentry for production

### Key Metrics to Watch
- Page load time
- API response times
- Error rates
- Edge Function execution time
