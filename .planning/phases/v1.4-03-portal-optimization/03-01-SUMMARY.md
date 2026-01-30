# Plan 03-01 Summary: Portal Property Summaries View

## Status: Complete

## What Was Built

Created database view `portal_property_summaries` that pre-aggregates all per-property counts needed by the portal, eliminating N+1 queries.

## Deliverables

| File | Purpose |
|------|---------|
| supabase/migrations/036_portal_property_summaries_view.sql | Database view with pre-aggregated portal counts |

## Key Decisions

- **036**: Renamed from 032 due to migration conflicts with existing 025/030 duplicates
- **Idempotent migrations**: Updated all migrations to use DROP IF EXISTS / CREATE IF NOT EXISTS patterns
- **View structure**: Includes base property columns, program data, aggregated counts, and inspection data

## View Columns

**Base property data:**
- id, name, address_line1, city, state, zip, primary_photo_url, is_active

**Program data (from active program):**
- program_id, inspection_tier, inspection_frequency, program_status, monthly_total

**Aggregated counts:**
- equipment_count: Active equipment per property
- open_work_order_count: Work orders in pending/assigned/scheduled/in_progress
- pending_recommendation_count: Recommendations with status='pending'

**Inspection data:**
- last_inspection_date: Most recent completed inspection
- last_inspection_condition: Condition from last completed inspection
- next_inspection_date: Next scheduled inspection >= today

## Technical Notes

- Uses LEFT JOINs with subqueries for efficient aggregation
- View auto-updates as underlying tables change
- RLS policies on base tables still apply

## Commits

| Hash | Message |
|------|---------|
| 917a121 | feat(03-01): create portal_property_summaries database view |
| 1e99509 | fix: make migrations idempotent and rename duplicates |
| 64eb7e3 | chore: remove old duplicate migration files |

## Verification

- [x] Migration applied to Supabase successfully
- [x] View created with all required columns
- [x] No errors during migration push
