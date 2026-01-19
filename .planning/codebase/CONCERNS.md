# Codebase Concerns

**Analysis Date:** 2025-01-19

## Tech Debt

**Incomplete Feature - Reschedule Dialog:**
- Issue: TODO comment indicates reschedule functionality not implemented
- Files: `apps/admin/src/components/calendar/inspection-detail-sheet.tsx:248`
- Impact: Users cannot reschedule inspections from calendar detail view, must cancel and recreate
- Fix approach: Implement RescheduleInspectionDialog component using existing `useRescheduleInspection` hook

**Offline Inspection Completion Not Fully Supported:**
- Issue: Inspection completion throws error when offline instead of queueing
- Files: `apps/admin/src/hooks/use-inspection-execution.ts:264`
- Impact: Inspectors cannot complete inspections without connectivity
- Fix approach: Add `pendingCompletions` store handling, already defined in `apps/admin/src/lib/offline/db.ts:54-63`

**Type Assertion Workarounds:**
- Issue: Using `any` type in several locations to work around TypeScript limitations
- Files:
  - `apps/admin/src/lib/offline/sync.ts:150` - Background sync registration
  - `apps/admin/src/hooks/use-realtime-sync.ts:20` - Callback payload type
  - `supabase/functions/create-payment-link/index.ts:111` - Line items mapping
- Impact: Type safety compromised, runtime errors possible
- Fix approach: Create proper type definitions for SyncManager API and Supabase payloads

**Console Logging in Production Code:**
- Issue: Numerous console.log/warn/error statements throughout codebase
- Files:
  - `apps/admin/src/stores/auth-store.ts:53,84,127,145,151`
  - `apps/admin/src/hooks/use-realtime-sync.ts:51,67,83,92,97`
  - `apps/admin/src/hooks/use-photo-capture.tsx:106,142,145`
  - `apps/admin/src/lib/pwa.ts:23,26`
- Impact: Clutters browser console, potential information leakage in production
- Fix approach: Implement proper logging service with environment-based filtering

**Map View Placeholder:**
- Issue: Property detail page shows "Map view (coming soon)" placeholder
- Files: `apps/admin/src/pages/properties/[id]/index.tsx:182-184`
- Impact: Missing expected feature for property visualization
- Fix approach: Integrate mapping library (Mapbox/Google Maps) with property coordinates

## Known Bugs

**Empty Error Messages on Catch:**
- Issue: Several catch blocks show generic error messages without logging original error
- Files:
  - `apps/admin/src/components/calendar/inspection-detail-sheet.tsx:89,106`
  - `apps/admin/src/pages/settings/profile.tsx:106-112,123-129`
- Symptoms: Users see "Failed to..." messages with no actionable information
- Trigger: Any API error during inspector assignment or profile updates
- Workaround: Check browser network tab for actual error
- Fix approach: Log error details and/or include error message in toast

**Payment Failure Notification Missing:**
- Issue: Stripe webhook handles payment failures with only console.log, no user notification
- Files: `supabase/functions/stripe-webhook/index.ts:130-138`
- Symptoms: Failed payments go unnoticed by admins
- Trigger: Credit card decline or payment failure
- Fix approach: Create notification record and/or email alert on payment failure

## Security Considerations

**Sensitive Environment File Committed:**
- Risk: `.env.local` contains real Supabase anon key (though public, sets bad precedent)
- Files: `P:/Claude Projects/home-care-os/.env.local`
- Current mitigation: Anon key is designed to be public, RLS policies protect data
- Recommendations:
  - Remove `.env.local` from repo, only keep `.env.local.example`
  - Ensure `.gitignore` includes `.env.local` (it does, but file may have been committed before)

**WiFi Password and Access Codes Storage:**
- Risk: Sensitive property access information stored in database
- Files:
  - `apps/admin/src/pages/properties/[id]/index.tsx:299-363` (display)
  - `supabase/migrations/004_properties.sql` (schema)
- Current mitigation: RLS policies restrict access to organization members, UI hides codes by default
- Recommendations: Consider encryption at rest for sensitive fields, audit logging for code access

**Test Credentials in E2E Tests:**
- Risk: Test password visible in test files
- Files:
  - `apps/admin/e2e/auth.setup.ts:14`
  - `apps/admin/e2e/authenticated-features.spec.ts:5`
  - `apps/admin/e2e/comprehensive.spec.ts:5`
  - `apps/admin/e2e/settings.spec.ts:5`
- Current mitigation: Test account uses simple password, separate from production
- Recommendations: Move test credentials to environment variables

**CORS Wildcard in Edge Functions:**
- Risk: All Supabase edge functions use `Access-Control-Allow-Origin: *`
- Files:
  - `supabase/functions/stripe-webhook/index.ts:6`
  - `supabase/functions/send-email/index.ts:6`
  - `supabase/functions/generate-report-summary/index.ts:5`
  - `supabase/functions/create-payment-link/index.ts:7`
