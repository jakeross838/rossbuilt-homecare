# Home Care OS

## What This Is

The operating system for luxury home care companies. A complete business platform that manages properties, runs inspections, generates professional reports, coordinates vendors, bills clients, and provides a premium client portal. Built for Ross Built initially, architected for SaaS scale.

## Core Value

Inspections + Reports must work flawlessly. When an inspector completes an inspection, the system generates a beautiful, professional PDF report that makes clients feel their $500K+ home is being cared for by experts.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Phase 1-2: Foundation**
- [ ] Database schema in Supabase (PostgreSQL with RLS)
- [ ] Authentication system with role-based permissions
- [ ] Client management (CRUD, contacts, billing info)
- [ ] Property management (details, features, access codes, photos)

**Phase 3-4: Equipment & Programs**
- [ ] Equipment registry with AI-powered recognition from photos
- [ ] Program builder (Visual, Functional, Comprehensive, Preventative tiers)
- [ ] Pricing engine (frequency + tier + add-ons = monthly fee)

**Phase 5-6: Inspections & Scheduling**
- [ ] Inspection template builder with customizable checklists
- [ ] Smart scheduling with route optimization
- [ ] Calendar view with drag-and-drop

**Phase 7: Inspector Mobile App**
- [ ] PWA for inspectors (offline-capable)
- [ ] Photo capture and upload
- [ ] Checklist execution with findings

**Phase 8: Report Generation**
- [ ] Professional PDF reports with photos and findings
- [ ] AI-generated summaries and recommendations
- [ ] Email delivery to clients

**Phase 9-10: Work Orders & Billing**
- [ ] Work order creation from findings
- [ ] Vendor management and assignment
- [ ] Stripe integration for subscriptions and invoicing
- [ ] Invoice processing with draw management

**Phase 11-12: Client Portal & Analytics**
- [ ] Client-facing portal (property status, reports, approvals)
- [ ] Service request submission
- [ ] Admin dashboards and analytics

**Phase 13-14: Automation & Launch**
- [ ] Notifications (email, SMS, in-app)
- [ ] Automated scheduling and reminders
- [ ] Testing and deployment

### Out of Scope

- Native mobile apps (React Native) — PWA is sufficient for v1
- Smart home IoT integrations — future feature
- Multi-tenant SaaS onboarding — architecture ready, but Ross Built only for now
- White-label branding — future when selling to other companies
- Advanced ML predictions — basic health scores only in v1
- QuickBooks integration — manual export acceptable initially

## Context

**Business Context:**
- Ross Built is a luxury home care company serving coastal Florida
- Target market: $500K+ homes, seasonal residents ("snowbirds")
- Competitive gap: No software specifically designed for recurring luxury home inspection programs with AI
- Revenue model: Monthly program fees + vendor coordination markup + service requests

**Technical Context:**
- 14 phases planned, ~160-216 hours estimated
- Detailed phase documents available in `~/Downloads/home-care-os-docs/`
- Tech stack locked: Supabase + React + TypeScript + shadcn/ui + Tailwind + Vercel
- AI integration via Claude API throughout (18+ touchpoints)

**Pre-existing Planning:**
- `QUESTIONS_FOR_JAKE.md` — contains items needing answers before/during development
- Phase documents (01-14) — detailed implementation specs ready
- `BUSINESS-MODEL.md` — pricing strategy, competitive analysis, cost projections

## Constraints

- **Tech Stack**: Must use Supabase (PostgreSQL), Next.js/React, TypeScript, shadcn/ui, Tailwind CSS, Vercel — per master plan specification
- **Design**: Must match rossbuilt.com aesthetic — clean, minimalist, black/white/gray palette, professional, timeless
- **Architecture**: SaaS-ready from day one (multi-tenant RLS, company_id on all tables) even though Ross Built is the only tenant initially
- **Mobile**: PWA only for v1 — React Native deferred to future phase

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA over React Native for mobile | Faster to ship, code sharing with web, sufficient for inspector needs | — Pending |
| Supabase over custom backend | Auth, DB, Storage, Edge Functions integrated; RLS for multi-tenancy | — Pending |
| shadcn/ui over custom components | High-quality, accessible, customizable; matches minimalist aesthetic | — Pending |
| Ross Built first, SaaS later | Validate with real operations before selling to others | — Pending |
| Claude API for AI features | Best-in-class content generation; already have relationship | — Pending |

---
*Last updated: 2026-01-14 after initialization*
