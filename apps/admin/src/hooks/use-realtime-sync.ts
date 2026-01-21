import { useEffect, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

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

interface RealtimeConfig {
  tables: TableName[]
  onUpdate?: (table: TableName, payload: unknown) => void
}

// Map table names to query keys (static, no need for useMemo)
const queryKeyMap: Record<TableName, string[][]> = {
  clients: [['clients'], ['portal', 'dashboard']],
  properties: [['properties'], ['portal', 'properties'], ['portal', 'dashboard']],
  equipment: [['equipment'], ['portal', 'properties']],
  work_orders: [['workOrders'], ['portal', 'properties'], ['portal', 'dashboard']],
  inspections: [['inspections'], ['portal', 'inspections'], ['portal', 'dashboard']],
  invoices: [['invoices'], ['portal', 'invoices'], ['portal', 'dashboard']],
  service_requests: [['serviceRequests'], ['portal', 'requests'], ['portal', 'dashboard']],
  vendors: [['vendors']],
  reminders: [['reminders']],
  calendar_events: [['calendar'], ['calendarEvents']],
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
          console.log(`[Realtime] ${table} INSERT:`, payload.new)
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
          console.log(`[Realtime] ${table} UPDATE:`, payload.new)
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
          console.log(`[Realtime] ${table} DELETE:`, payload.old)
          invalidateTable(table)
          onUpdateCallback?.(table, payload)
        }
      )
    })

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`[Realtime] Subscription status: ${status}`)
    })

    // Cleanup on unmount
    return () => {
      console.log('[Realtime] Unsubscribing from channel')
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
  ], [])

  return useRealtimeSync({ tables })
}
