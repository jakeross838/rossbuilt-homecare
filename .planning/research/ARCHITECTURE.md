# Architecture Research: Home Care OS

**Researched:** 2026-01-19
**Domain:** Property Inspection / Home Care Management SaaS
**Confidence:** HIGH (verified via official Supabase documentation and industry patterns)

---

## Executive Summary

Home Care OS should follow a **layered, multi-tenant architecture** with Supabase as the backend-as-a-service foundation. The system separates into three deployment targets: Admin Portal (web), Client Portal (web), and Inspector PWA (offline-first mobile). All share a single Supabase project with Row-Level Security (RLS) enforcing tenant isolation via `organization_id` on every table.

The architecture prioritizes **offline-first for inspectors** using IndexedDB with a sync queue pattern, **real-time updates for admin/client portals** via Supabase Realtime, and **file storage** through Supabase Storage with organization-scoped buckets. PDF report generation happens server-side via Supabase Edge Functions.

**Critical architectural decisions:**
1. RLS from day one - every table includes `organization_id`
2. Offline-first inspector PWA with last-write-wins conflict resolution
3. Separate storage buckets per content type (photos, documents, reports)
4. Edge Functions for PDF generation and scheduled tasks

---

## System Components

### Core Components

| Component | Technology | Purpose | Dependencies |
|-----------|------------|---------|--------------|
| **Database** | Supabase PostgreSQL | Primary data store with RLS | None (foundation) |
| **Auth** | Supabase Auth | User authentication, session management | Database |
| **API Layer** | Supabase auto-generated REST/GraphQL | Data access for all clients | Database, Auth |
| **Realtime** | Supabase Realtime | Live updates for admin/client portals | Database, Auth |
| **Storage** | Supabase Storage | Photos, documents, generated PDFs | Database (metadata), Auth |
| **Edge Functions** | Supabase Edge Functions (Deno) | PDF generation, webhooks, scheduled tasks | Database, Storage |

### Application Layers

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Admin Portal** | Next.js / React | Organization management, scheduling, reporting |
| **Client Portal** | Next.js / React | Client self-service, inspection viewing |
| **Inspector PWA** | React + Workbox + IndexedDB | Offline-capable inspection data capture |
| **Shared UI Library** | React components + Tailwind | Consistent UI across portals |

### Supporting Services

| Service | Technology | Purpose |
|---------|------------|---------|
| **Local Database** | IndexedDB (via Dexie.js or idb) | Offline data storage for PWA |
| **Sync Engine** | Custom sync queue | Offline-to-online reconciliation |
| **Service Worker** | Workbox | Caching, background sync |
| **PDF Generator** | pdf-lib in Edge Function | Inspection report generation |
| **Email Service** | Resend / SendGrid via Edge Function | Notifications, report delivery |

### External Integrations

| Integration | Purpose | Connection Point |
|-------------|---------|------------------|
| **Stripe** | Billing, subscriptions | Edge Functions + Webhooks |
| **Email Provider** | Transactional email | Edge Functions |
| **Calendar Sync** | Google/Outlook calendar | Edge Functions + OAuth |

---

## Data Flow

### Primary Data Flows

```
[Inspector in Field]
      |
      v
[PWA: Local IndexedDB] ---(when online)---> [Sync Queue]
      |                                           |
      v                                           v
[Offline UI] <---(immediate)        [Supabase API] ---> [PostgreSQL]
                                          |                    |
                                          v                    v
                                    [Realtime]           [Storage]
                                          |                    |
                                          v                    v
                              [Admin Portal] <--------- [Photos/PDFs]
                              [Client Portal]
```

### Inspection Workflow Data Flow

1. **Schedule Created (Admin Portal)**
   - Admin creates inspection via API
   - PostgreSQL stores with `organization_id`
   - Realtime broadcasts to subscribed clients
   - PWA syncs on next online interval

