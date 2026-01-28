import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Tables, type InsertTables, type UpdateTables } from '@/lib/supabase'
import { equipmentKeys } from '@/lib/queries'

type Equipment = Tables<'equipment'>
type EquipmentInsert = InsertTables<'equipment'>
type EquipmentUpdate = UpdateTables<'equipment'>

/**
 * Hook to fetch list of equipment for a property
 */
export function usePropertyEquipment(propertyId: string) {
  return useQuery({
    queryKey: equipmentKeys.property(propertyId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('property_id', propertyId)
        .eq('is_active', true)
        .order('category')

      if (error) {
        throw error
      }

      return data as Equipment[]
    },
    enabled: !!propertyId,
  })
}

/**
 * Hook to fetch a single equipment item by ID
 */
export function useEquipment(id: string | undefined) {
  return useQuery({
    queryKey: equipmentKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Equipment ID is required')
      }

      const { data, error } = await supabase
        .from('equipment')
        .select(
          `
          *,
          property:properties (
            id,
            name,
            address_line1,
            city,
            state
          )
        `
        )
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      return data
    },
    enabled: !!id,
  })
}

/**
 * Hook to create new equipment
 */
export function useCreateEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: Omit<EquipmentInsert, 'id' | 'created_at' | 'updated_at'>
    ) => {
      const { data: equipment, error } = await supabase
        .from('equipment')
        .insert(data)
        .select()
        .single()

      if (error) {
        throw error
      }

      return equipment as Equipment
    },
    onSuccess: (equipment) => {
      // Invalidate property equipment list
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.property(equipment.property_id),
      })
    },
  })
}

/**
 * Hook to update existing equipment
 */
export function useUpdateEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Omit<EquipmentUpdate, 'id' | 'created_at' | 'updated_at'>
    }) => {
      const { data: equipment, error } = await supabase
        .from('equipment')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return equipment as Equipment
    },
    onSuccess: (equipment) => {
      // Invalidate specific equipment and property list
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.detail(equipment.id),
      })
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.property(equipment.property_id),
      })
    },
  })
}

/**
 * Hook to soft delete equipment (sets is_active = false)
 */
export function useDeleteEquipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: equipment, error } = await supabase
        .from('equipment')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return equipment as Equipment
    },
    onSuccess: (equipment) => {
      // Invalidate specific equipment and property list
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.detail(equipment.id),
      })
      queryClient.invalidateQueries({
        queryKey: equipmentKeys.property(equipment.property_id),
      })
    },
  })
}

/**
 * Hook to generate AI-powered maintenance schedule and inspection checklist
 * Calls the generate-equipment-ai edge function
 */
export function useGenerateEquipmentAI() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (equipmentId: string) => {
      const { data, error } = await supabase.functions.invoke(
        'generate-equipment-ai',
        {
          body: { equipment_id: equipmentId },
        }
      )

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: () => {
      // Invalidate all equipment queries to refresh with AI-generated content
      queryClient.invalidateQueries({ queryKey: equipmentKeys.all })
    },
  })
}
