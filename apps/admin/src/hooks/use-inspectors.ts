import { useQuery } from '@tanstack/react-query'
import { supabase, type Tables } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

type User = Tables<'users'>

// Query keys for cache management
export const inspectorKeys = {
  all: ['inspectors'] as const,
  lists: () => [...inspectorKeys.all, 'list'] as const,
  workload: (startDate: string, endDate: string) =>
    [...inspectorKeys.all, 'workload', startDate, endDate] as const,
  schedule: (inspectorId: string | null, date: string) =>
    [...inspectorKeys.all, 'schedule', inspectorId, date] as const,
}

/**
 * Fetch all users with inspector role who are active
 */
export function useInspectors() {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: inspectorKeys.lists(),
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, phone, role, is_active, avatar_url')
        .eq('organization_id', profile.organization_id)
        .eq('role', 'inspector')
        .eq('is_active', true)
        .order('last_name')
        .order('first_name')

      if (error) throw error
      return data as User[]
    },
    enabled: !!profile?.organization_id,
  })
}

/**
 * Fetch inspector workload for a date range
 * Returns count of inspections per inspector per day
 */
export function useInspectorWorkload(startDate: string, endDate: string) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: inspectorKeys.workload(startDate, endDate),
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const { data, error } = await supabase
        .from('inspections')
        .select(`
          inspector_id,
          scheduled_date,
          estimated_duration_minutes,
          inspector:users!inspector_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('organization_id', profile.organization_id)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .not('inspector_id', 'is', null)
        .in('status', ['scheduled', 'in_progress'])

      if (error) throw error

      // Aggregate by inspector and date
      const workloadMap = new Map<
        string,
        {
          inspector_id: string
          inspector_name: string
          date: string
          inspection_count: number
          total_duration_minutes: number
        }
      >()

      for (const inspection of data || []) {
        const key = `${inspection.inspector_id}-${inspection.scheduled_date}`
        const existing = workloadMap.get(key)

        // Type assertion via unknown for joined table (consistent with prior decisions)
        const userJoin = inspection.users as unknown as {
          id: string
          first_name: string | null
          last_name: string | null
        } | null

        const inspectorName = userJoin
          ? `${userJoin.first_name || ''} ${userJoin.last_name || ''}`.trim() || 'Unknown'
          : 'Unknown'

        if (existing) {
          existing.inspection_count++
          existing.total_duration_minutes +=
            inspection.estimated_duration_minutes || 60
        } else {
          workloadMap.set(key, {
            inspector_id: inspection.inspector_id!,
            inspector_name: inspectorName,
            date: inspection.scheduled_date,
            inspection_count: 1,
            total_duration_minutes: inspection.estimated_duration_minutes || 60,
          })
        }
      }

      return Array.from(workloadMap.values())
    },
    enabled: !!startDate && !!endDate && !!profile?.organization_id,
  })
}

/**
 * Get inspections for a specific inspector on a specific date
 */
export function useInspectorSchedule(inspectorId: string | null, date: string) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: inspectorKeys.schedule(inspectorId, date),
    queryFn: async () => {
      if (!inspectorId) return []

      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id,
          scheduled_date,
          scheduled_time_start,
          scheduled_time_end,
          estimated_duration_minutes,
          status,
          inspection_type,
          properties (
            id,
            name,
            address_line1,
            city
          )
        `)
        .eq('organization_id', profile.organization_id)
        .eq('inspector_id', inspectorId)
        .eq('scheduled_date', date)
        .in('status', ['scheduled', 'in_progress'])
        .order('scheduled_time_start')

      if (error) throw error

      // Type assertion via unknown for joined table
      return (data || []).map((inspection) => {
        const propertyJoin = inspection.properties as unknown as {
          id: string
          name: string | null
          address_line1: string | null
          city: string | null
        } | null

        return {
          id: inspection.id,
          scheduled_date: inspection.scheduled_date,
          scheduled_time_start: inspection.scheduled_time_start,
          scheduled_time_end: inspection.scheduled_time_end,
          estimated_duration_minutes: inspection.estimated_duration_minutes,
          status: inspection.status,
          inspection_type: inspection.inspection_type,
          property: propertyJoin,
        }
      })
    },
    enabled: !!inspectorId && !!date && !!profile?.organization_id,
  })
}
