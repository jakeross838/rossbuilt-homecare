# Summary 11-03: Service Request & Recommendation Hooks

## Completed: 2026-01-15

## What Was Built

### Service Request Hooks (`use-service-requests.ts`)
- `useServiceRequests`: Fetch list of service requests with status/property filters
- `useServiceRequest`: Fetch single request with comments
- `useCreateServiceRequest`: Create new service request (generates request number)
- `useAddServiceRequestComment`: Add comment to service request (non-internal only)
- `useUploadServiceRequestPhoto`: Upload photos to storage bucket
- `serviceRequestKeys`: Query key factory for cache management

### Recommendation Response Hooks (`use-recommendation-response.ts`)
- `useRespondToRecommendation`: Base mutation for approve/decline
- `useApproveRecommendation`: Convenience wrapper for approvals
- `useDeclineRecommendation`: Convenience wrapper for declines

### Database Migration (`021_recommendation_response.sql`)
- Added `client_response_notes` column to recommendations
- Added `responded_at` timestamp column
- Added `responded_by` user reference column
- Created index for efficient querying of responded recommendations

### Documentation (`SERVICE_REQUEST_STORAGE.md`)
- Storage bucket configuration guide
- RLS policies for photo upload/access
- File path conventions

## Files Created

1. `apps/admin/src/hooks/use-service-requests.ts` - Service request hooks
2. `apps/admin/src/hooks/use-recommendation-response.ts` - Recommendation response hooks
3. `supabase/migrations/021_recommendation_response.sql` - Database migration
4. `apps/admin/src/lib/storage/SERVICE_REQUEST_STORAGE.md` - Storage setup guide

## Key Decisions

- **Client-only hooks**: All hooks enabled only when `profile?.role === 'client'`
- **Pending-only responses**: Recommendations can only be responded to when status is 'pending'
- **Non-internal comments**: Clients can only post non-internal comments
- **Request number generation**: Uses `nextval` RPC with timestamp fallback
- **Photo storage**: Public bucket with authenticated upload policy

## Commits

1. `feat(portal): add service request hooks for client portal`
2. `feat(portal): add recommendation response hooks`
3. `feat(db): add recommendation response fields migration`
4. `docs(storage): add service request photo storage setup guide`

## Verification

- [x] TypeScript compiles without errors (`npx tsc --noEmit`)
- [x] All files created in correct locations
- [x] Hooks use correct query key patterns (consistent with portal hooks)
- [x] Migration follows existing naming convention

## Dependencies Satisfied

- Uses `portalKeys` from 11-02
- Uses types from 11-01 (`PortalServiceRequest`, `PortalServiceRequestComment`)
- Uses validation schemas from 11-01 (`CreateServiceRequestInput`, etc.)

## Next Steps

- 11-04: Build client portal UI components using these hooks
