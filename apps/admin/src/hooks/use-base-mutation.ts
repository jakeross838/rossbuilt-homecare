/**
 * Base Mutation Hook Templates
 *
 * Provides standardized patterns for React Query mutations:
 * - Optimistic UI updates (SYNC-06.1)
 * - Automatic rollback on error (SYNC-06.2)
 * - Always refetch on settled (SYNC-06.3)
 * - Toast notifications on success/error (SYNC-06.5)
 *
 * Usage:
 *   const mutation = useOptimisticMutation({
 *     mutationFn: (data) => updateClient(data),
 *     queryKey: clientKeys.list({}),
 *     updateCache: (old, newData) => [...old, newData],
 *     successMessage: 'Client updated successfully',
 *   })
 */

import { useMutation, useQueryClient, QueryKey, MutationOptions } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

interface BaseMutationOptions<TData, TError, TVariables, TContext>
  extends Omit<MutationOptions<TData, TError, TVariables, TContext>, 'onSuccess' | 'onError'> {
  /** Message to show in toast on success */
  successMessage?: string
  /** Message to show in toast on error (falls back to error message) */
  errorMessage?: string
  /** Custom success handler */
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void
  /** Custom error handler */
  onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void
  /** Additional query keys to invalidate on success */
  invalidateKeys?: QueryKey[]
}

/**
 * Base mutation hook with toast notifications
 *
 * @param options - Mutation options with success/error messages
 * @returns Standard React Query mutation result
 *
 * @example
 * ```tsx
 * const createClient = useBaseMutation({
 *   mutationFn: (data) => supabase.from('clients').insert(data),
 *   successMessage: 'Client created successfully',
 *   invalidateKeys: [clientKeys.lists()],
 * })
 * ```
 */
export function useBaseMutation<TData, TError = Error, TVariables = void, TContext = unknown>(
  options: BaseMutationOptions<TData, TError, TVariables, TContext>
) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { successMessage, errorMessage, invalidateKeys, onSuccess, onError, ...mutationOptions } = options

  return useMutation({
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      // Show success toast
      if (successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        })
      }

      // Invalidate related queries
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }

      // Call custom onSuccess
      onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      // Show error toast
      toast({
        title: 'Error',
        description: errorMessage || (error as Error).message || 'An error occurred',
        variant: 'destructive',
      })

      // Log error for debugging
      console.error('[Mutation Error]', { error, variables })

      // Call custom onError
      onError?.(error, variables, context)
    },
  })
}

interface OptimisticMutationOptions<TData, TError, TVariables, TCacheData>
  extends Omit<BaseMutationOptions<TData, TError, TVariables, { previousData: TCacheData | undefined }>, 'onMutate'> {
  /** Query key for the cache to update optimistically */
  queryKey: QueryKey
  /** Function to update the cache optimistically */
  updateCache: (oldData: TCacheData | undefined, variables: TVariables) => TCacheData
}

/**
 * Optimistic mutation hook with automatic rollback
 *
 * Implements the optimistic UI pattern:
 * 1. onMutate: Save current cache and update optimistically (SYNC-06.1)
 * 2. onError: Rollback to previous state (SYNC-06.2)
 * 3. onSettled: Always refetch to ensure consistency (SYNC-06.3)
 *
 * @param options - Mutation options with cache update function
 * @returns Standard React Query mutation result
 *
 * @example
 * ```tsx
 * const updateClient = useOptimisticMutation<Client, Error, UpdateVars, Client[]>({
 *   mutationFn: ({ id, data }) => supabase.from('clients').update(data).eq('id', id),
 *   queryKey: clientKeys.list({}),
 *   updateCache: (oldData, { id, data }) =>
 *     oldData?.map(c => c.id === id ? { ...c, ...data } : c) ?? [],
 *   successMessage: 'Client updated successfully',
 * })
 * ```
 */
export function useOptimisticMutation<TData, TError = Error, TVariables = void, TCacheData = unknown>(
  options: OptimisticMutationOptions<TData, TError, TVariables, TCacheData>
) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { queryKey, updateCache, successMessage, errorMessage, invalidateKeys, onSuccess, onError, ...mutationOptions } = options

  return useMutation({
    ...mutationOptions,

    // Step 1: Optimistic update (SYNC-06.1)
    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot current value
      const previousData = queryClient.getQueryData<TCacheData>(queryKey)

      // Optimistically update cache
      queryClient.setQueryData<TCacheData>(queryKey, (old) => updateCache(old, variables))

      // Return context with previous value
      return { previousData }
    },

    // Step 2: Rollback on error (SYNC-06.2)
    onError: (error, variables, context) => {
      // Rollback to previous state
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData)
      }

      // Show error toast
      toast({
        title: 'Error',
        description: errorMessage || (error as Error).message || 'An error occurred',
        variant: 'destructive',
      })

      // Log error
      console.error('[Optimistic Mutation Error]', { error, variables })

      // Call custom onError
      onError?.(error, variables, context)
    },

    // Success handling
    onSuccess: (data, variables, context) => {
      if (successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        })
      }
      onSuccess?.(data, variables, context)
    },

    // Step 3: Always refetch (SYNC-06.3)
    onSettled: () => {
      // Always refetch to ensure server state consistency
      queryClient.invalidateQueries({ queryKey })

      // Also invalidate any additional keys
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }
    },
  })
}
