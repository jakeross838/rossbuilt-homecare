import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  supabase,
  type Tables,
  type InsertTables,
  type UpdateTables,
} from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type { ProgramFormData } from '@/lib/validations/program'

type Program = Tables<'programs'>
type ProgramInsert = InsertTables<'programs'>
type ProgramUpdate = UpdateTables<'programs'>

// Query keys for cache management
export const programKeys = {
  all: ['programs'] as const,
  lists: () => [...programKeys.all, 'list'] as const,
  property: (propertyId: string) =>
    [...programKeys.all, 'property', propertyId] as const,
  details: () => [...programKeys.all, 'detail'] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,
}

/**
 * Hook to fetch program for a specific property
 * Returns active/pending/paused program (most recent)
 */
export function usePropertyProgram(propertyId: string) {
  return useQuery({
    queryKey: programKeys.property(propertyId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('property_id', propertyId)
        .in('status', ['active', 'pending', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // PGRST116 = no rows found - this is expected when property has no program
      if (error && error.code !== 'PGRST116') throw error
      return data as Program | null
    },
    enabled: !!propertyId,
  })
}

/**
 * Hook to create a new program
 */
export function useCreateProgram() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (
      data: ProgramFormData & {
        base_fee: number
        tier_fee: number
        addons_fee: number
        monthly_total: number
      }
    ) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const insertData: ProgramInsert = {
        organization_id: profile.organization_id,
        property_id: data.property_id,
        client_id: data.client_id,
        inspection_frequency: data.inspection_frequency,
        inspection_tier: data.inspection_tier,
        addon_digital_manual: data.addon_digital_manual,
        addon_warranty_tracking: data.addon_warranty_tracking,
        addon_emergency_response: data.addon_emergency_response,
        addon_hurricane_monitoring: data.addon_hurricane_monitoring,
        preferred_day_of_week: data.preferred_day_of_week ?? null,
        preferred_time_slot: data.preferred_time_slot || null,
        preferred_inspector_id: data.preferred_inspector_id || null,
        billing_start_date: data.billing_start_date || null,
        billing_day_of_month: data.billing_day_of_month,
        vendor_markup_percent: data.vendor_markup_percent,
        notes: data.notes || null,
        base_fee: data.base_fee,
        tier_fee: data.tier_fee,
        addons_fee: data.addons_fee,
        monthly_total: data.monthly_total,
        status: 'active',
        activated_at: new Date().toISOString(),
      }

      const { data: program, error } = await supabase
        .from('programs')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      return program as Program
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: programKeys.property(data.property_id),
      })
      queryClient.invalidateQueries({ queryKey: ['property', data.property_id] })
    },
  })
}

/**
 * Hook to update an existing program
 */
export function useUpdateProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<ProgramFormData>
    }) => {
      const updateData: ProgramUpdate = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      const { data: program, error } = await supabase
        .from('programs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return program as Program
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: programKeys.property(data.property_id),
      })
    },
  })
}

/**
 * Hook to pause a program
 */
export function usePauseProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('programs')
        .update({
          status: 'paused',
          paused_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Program
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: programKeys.property(data.property_id),
      })
    },
  })
}

/**
 * Hook to resume a paused program
 */
export function useResumeProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('programs')
        .update({
          status: 'active',
          paused_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Program
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: programKeys.property(data.property_id),
      })
    },
  })
}

/**
 * Hook to cancel a program
 */
export function useCancelProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('programs')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Program
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: programKeys.property(data.property_id),
      })
    },
  })
}
