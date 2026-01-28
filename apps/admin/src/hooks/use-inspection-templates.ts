import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  supabase,
  type Tables,
  type InsertTables,
  type UpdateTables,
  type Enums,
} from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type { InspectionTemplateFormData } from '@/lib/validations/inspection-template'
import { templateKeys } from '@/lib/queries'

type InspectionTemplate = Tables<'inspection_templates'>
type InspectionTemplateInsert = InsertTables<'inspection_templates'>
type InspectionTemplateUpdate = UpdateTables<'inspection_templates'>
type InspectionTier = Enums<'inspection_tier'>

/**
 * Options for filtering inspection templates
 */
export interface InspectionTemplateFilters {
  tier?: InspectionTier
  category?: string
  feature_type?: string
}

/**
 * Hook to fetch list of inspection templates with optional filters
 */
export function useInspectionTemplates(options?: InspectionTemplateFilters) {
  return useQuery({
    queryKey: templateKeys.list(options || {}),
    queryFn: async () => {
      let query = supabase
        .from('inspection_templates')
        .select('*')
        .eq('is_active', true)
        .order('tier')
        .order('category')

      // Apply optional filters
      if (options?.tier) {
        query = query.eq('tier', options.tier)
      }
      if (options?.category) {
        query = query.eq('category', options.category)
      }
      if (options?.feature_type) {
        query = query.eq('feature_type', options.feature_type)
      }

      const { data, error } = await query

      if (error) throw error
      return data as InspectionTemplate[]
    },
  })
}

/**
 * Hook to fetch a single inspection template by ID
 */
export function useInspectionTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspection_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as InspectionTemplate
    },
    enabled: !!id,
  })
}

/**
 * Hook to create a new inspection template
 */
export function useCreateInspectionTemplate() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (data: InspectionTemplateFormData) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const insertData: InspectionTemplateInsert = {
        organization_id: profile.organization_id,
        name: data.name,
        description: data.description || null,
        tier: data.tier,
        category: data.category || null,
        feature_type: data.feature_type || null,
        equipment_category: data.equipment_category || null,
        sections: data.sections,
        estimated_minutes: data.estimated_minutes || null,
        version: 1,
        is_current: true,
        is_active: true,
      }

      const { data: template, error } = await supabase
        .from('inspection_templates')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      return template as InspectionTemplate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: templateKeys.lists(),
      })
    },
  })
}

/**
 * Hook to update an existing inspection template
 */
export function useUpdateInspectionTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<InspectionTemplateFormData>
    }) => {
      // First get the current template to increment version
      const { data: currentTemplate, error: fetchError } = await supabase
        .from('inspection_templates')
        .select('version')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const currentVersion = currentTemplate?.version || 1

      const updateData: InspectionTemplateUpdate = {
        name: data.name,
        description: data.description,
        tier: data.tier,
        category: data.category,
        feature_type: data.feature_type,
        equipment_category: data.equipment_category,
        sections: data.sections,
        estimated_minutes: data.estimated_minutes,
        version: currentVersion + 1,
        updated_at: new Date().toISOString(),
      }

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof InspectionTemplateUpdate] === undefined) {
          delete updateData[key as keyof InspectionTemplateUpdate]
        }
      })

      const { data: template, error } = await supabase
        .from('inspection_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return template as InspectionTemplate
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({
        queryKey: templateKeys.detail(template.id),
      })
      queryClient.invalidateQueries({
        queryKey: templateKeys.lists(),
      })
    },
  })
}

/**
 * Hook to soft-delete an inspection template (sets is_active = false)
 */
export function useDeleteInspectionTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: template, error } = await supabase
        .from('inspection_templates')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return template as InspectionTemplate
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({
        queryKey: templateKeys.detail(template.id),
      })
      queryClient.invalidateQueries({
        queryKey: templateKeys.lists(),
      })
    },
  })
}
