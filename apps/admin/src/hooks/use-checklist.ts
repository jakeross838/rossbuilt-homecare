import { useQuery } from '@tanstack/react-query'
import { supabase, type Tables } from '@/lib/supabase'
import { generateChecklist } from '@/lib/checklist-generator'
import type { GeneratedChecklist } from '@/lib/types/inspection'
import type { PropertyFeatures } from '@/lib/validations/property'

type Equipment = Tables<'equipment'>

// Query keys for cache management
export const checklistKeys = {
  all: ['checklists'] as const,
  generated: () => [...checklistKeys.all, 'generated'] as const,
  forProperty: (propertyId: string, programId: string) =>
    [...checklistKeys.generated(), 'property', propertyId, 'program', programId] as const,
}

/**
 * Hook to generate a checklist for a property and program
 * Fetches property (with equipment) and program, then generates checklist
 */
export function useGenerateChecklist(
  propertyId: string | undefined,
  programId: string | undefined
) {
  return useQuery({
    queryKey: checklistKeys.forProperty(propertyId || '', programId || ''),
    queryFn: async (): Promise<GeneratedChecklist> => {
      if (!propertyId || !programId) {
        throw new Error('Property ID and Program ID are required')
      }

      // Fetch property with features
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id, square_footage, features')
        .eq('id', propertyId)
        .single()

      if (propertyError) throw propertyError
      if (!property) throw new Error('Property not found')

      // Fetch equipment for the property
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .eq('property_id', propertyId)
        .eq('is_active', true)

      if (equipmentError) throw equipmentError

      // Fetch program to get inspection tier
      const { data: program, error: programError } = await supabase
        .from('programs')
        .select('id, inspection_tier')
        .eq('id', programId)
        .single()

      if (programError) throw programError
      if (!program) throw new Error('Program not found')

      // Generate the checklist
      return generateChecklist({
        property: {
          id: property.id,
          square_footage: property.square_footage,
          features: property.features as PropertyFeatures | null,
        },
        program: {
          id: program.id,
          inspection_tier: program.inspection_tier,
        },
        equipment: (equipment || []) as Equipment[],
      })
    },
    enabled: !!propertyId && !!programId,
    // Cache generated checklists since they're expensive to compute
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (previously cacheTime)
  })
}
