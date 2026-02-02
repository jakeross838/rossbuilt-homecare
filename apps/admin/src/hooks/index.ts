/**
 * Hooks Barrel Export
 *
 * Re-exports base hook templates for convenient imports:
 *   import { useBaseQuery, useOptimisticMutation } from '@/hooks'
 *
 * Note: Only base templates are exported here. Domain-specific hooks
 * (use-clients, use-properties, etc.) should be imported directly
 * to avoid circular dependencies and keep bundle size optimized.
 */

// Base hook templates
export { useBaseQuery, useBaseList, useBaseDetail } from './use-base-query'
export { useBaseMutation, useOptimisticMutation } from './use-base-mutation'
