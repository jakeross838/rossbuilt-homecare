# Claude Project Instructions

## Prime Directive
Never say "done" until the code is verified working. Assume nothing. Test everything.

---

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

---

## Phase 1: Before Writing Any Code

### Understand First
1. Read all relevant existing files completely
2. Identify every function/component the new code must interact with
3. List the imports, variables, and data structures you'll need to use
4. State your approach and what "working" looks like

### Ask Yourself
- What existing code does this touch?
- What could break?
- What inputs does this need? What outputs should it produce?

---

## Phase 2: While Writing Code

### Build Incrementally
1. Write the smallest testable piece first
2. Run it and confirm it works before adding more
3. If it fails, stop and fix before continuing

### Integration Checkpoints
- Every function that calls another function: verify the called function exists and returns what you expect
- Every variable from another file: verify it's exported and imported correctly
- Every database/API call: verify the endpoint/table exists and the shape matches

---

## Phase 3: After Writing Code

### Mandatory Verification Loop
```
1. Run the code
2. Did it work?
   - YES → Test edge cases → Move to step 3
   - NO → Read the EXACT error message → Fix ONLY that issue → Go to step 1
3. Manually trace through: does data flow correctly from start to finish?
4. Test the feature as a user would
5. Confirm no existing functionality broke
```

### Before Saying "Done"
- [ ] Code executes without errors
- [ ] Feature works end-to-end (not just "should work")
- [ ] Tested with real/realistic data
- [ ] Integrations verified (buttons trigger functions, functions hit DB, DB returns to UI)
- [ ] Existing features still work
- [ ] Console is clean (no warnings/errors)

---

## Rules

### Never Do
- Say "this should work" without running it
- Rewrite working code to fix unrelated issues
- Assume imports, exports, or function signatures
- Move to the next task while current task is broken
- Guess at fixes without reading the error

### Always Do
- Read files before editing them
- Run code after every meaningful change
- Fix the actual error, not what you think the error might be
- Verify integrations at boundaries (component→function→database→response→UI)
- Test the happy path AND at least one error case

---

## Debugging Protocol

When something fails:
1. Copy the exact error message
2. Identify the file and line number
3. Read the surrounding code
4. Identify the single root cause
5. Make the minimal fix
6. Run again
7. If new error, repeat. If same error, your fix didn't work—try different approach
8. Do NOT refactor or "clean up" while debugging

---

## Integration Testing Checklist

For any feature that connects multiple parts:
- [ ] UI element renders
- [ ] UI element responds to interaction (click, input, etc.)
- [ ] Handler function is called (add console.log to verify)
- [ ] Handler calls service/API correctly
- [ ] Service/API returns expected data (log the response)
- [ ] Response is processed correctly
- [ ] UI updates with the result
- [ ] Error states handled and displayed
