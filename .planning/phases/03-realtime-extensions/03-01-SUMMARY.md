# Plan 03-01: Extend Realtime Subscriptions

## Status: COMPLETE

## Objective
Extend real-time subscriptions to programs and notifications tables so data changes propagate instantly to all connected users.

## What Was Done

### 1. Extended TableName Type
Added 'programs' and 'notifications' to the allowed table types:

```typescript
type TableName =
  | 'clients'
  | 'properties'
  // ... existing tables ...
  | 'programs'      // NEW
  | 'notifications' // NEW
```

### 2. Added Query Key Mappings
Configured cache invalidation for new tables:

```typescript
const queryKeyMap: Record<TableName, string[][]> = {
  // ... existing mappings ...
  programs: [['programs'], ['portal', 'plan'], ['portal', 'dashboard'], ['admin', 'properties-overview']],
  notifications: [['notifications'], ['portal', 'notifications'], ['admin', 'notifications']],
}
```

### 3. Updated Global Realtime Sync
Added programs and notifications to `useGlobalRealtimeSync()`:
- Admin dashboard receives live updates when any client modifies their plan
- Notifications appear instantly across all connected users

### 4. Updated Portal Realtime Sync
Added programs and notifications to `usePortalRealtimeSync()`:
- Client portal sees plan changes in real-time
- Clients receive notifications instantly

## How It Works

1. **Subscription**: When user loads app, `useRealtimeSync` subscribes to Supabase channels for all configured tables
2. **Filter**: Subscriptions filter by `organization_id=eq.${orgId}` for security
3. **Events**: Listens for INSERT, UPDATE, DELETE events on each table
4. **Invalidation**: On any event, invalidates relevant React Query cache keys
5. **Refetch**: React Query automatically refetches stale data

## Artifacts
- `apps/admin/src/hooks/use-realtime-sync.ts` (modified)

## Success Criteria Met
- [x] Programs table has realtime subscription
- [x] Notifications table has realtime subscription
- [x] Admin sees plan changes from clients instantly
- [x] Query cache invalidation configured correctly
