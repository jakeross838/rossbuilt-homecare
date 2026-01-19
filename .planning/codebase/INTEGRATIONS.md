# External Integrations

**Analysis Date:** 2026-01-19

## APIs & External Services

**AI/ML:**
- Anthropic Claude - AI-powered features via Supabase Edge Functions
  - SDK/Client: Called via `supabase.functions.invoke()`
  - Edge Functions: `generate-equipment-ai`, `generate-report-summary`
  - Auth: `ANTHROPIC_API_KEY` (Supabase Edge Function secret)
  - Usage: Equipment maintenance schedule generation, inspection report AI summaries

**Payment Processing:**
- Stripe - Payment link generation and webhook processing
  - SDK/Client: Called via Supabase Edge Functions
  - Edge Functions: `create-payment-link`, `stripe-webhook`
  - Auth: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (Supabase secrets)
  - Client hook: `apps/admin/src/hooks/use-stripe.ts`
  - Features: Invoice payment links, payment status webhooks

**Email Delivery:**
- Resend - Transactional email delivery
  - SDK/Client: Called via Supabase Edge Function `send-email`
  - Auth: `RESEND_API_KEY` (Supabase Edge Function secret)
  - Client hook: `apps/admin/src/hooks/use-email.ts`
  - Templates: `apps/admin/src/lib/email/templates.ts`
  - Email types: inspection scheduled, inspection reminder, report ready, invoice created, invoice overdue, payment received, work order notifications

## Data Storage

**Primary Database:**
- Supabase PostgreSQL 17
  - Connection: `VITE_SUPABASE_URL`
  - Client: `@supabase/supabase-js` (`apps/admin/src/lib/supabase.ts`)
  - ORM: Direct Supabase query builder (no separate ORM)
  - Types: Auto-generated via `supabase gen types typescript` -> `src/types/database.ts`
  - Migrations: `supabase/migrations/` (23 migration files)

**Database Schema (key tables):**
- `organizations`, `users` - Multi-tenant auth
- `clients`, `properties`, `equipment` - Core domain
- `programs`, `inspection_templates` - Configuration
- `inspections`, `inspection_items` - Inspection workflow
- `recommendations`, `work_orders` - Follow-up actions
- `invoices`, `payments` - Billing
- `vendors` - Contractor management
- `notifications`, `activity_log` - Audit/notifications

**File Storage:**
- Supabase Storage
  - Buckets: `inspection-photos`, `inspection-reports`
  - Client: `supabase.storage.from('bucket-name')`
  - Usage: Inspection photos upload, PDF report storage
  - PDF upload: `apps/admin/src/lib/pdf/generate-pdf.ts`

**Offline/Local Storage:**
- IndexedDB via `idb` library
  - Database name: `rossbuilt-offline`
  - Implementation: `apps/admin/src/lib/offline/db.ts`
  - Stores: `inspections`, `pendingFindings`, `pendingPhotos`, `pendingCompletions`, `syncMeta`
  - Purpose: Offline inspection execution, photo capture, sync queue

**Caching:**
- TanStack Query in-memory cache (client-side)
- Workbox runtime caching for Supabase API calls (PWA service worker)
  - Cache name: `supabase-api`
  - Strategy: NetworkFirst with 10s timeout
  - Max entries: 100, Max age: 1 hour

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in)
  - Implementation: `apps/admin/src/stores/auth-store.ts`
  - Methods: Email/password sign-in
  - Session: Persisted via Supabase client, auto-refresh enabled
  - User profile: Stored in `users` table, linked to `auth.users`

**Auth Configuration (from `supabase/config.toml`):**
- JWT expiry: 3600 seconds (1 hour)
- Refresh token rotation: Enabled
- Signup: Enabled
- Anonymous sign-ins: Disabled
- Email confirmations: Disabled
- Minimum password length: 6

**Multi-tenancy:**
- Organization-based isolation via `organization_id` on all tables
- Row Level Security (RLS) policies: `supabase/migrations/018_rls_policies.sql`

**Portal Authentication:**
- Separate client portal auth flow
- Hooks: `apps/admin/src/hooks/use-portal-auth.ts`

## Monitoring & Observability

**Error Tracking:**
- None configured (Sentry recommended in `DEPLOYMENT.md`)

**Logs:**
- Console logging throughout application
- Realtime subscription logging: `[Realtime] Subscription status: ...`
- Supabase Edge Function logs available in Supabase Dashboard

**Analytics:**
- Vercel Analytics (recommended, built-in)
- Supabase Analytics enabled (postgres backend, port 54327)

## CI/CD & Deployment

**Hosting:**
- Vercel - Admin frontend (`apps/admin/`)
  - Config: `apps/admin/vercel.json`
  - Framework: Vite
  - Build command: `npm run build`
  - Output: `dist/`

**Backend:**
- Supabase (managed)
  - Database migrations: `supabase db push`
  - Edge Functions: `supabase functions deploy <function-name>`
  - Local development: `supabase start`

**CI Pipeline:**
- Not explicitly configured
- Vercel auto-deploys on git push
- Manual Edge Function deployment via Supabase CLI

## Environment Configuration

**Frontend (Vercel) - Required:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://app.yourdomain.com
```

**Edge Functions (Supabase Secrets) - Optional:**
```
ANTHROPIC_API_KEY=sk-ant-...      # AI features
STRIPE_SECRET_KEY=sk_live_...     # Payment processing
STRIPE_WEBHOOK_SECRET=whsec_...   # Webhook validation
RESEND_API_KEY=re_...             # Email delivery
APP_URL=https://app.yourdomain.com # Payment redirects
```

**Local Development:**
- `.env.local` in `apps/admin/` for frontend
- `.env.supabase` in root for Supabase CLI
- `supabase/config.toml` for local Supabase services

## Realtime Features

**Supabase Realtime:**
- Implementation: `apps/admin/src/hooks/use-realtime-sync.ts`
- Subscribed tables: clients, properties, equipment, work_orders, inspections, invoices, service_requests, vendors, reminders, calendar_events
- Events: INSERT, UPDATE, DELETE
- Filter: `organization_id=eq.${orgId}`
- Cache invalidation: Automatic via TanStack Query

## Webhooks & Callbacks

**Incoming:**
- Stripe webhook endpoint: `stripe-webhook` Edge Function
  - Purpose: Payment status updates, subscription events
  - Validation: `STRIPE_WEBHOOK_SECRET`

**Outgoing:**
- Email notifications via Resend (triggered by app events)
- No other outgoing webhooks detected

## Edge Functions

**Deployed Functions (from `DEPLOYMENT.md`):**
| Function | Purpose | Required Secrets |
|----------|---------|------------------|
| `generate-equipment-ai` | AI equipment schedules | `ANTHROPIC_API_KEY` |
| `generate-report-summary` | AI report summaries | `ANTHROPIC_API_KEY` |
| `create-payment-link` | Stripe payment URLs | `STRIPE_SECRET_KEY`, `APP_URL` |
| `stripe-webhook` | Payment webhooks | `STRIPE_WEBHOOK_SECRET` |
| `send-email` | Email delivery | `RESEND_API_KEY` |

**Invocation Pattern:**
```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* payload */ }
})
```

## PWA Integration

**Service Worker:**
- Generated by vite-plugin-pwa with Workbox
- Registration: Prompt-based updates
- Caching: Static assets + Supabase API responses
- Config: `apps/admin/vite.config.ts`

**Manifest:**
- Location: `apps/admin/public/manifest.json`
- Icons: `apps/admin/public/icons/`

---

*Integration audit: 2026-01-19*
