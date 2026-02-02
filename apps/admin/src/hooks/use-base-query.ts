/**
 * Base Query Hook Templates
 *
 * Provides standardized patterns for React Query usage:
 * - Consistent cache timing via getCacheConfig
 * - Type-safe query options
 * - Built-in loading/error state helpers
 * - AUTOMATIC realtime subscription (SYNC-05.3)
 *
 * Usage:
 *   const { data, isLoading, error } = useBaseQuery({
 *     queryKey: clientKeys.list({}),
 *     queryFn: async () => fetchClients(),
 *     cacheStrategy: 'realtime',
 *     realtimeTable: 'clients'  // Enables automatic realtime sync
 *   })
 */

import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query'
import { getCacheConfig, CacheStrategy } from '@/lib/queries/config'
import { useRealtimeSync } from '@/hooks/use-realtime-sync'
import { useMemo } from 'react'

// Import TableName type from realtime-sync (duplicated here for type-safety)
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

interface BaseQueryOptions<TData, TError = Error>
  extends Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'staleTime'> {
  /** Cache strategy to use (determines staleTime) */
  cacheStrategy?: CacheStrategy
  /** Table name for automatic realtime subscription (SYNC-05.3) */
  realtimeTable?: TableName
}

/**
 * Base query hook with standardized cache timing and optional realtime sync
 *
 * @param options - Query options with cacheStrategy instead of raw staleTime
 * @returns Standard React Query result
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useBaseQuery({
 *   queryKey: clientKeys.list({}),
 *   queryFn: () => fetchClients(),
 *   cacheStrategy: 'realtime',
 *   realtimeTable: 'clients',
 * })
 * ```
 */
export function useBaseQuery<TData, TError = Error>(
  options: BaseQueryOptions<TData, TError>
) {
  const { cacheStrategy = 'standard', realtimeTable, ...queryOptions } = options
  const cacheConfig = getCacheConfig(cacheStrategy)

  // Set up realtime subscription if table specified (SYNC-05.3)
  const tables = useMemo(
    () => (realtimeTable ? [realtimeTable] : []),
    [realtimeTable]
  )
  useRealtimeSync({ tables })

  return useQuery({
    ...queryOptions,
    ...cacheConfig,
  })
}

/**
 * Specialized hook for list queries
 * Uses realtime strategy by default for live updates
 *
 * @param options - Query options for list data
 * @returns Standard React Query result with array data
 *
 * @example
 * ```tsx
 * const { data: clients } = useBaseList({
 *   queryKey: clientKeys.list({}),
 *   queryFn: () => fetchClients(),
 *   realtimeTable: 'clients',
 * })
 * ```
 */
export function useBaseList<TData, TError = Error>(
  options: Omit<BaseQueryOptions<TData[], TError>, 'cacheStrategy'> & {
    cacheStrategy?: CacheStrategy
  }
) {
  return useBaseQuery<TData[], TError>({
    ...options,
    cacheStrategy: options.cacheStrategy ?? 'realtime',
  })
}

/**
 * Specialized hook for detail queries
 * Uses realtime strategy by default for live updates
 * Automatically disables query when id is undefined
 *
 * @param options - Query options with required id parameter
 * @returns Standard React Query result
 *
 * @example
 * ```tsx
 * const { data: client } = useBaseDetail({
 *   id: clientId,
 *   queryKey: clientKeys.detail(clientId),
 *   queryFn: () => fetchClient(clientId),
 *   realtimeTable: 'clients',
 * })
 * ```
 */
export function useBaseDetail<TData, TError = Error>(
  options: Omit<BaseQueryOptions<TData, TError>, 'cacheStrategy'> & {
    cacheStrategy?: CacheStrategy
    /** The entity ID - query is disabled when undefined */
    id: string | undefined
  }
) {
  const { id, ...queryOptions } = options

  return useBaseQuery<TData, TError>({
    ...queryOptions,
    cacheStrategy: options.cacheStrategy ?? 'realtime',
    enabled: !!id && (options.enabled ?? true),
  })
}
