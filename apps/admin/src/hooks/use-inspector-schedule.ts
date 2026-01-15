import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type { InspectorInspection, InspectorDaySchedule } from '@/lib/types/inspector'

// Fetch inspector's inspections for a specific date
export function useInspectorDaySchedule(date: string) {
  const { user } = useAuthStore()
  const inspectorId = user?.id

  return useQuery({
    queryKey: ['inspector-schedule', inspectorId, date],
    queryFn: async (): Promise<InspectorDaySchedule> => {
      if (!inspectorId) {
        return { date, inspections: [], total_estimated_minutes: 0 }
      }

      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id,
          property_id,
          program_id,
          inspection_type,
          status,
          scheduled_date,
          scheduled_time_start,
          scheduled_time_end,
          estimated_duration_minutes,
          actual_start_at,
          actual_end_at,
          checklist,
          findings,
          overall_condition,
          summary,
          weather_conditions,
          properties (
            id,
            name,
            address_line1,
            address_line2,
            city,
            state,
            zip,
            access_codes,
            special_instructions,
            clients (
              id,
              first_name,
              last_name,
              phone,
              email
            )
          )
        `)
        .eq('inspector_id', inspectorId)
        .eq('scheduled_date', date)
        .in('status', ['scheduled', 'in_progress'])
        .order('scheduled_time_start')

      if (error) throw error

      const inspections = (data || []).map((row) => {
        const property = row.properties as unknown as {
          id: string
          name: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          zip: string
          access_codes: Record<string, string> | null
          special_instructions: string | null
          clients: {
            id: string
            first_name: string
            last_name: string
            phone: string | null
            email: string | null
          } | null
        } | null

        return {
          id: row.id,
          property_id: row.property_id,
          program_id: row.program_id,
          inspection_type: row.inspection_type,
          status: row.status,
          scheduled_date: row.scheduled_date,
          scheduled_time_start: row.scheduled_time_start,
          scheduled_time_end: row.scheduled_time_end,
          estimated_duration_minutes: row.estimated_duration_minutes,
          actual_start_at: row.actual_start_at,
          actual_end_at: row.actual_end_at,
          checklist: row.checklist as InspectorInspection['checklist'],
          findings: row.findings as InspectorInspection['findings'],
          overall_condition: row.overall_condition,
          summary: row.summary,
          weather_conditions: row.weather_conditions as InspectorInspection['weather_conditions'],
          property: property
            ? {
                id: property.id,
                name: property.name,
                address_line1: property.address_line1,
                address_line2: property.address_line2,
                city: property.city,
                state: property.state,
                zip: property.zip,
                access_codes: property.access_codes,
                special_instructions: property.special_instructions,
              }
            : null,
          client: property?.clients || null,
        }
      }) as InspectorInspection[]

      const total_estimated_minutes = inspections.reduce(
        (sum, i) => sum + (i.estimated_duration_minutes || 60),
        0
      )

      return { date, inspections, total_estimated_minutes }
    },
    enabled: !!inspectorId && !!date,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Fetch single inspection with full details for execution
export function useInspectorInspection(inspectionId: string | undefined) {
  return useQuery({
    queryKey: ['inspector-inspection', inspectionId],
    queryFn: async (): Promise<InspectorInspection | null> => {
      if (!inspectionId) return null

      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id,
          property_id,
          program_id,
          inspection_type,
          status,
          scheduled_date,
          scheduled_time_start,
          scheduled_time_end,
          estimated_duration_minutes,
          actual_start_at,
          actual_end_at,
          checklist,
          findings,
          overall_condition,
          summary,
          weather_conditions,
          properties (
            id,
            name,
            address_line1,
            address_line2,
            city,
            state,
            zip,
            access_codes,
            special_instructions,
            clients (
              id,
              first_name,
              last_name,
              phone,
              email
            )
          )
        `)
        .eq('id', inspectionId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      const property = data.properties as unknown as {
        id: string
        name: string
        address_line1: string
        address_line2: string | null
        city: string
        state: string
        zip: string
        access_codes: Record<string, string> | null
        special_instructions: string | null
        clients: {
          id: string
          first_name: string
          last_name: string
          phone: string | null
          email: string | null
        } | null
      } | null

      return {
        id: data.id,
        property_id: data.property_id,
        program_id: data.program_id,
        inspection_type: data.inspection_type,
        status: data.status,
        scheduled_date: data.scheduled_date,
        scheduled_time_start: data.scheduled_time_start,
        scheduled_time_end: data.scheduled_time_end,
        estimated_duration_minutes: data.estimated_duration_minutes,
        actual_start_at: data.actual_start_at,
        actual_end_at: data.actual_end_at,
        checklist: data.checklist as InspectorInspection['checklist'],
        findings: data.findings as InspectorInspection['findings'],
        overall_condition: data.overall_condition,
        summary: data.summary,
        weather_conditions: data.weather_conditions as InspectorInspection['weather_conditions'],
        property: property
          ? {
              id: property.id,
              name: property.name,
              address_line1: property.address_line1,
              address_line2: property.address_line2,
              city: property.city,
              state: property.state,
              zip: property.zip,
              access_codes: property.access_codes,
              special_instructions: property.special_instructions,
            }
          : null,
        client: property?.clients || null,
      }
    },
    enabled: !!inspectionId,
  })
}

// Fetch upcoming inspections for inspector (next 7 days)
export function useInspectorUpcoming() {
  const { user } = useAuthStore()
  const inspectorId = user?.id

  return useQuery({
    queryKey: ['inspector-upcoming', inspectorId],
    queryFn: async () => {
      if (!inspectorId) return []

      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id,
          property_id,
          inspection_type,
          status,
          scheduled_date,
          scheduled_time_start,
          estimated_duration_minutes,
          properties (
            id,
            name,
            city
          )
        `)
        .eq('inspector_id', inspectorId)
        .gte('scheduled_date', today)
        .lte('scheduled_date', nextWeek)
        .in('status', ['scheduled', 'in_progress'])
        .order('scheduled_date')
        .order('scheduled_time_start')

      if (error) throw error
      return data
    },
    enabled: !!inspectorId,
  })
}