2. **Inspection Performed (PWA - Offline)**
   - Inspector opens assigned inspection
   - Data loaded from IndexedDB (offline-first)
   - Photos captured, stored locally with unique IDs
   - Form data saved to IndexedDB immediately
   - UI shows "pending sync" status

3. **Sync to Server (PWA - Online)**
   - Background sync detects connectivity
   - Sync queue processes pending changes
   - Photos uploaded to Supabase Storage
   - Inspection data upserted to PostgreSQL
   - Conflicts resolved via last-write-wins
   - Local records marked as synced

4. **Report Generation (Edge Function)**
   - Triggered by inspection completion
   - Edge Function fetches inspection data
   - pdf-lib generates PDF report
   - PDF stored in Supabase Storage
   - Notification sent to client

5. **Client Views Report (Client Portal)**
   - Client authenticates via Supabase Auth
   - RLS filters to their `organization_id`
   - Report retrieved from Storage
   - Real-time subscription for updates

---

## Multi-Tenant Architecture

### Tenant Isolation Strategy: Pooled with RLS

All tenants share the same database with `organization_id` column on every table. Row-Level Security enforces isolation at the database level.

**Why Pooled (not Silo or Bridge):**
- Cost-efficient for SMB target market
- Simpler operational overhead
- RLS provides strong isolation guarantee
- Supabase natively supports this pattern

### RLS Implementation Pattern

```sql
-- Every table follows this pattern
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    scheduled_date TIMESTAMPTZ,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Create organization membership lookup (optimized with SELECT wrapper)
CREATE POLICY "Users access their org inspections"
ON inspections FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id
        FROM user_organizations
        WHERE user_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id
        FROM user_organizations
        WHERE user_id = (SELECT auth.uid())
    )
);

-- Index for RLS performance (critical)
CREATE INDEX idx_inspections_org_id ON inspections(organization_id);
CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
```

### Organization Membership Model

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    stripe_customer_id TEXT,
    subscription_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_organizations (
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'inspector', 'viewer')),
    PRIMARY KEY (user_id, organization_id)
);
```

### Role-Based Access Within Organization

| Role | Capabilities |
|------|-------------|
| **owner** | Full access, billing, user management |
| **admin** | CRUD all data, user invites (not billing) |
| **inspector** | View assigned inspections, create/update inspection data |
| **viewer** | Read-only access (for clients) |

```sql
-- Example: Only admins+ can delete inspections
CREATE POLICY "Admins can delete inspections"
ON inspections FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_id = (SELECT auth.uid())
        AND organization_id = inspections.organization_id
        AND role IN ('owner', 'admin')
    )
);
```

### Critical RLS Best Practices

1. **Wrap `auth.uid()` in SELECT** - Caches result per-statement, 99%+ performance improvement
2. **Index all `organization_id` columns** - Essential for RLS query performance
3. **Never use service_role key client-side** - Bypasses all RLS
4. **Test every access pattern** - Integration tests verifying tenant isolation

---

## Offline-First Architecture

### Strategy: Local-First with Sync Queue

The PWA treats the local IndexedDB as the source of truth. Network is an optimization for syncing, not a requirement for operation.

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Local DB** | IndexedDB via Dexie.js | Structured offline storage |
| **Sync Queue** | Custom queue in IndexedDB | Pending operations |
| **Service Worker** | Workbox | Asset caching, background sync |
| **State Management** | Zustand or TanStack Query | UI state, optimistic updates |

### Data Flow Architecture

```
[UI Component]
      |
      v
[Repository Layer] <-- Single interface for all data access
      |
      +---> [IndexedDB] <-- Always write here first
      |           |
      |           v
      |     [Sync Queue] <-- Track pending changes
      |           |
      |           v (when online)
      +---> [Supabase API] <-- Background sync
                  |
                  v
            [Reconciliation] <-- Merge server response
                  |
                  v
            [IndexedDB] <-- Update local with server state
```

### IndexedDB Schema

```typescript
// Using Dexie.js
const db = new Dexie('HomeCareOS');

