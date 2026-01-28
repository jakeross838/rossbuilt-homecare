import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { portalKeys } from '@/lib/queries'
import type { PortalInspection } from '@/lib/types/portal'

interface UsePortalInspectionsOptions {
  propertyId?: string
  limit?: number
}

/**
 * Hook to fetch inspections for client portal
 * Only returns inspections for properties assigned to the current user
 */
export function usePortalInspections(options: UsePortalInspectionsOptions = {}) {
  const { propertyId, limit = 20 } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: portalKeys.inspections({ propertyId }),
    queryFn: async (): Promise<PortalInspection[]> => {
      if (!profile?.id) {
        throw new Error('User not authenticated')
      }

      // First, get the property IDs assigned to this user
      const { data: assignments, error: assignmentError } = await supabase
        .from('user_property_assignments')
        .select('property_id')
        .eq('user_id', profile.id)

      if (assignmentError) {
        throw assignmentError
      }

      // If no assignments, return empty array
      if (!assignments || assignments.length === 0) {
        return []
      }

      const assignedPropertyIds = assignments.map((a) => a.property_id)

      // If filtering by a specific property, verify it's assigned to the user
      if (propertyId && !assignedPropertyIds.includes(propertyId)) {
        return []
      }

      let query = supabase
        .from('inspections')
        .select(`
          id,
          scheduled_date,
          inspection_type,
          status,
          overall_condition,
          summary,
          report_url,
          inspector:users!inspector_id (
            first_name,
            last_name
          ),
          findings,
          property:properties (
            id,
            name
          )
        `)
        .in('property_id', propertyId ? [propertyId] : assignedPropertyIds)
        .in('status', ['completed', 'scheduled', 'in_progress'])
        .order('scheduled_date', { ascending: false })
        .limit(limit)

      const { data, error } = await query

      if (error) throw error

      return (data || []).map((i) => {
        // findings is a JSONB object keyed by item_id, not an array
        const findingsObj = i.findings as Record<string, { status: string }> | null
        const findingsArray = findingsObj ? Object.values(findingsObj) : []

        return {
          id: i.id,
          inspection_date: i.scheduled_date,
          inspection_type: i.inspection_type,
          status: i.status,
          overall_condition: i.overall_condition,
          summary: i.summary,
          report_url: i.report_url,
          inspector: i.inspector as { first_name: string; last_name: string } | null,
          findings_summary: {
            total: findingsArray.length,
            passed: findingsArray.filter((f) => f.status === 'pass').length,
            needs_attention: findingsArray.filter((f) => f.status === 'needs_attention').length,
            urgent: findingsArray.filter((f) => f.status === 'urgent').length,
          },
        }
      })
    },
    enabled: profile?.role === 'client',
  })
}

/**
 * Hook to fetch single inspection detail for portal
 * Verifies the inspection belongs to an assigned property
 */
export function usePortalInspection(inspectionId: string | undefined) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: portalKeys.inspection(inspectionId || ''),
    queryFn: async () => {
      if (!inspectionId) throw new Error('Inspection ID required')
      if (!profile?.id) throw new Error('User not authenticated')

      // First, get the property IDs assigned to this user
      const { data: assignments, error: assignmentError } = await supabase
        .from('user_property_assignments')
        .select('property_id')
        .eq('user_id', profile.id)

      if (assignmentError) {
        throw assignmentError
      }

      const assignedPropertyIds = assignments?.map((a) => a.property_id) || []

      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id,
          property_id,
          scheduled_date,
          inspection_type,
          status,
          overall_condition,
          summary,
          report_url,
          actual_start_at,
          actual_end_at,
          inspector:users!inspector_id (
            first_name,
            last_name
          ),
          findings,
          weather_conditions,
          property:properties (
            id,
            name,
            address_line1,
            city,
            state
          )
        `)
        .eq('id', inspectionId)
        .single()

      if (error) throw error

      // Verify the inspection belongs to an assigned property
      if (!assignedPropertyIds.includes(data.property_id)) {
        throw new Error('Inspection not found')
      }

      // Also fetch inspection photos
      const { data: photos } = await supabase
        .from('inspection_photos')
        .select('id, url, caption, section, taken_at')
        .eq('inspection_id', inspectionId)
        .order('taken_at')

      return {
        ...data,
        photos: photos || [],
      }
    },
    enabled: !!inspectionId && profile?.role === 'client',
  })
}
