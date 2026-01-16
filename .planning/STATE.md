# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-14)

**Core value:** Inspections + Reports must work flawlessly — beautiful PDF reports that make clients feel their $500K+ home is being cared for by experts.
**Current focus:** Phase 10 Complete — Ready for Phase 11

## Current Position

Phase: 10 of 14 (Billing & Invoicing) - COMPLETE
Plan: 6 of 6 in current phase
Status: Phase 10 Complete - All Waves Done
Last activity: 2026-01-15 - Completed 10-06 (Billing Pages & Integration)

Progress: █████████░ 95% (64 of ~68 plans)

### Phase 10 Plans (COMPLETE)

| Plan | Name | Wave | Status |
|------|------|------|--------|
| 10-01 | Billing Data Foundation | 1 | **Complete** |
| 10-02 | Invoice Hooks | 2 | **Complete** |
| 10-03 | Payment Hooks | 2 | **Complete** |
| 10-04 | Stripe Integration Edge Function | 2 | **Complete** |
| 10-05 | Invoice UI Components | 3 | **Complete** |
| 10-06 | Billing Pages & Integration (Checkpoint) | 4 | **Complete** |

**Wave Structure:**
- Wave 1: 10-01 (no dependencies) - Complete
- Wave 2: 10-02, 10-03, 10-04 (parallel - depend on 10-01) - Complete
- Wave 3: 10-05 (depends on 10-02, 10-03, 10-04) - Complete
- Wave 4: 10-06 (checkpoint - depends on 10-05) - Complete

### Phase 9 Plans (COMPLETE)

| Plan | Name | Wave | Status |
|------|------|------|--------|
| 09-01 | Work Order Data Foundation | 1 | **Complete** |
| 09-02 | Vendor Data Foundation | 1 | **Complete** |
| 09-03 | Work Order Hooks | 2 | **Complete** |
| 09-04 | Vendor Hooks | 2 | **Complete** |
| 09-05 | Work Order UI Components | 3 | **Complete** |
| 09-06 | Vendor UI Components | 3 | **Complete** |
| 09-07 | Work Orders & Vendors Pages (Checkpoint) | 4 | **Complete** |

**Wave Structure:**
- Wave 1: 09-01, 09-02 (parallel - no dependencies) - Complete
- Wave 2: 09-03, 09-04 (parallel - depend on Wave 1) - Complete
- Wave 3: 09-05, 09-06 (parallel - depend on Wave 2) - Complete
- Wave 4: 09-07 (checkpoint - depends on Wave 3) - Complete

### Phase 8 Plans (COMPLETE)

| Plan | Name | Files | Status |
|------|------|-------|--------|
| 08-01 | Report Data Foundation | Types, constants | **Complete** |
| 08-02 | Findings & Recommendations Hooks | Validations, React Query hooks | **Complete** |
| 08-03 | AI Report Summary Edge Function | Supabase Edge Function | **Complete** |
| 08-04 | PDF Report Generation | @react-pdf/renderer components | **Complete** |
| 08-05 | Report UI Components | Preview, dialog, badges | **Complete** |
| 08-06 | Report Page & Integration | Pages, routes, sidebar | **Complete** |

**Wave Structure:**
- Wave 1: 08-01, 08-02 (parallel - no dependencies) - Complete
- Wave 2: 08-03, 08-04 (parallel - depend on 08-01) - Complete
- Wave 3: 08-05 (depends on 08-02, 08-04) - Complete
- Wave 4: 08-06 (checkpoint - depends on 08-05) - Complete

### Phase 7 Plans (COMPLETE)

| Plan | Name | Files | Status |
|------|------|-------|--------|
| 07-01 | PWA Setup & Foundation | manifest, service worker, pwa.ts | **Complete** |
| 07-02 | Inspector Types & Schedule | Types, constants, schedule hooks | **Complete** |
| 07-03 | Offline Storage | IndexedDB, sync queue | **Complete** |
| 07-04 | Inspection Execution Hooks | Mutations with offline support | **Complete** |
| 07-05 | Photo Capture | Camera access, local storage | **Complete** |
| 07-06 | Inspector UI Components | Schedule list, checklist, forms | **Complete** |
| 07-07 | Completion & Sync Status | Completion form, sync indicators | **Complete** |
| 07-08 | Inspector Pages | Dashboard, inspection execution | **Complete** |

