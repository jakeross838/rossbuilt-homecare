import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { portalKeys, STALE_STANDARD } from '@/lib/queries'
import type { PortalInspection } from '@/lib/types/portal'

interface UsePortalInspectionsOptions {
  propertyId?: string
  limit?: number
}

/**
 * Helper to get property IDs for a client user
 * Checks: 1) user_property_assignments, 2) client.user_id match, 3) client.email match
 */
async function getClientPropertyIds(userId: string, userEmail: string | null): Promise<string[]> {
  // First, check user_property_assignments
  const { data: assignments } = await supabase
    .from('user_property_assignments')
    .select('property_id')
    .eq('user_id', userId)

  if (assignments && assignments.length > 0) {
    return assignments.map((a) => a.property_id)
  }

  // Second: Find client by user_id and get their properties
  const { data: clientByUserId } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (clientByUserId) {
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .eq('client_id', clientByUserId.id)
      .eq('is_active', true)

    if (properties && properties.length > 0) {
      return properties.map((p) => p.id)
    }
  }

  // Third fallback: Find client by email and get their properties
  if (userEmail) {
    const { data: clientByEmail } = await supabase
      .from('clients')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (clientByEmail) {
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('client_id', clientByEmail.id)
        .eq('is_active', true)

      if (properties && properties.length > 0) {
        return properties.map((p) => p.id)
      }
    }
  }

  return []
}

/**
 * Hook to fetch inspections for client portal
 * Returns inspections for properties assigned to user OR owned by client
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

      // Get property IDs for this client user
      const assignedPropertyIds = await getClientPropertyIds(profile.id, profile.email)

      // If no properties found, return empty array
      if (assignedPropertyIds.length === 0) {
        return []
      }

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
    staleTime: STALE_STANDARD,
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

      // Get property IDs for this client user
      const assignedPropertyIds = await getClientPropertyIds(profile.id, profile.email)

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
    staleTime: STALE_STANDARD,
  })
}
