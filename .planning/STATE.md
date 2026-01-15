# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-14)

**Core value:** Inspections + Reports must work flawlessly — beautiful PDF reports that make clients feel their $500K+ home is being cared for by experts.
**Current focus:** Phase 3 — Equipment & AI (IN PROGRESS)

## Current Position

Phase: 3 of 14 (Equipment & AI) - IN PROGRESS
Plan: 2 of 4 in current phase (03-02 complete)
Status: In progress (Wave 1 parallel execution)
Last activity: 2026-01-15 - Completed 03-02-PLAN.md (AI Edge Function)

Progress: ███░░░░░░░ 24% (12 of ~50 plans)

### Phase 3 Plans (IN PROGRESS)

| Plan | Name | Files | Status |
|------|------|-------|--------|
| 03-01 | Equipment Data Foundation | Constants, validation, hooks | **Complete** |
| 03-02 | AI Edge Function | Edge function, Claude API | **Complete** |
| 03-03 | Equipment Hooks & UI Components | React Query hooks, components | Pending |
| 03-04 | Equipment Pages & Integration | CRUD pages, AI button | Pending |

**Wave Structure:**
- Wave 1: 03-01, 03-02 (parallel - no dependencies) - DONE
- Wave 2: 03-03 (depends on 03-01, 03-02)
- Wave 3: 03-04 (depends on 03-03 - integration)

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: 7 min
- Total execution time: 78 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 4/4 | 21 min | 5 min |
| 2 | 6/6 | 78 min | 13 min |
| 3 | 2/4 | 9 min | 5 min |

**Recent Trend:**
- Last 5 plans: 02-04 (15 min), 02-05 (18 min), 02-06 (25 min), 03-01 (5 min), 03-02 (4 min)
- Trend: Wave 1 parallel execution

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
Stopped at: Completed 03-02-PLAN.md (AI Edge Function)
Resume file: None

## Next Action

Wave 1 complete (03-01, 03-02). Ready for Wave 2 (03-03, 03-04 - Equipment UI).

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