**Wave Structure:**
- Wave 1: 07-01, 07-02 (parallel - no dependencies)
- Wave 2: 07-03, 07-04, 07-05 (parallel - depend on Wave 1)
- Wave 3: 07-06, 07-07 (parallel - depend on Wave 2)
- Wave 4: 07-08 (integration with checkpoint - depends on 07-06, 07-07)

### Phase 6 Plans (COMPLETE)

| Plan | Name | Files | Status |
|------|------|-------|--------|
| 06-01 | Scheduling Data Foundation | Types, constants, validations | **Complete** |
| 06-02 | Inspector Availability Hooks | useInspectors, useInspectorWorkload | **Complete** |
| 06-03 | Inspection CRUD Hooks | useCalendarInspections, mutations | **Complete** |
| 06-04 | Calendar UI Components | CalendarView, Grid, Header, Card | **Complete** |
| 06-05 | Calendar Page & Integration | Calendar page, dialogs, sheets | **Complete** |

**Wave Structure:**
- Wave 1: 06-01, 06-02 (parallel - no dependencies)
- Wave 2: 06-03, 06-04 (parallel - both depend on 06-01)
- Wave 3: 06-05 (depends on 06-02, 06-03, 06-04 - integration with checkpoint)

### Phase 5 Plans (COMPLETE)

| Plan | Name | Files | Status |
|------|------|-------|--------|
| 05-01 | Template Data Foundation | Types, constants | **Complete** |
| 05-02 | Template Validation & Hooks | Zod schemas, React Query CRUD | **Complete** |
| 05-03 | Checklist Generation Engine | Dynamic checklist builder | **Complete** |
| 05-04 | Template Management UI | Settings page, editor | **Complete** |
| 05-05 | Checklist Preview & Integration | Property page integration | **Complete** |

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
- Total plans completed: 62
- Average duration: 6 min
- Total execution time: ~374 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 4/4 | 21 min | 5 min |
| 2 | 6/6 | 78 min | 13 min |
| 3 | 4/4 | 21 min | 5 min |
| 4 | 5/5 | 25 min | 5 min |
| 5 | 5/5 | 30 min | 6 min |
| 6 | 5/5 | 30 min | 6 min |
| 7 | 8/8 | 48 min | 6 min |
| 8 | 6/6 | 36 min | 6 min |
| 9 | 7/7 | 42 min | 6 min |
| 10 | 5/6 | 32 min | 6 min |