db.version(1).stores({
  // Synced tables (mirror server structure)
  inspections: 'id, organization_id, property_id, scheduled_date, [_syncStatus+organization_id]',
  properties: 'id, organization_id, client_id, [_syncStatus+organization_id]',
  clients: 'id, organization_id, [_syncStatus+organization_id]',
  equipment: 'id, organization_id, property_id, [_syncStatus+organization_id]',

  // Local-only tables
  syncQueue: '++id, table, operation, recordId, timestamp',
  pendingPhotos: '++id, inspectionId, blob, uploadStatus',
  cachedPhotos: 'id, url, blob, cachedAt'
});
```

### Sync Status Tracking

Every synced record includes metadata:

```typescript
interface SyncMetadata {
  _syncStatus: 'synced' | 'pending' | 'conflict';
  _localUpdatedAt: string;  // ISO timestamp
  _serverUpdatedAt: string; // From Supabase
  _syncError?: string;      // Last error if any
}
```

### Conflict Resolution: Last-Write-Wins

For 95% of inspection data, last-write-wins is appropriate:

```typescript
async function resolveConflict(local: Record, server: Record): Promise<Record> {
  // Server timestamp wins
  if (new Date(server._serverUpdatedAt) > new Date(local._localUpdatedAt)) {
    return { ...server, _syncStatus: 'synced' };
  }

  // Local is newer, push to server
  return { ...local, _syncStatus: 'pending' };
}
```

**When LWW is insufficient:**
- Concurrent edits to same inspection by multiple users
- Consider per-field merging or operational transforms
- Flag for manual review in conflict queue

### Service Worker Caching Strategy

```typescript
// workbox-config.js
module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
  swDest: 'dist/sw.js',
  runtimeCaching: [
    {
      // App shell - cache first
      urlPattern: /\.(?:js|css|html)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'app-shell',
        expiration: { maxAgeSeconds: 7 * 24 * 60 * 60 }
      }
    },
    {
      // API calls - network first with fallback
      urlPattern: /\/rest\/v1\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 3
      }
    },
    {
      // Photos - cache first (immutable once uploaded)
      urlPattern: /\/storage\/v1\/object\/public\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'photo-cache',
        expiration: { maxEntries: 500 }
      }
    }
  ]
};
```

### Background Sync Implementation

```typescript
// In service worker
self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-inspections') {
    event.waitUntil(syncPendingChanges());
  }
});

async function syncPendingChanges() {
  const queue = await db.syncQueue.toArray();

  for (const item of queue) {
    try {
      await processQueueItem(item);
      await db.syncQueue.delete(item.id);
    } catch (error) {
      if (!isRetryable(error)) {
        await markAsFailed(item, error);
      }
      // Retryable errors stay in queue for next sync
    }
  }
}
```

### Offline UI Patterns

1. **Optimistic updates** - UI updates immediately, sync happens in background
2. **Sync status indicators** - Badge showing pending/synced/error state
3. **Manual sync trigger** - "Sync Now" button for explicit user control
4. **Conflict UI** - Modal for manual resolution when needed

---

## File Storage Strategy

### Bucket Organization

| Bucket | Access | Content | Retention |
|--------|--------|---------|-----------|
| `inspection-photos` | Private | Inspection images | Indefinite |
| `documents` | Private | Property docs, contracts | Indefinite |
| `reports` | Private | Generated PDF reports | Indefinite |
| `avatars` | Public | User profile images | Indefinite |
| `temp-uploads` | Private | In-progress uploads | 24 hours |

### Storage Path Convention

```
{bucket}/{organization_id}/{entity_type}/{entity_id}/{filename}

