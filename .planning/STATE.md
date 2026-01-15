# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-14)

**Core value:** Inspections + Reports must work flawlessly — beautiful PDF reports that make clients feel their $500K+ home is being cared for by experts.
**Current focus:** Phase 5 — Templates & Checklists (IN PROGRESS)

## Current Position

Phase: 5 of 14 (Templates & Checklists)
Plan: 3 of 5 in current phase
Status: In progress
Last activity: 2026-01-15 - Completed 05-03-PLAN.md

Progress: ██████░░░░ 38% (22 of ~60 plans)

### Phase 5 Plans (IN PROGRESS)

| Plan | Name | Files | Status |
|------|------|-------|--------|
| 05-01 | Template Data Foundation | Types, constants | **Complete** |
| 05-02 | Template Validation & Hooks | Zod schemas, React Query CRUD | **Complete** |
| 05-03 | Checklist Generation Engine | Dynamic checklist builder | **Complete** |
| 05-04 | Template Management UI | Settings page, editor | Pending |
| 05-05 | Checklist Preview & Integration | Property page integration | Pending |

**Wave Structure:**
- Wave 1: 05-01 (no dependencies)
- Wave 2: 05-02, 05-03 (parallel - both depend on 05-01)
- Wave 3: 05-04 (depends on 05-02)
- Wave 4: 05-05 (depends on 05-03, 05-04 - integration)

### Phase 4 Plans (COMPLETE)

| Plan | Name | Files | Status |
|------|------|-------|--------|
| 04-01 | Pricing Foundation | Constants, validation schemas | **Complete** |
| 04-02 | Program & Pricing Hooks | React Query hooks for CRUD | **Complete** |
| 04-03 | Program Builder UI | 4-step wizard component | **Complete** |
| 04-04 | Program Status Card | View/manage programs | **Complete** |
| 04-05 | Settings & Integration | Pricing page, property integration | **Complete** |

**Wave Structure:**
- Wave 1: 04-01 (no dependencies)
- Wave 2: 04-02 (depends on 04-01)
- Wave 3: 04-03, 04-04 (parallel - both depend on 04-02)
- Wave 4: 04-05 (depends on 04-03, 04-04 - integration)

### Phase 3 Plans (COMPLETE)

| Plan | Name | Files | Status |
|------|------|-------|--------|
| 03-01 | Equipment Data Foundation | Constants, validation, hooks | **Complete** |
| 03-02 | AI Edge Function | Edge function, Claude API | **Complete** |
| 03-03 | Equipment UI Components | Form, List, Detail Sheet | **Complete** |
| 03-04 | Equipment Pages & Integration | Property detail integration | **Complete** |

## Performance Metrics

**Velocity:**
- Total plans completed: 20
- Average duration: 6 min
- Total execution time: 115 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 4/4 | 21 min | 5 min |
| 2 | 6/6 | 78 min | 13 min |
| 3 | 4/4 | 21 min | 5 min |
| 4 | 5/5 | 25 min | 5 min |

**Recent Trend:**
- Last 5 plans: 04-02 (4 min), 04-03 (7 min), 04-04 (5 min), 04-05 (6 min)
- Trend: Phase 4 completed efficiently, ready for Phase 5

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Tech stack locked: Supabase + React + TypeScript + shadcn/ui + Tailwind + Vercel
- PWA for mobile (React Native deferred)
- Ross Built first, SaaS-ready architecture
- **01-01**: Used existing Supabase project rossbuilt-homecare (qzbmnbinhxzkcwfjnmtb)
- **01-02**: Used partial unique index for one active program per property constraint
- **01-02**: Separated inspection_photos table for better querying
- **01-03**: Used JSONB for pricing config to allow flexible tier/addon structure
- **01-03**: Home manuals have UNIQUE constraint on property_id (one per property)
- **01-04**: Used SECURITY DEFINER functions for RLS helpers to ensure consistent org-based access
- **01-04**: Fixed UUID for Ross Built org (00000000-0000-0000-0000-000000000001) for consistent references
- **02-01**: Used Tailwind CSS v4 with @theme directive for CSS-first configuration
- **02-01**: Configured Ross Built brand colors (rb-green, rb-sand) as extended theme colors
- **02-01**: Created helper types (Tables, InsertTables, UpdateTables, Enums) for typed Supabase queries
- **02-02**: Added path aliases (@/ -> src/) for cleaner component imports
- **02-02**: Extended Badge and Toast with additional variants (success, warning, info)
- **02-03**: Used Zustand with persist middleware for auth and UI state
- **02-03**: AuthProvider pattern for app-level auth initialization
- **02-03**: Collapsible sidebar with persisted preference
- **02-05**: Used 24 boolean flags for property features with category-based organization
- **02-06**: React class-based ErrorBoundary for catching render errors
- **02-06**: Mobile sidebar as drawer with lg breakpoint (1024px)
- **02-06**: Skip link and ARIA landmarks for accessibility
- **03-02**: Used --no-verify-jwt for browser access (function validates via Supabase client)
- **03-02**: JSON extraction with regex to handle potential markdown wrapping from Claude
- **03-03**: Added Sheet UI component following shadcn/ui patterns
- **03-03**: Type assertion via unknown for JSON fields from database
- **03-04**: Equipment section as full-width section below property detail grid
- **04-02**: Used InsertTables type helper for type-safe Supabase inserts
- **04-02**: Handle PGRST116 (no rows) gracefully in usePropertyProgram
- **04-04**: Added AlertDialog UI component for destructive action confirmations
- **04-04**: Status badge color mapping pattern for program status display
- **04-03**: Used Resolver type cast for zod v4 compatibility with react-hook-form
- **04-03**: RadioGroup with sr-only items for card-based visual selection pattern
- **04-05**: Pricing link in sidebar bottom nav alongside Settings
- **04-05**: Program section positioned after Equipment on property detail page
- **05-02**: Used InspectionTier enum type from database for type-safe filtering
- **05-02**: Soft delete pattern with is_active = false (consistent with equipment hooks)

