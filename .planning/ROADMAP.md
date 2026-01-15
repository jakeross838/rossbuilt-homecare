# Roadmap: Home Care OS

## Overview

Build the complete operating system for luxury home care companies, starting with database foundation and progressing through core entities, inspection workflows, mobile app, billing, and client portal. Ross Built is the first customer, but architecture supports future SaaS expansion.

## Domain Expertise

None — general web application patterns apply.

## Reference Documents

Detailed phase specifications available in `~/Downloads/home-care-os-docs/`:
- `phase-01-database.md` through `phase-09-14-remaining.md`
- `QUESTIONS_FOR_JAKE.md` — items needing answers before certain phases

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Database & Auth** - Supabase schema, RLS, authentication ✅
- [ ] **Phase 2: Core Entities** - Clients, properties, users CRUD
- [ ] **Phase 3: Equipment & AI** - Equipment registry, AI photo recognition
- [ ] **Phase 4: Programs & Pricing** - Program builder, pricing engine
- [ ] **Phase 5: Templates & Checklists** - Inspection templates, dynamic checklists
- [ ] **Phase 6: Smart Scheduling** - Calendar, route optimization, assignments
- [ ] **Phase 7: Inspector Mobile** - PWA, offline mode, photo capture
- [ ] **Phase 8: Findings & Reports** - Report generation, PDF, AI summaries
- [ ] **Phase 9: Work Orders & Vendors** - Work order workflow, vendor management
- [ ] **Phase 10: Billing & Invoicing** - Stripe integration, subscriptions
- [ ] **Phase 11: Client Portal** - Client-facing dashboard, approvals
- [ ] **Phase 12: Analytics & Dashboards** - Admin metrics, reporting
- [ ] **Phase 13: Notifications & Automation** - Email, SMS, scheduled jobs
- [ ] **Phase 14: Testing & Launch** - QA, deployment, go-live

## Phase Details

### Phase 1: Database & Auth ✅
**Goal**: Establish Supabase foundation with multi-tenant schema and authentication
**Depends on**: Nothing (first phase)
**Status**: COMPLETE (2026-01-14)
**Plans**: 4 plans executed
- 01-01: Supabase setup, core schema (enums, orgs, users, clients, properties)
- 01-02: Domain schema (programs, equipment, inspections, vendors, work orders)
- 01-03: Billing & supporting (invoices, calendar, documents, notifications, settings)
- 01-04: RLS policies, seed data, TypeScript types

Reference: `~/Downloads/home-care-os-docs/phase-01-database.md`

### Phase 2: Core Entities
**Goal**: CRUD for clients, properties, and users with proper permissions
**Depends on**: Phase 1
**Status**: IN PROGRESS (3/6 plans complete)
**Plans**: 6 plans created
- 02-01: Project setup & core infrastructure (Vite, Tailwind, Supabase client) ✅
- 02-02: shadcn/ui components (18 UI components + 5 shared components) ✅
- 02-03: Authentication & layout (auth store, login, sidebar, header) ✅
- 02-04: Client management (validation, hooks, CRUD pages)
- 02-05: Property management (validation, hooks, CRUD pages)
- 02-06: Polish & testing (toasts, error handling, manual testing)

Reference: `~/Downloads/home-care-os-docs/phase-02-core-entities.md`

### Phase 3: Equipment & AI
**Goal**: Equipment registry with AI-powered photo recognition
**Depends on**: Phase 2
**Research**: Likely (Claude Vision API integration)
**Research topics**: Claude Vision API for equipment recognition, image processing patterns
**Plans**: TBD

Reference: `~/Downloads/home-care-os-docs/phase-03-equipment-ai.md`

### Phase 4: Programs & Pricing
**Goal**: Program builder with tier-based pricing engine
**Depends on**: Phase 2
**Research**: Unlikely (internal business logic)
**Plans**: TBD

Reference: `~/Downloads/home-care-os-docs/phase-04-programs-pricing.md`