Examples:
inspection-photos/org_123/inspections/insp_456/photo_001.jpg
documents/org_123/properties/prop_789/contract.pdf
reports/org_123/inspections/insp_456/report_2026-01-19.pdf
```

### RLS for Storage

```sql
-- Storage policy for inspection-photos bucket
CREATE POLICY "Users access their org photos"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'inspection-photos'
    AND (storage.foldername(name))[1] IN (
        SELECT organization_id::text
        FROM user_organizations
        WHERE user_id = auth.uid()
    )
);
```

### Photo Upload Flow (PWA)

```typescript
async function captureAndStorePhoto(inspectionId: string, photoBlob: Blob) {
  const photoId = crypto.randomUUID();

  // 1. Store locally immediately
  await db.pendingPhotos.add({
    id: photoId,
    inspectionId,
    blob: photoBlob,
    uploadStatus: 'pending',
    capturedAt: new Date().toISOString()
  });

  // 2. Update UI optimistically
  notifyPhotoAdded(photoId);

  // 3. Queue for background upload
  if (navigator.onLine) {
    uploadPhoto(photoId);
  }
  // Otherwise, service worker will pick up on next sync
}

async function uploadPhoto(photoId: string) {
  const photo = await db.pendingPhotos.get(photoId);
  const path = `${orgId}/inspections/${photo.inspectionId}/${photoId}.jpg`;

  const { error } = await supabase.storage
    .from('inspection-photos')
    .upload(path, photo.blob, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (!error) {
    await db.pendingPhotos.update(photoId, { uploadStatus: 'uploaded' });
    // Store URL reference in inspection record
  }
}
```

### PDF Generation Architecture

```typescript
// Edge Function: generate-report
import { serve } from 'https://deno.land/std/http/server.ts';
import { PDFDocument } from 'https://esm.sh/pdf-lib';

serve(async (req) => {
  const { inspectionId } = await req.json();

  // Fetch inspection data
  const inspection = await supabase
    .from('inspections')
    .select(`
      *,
      property:properties(*),
      items:inspection_items(*),
      photos:inspection_photos(*)
    `)
    .eq('id', inspectionId)
    .single();

  // Generate PDF
  const pdfDoc = await PDFDocument.create();
  // ... populate PDF with inspection data

  const pdfBytes = await pdfDoc.save();

  // Store in Supabase Storage
  const path = `${inspection.organization_id}/inspections/${inspectionId}/report.pdf`;
  await supabase.storage
    .from('reports')
    .upload(path, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true
    });

  // Update inspection record with report URL
  await supabase
    .from('inspections')
    .update({ report_url: path, report_generated_at: new Date() })
    .eq('id', inspectionId);

  return new Response(JSON.stringify({ success: true, path }));
});
```

---

## Component Dependencies

### Build Order (Recommended Sequence)

The following sequence respects dependencies where each phase builds on the previous.

#### Phase 1: Foundation
**What:** Database schema, authentication, RLS policies
**Depends on:** Nothing
**Blocks:** Everything else

```
[Organizations] --> [Users] --> [RLS Policies]
       |
       v
