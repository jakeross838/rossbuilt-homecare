# Claude Project Instructions

## Project Overview
Home Care OS - Complete operating system for luxury home care companies. Built for Ross Built, architected for SaaS scale.

## Quick Start
```bash
# Start dev server
cd apps/admin && npm run dev
# Opens at http://localhost:5173
```

## Supabase CLI Setup

Credentials are stored in `.env.supabase` (gitignored). To run Supabase CLI commands:

```bash
# Option 1: Use the helper script
./scripts/supabase-cli.sh db push
./scripts/supabase-cli.sh functions deploy

# Option 2: Export manually then run commands
export SUPABASE_ACCESS_TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env.supabase | cut -d '=' -f2)
npx supabase db push
npx supabase functions deploy
```

## Project References
- **Project Ref:** qzbmnbinhxzkcwfjnmtb
- **Dashboard:** https://supabase.com/dashboard/project/qzbmnbinhxzkcwfjnmtb
- **GitHub:** https://github.com/jakeross838/rossbuilt-homecare

## Key Directories
- `apps/admin/` - Main admin React app (Vite + TypeScript)
- `supabase/migrations/` - Database migrations (22 total)
- `supabase/functions/` - Edge Functions (5 deployed)
- `.planning/` - Project roadmap, plans, and documentation

## Edge Functions
1. `create-payment-link` - Stripe payment links
2. `generate-equipment-ai` - AI equipment maintenance generation
3. `generate-report-summary` - AI report summaries
4. `send-email` - Email notifications via Resend
5. `stripe-webhook` - Stripe webhook handler

## Common Tasks

### Deploy to Supabase
```bash
cd "P:/Claude Projects/home-care-os"
export SUPABASE_ACCESS_TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env.supabase | cut -d '=' -f2)
npx supabase db push          # Push migrations
npx supabase functions deploy  # Deploy edge functions
```

### Push to GitHub
```bash
git add -A && git commit -m "message" && git push origin main
```