### Phase 5: Templates & Checklists
**Goal**: Inspection template builder with dynamic checklist generation
**Depends on**: Phase 3, Phase 4
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Reference: `~/Downloads/home-care-os-docs/phase-05-templates-checklists.md`

### Phase 6: Smart Scheduling
**Goal**: Calendar with route optimization and inspector assignments
**Depends on**: Phase 5
**Research**: Likely (Google Maps API, route optimization)
**Research topics**: Google Maps Distance Matrix API, optimal route algorithms, time estimation
**Plans**: TBD

Reference: `~/Downloads/home-care-os-docs/phase-06-scheduling.md`

### Phase 7: Inspector Mobile
**Goal**: PWA for inspectors with offline capability and photo capture
**Depends on**: Phase 6
**Research**: Likely (PWA patterns, offline storage)
**Research topics**: Service workers, IndexedDB sync, camera APIs, offline-first architecture
**Plans**: TBD

Reference: `~/Downloads/home-care-os-docs/phase-07-mobile-app.md`

### Phase 8: Findings & Reports
**Goal**: Professional PDF reports with AI-generated summaries
**Depends on**: Phase 7
**Research**: Likely (PDF generation)
**Research topics**: React-PDF vs Puppeteer, PDF styling, report templates
**Plans**: TBD

Reference: `~/Downloads/home-care-os-docs/phase-08-findings-recommendations.md`

### Phase 9: Work Orders & Vendors
**Goal**: Work order workflow with vendor management
**Depends on**: Phase 8
**Research**: Unlikely (internal workflow patterns)
**Plans**: TBD

Reference: `~/Downloads/home-care-os-docs/phase-09-14-remaining.md`

### Phase 10: Billing & Invoicing
**Goal**: Stripe integration for subscriptions and invoicing
**Depends on**: Phase 9
**Research**: Likely (Stripe API)
**Research topics**: Stripe subscriptions, webhooks, invoice generation, payment links
**Plans**: TBD

Reference: `~/Downloads/home-care-os-docs/phase-15-invoice-draw.md`

### Phase 11: Client Portal
**Goal**: Client-facing portal for property status and approvals
**Depends on**: Phase 10
**Research**: Unlikely (internal React patterns)
**Plans**: TBD

### Phase 12: Analytics & Dashboards
**Goal**: Admin dashboards with operational metrics
**Depends on**: Phase 11
**Research**: Unlikely (Recharts, internal patterns)
**Plans**: TBD

### Phase 13: Notifications & Automation
**Goal**: Email, SMS notifications and automated scheduling
**Depends on**: Phase 12
**Research**: Likely (Resend, Twilio APIs)
**Research topics**: Resend email API, Twilio SMS, notification preferences, scheduled jobs
**Plans**: TBD

### Phase 14: Testing & Launch
**Goal**: QA, optimization, and production deployment
**Depends on**: Phase 13
**Research**: Unlikely (Vercel deployment)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → ... → 14

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Database & Auth | 4/4 | ✅ Complete | 2026-01-14 |
| 2. Core Entities | 3/6 | In Progress | - |
| 3. Equipment & AI | 0/TBD | Not started | - |
| 4. Programs & Pricing | 0/TBD | Not started | - |
| 5. Templates & Checklists | 0/TBD | Not started | - |
| 6. Smart Scheduling | 0/TBD | Not started | - |
| 7. Inspector Mobile | 0/TBD | Not started | - |
| 8. Findings & Reports | 0/TBD | Not started | - |
| 9. Work Orders & Vendors | 0/TBD | Not started | - |
| 10. Billing & Invoicing | 0/TBD | Not started | - |
| 11. Client Portal | 0/TBD | Not started | - |
| 12. Analytics & Dashboards | 0/TBD | Not started | - |
| 13. Notifications & Automation | 0/TBD | Not started | - |
| 14. Testing & Launch | 0/TBD | Not started | - |