[Core Entities: Clients, Properties, Equipment]
```

#### Phase 2: API & Core CRUD
**What:** Data access patterns, basic CRUD operations
**Depends on:** Phase 1 (database)
**Blocks:** All UI work

```
[Supabase Client Setup] --> [CRUD Utilities] --> [Type Definitions]
```

#### Phase 3: Admin Portal - Core
**What:** Authentication UI, organization dashboard, entity management
**Depends on:** Phase 1, 2
**Blocks:** Client portal, inspector PWA (shared components)

```
[Auth Pages] --> [Dashboard] --> [Entity CRUD UIs]
```

#### Phase 4: Inspection Workflow
**What:** Inspection scheduling, templates, checklist system
**Depends on:** Phase 1-3
**Blocks:** PWA (needs inspection data model)

```
[Inspection Templates] --> [Scheduling] --> [Assignment System]
```

#### Phase 5: File Storage
**What:** Photo upload, document management, storage policies
**Depends on:** Phase 1 (storage RLS)
**Blocks:** PWA photo capture, report generation

```
[Storage Buckets] --> [Upload Utilities] --> [Photo Gallery UI]
```

#### Phase 6: Inspector PWA
**What:** Offline-first mobile interface, IndexedDB, sync engine
**Depends on:** Phase 1-5
**Blocks:** Nothing (parallel track possible after Phase 4)

```
[IndexedDB Schema] --> [Sync Engine] --> [Offline UI] --> [Photo Capture]
```

#### Phase 7: Realtime & Notifications
**What:** Live updates, push notifications
**Depends on:** Phase 1-3
**Blocks:** Client portal real-time features

```
[Realtime Subscriptions] --> [Notification System] --> [Push Notifications]
```

#### Phase 8: Client Portal
**What:** Client self-service, inspection viewing
**Depends on:** Phase 1-4, 7
**Blocks:** Nothing

```
[Client Auth] --> [Property View] --> [Inspection Reports] --> [Communication]
```

#### Phase 9: Reports & Analytics
**What:** PDF generation, dashboards, analytics
**Depends on:** Phase 1-5, inspection data
**Blocks:** Nothing (can be deferred)

```
[Edge Functions] --> [PDF Generation] --> [Report Storage] --> [Dashboards]
```

#### Phase 10: Billing & Subscriptions
**What:** Stripe integration, subscription management
**Depends on:** Phase 1-3
**Blocks:** Production launch

```
[Stripe Setup] --> [Subscription Model] --> [Billing UI] --> [Webhooks]
```

### Dependency Graph (ASCII)

```
                    [Phase 1: Foundation]
                            |
                            v
                    [Phase 2: API/CRUD]
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
      [Phase 3:       [Phase 5:      [Phase 10:
      Admin Core]     Storage]       Billing]
              |             |
              v             |
      [Phase 4:            |
      Inspections] <-------+
              |
    +---------+---------+
    |                   |
    v                   v
[Phase 6:           [Phase 7:
PWA]                Realtime]
                        |
                        v
                    [Phase 8:
                    Client Portal]
                        |
                        v
                    [Phase 9:
                    Reports]
```

---

## Recommended Architecture Diagram

```
+------------------------------------------------------------------+
|                         CLIENTS                                    |
+------------------------------------------------------------------+
|                                                                    |
|  +-----------------+  +-----------------+  +-----------------+     |
|  |  Admin Portal   |  |  Client Portal  |  |  Inspector PWA  |     |
|  |  (Next.js)      |  |  (Next.js)      |  |  (React + SW)   |     |
|  +-----------------+  +-----------------+  +-----------------+     |
|         |                    |                    |                |
|         |                    |                    v                |
|         |                    |           +---------------+         |
|         |                    |           |  IndexedDB    |         |
|         |                    |           |  (Dexie.js)   |         |
|         |                    |           +-------+-------+         |
|         |                    |                   |                 |
|         +--------------------+-------------------+                 |
|                              |                                     |
+------------------------------------------------------------------+
                               |
                               v
+------------------------------------------------------------------+
|                      SUPABASE PLATFORM                            |
+------------------------------------------------------------------+
|                                                                    |
|  +-------------------+  +-------------------+  +----------------+  |
|  |    Supabase       |  |    Supabase       |  |   Supabase     |  |
|  |    Auth           |  |    Realtime       |  |   Storage      |  |
|  +-------------------+  +-------------------+  +----------------+  |
|           |                     |                     |            |
|           +---------------------+---------------------+            |
|                                 |                                  |
|                                 v                                  |
|  +----------------------------------------------------------+     |
|  |                    PostgreSQL + RLS                       |     |
|  |  +----------+ +----------+ +----------+ +----------+      |     |
|  |  | orgs     | | users    | | clients  | | inspect. |      |     |
|  |  +----------+ +----------+ +----------+ +----------+      |     |
|  +----------------------------------------------------------+     |
|                                 |                                  |
|                                 v                                  |
|  +----------------------------------------------------------+     |
|  |                    Edge Functions                         |     |
|  |  [PDF Gen] [Stripe Webhooks] [Scheduled Tasks] [Email]   |     |
|  +----------------------------------------------------------+     |
|                                                                    |
+------------------------------------------------------------------+
                               |
                               v
