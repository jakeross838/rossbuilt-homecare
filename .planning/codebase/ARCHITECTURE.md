# Architecture

**Analysis Date:** 2026-01-19

## Pattern Overview

**Overall:** Feature-based Vertical Slice Architecture with React Query + Supabase

**Key Characteristics:**
- Single-page application (SPA) with React Router for client-side routing
- Server state managed via React Query (TanStack Query) with Supabase as backend
- Client state split between Zustand stores (auth, UI) and local component state
- Multi-tenant architecture with organization-based data isolation via RLS
- Offline-first capability for inspector mobile PWA using IndexedDB
- Real-time data sync via Supabase postgres_changes subscriptions

## Layers

**Presentation Layer:**
- Purpose: Renders UI and handles user interactions
- Location: `apps/admin/src/pages/`, `apps/admin/src/components/`
- Contains: React components, page layouts, forms
- Depends on: Hooks layer, UI components, Zustand stores
- Used by: React Router (entry point)

**Hooks Layer (Data Access):**
- Purpose: Encapsulates data fetching, mutations, and business logic
- Location: `apps/admin/src/hooks/`
- Contains: Custom hooks using React Query for CRUD operations
- Depends on: Supabase client, type definitions, auth store
- Used by: Pages and components

**State Management Layer:**
- Purpose: Manages global client-side state
- Location: `apps/admin/src/stores/`
- Contains: Zustand stores for auth (`auth-store.ts`) and UI (`ui-store.ts`)
- Depends on: Supabase auth
- Used by: Components, hooks, providers

**Data Client Layer:**
- Purpose: Provides typed Supabase client and helper types
- Location: `apps/admin/src/lib/supabase.ts`
- Contains: Supabase client instance, type helpers (Tables, InsertTables, UpdateTables)
- Depends on: Auto-generated database types, environment variables
- Used by: All hooks

**Validation Layer:**
- Purpose: Form validation schemas and data transformation
- Location: `apps/admin/src/lib/validations/`
- Contains: Zod schemas, transform functions, default values
- Depends on: Zod library
- Used by: Forms (react-hook-form integration)

**Type Layer:**
- Purpose: TypeScript type definitions
- Location: `apps/admin/src/types/`, `apps/admin/src/lib/types/`
- Contains: Auto-generated Supabase types (`database.ts`), domain types
- Depends on: Nothing (pure types)
- Used by: All layers

**Offline Layer:**
- Purpose: IndexedDB storage for offline inspector functionality
- Location: `apps/admin/src/lib/offline/`
- Contains: IndexedDB schema, cache operations, sync logic
- Depends on: idb library
- Used by: Inspector hooks and components

## Data Flow

**Read Flow (List/Detail):**
1. Component calls custom hook (e.g., `useClients()`)
2. Hook uses React Query's `useQuery` with Supabase query
3. Supabase client fetches data with RLS filtering by `organization_id`
4. Data returned and cached by React Query
5. Component receives `{ data, isLoading, error }` and renders

**Write Flow (Create/Update/Delete):**
1. Form component collects input, validates with Zod schema
2. Submit triggers mutation hook (e.g., `useCreateClient()`)
3. Hook uses React Query's `useMutation` with Supabase insert/update
4. On success, `onSuccess` callback invalidates related query keys
5. React Query refetches invalidated queries
6. UI updates automatically with new data

**Real-time Sync Flow:**
1. `AppLayout` mounts `useGlobalRealtimeSync()` hook
2. Hook subscribes to Supabase channel for INSERT/UPDATE/DELETE events
3. Events filtered by `organization_id`
4. On event, corresponding React Query cache is invalidated
5. Components subscribed to that data automatically refetch

**Offline Sync Flow (Inspector PWA):**
1. Inspector loads inspection, hook caches to IndexedDB
2. Inspector makes changes (findings, photos) while offline
3. Changes stored in IndexedDB pending tables
4. When online, `useOffline` hook syncs pending data to Supabase
5. Synced items marked as uploaded, cache cleaned up

**State Management:**
- Server state: React Query manages all Supabase data
- Auth state: Zustand `auth-store` with persist middleware
- UI state: Zustand `ui-store` (sidebar, toasts) with persist middleware
- Form state: react-hook-form with Zod resolver

## Key Abstractions

**Query Keys:**
- Purpose: Cache key factory functions for consistent cache management
- Examples: `apps/admin/src/hooks/use-clients.ts` (`clientKeys`), `apps/admin/src/hooks/use-properties.ts` (`propertyKeys`)
- Pattern: Hierarchical keys with filters (e.g., `['clients', 'list', { search, active }]`)

**Typed Supabase Helpers:**
- Purpose: Type-safe database operations
- Examples: `Tables<'clients'>`, `InsertTables<'clients'>`, `UpdateTables<'clients'>`
- Pattern: Generic type helpers wrapping auto-generated database types

**Validation Schemas:**
- Purpose: Form validation with transformation
- Examples: `apps/admin/src/lib/validations/client.ts`, `apps/admin/src/lib/validations/property.ts`
- Pattern: Zod schema + `transform` function + `default` values

**Hook Pattern:**
- Purpose: Encapsulate data operations with consistent interface
- Examples: `useClients()`, `useClient(id)`, `useCreateClient()`, `useUpdateClient()`, `useDeleteClient()`
- Pattern: One hook per operation type, returns React Query result

## Entry Points

**Main Application:**
- Location: `apps/admin/src/main.tsx`
- Triggers: Browser loads the app
- Responsibilities: Mounts React app with StrictMode

**App Root:**
- Location: `apps/admin/src/App.tsx`
- Triggers: main.tsx renders `<App />`
- Responsibilities: Sets up providers (QueryClient, AuthProvider, ErrorBoundary, BrowserRouter), defines routes

**Auth Provider:**
- Location: `apps/admin/src/components/providers/auth-provider.tsx`
- Triggers: App mount
- Responsibilities: Initializes Supabase auth, shows loading state, wraps children

**App Layout (Protected Routes):**
- Location: `apps/admin/src/components/layout/app-layout.tsx`
- Triggers: Authenticated route navigation
- Responsibilities: Auth guard, layout (sidebar/header), real-time sync, toast notifications

**Portal Layout (Client Portal):**
- Location: `apps/admin/src/components/portal/portal-layout.tsx`
- Triggers: `/portal/*` route navigation
- Responsibilities: Client-facing layout, portal-specific real-time sync

**Inspector Dashboard (Mobile PWA):**
- Location: `apps/admin/src/pages/inspector/index.tsx`
- Triggers: `/inspector` route (standalone, no AppLayout)
- Responsibilities: Mobile-first inspection interface, PWA registration, offline support

## Error Handling

**Strategy:** Layered error handling with React Error Boundary and per-query error states

**Patterns:**
- React Error Boundary wraps entire app for catastrophic errors (`apps/admin/src/components/shared/error-boundary.tsx`)
- React Query provides `error` state per query/mutation
- Supabase errors caught and re-thrown in hooks
- Forms show field-level validation errors via Zod
- Toast notifications for user-facing error messages

## Cross-Cutting Concerns

**Logging:** Console logging in development, real-time sync events logged with `[Realtime]` prefix

**Validation:** Zod schemas for all forms, validated before mutation calls

**Authentication:** Supabase Auth with JWT tokens, session persisted and auto-refreshed

**Authorization:** Row Level Security (RLS) policies in Supabase, all queries filtered by `organization_id`

**Multi-tenancy:** Organization-based isolation, `organization_id` required on all data tables

---

*Architecture analysis: 2026-01-19*
