/**
 * Queries Module Barrel Export
 *
 * Re-exports all query-related utilities from a single location.
 * Enables: import { queryKeys, STALE_STANDARD, getCacheConfig } from '@/lib/queries'
 */

// Re-export cache configuration
export * from './config'

// Re-export query keys
export * from './keys'
