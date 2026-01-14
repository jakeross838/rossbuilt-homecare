# Phase 01: User Setup Required

**Generated:** 2026-01-14
**Phase:** 01-database-auth
**Status:** Partially Complete

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [x] | `NEXT_PUBLIC_SUPABASE_URL` | Already configured | `.env.local` |
| [x] | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Already configured | `.env.local` |
| [ ] | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Project Settings > API > service_role key | `.env.local` |

## Dashboard Configuration

- [x] **Supabase project exists**
  - Project: rossbuilt-homecare
  - ID: qzbmnbinhxzkcwfjnmtb
  - Region: us-east-1
  - Status: ACTIVE_HEALTHY

## Remaining Setup

1. Get the service role key from Supabase Dashboard:
   - Go to: https://supabase.com/dashboard/project/qzbmnbinhxzkcwfjnmtb/settings/api
   - Copy the `service_role` key (keep this secret!)
   - Paste into `home-care-os/.env.local` replacing `YOUR_SERVICE_ROLE_KEY_HERE`

## Verification

After adding the service role key, verify setup works:

```bash
cd home-care-os
# Check env vars are set
cat .env.local | grep SUPABASE
```

---
**Once all items complete:** Mark status as "Complete"
