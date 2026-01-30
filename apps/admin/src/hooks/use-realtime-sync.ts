import { useEffect, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { DEBUG } from '@/config/app-config'

type TableName =
  | 'clients'
  | 'properties'
  | 'equipment'
  | 'work_orders'
  | 'inspections'
  | 'invoices'
  | 'service_requests'
  | 'vendors'
  | 'reminders'
  | 'calendar_events'
  | 'programs'
  | 'notifications'
  | 'user_property_assignments'
  | 'recommendations'

interface RealtimeConfig {
  tables: TableName[]
  onUpdate?: (table: TableName, payload: unknown) => void
}

/**
 * Map table names to React Query keys for cache invalidation.
 * Cross-portal sync requirements (STAB-29 through STAB-34):
 * - user_property_assignments: Syncs property access to Client/Tech portals
 * - work_orders: Syncs across Admin/Tech/Client
 * - inspections: Syncs across Admin/Tech/Client
 * - invoices: Syncs across Admin/Client
 * - service_requests: Syncs across Admin/Client
 * - programs: Syncs plan changes to Client portal
 */
/**
 * Map table names to React Query keys for cache invalidation.
 * Cross-portal sync requirements (STAB-29 through STAB-34):
 * - user_property_assignments: Syncs property access to Client/Tech portals
 * - work_orders: Syncs across Admin/Tech/Client
 * - inspections: Syncs across Admin/Tech/Client
 * - invoices: Syncs across Admin/Client
 * - service_requests: Syncs across Admin/Client
 * - programs: Syncs plan changes to Client portal
 *
 * Note: Keys must match what the hooks use. portalKeys.requests() = ['portal', 'requests']
 */
const queryKeyMap: Record<TableName, string[][]> = {
  clients: [['clients'], ['portal', 'dashboard']],
  properties: [
    ['properties'],
    ['portal', 'properties'],
    ['portal', 'property-summaries'],
    ['portal', 'dashboard'],
  ],
  equipment: [['equipment'], ['portal', 'properties'], ['portal', 'property-summaries']],
  work_orders: [
    ['work-orders'],
    ['portal', 'properties'],
    ['portal', 'property-summaries'],
    ['portal', 'dashboard'],
    ['dashboard'],
    ['work-order-metrics'],
  ],
  inspections: [
    ['inspections'],
    ['inspection'],
    ['calendar-inspections'],
    ['property-inspections'],
    ['inspector-workload'],
    ['inspector-schedule'],
    ['inspector-inspection'],
    ['inspector-upcoming'],
    ['inspectors'],
    ['inspection-metrics'],
    ['portal', 'inspections'],
    ['portal', 'inspection'],
    ['portal', 'properties'],
    ['portal', 'property-summaries'],
    ['portal', 'dashboard'],
    ['dashboard'],
  ],
  invoices: [['invoices'], ['portal', 'invoices'], ['portal', 'invoice'], ['portal', 'dashboard']],
  service_requests: [
    ['service-requests'],
    ['portal', 'requests'],
    ['portal', 'request'],
    ['portal', 'dashboard'],
  ],
  vendors: [['vendors']],
  reminders: [['reminders']],
  calendar_events: [['calendar'], ['calendar-events']],
  programs: [
    ['programs'],
    ['portal', 'properties'],
    ['portal', 'property-summaries'],
    ['portal', 'dashboard'],
    ['admin', 'properties-overview'],
  ],
  notifications: [['notifications'], ['portal', 'notifications'], ['admin', 'notifications']],
  user_property_assignments: [
    ['property-assignments'],
    ['portal', 'properties'],
    ['portal', 'property-summaries'],
    ['portal', 'dashboard'],
    ['users'],
  ],
  recommendations: [
    ['recommendations'],
    ['portal', 'properties'],
    ['portal', 'property-summaries'],
  ],
}

/**
 * Real-time sync hook that subscribes to Supabase postgres_changes
 * Automatically invalidates React Query cache when data changes
 * Works for both admin and portal views
 */
export function useRealtimeSync(config: RealtimeConfig) {
  const { profile } = useAuthStore()
  const queryClient = useQueryClient()
  const orgId = profile?.organization_id

  // Memoize the tables array to prevent unnecessary re-renders
  const tablesList = useMemo(() => config.tables, [config.tables])
  const onUpdateCallback = config.onUpdate

  // Invalidate queries for a specific table
  const invalidateTable = useCallback((table: TableName) => {
    const keys = queryKeyMap[table] || [[table]]
    keys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key })
    })
  }, [queryClient])

  useEffect(() => {
    if (!orgId) return

    // Create a channel for all table subscriptions
    const channel = supabase.channel(`realtime-sync-${orgId}`)

    // Subscribe to each table
    tablesList.forEach((table) => {
      // Listen for INSERT events
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: table,
          filter: `organization_id=eq.${orgId}`,
        },
        (payload) => {
          if (DEBUG.REALTIME_LOGGING) {
            console.log(`[Realtime] ${table} INSERT:`, payload.new)
          }
          invalidateTable(table)
          onUpdateCallback?.(table, payload)
        }
      )

      // Listen for UPDATE events
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
          filter: `organization_id=eq.${orgId}`,
        },
        (payload) => {
          if (DEBUG.REALTIME_LOGGING) {
            console.log(`[Realtime] ${table} UPDATE:`, payload.new)
          }
          invalidateTable(table)
          onUpdateCallback?.(table, payload)
        }
      )

      // Listen for DELETE events
      channel.on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: table,
          filter: `organization_id=eq.${orgId}`,
        },
        (payload) => {
          if (DEBUG.REALTIME_LOGGING) {
            console.log(`[Realtime] ${table} DELETE:`, payload.old)
          }
          invalidateTable(table)
          onUpdateCallback?.(table, payload)
        }
      )
    })

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (DEBUG.REALTIME_LOGGING) {
        console.log(`[Realtime] Subscription status: ${status}`)
      }
    })

    // Cleanup on unmount
    return () => {
      if (DEBUG.REALTIME_LOGGING) {
        console.log('[Realtime] Unsubscribing from channel')
      }
      supabase.removeChannel(channel)
    }
  }, [orgId, tablesList, invalidateTable, onUpdateCallback])

  return { invalidateTable }
}

/**
 * Hook to enable real-time sync for all main data tables
 * Use this in the app layout to enable global real-time updates
 */
export function useGlobalRealtimeSync() {
  const tables = useMemo<TableName[]>(() => [
    'clients',
    'properties',
    'equipment',
    'work_orders',
    'inspections',
    'invoices',
    'service_requests',
    'vendors',
    'reminders',
    'calendar_events',
    'programs',
    'notifications',
    'user_property_assignments',
    'recommendations',
  ], [])

  return useRealtimeSync({ tables })
}

/**
 * Hook for portal-specific real-time sync
 * Only subscribes to tables relevant to client portal
 */
export function usePortalRealtimeSync() {
  const tables = useMemo<TableName[]>(() => [
    'properties',
    'equipment',
    'work_orders',
    'inspections',
    'invoices',
    'service_requests',
    'programs',
    'notifications',
    'user_property_assignments',
    'recommendations',
  ], [])

  return useRealtimeSync({ tables })
}

/**
 * Hook for inspector portal real-time sync
 * Subscribes to inspection-related tables for mobile inspector app
 */
export function useInspectorRealtimeSync() {
  const tables = useMemo<TableName[]>(() => [
    'inspections',
    'work_orders',
    'properties',
    'recommendations',
  ], [])

  return useRealtimeSync({ tables })
}
