import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { portalKeys } from './use-portal-dashboard'
import type { RecommendationResponseInput } from '@/lib/validations/service-request'

/**
 * Hook for client to respond to a recommendation (approve/decline)
 */
export function useRespondToRecommendation() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async (input: RecommendationResponseInput) => {
      const { data, error } = await supabase
        .from('recommendations')
        .update({
          status: input.status,
          client_response_notes: input.notes || null,
          responded_at: new Date().toISOString(),
          responded_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.recommendation_id)
        .eq('status', 'pending') // Can only respond to pending recommendations
        .select()
        .single()

      if (error) throw error

      return data
    },
    onSuccess: () => {
      // Invalidate all portal queries that might show recommendations
      queryClient.invalidateQueries({ queryKey: portalKeys.dashboard() })
      queryClient.invalidateQueries({ queryKey: portalKeys.properties() })
    },
  })
}

/**
 * Hook to approve a recommendation (convenience wrapper)
 */
export function useApproveRecommendation() {
  const respondMutation = useRespondToRecommendation()

  return {
    ...respondMutation,
    mutate: (recommendationId: string, notes?: string) =>
      respondMutation.mutate({
        recommendation_id: recommendationId,
        status: 'approved',
        notes,
      }),
    mutateAsync: (recommendationId: string, notes?: string) =>
      respondMutation.mutateAsync({
        recommendation_id: recommendationId,
        status: 'approved',
        notes,
      }),
  }
}

/**
 * Hook to decline a recommendation (convenience wrapper)
 */
export function useDeclineRecommendation() {
  const respondMutation = useRespondToRecommendation()

  return {
    ...respondMutation,
    mutate: (recommendationId: string, notes?: string) =>
      respondMutation.mutate({
        recommendation_id: recommendationId,
        status: 'declined',
        notes,
      }),
    mutateAsync: (recommendationId: string, notes?: string) =>
      respondMutation.mutateAsync({
        recommendation_id: recommendationId,
        status: 'declined',
        notes,
      }),
  }
}