+------------------------------------------------------------------+
|                    EXTERNAL SERVICES                              |
+------------------------------------------------------------------+
|  [Stripe]  [Email Provider]  [Calendar APIs]  [Push Service]      |
+------------------------------------------------------------------+
```

---

## Anti-Patterns to Avoid

### 1. Forgetting RLS on New Tables
**Risk:** Data leakage between tenants
**Prevention:** Checklist for every migration - RLS enabled + policy created + index added

### 2. Direct Supabase Calls from UI
**Risk:** Scattered data access, hard to add offline support
**Prevention:** Repository pattern - single interface for all data access

### 3. Storing Files in Database
**Risk:** Performance degradation, backup complexity
**Prevention:** Always use Supabase Storage, store only paths/URLs in database

### 4. Realtime on Every Table
**Risk:** Connection overload, unnecessary traffic
**Prevention:** Enable realtime only where needed (inspections, assignments, chat)

### 5. Single Global Cache Strategy
**Risk:** Stale data or unnecessary network calls
**Prevention:** Per-asset caching strategy (cache-first for shell, network-first for user data)

### 6. Assuming Online Connectivity
**Risk:** Poor inspector experience in field
**Prevention:** Offline-first architecture - local DB is source of truth

---

## Sources

### Primary (HIGH Confidence)
- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS patterns, policy syntax
- [Supabase Realtime Architecture](https://supabase.com/docs/guides/realtime/architecture) - Realtime implementation
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage) - File storage patterns
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions) - Server-side execution

### Secondary (MEDIUM Confidence)
- [AWS Multi-tenant RLS Guide](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/) - RLS patterns for multi-tenancy
- [MDN PWA Offline Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) - Service worker patterns
- [PowerSync + Supabase](https://www.powersync.com/blog/offline-first-apps-made-simple-supabase-powersync) - Offline sync patterns
- [RxDB Supabase Replication](https://rxdb.info/replication-supabase.html) - Conflict resolution strategies

### Tertiary (LOW Confidence - Community Sources)
- [Medium: Building Offline-First PWA with Next.js and Supabase](https://oluwadaprof.medium.com/building-an-offline-first-pwa-notes-app-with-next-js-indexeddb-and-supabase-f861aa3a06f9)
- [Supabase Community Discussion: Offline Support](https://github.com/orgs/supabase/discussions/357)
- [Supabase Community Discussion: PDF Generation](https://github.com/orgs/supabase/discussions/38327)

---

## Metadata

**Confidence breakdown:**
- Multi-tenant RLS: HIGH - Official Supabase docs + AWS best practices
- Offline-first patterns: MEDIUM - Community patterns + MDN reference
- File storage: HIGH - Official Supabase docs
- Build order: MEDIUM - Derived from dependency analysis + SaaS patterns

**Research date:** 2026-01-19
**Valid until:** 2026-04-19 (90 days - architecture patterns stable)

---

## Implications for Roadmap

Based on this research, the roadmap should follow these principles:

1. **Foundation First** - Database schema with RLS must be complete before any UI work
2. **Admin Before Client** - Admin portal establishes patterns that client portal reuses
3. **PWA Can Parallel** - After inspection data model exists, PWA can develop in parallel
4. **Defer Reports** - PDF generation is valuable but not blocking; can ship v1 without
5. **Billing Before Launch** - Stripe integration needed for production but not for MVP testing

**Suggested phase groupings:**
- Phase 1: Database + Auth + RLS (foundation)
- Phase 2: Core entity CRUD (clients, properties, equipment)
- Phase 3: Inspection workflow (scheduling, templates, assignment)
- Phase 4: Admin dashboard + basic reporting
- Phase 5: Inspector PWA with offline sync
- Phase 6: Client portal
- Phase 7: Advanced features (billing, notifications, analytics)