**Recent Trend:**
- Last 5 plans: 10-01 (6 min), 10-02 (6 min), 10-03 (4 min), 10-04 (6 min), 10-05 (8 min)
- Trend: Wave 3 complete, ready for Wave 4 (checkpoint)

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
- **05-04**: Used Sheet instead of Dialog for template editor (more space for complex form)
- **05-04**: Templates link added to sidebar bottom nav alongside Pricing and Settings
- **05-05**: ChecklistPreview component with TooltipProvider wrapper for self-contained tooltip functionality
- **07-01**: registerType: 'prompt' for user-controlled PWA updates
- **07-01**: NetworkFirst caching strategy for Supabase API (1 hour expiry)
- **07-02**: Nested join pattern for clients through properties foreign key
- **07-02**: Type assertion via unknown for JSONB fields (checklist, findings, weather_conditions)
- **07-03**: 24-hour cache expiry for offline inspections
- **07-03**: Sync photos before findings (findings may reference photo URLs)
- **07-03**: Batch findings updates per inspection for efficiency
- **07-05**: Separate IndexedDB database for photos (rossbuilt-photos)
- **07-05**: Canvas-based JPEG compression at 80% quality, max 1920px width
- **07-04**: Offline-first mutation pattern (save to IndexedDB, then sync to server)
- **07-04**: Inspection completion requires online connection
- **07-07**: Used existing useOffline hook (adapted plan's useOfflineStatus/useSyncStatus/useManualSync)
- **07-07**: SyncStatus has compact mode for header integration
- **07-06**: Bottom sheet at 85% viewport height for finding form on mobile
- **07-06**: Horizontal scrolling tabs for checklist sections
- **07-06**: Status icons with color-coded borders for finding status
- **08-01**: Report types integrate with existing ChecklistItemFinding and WeatherConditions from inspector.ts
- **08-01**: Email templates use placeholder syntax ({property_name}, {client_name}, etc.) for dynamic substitution
- **08-02**: Hierarchical query keys (`['recommendations', 'inspection', id]`) for targeted cache invalidation
- **08-02**: Type assertions via `unknown` for JSONB fields (checklist, findings) before asserting proper types
- **08-02**: Photo consolidation from both `inspection_photos` table and embedded JSONB findings
- **08-02**: Separated data fetching (`useInspectionForReport`) from transformation (`useBuildReportData`)
- **08-03**: Direct fetch to Claude API for consistency with generate-equipment-ai edge function pattern
- **08-03**: Professional tone prompt for luxury home care audience with reassuring but honest messaging
- **08-03**: Fallback response handling returns generic professional message if JSON parsing fails
- **08-04**: Built-in Helvetica fonts for PDF rendering (no custom font registration needed)
- **08-04**: Photo gallery limited to 12 photos per report with overflow indicator
- **08-04**: Section filtering shows detailed findings only for sections with issues; passed sections get summary row
- **08-04**: AI summary graceful fallback continues with inspector summary if generation fails
- **08-04**: Storage bucket `inspection-reports` for PDF storage
- **08-05**: Switch UI component added using @radix-ui/react-switch
- **08-05**: Multi-step dialog pattern for options -> generating -> complete flow
- **08-05**: Progress bar with status messages during report generation
- **08-05**: FindingsSummaryCard composed into ReportPreview component
- **08-06**: Custom `useInspectionsList` hook for list page with report-specific fields
- **08-06**: Date range filter: 30 days past to 7 days ahead for list view
- **08-06**: Kept existing ClipboardCheck icon for Inspections in sidebar (already correct)
- **08-06**: Report page shows recommendations in tabbed interface with priority badges
- **09-01**: Work order types reference database enums via `Enums<'work_order_status'>` and `Enums<'priority_level'>`
- **09-01**: WorkOrderWithRelations pattern for display with expanded property, client, vendor, user relations
- **09-01**: 14 work order categories aligned with equipment categories and vendor trades
- **09-01**: Default 15% markup for vendor work with `calculateClientCost()` helper
- **09-01**: Status workflow config with `allowedTransitions` array for state machine validation
- **09-02**: Trade categories aligned with work order categories for consistency
- **09-02**: US_STATES reusable constant (may be used elsewhere for address forms)
- **09-02**: 30-day compliance warning threshold for license/insurance expiration
- **09-02**: Flexible phone validation regex allows various formats (digits, spaces, dashes, parentheses)
- **09-02**: Optional fields allow empty strings or null for form compatibility
- **09-04**: Used `vendorKeys` factory pattern for hierarchical cache invalidation (consistent with other hooks)
- **09-04**: Compliance counts computed client-side from minimal vendor fields for efficiency
- **09-04**: Rolling average rating calculation: `(currentRating * (completedJobs - 1) + newRating) / completedJobs`
- **09-03**: Used `workOrderKeys` factory pattern for hierarchical cache invalidation (consistent with vendor hooks)
- **09-03**: RPC functions (`increment_vendor_total_jobs`, `increment_vendor_completed_jobs`) use SECURITY DEFINER
- **09-03**: Work order number generation uses `work_order_seq` sequence with timestamp fallback
- **09-06**: Resolver type cast for zod v4 compatibility with react-hook-form (consistent with 04-03)
- **09-06**: TooltipProvider wrapper for self-contained tooltip in VendorComplianceBadge (consistent with 05-05)
- **09-06**: Checkbox grid pattern for multi-select trade categories in VendorForm
- **09-06**: Conditional field display (W-9 received date only shown when W-9 is on file)
- **09-06**: Color-coded status badges with semantic meaning (green/yellow/red) for compliance
- **09-05**: Status badge variants map to shadcn Badge (success/info -> default, warning -> secondary, destructive -> destructive)
- **09-05**: Priority icons use Lucide (ArrowDown, Minus, ArrowUp, AlertTriangle) for visual hierarchy
- **09-05**: RadioGroup with sr-only items for card-based vendor selection (consistent with 04-03)
- **09-05**: Real-time cost summary calculation using `calculateClientCost()` helper in completion dialog
- **09-07**: Sidebar already had Work Orders (Wrench icon) and Vendors (Truck icon) navigation
- **09-07**: Fixed null type handling in work order detail page using fallback default status
- **09-07**: Removed `invoiced` status from constants (not in database enum)
- **09-07**: Added Form component from shadcn/ui to support vendor forms
- **10-01**: Invoice types reference database enum via `Enums<'invoice_status'>`
- **10-01**: InvoiceWithRelations pattern for display with expanded client, line_items, payments
- **10-01**: Status workflow config with `allowedTransitions` array plus `canEdit`/`canDelete` flags
- **10-01**: Currency precision via `Math.round(x * 100) / 100` for 2 decimal places
- **10-01**: Created `lib/helpers/` directory for centralized helper functions (new pattern)
- **10-01**: Default 30-day payment terms with Net 15/30/45/60 options
- **10-02**: Invoice hooks use `invoiceKeys` factory pattern for hierarchical cache invalidation (consistent with work orders/vendors)
- **10-02**: Invoice number generation uses `nextval` RPC with timestamp fallback for sequence failures
- **10-02**: Draft-only editing/deletion enforced via `.eq('status', 'draft')` filter on update/delete mutations
- **10-02**: Type assertions via `unknown` for database relations (client, line_items, payments)
- **10-03**: Import invoiceKeys from use-invoices.ts for cache invalidation (parallel plan coordination)
- **10-03**: Payment recording automatically updates invoice status (paid/partial) and balance_due
- **10-03**: Delete payment recalculates invoice balance and may revert status from paid to sent
- **10-03**: Payment summary aggregates by payment method for dashboard reporting
- **10-04**: No migration needed for stripe_customer_id (already exists in clients table from initial schema)
- **10-04**: Stripe Checkout for PCI compliance (hosted payment pages, no card handling in app)
- **10-04**: Stripe customer ID cached on client record for repeat payments
- **10-04**: Invoice metadata links Stripe to Supabase via payment intent metadata
- **10-04**: Discount handling uses Stripe coupons for one-time discounts
- **10-05**: Resolver type cast for zod v4 compatibility with react-hook-form (consistent with 04-03, 09-06)
- **10-05**: Conditional form fields: show check number for check payments, card details for card payments
- **10-05**: Real-time invoice total calculation as line items are edited
- **10-05**: Pre-filled email template in SendInvoiceDialog with Ross Built branding
- **10-05**: PaymentLinkButton state transitions: create button -> copy/open buttons after generation
- **10-05**: Due date presets (Net 15/30/45/60) calculated from invoice date dynamically

### Pending Todos

- ANTHROPIC_API_KEY needs to be set in Supabase Edge Function secrets (see .planning/phases/03-equipment-ai/03-USER-SETUP.md)
- STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET need to be set in Supabase Edge Function secrets (see apps/admin/src/lib/stripe/STRIPE_SETUP.md)

### Blockers/Concerns

**Resolved:**
- ~~Need Supabase project credentials~~ -> Using existing rossbuilt-homecare project

**Remaining:**
- Need SUPABASE_SERVICE_ROLE_KEY from dashboard (placeholder in .env.local)
- Need ANTHROPIC_API_KEY for AI edge function
- Need STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET for Stripe integration
- See ~/Downloads/home-care-os-docs/QUESTIONS_FOR_JAKE.md for full list

## Session Continuity

Last session: 2026-01-15
Stopped at: Completed 10-05-PLAN.md (Invoice UI Components)
Resume file: None

## Next Action

Phase 10 Wave 3 Complete! Ready for Wave 4 (checkpoint):
- Run 10-06 (Billing Pages & Integration) to complete Phase 10
- Or run `/gsd:execute-plan .planning/phases/10-billing-invoicing/10-06-PLAN.md`

## Phase 9 Summary

**Work Orders & Vendors Complete:**
- Work order types, constants, and validation schemas
- Vendor types, constants, and validation schemas
- React Query hooks for work orders (CRUD, status, assignment, completion)
- React Query hooks for vendors (CRUD, compliance, ratings)
- Work order UI components (cards, badges, dialogs)
- Vendor UI components (cards, badges, forms)
- Work orders list and detail pages
- Vendors list and detail pages
- Full route integration in App.tsx

**Key Files Created:**
- apps/admin/src/lib/types/work-order.ts - Work order TypeScript types
- apps/admin/src/lib/types/vendor.ts - Vendor TypeScript types
- apps/admin/src/lib/constants/work-order.ts - Work order status, categories
- apps/admin/src/lib/constants/vendor.ts - Vendor trades, compliance helpers
- apps/admin/src/hooks/use-work-orders.ts - Work order React Query hooks
- apps/admin/src/hooks/use-vendors.ts - Vendor React Query hooks
- apps/admin/src/components/work-orders/* - Work order UI components
- apps/admin/src/components/vendors/* - Vendor UI components
- apps/admin/src/pages/work-orders/index.tsx - Work orders list page
- apps/admin/src/pages/work-orders/[id].tsx - Work order detail page
- apps/admin/src/pages/vendors/index.tsx - Vendors list page
- apps/admin/src/pages/vendors/[id].tsx - Vendor detail page

## Phase 8 Summary

**Findings & Reports Complete:**
- Report types and constants with Ross Built branding
- Recommendations React Query hooks (CRUD operations)
- AI Summary Edge Function using Claude API
- PDF generation with @react-pdf/renderer (cover, findings, recommendations, photos)
- Report UI components (status badges, findings cards, generate dialog)
- Inspections list page and dedicated report page
- Full report workflow: list → detail → generate → download/view

**Key Files Created:**
- apps/admin/src/lib/types/report.ts - Report TypeScript types
- apps/admin/src/lib/constants/report.ts - Brand colors, fonts, dimensions
- apps/admin/src/lib/validations/report.ts - Zod validation schemas
- apps/admin/src/hooks/use-recommendations.ts - Recommendations CRUD hooks
- apps/admin/src/hooks/use-reports.ts - Report data aggregation hooks
- supabase/functions/generate-report-summary/ - AI summary edge function
- apps/admin/src/lib/pdf/ - PDF generation components and utilities
- apps/admin/src/components/reports/ - Report UI components
- apps/admin/src/pages/inspections/ - Inspections list and report pages

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

## Phase 5 Summary

**Templates & Checklists Complete:**
- Template data foundation with TypeScript types for inspection templates
- Template validation schemas and React Query hooks for CRUD operations
- Checklist generation engine that builds dynamic checklists from property features, equipment, and tier
- Template Management UI with Sheet-based editor for creating/editing templates
- ChecklistPreview component integrated into property detail page
- Conditional display: checklist appears only when program is active

**Key Files Created:**
- apps/admin/src/lib/types/inspection.ts - Template and checklist TypeScript types
- apps/admin/src/lib/validations/template.ts - Zod schemas for template validation
- apps/admin/src/hooks/use-templates.ts - React Query hooks for template CRUD
- apps/admin/src/hooks/use-checklist.ts - Hook for generating checklists
- apps/admin/src/lib/checklist-generator.ts - Engine for building checklists from data
- apps/admin/src/components/inspections/checklist-preview.tsx - Preview component
- apps/admin/src/pages/settings/templates.tsx - Template management page

## Phase 6 Summary

**Smart Scheduling Complete:**
- Scheduling data foundation with types, constants, and validation schemas
- Inspector availability hooks for workload tracking
- Inspection CRUD hooks with React Query mutations
- Full calendar UI component suite (grid, header, cards)
- Calendar page with scheduling dialog and inspection detail sheet
- Month navigation with date range-based data fetching

**Key Files Created:**
- apps/admin/src/lib/constants/scheduling.ts - Time slots, inspection types, colors
- apps/admin/src/lib/types/scheduling.ts - CalendarInspection, CalendarDay, InspectorWorkload
- apps/admin/src/lib/validations/inspection.ts - Zod schemas for scheduling
- apps/admin/src/hooks/use-inspectors.ts - Inspector availability hooks
- apps/admin/src/hooks/use-inspections.ts - Inspection CRUD hooks
- apps/admin/src/components/calendar/* - Calendar UI components
- apps/admin/src/pages/calendar/index.tsx - Calendar page

## Phase 7 Summary

**Inspector Mobile PWA Complete:**
- PWA configuration with Workbox for offline support
- Inspector types and schedule hooks for daily workflow
- IndexedDB-based offline storage with sync queue
- Offline-first inspection execution mutations
- Camera-based photo capture with compression
- Mobile-optimized UI components (schedule list, checklist, forms)
- Completion flow with sync status indicators
- Inspector dashboard and inspection execution pages

**Key Files Created:**
- apps/admin/vite.config.ts - PWA configuration with VitePWA plugin
- apps/admin/src/lib/types/inspector.ts - Inspector and checklist types
- apps/admin/src/lib/offline/* - IndexedDB storage and sync queue
- apps/admin/src/hooks/use-offline.ts - Offline status and sync hooks
- apps/admin/src/hooks/use-inspection-execution.ts - Offline-first mutations
- apps/admin/src/components/inspector/* - Mobile UI components
- apps/admin/src/pages/inspector/index.tsx - Inspector dashboard
- apps/admin/src/pages/inspector/inspection.tsx - Inspection execution page