- Current mitigation: Functions still require authentication via headers
- Recommendations: Restrict CORS to specific domains in production

## Performance Bottlenecks

**Large Property Detail Page Queries:**
- Problem: Property detail page makes multiple sequential queries
- Files: `apps/admin/src/pages/properties/[id]/index.tsx:47-58`
- Cause: Separate queries for property, program, and checklist generation
- Improvement path: Combine into single query with joins, or use React Query parallel queries

**Inspection Calendar N+1 Potential:**
- Problem: Calendar queries all inspections, then frontend filters
- Files: `apps/admin/src/hooks/use-inspections.ts:30-86`
- Cause: Query fetches by date range without inspector filter
- Improvement path: Add server-side filtering, pagination for large datasets

**IndexedDB Sync Operations:**
- Problem: Sync iterates through all pending items one at a time
- Files: `apps/admin/src/lib/offline/sync.ts:47-78`
- Cause: Sequential photo uploads instead of batched
- Improvement path: Use Promise.all with concurrency limit for parallel uploads

## Fragile Areas

**Checklist Generation:**
- Files:
  - `apps/admin/src/hooks/use-inspection-execution.ts:35-88`
  - `apps/admin/src/lib/checklist-generator.ts`
- Why fragile: Complex logic combining property features, equipment, and program tier
- Safe modification: Add comprehensive unit tests before changing
- Test coverage: No unit tests detected for checklist generation

**Auth State Initialization:**
- Files: `apps/admin/src/stores/auth-store.ts:45-87`
- Why fragile: Race conditions possible between session check and auth listener setup
- Safe modification: Ensure auth listener registered before any async operations
- Test coverage: E2E tests cover login flow, no unit tests

**Offline Data Sync:**
- Files:
  - `apps/admin/src/lib/offline/db.ts`
  - `apps/admin/src/lib/offline/sync.ts`
- Why fragile: Complex state management across IndexedDB, Supabase, and UI
- Safe modification: Test offline scenarios thoroughly before changes
- Test coverage: No automated offline tests

## Scaling Limits

**Single Organization Per Instance:**
- Current capacity: App designed for multi-tenant but no org switching UI
- Limit: Users belong to one organization
- Scaling path: Add organization switcher for users in multiple orgs

**Inspector Workload View:**
- Current capacity: Lists all inspectors with counts
- Limit: May become slow with 50+ inspectors
- Scaling path: Add pagination, search, and filter options

**Photo Storage:**
- Current capacity: All photos uploaded to single Supabase storage bucket
- Limit: Storage costs scale linearly with inspection volume
- Scaling path: Implement image compression, archival policy for old photos

## Dependencies at Risk

**None Critical Detected**
- Dependencies appear well-maintained (React 18, Supabase, TanStack Query)
- Stripe SDK version 14.10.0 is recent

## Missing Critical Features

**No Unit Tests:**
- Problem: Zero `.test.ts` or `.spec.ts` unit test files in source code
- Blocks: Confident refactoring, regression prevention
- Files: Only E2E tests in `apps/admin/e2e/`

**No Error Boundary Recovery:**
- Problem: Error boundaries show error message but no recovery action
- Files: `apps/admin/src/components/shared/error-boundary.tsx`
- Blocks: Users must manually refresh after errors

**No Rate Limiting on Edge Functions:**
- Problem: Supabase edge functions have no rate limiting
- Files: `supabase/functions/*`
- Blocks: Protection against abuse

## Test Coverage Gaps

**Offline Functionality:**
- What's not tested: IndexedDB operations, sync logic, offline UI states
- Files: `apps/admin/src/lib/offline/*.ts`, `apps/admin/src/hooks/use-inspection-execution.ts`
- Risk: Offline bugs could cause data loss
- Priority: High

**Payment Processing:**
- What's not tested: Stripe webhook handlers, payment recording
- Files: `supabase/functions/stripe-webhook/index.ts`, `supabase/functions/create-payment-link/index.ts`
- Risk: Payment errors could go undetected
- Priority: High

**Checklist Generation Logic:**
- What's not tested: Feature-to-checklist mapping, equipment integration
- Files: `apps/admin/src/lib/checklist-generator.ts`
- Risk: Missing checklist items for specific property configurations
- Priority: Medium

**Form Validations:**
- What's not tested: Zod schema edge cases
- Files: `apps/admin/src/lib/validations/*.ts`
- Risk: Invalid data submission
- Priority: Medium

**PDF Report Generation:**
- What's not tested: PDF rendering, content accuracy
- Files: `apps/admin/src/lib/pdf/*.ts`
- Risk: Malformed reports sent to clients
- Priority: Medium

---

*Concerns audit: 2025-01-19*