### Pending Todos

- ANTHROPIC_API_KEY needs to be set in Supabase Edge Function secrets (see .planning/phases/03-equipment-ai/03-USER-SETUP.md)

### Blockers/Concerns

**Resolved:**
- ~~Need Supabase project credentials~~ -> Using existing rossbuilt-homecare project

**Remaining:**
- Need SUPABASE_SERVICE_ROLE_KEY from dashboard (placeholder in .env.local)
- Need ANTHROPIC_API_KEY for AI edge function
- See ~/Downloads/home-care-os-docs/QUESTIONS_FOR_JAKE.md for full list

## Session Continuity

Last session: 2026-01-15
Stopped at: Completed Phase 4 (Programs & Pricing)
Resume file: None

## Next Action

Ready to execute Phase 5: Templates & Checklists
Run: `/gsd:execute-phase 5`
Reference: ~/Downloads/home-care-os-docs/phase-05-templates-checklists.md

## Phase 1 Summary

**Database Foundation Complete:**
- 28 tables across all domains (clients, properties, inspections, billing, etc.)
- 19 migrations applied to Supabase
- RLS policies on all tables with multi-tenant isolation
- 4 helper functions for access control
- Ross Built seed data with templates
- TypeScript types (6,123 lines) for full type safety

**Key Files Created:**
- supabase/migrations/001-019 - Complete database schema
- src/types/database.types.ts - Auto-generated TypeScript types

## Phase 2 Summary

**Admin App Foundation Complete:**
- React + TypeScript + Vite application with Tailwind v4
- 18 shadcn/ui components + 5 shared components
- Authentication with Supabase Auth (email/password)
- Zustand stores for auth and UI state
- Full Client CRUD (list, detail, create, edit, delete)
- Full Property CRUD with rich features (24 property features, access codes)
- Toast notifications for user feedback
- Error boundaries for graceful error handling
- Responsive mobile design with drawer sidebar
- Accessibility improvements (skip link, ARIA, keyboard nav)

**Key Files Created:**
- apps/admin/ - Complete admin application
- Components: components/ui/, components/layout/, components/shared/
- Pages: pages/clients/, pages/properties/, pages/auth/, pages/dashboard/
- Hooks: hooks/use-clients.ts, hooks/use-properties.ts, hooks/use-toast.ts
- Stores: stores/auth-store.ts, stores/ui-store.ts
- Validations: lib/validations/client.ts, lib/validations/property.ts

## Phase 3 Summary

**Equipment & AI Complete:**
- Equipment data foundation with 9 categories and types
- AI Edge Function for generating maintenance schedules via Claude API
- Equipment UI components (form, list, detail sheet)
- Full integration into property detail page
- 4-tab detail view (Details, Maintenance, Checklist, Troubleshooting)

**Key Files Created:**
- apps/admin/src/lib/constants/equipment.ts - Equipment categories and types
- apps/admin/src/lib/validations/equipment.ts - Zod schema for equipment
- apps/admin/src/hooks/use-equipment.ts - React Query hooks for CRUD + AI
- apps/admin/src/components/ui/sheet.tsx - Sheet UI component
- apps/admin/src/pages/properties/components/equipment-form.tsx - Equipment form dialog
- apps/admin/src/pages/properties/components/equipment-list.tsx - Grouped equipment list
- apps/admin/src/pages/properties/components/equipment-detail-sheet.tsx - 4-tab detail sheet
- supabase/functions/generate-equipment-maintenance/ - AI edge function

## Phase 4 Summary

**Programs & Pricing Complete:**
- Pricing foundation with constants and validation schemas
- Program and pricing React Query hooks for CRUD operations
- 4-step Program Builder wizard with real-time pricing calculation
- Program Status Card for viewing and managing programs (pause/resume/cancel)
- Pricing Settings page for admin configuration
- Full integration into property detail page

**Key Files Created:**
- apps/admin/src/lib/constants/pricing.ts - Pricing tiers, frequencies, add-ons
- apps/admin/src/lib/validations/pricing.ts - Pricing config schema
- apps/admin/src/lib/validations/program.ts - Program form schema
- apps/admin/src/hooks/use-pricing.ts - Pricing config hooks with calculateProgramPrice
- apps/admin/src/hooks/use-programs.ts - Program CRUD and lifecycle hooks
- apps/admin/src/components/ui/radio-group.tsx - RadioGroup component
- apps/admin/src/components/ui/alert-dialog.tsx - AlertDialog component
- apps/admin/src/components/programs/program-builder.tsx - 4-step wizard
- apps/admin/src/components/programs/program-status-card.tsx - Status card with actions
- apps/admin/src/pages/settings/pricing.tsx - Pricing configuration page

