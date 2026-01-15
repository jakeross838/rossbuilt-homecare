import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, InsertTables, UpdateTables } from '@/lib/supabase'

type Recommendation = Tables<'recommendations'>
type RecommendationInsert = InsertTables<'recommendations'>
type RecommendationUpdate = UpdateTables<'recommendations'>

// Fetch recommendations for an inspection
export function useInspectionRecommendations(inspectionId: string | undefined) {
  return useQuery({
    queryKey: ['recommendations', 'inspection', inspectionId],
    queryFn: async () => {
      if (!inspectionId) return []

      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('inspection_id', inspectionId)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as Recommendation[]
    },
    enabled: !!inspectionId,
  })
}

// Fetch recommendations for a property
export function usePropertyRecommendations(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['recommendations', 'property', propertyId],
    queryFn: async () => {
      if (!propertyId) return []

      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          inspection:inspections(scheduled_date, inspection_type)
        `)
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!propertyId,
  })
}

// Fetch a single recommendation
export function useRecommendation(id: string | undefined) {
  return useQuery({
    queryKey: ['recommendation', id],
    queryFn: async () => {
      if (!id) return null

      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Recommendation
    },
    enabled: !!id,
  })
}

// Create a recommendation
export function useCreateRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RecommendationInsert) => {
      const { data, error } = await supabase
        .from('recommendations')
        .insert(input)
        .select()
        .single()

      if (error) throw error
      return data as Recommendation
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      if (data.inspection_id) {
        queryClient.invalidateQueries({
          queryKey: ['recommendations', 'inspection', data.inspection_id],
        })
      }
      if (data.property_id) {
        queryClient.invalidateQueries({
          queryKey: ['recommendations', 'property', data.property_id],
        })
      }
    },
  })
}

// Update a recommendation
export function useUpdateRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: RecommendationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('recommendations')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Recommendation
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      queryClient.invalidateQueries({ queryKey: ['recommendation', data.id] })
    },
  })
}

// Update recommendation status
export function useUpdateRecommendationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: Recommendation['status']
    }) => {
      const { data, error } = await supabase
        .from('recommendations')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Recommendation
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      queryClient.invalidateQueries({ queryKey: ['recommendation', data.id] })
    },
  })
}

// Delete a recommendation
export function useDeleteRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recommendations')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })
}
