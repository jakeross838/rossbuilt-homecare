/**
 * Query cache configuration
 * All staleTime and cacheTime values should come from here
 *
 * Principle: Realtime-synced data should have staleTime: 0
 * Other data should have appropriate staleness based on update frequency
 */

// Cache timing constants (in milliseconds)
export const STALE_REALTIME = 0           // For realtime-synced data
export const STALE_FAST = 30 * 1000       // 30 seconds - for frequently updated data
export const STALE_ACTIVITY = 60 * 1000   // 1 minute - for activity feeds
export const STALE_STANDARD = 5 * 60 * 1000  // 5 minutes - for standard data

// Cache time (how long to keep in cache after unmount)
export const CACHE_STANDARD = 10 * 60 * 1000  // 10 minutes

// Refetch intervals for polling (only for non-realtime data)
export const REFETCH_NOTIFICATIONS = 15 * 1000  // 15 seconds
export const REFETCH_ACTIVITY = 60 * 1000       // 1 minute

/**
 * Get standard cache config for a query type
 */
export type CacheStrategy = 'realtime' | 'fast' | 'activity' | 'standard'

export function getCacheConfig(strategy: CacheStrategy) {
  switch (strategy) {
    case 'realtime':
      return { staleTime: STALE_REALTIME }
    case 'fast':
      return { staleTime: STALE_FAST }
    case 'activity':
      return { staleTime: STALE_ACTIVITY }
    case 'standard':
    default:
      return { staleTime: STALE_STANDARD }
  }
}

/**
 * Default QueryClient options
 * Use these when creating the QueryClient in App.tsx
 */
export const DEFAULT_QUERY_OPTIONS = {
  queries: {
    staleTime: STALE_STANDARD,
    gcTime: CACHE_STANDARD,
    retry: 1,  // SYNC-10.4: Retry mechanism - one automatic retry on failure
    refetchOnWindowFocus: false,
  },
  mutations: {
    onError: (error: Error) => {
      if (import.meta.env.DEV) {
        console.error('[Query Error]', new Date().toISOString(), error.message)
      }
    }
  }
}
