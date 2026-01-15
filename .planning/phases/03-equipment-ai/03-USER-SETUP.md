# Phase 03: User Setup Required

**Generated:** 2026-01-15
**Phase:** 03-equipment-ai
**Status:** Incomplete

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [ ] | `ANTHROPIC_API_KEY` | Anthropic Console -> API Keys -> Create key | Supabase Edge Function Secrets |

## Account Setup

- [ ] **Anthropic Account**
  - URL: https://console.anthropic.com
  - Skip if: Already have Anthropic account with API access
  - Steps:
    1. Sign up or log in at https://console.anthropic.com
    2. Navigate to API Keys section
    3. Create a new API key
    4. Copy the key (it won't be shown again)

## Setting the Secret

The ANTHROPIC_API_KEY must be set as a Supabase Edge Function secret.

**Option 1: Via Supabase CLI**
```bash
cd supabase
npx supabase login
npx supabase secrets set ANTHROPIC_API_KEY=your-key-here
```

**Option 2: Via Supabase Dashboard**
1. Go to https://supabase.com/dashboard/project/qzbmnbinhxzkcwfjnmtb/settings/functions
2. Click on "Edge Function Secrets"
3. Add a new secret:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key

## Verification

After setting the secret, test the edge function:

```bash
# Get the project URL
curl -X POST \
  'https://qzbmnbinhxzkcwfjnmtb.supabase.co/functions/v1/generate-equipment-ai' \
  -H 'Content-Type: application/json' \
  -d '{"equipment_id": "test"}'
```

Expected response (before setting key):
```json
{"error":"ANTHROPIC_API_KEY not configured"}
```

Expected response (after setting key, with invalid equipment_id):
```json
{"error":"Equipment not found: ..."}
```

---
**Once all items complete:** Mark status as "Complete"
