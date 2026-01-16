import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { portalKeys } from './use-portal-dashboard'
import type { PortalInspection } from '@/lib/types/portal'

interface UsePortalInspectionsOptions {
  propertyId?: string
  limit?: number
}

/**
 * Hook to fetch inspections for client portal
 */
export function usePortalInspections(options: UsePortalInspectionsOptions = {}) {
  const { propertyId, limit = 20 } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: portalKeys.inspections({ propertyId }),
    queryFn: async (): Promise<PortalInspection[]> => {
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
          inspector:users!inspections_inspector_id_fkey (
            first_name,
            last_name
          ),
          findings,
          property:properties (
            id,
            name
          )
        `)
        .in('status', ['completed', 'scheduled', 'in_progress'])
        .order('scheduled_date', { ascending: false })
        .limit(limit)

      if (propertyId) {
        query = query.eq('property_id', propertyId)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).map((i) => {
        const findings = i.findings as unknown as Array<{ status: string }> | null

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
            total: findings?.length || 0,
            passed: findings?.filter((f) => f.status === 'pass').length || 0,
            needs_attention: findings?.filter((f) => f.status === 'needs_attention').length || 0,
            urgent: findings?.filter((f) => f.status === 'urgent').length || 0,
          },
        }
      })
    },
    enabled: profile?.role === 'client',
  })
}

/**
 * Hook to fetch single inspection detail for portal
 */
export function usePortalInspection(inspectionId: string | undefined) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: portalKeys.inspection(inspectionId || ''),
    queryFn: async () => {
      if (!inspectionId) throw new Error('Inspection ID required')

      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id,
          scheduled_date,
          inspection_type,
          status,
          overall_condition,
          summary,
          report_url,
          started_at,
          completed_at,
          inspector:users!inspections_inspector_id_fkey (
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
