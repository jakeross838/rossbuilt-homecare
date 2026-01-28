import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { assignmentKeys, userKeys } from '@/lib/queries'

/**
 * Hook to fetch property assignments for a specific user
 */
export function useUserAssignments(userId: string | undefined) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: assignmentKeys.user(userId || ''),
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required')
      }

      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const { data, error } = await supabase
        .from('user_property_assignments')
        .select(`
          id,
          property_id,
          assigned_at,
          notes,
          assigned_by,
          property:properties (
            id,
            name,
            address_line1,
            city,
            state,
            is_active
          ),
          assigner:users!user_property_assignments_assigned_by_fkey (
            first_name,
            last_name
          )
        `)
        .eq('user_id', userId)
        .eq('organization_id', profile.organization_id)
        .order('assigned_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    },
    enabled: !!userId && !!profile?.organization_id,
  })
}

/**
 * Hook to fetch user assignments for a specific property
 */
export function usePropertyAssignments(propertyId: string | undefined) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: assignmentKeys.property(propertyId || ''),
    queryFn: async () => {
      if (!propertyId) {
        throw new Error('Property ID is required')
      }

      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const { data, error } = await supabase
        .from('user_property_assignments')
        .select(`
          id,
          user_id,
          assigned_at,
          notes,
          user:users (
            id,
            first_name,
            last_name,
            email,
            role
          )
        `)
        .eq('property_id', propertyId)
        .eq('organization_id', profile.organization_id)
        .order('assigned_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    },
    enabled: !!propertyId && !!profile?.organization_id,
  })
}

/**
 * Hook to create a property assignment
 */
export function useCreateAssignment() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async ({
      userId,
      propertyId,
      notes,
    }: {
      userId: string
      propertyId: string
      notes?: string
    }) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      console.log('Creating assignment:', {
        organization_id: profile.organization_id,
        user_id: userId,
        property_id: propertyId,
        assigned_by: profile.id,
      })

      const { data, error } = await supabase
        .from('user_property_assignments')
        .insert({
          organization_id: profile.organization_id,
          user_id: userId,
          property_id: propertyId,
          assigned_by: profile.id,
          notes: notes || null,
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message || 'Failed to create assignment')
      }

      console.log('Assignment created:', data)
      return data
    },
    onSuccess: (_, { userId, propertyId }) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.user(userId) })
      queryClient.invalidateQueries({ queryKey: assignmentKeys.property(propertyId) })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Hook to delete a property assignment
 */
export function useDeleteAssignment() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async ({
      assignmentId,
      userId,
      propertyId,
    }: {
      assignmentId: string
      userId: string
      propertyId: string
    }) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const { error } = await supabase
        .from('user_property_assignments')
        .delete()
        .eq('id', assignmentId)
        .eq('organization_id', profile.organization_id)

      if (error) {
        throw error
      }

      return { assignmentId, userId, propertyId }
    },
    onSuccess: (_, { userId, propertyId }) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.user(userId) })
      queryClient.invalidateQueries({ queryKey: assignmentKeys.property(propertyId) })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Hook to bulk update assignments for a user (replace all with new set)
 */
export function useBulkUpdateUserAssignments() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async ({
      userId,
      propertyIds,
    }: {
      userId: string
      propertyIds: string[]
    }) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      // Delete all existing assignments for this user
      const { error: deleteError } = await supabase
        .from('user_property_assignments')
        .delete()
        .eq('user_id', userId)
        .eq('organization_id', profile.organization_id)

      if (deleteError) {
        throw deleteError
      }

      // Insert new assignments if any
      if (propertyIds.length > 0) {
        const { error: insertError } = await supabase
          .from('user_property_assignments')
          .insert(
            propertyIds.map((propertyId) => ({
              organization_id: profile.organization_id,
              user_id: userId,
              property_id: propertyId,
              assigned_by: profile.id,
            }))
          )

        if (insertError) {
          throw insertError
        }
      }

      return { userId, propertyIds }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.user(userId) })
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
