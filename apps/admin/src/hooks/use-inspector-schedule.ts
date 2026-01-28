import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { getPendingFindings } from '@/lib/offline/db'
import type { InspectorInspection, InspectorDaySchedule, ChecklistItemFinding } from '@/lib/types/inspector'
import { STALE_STANDARD, inspectorScheduleKeys } from '@/lib/queries'

// Helper to check if user is authenticated with a valid session
function useIsAuthenticated() {
  const { user, isInitialized } = useAuthStore()
  return isInitialized && !!user
}

// Fetch inspector's inspections for a specific date
export function useInspectorDaySchedule(date: string) {
  const { user } = useAuthStore()
  const isAuthenticated = useIsAuthenticated()
  const inspectorId = user?.id

  return useQuery({
    queryKey: inspectorScheduleKeys.day(inspectorId || '', date),
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
            gate_code,
            garage_code,
            lockbox_code,
            alarm_code,
            access_instructions,
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
          gate_code: string | null
          garage_code: string | null
          lockbox_code: string | null
          alarm_code: string | null
          access_instructions: string | null
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
          checklist: row.checklist as unknown as InspectorInspection['checklist'],
          findings: row.findings as unknown as InspectorInspection['findings'],
          overall_condition: row.overall_condition,
          summary: row.summary,
          weather_conditions: row.weather_conditions as unknown as InspectorInspection['weather_conditions'],
          property: property
            ? {
                id: property.id,
                name: property.name,
                address_line1: property.address_line1,
                address_line2: property.address_line2,
                city: property.city,
                state: property.state,
                zip: property.zip,
                access_codes: {
                  ...(property.gate_code && { 'Gate Code': property.gate_code }),
                  ...(property.garage_code && { 'Garage Code': property.garage_code }),
                  ...(property.lockbox_code && { 'Lockbox Code': property.lockbox_code }),
                  ...(property.alarm_code && { 'Alarm Code': property.alarm_code }),
                },
                special_instructions: property.access_instructions,
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
    enabled: !!inspectorId && !!date && isAuthenticated,
    staleTime: STALE_STANDARD,
  })
}

// Fetch single inspection with full details for execution
export function useInspectorInspection(inspectionId: string | undefined) {
  const isAuthenticated = useIsAuthenticated()

  return useQuery({
    queryKey: inspectorScheduleKeys.inspection(inspectionId || ''),
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
            gate_code,
            garage_code,
            lockbox_code,
            alarm_code,
            access_instructions,
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
        gate_code: string | null
        garage_code: string | null
        lockbox_code: string | null
        alarm_code: string | null
        access_instructions: string | null
        clients: {
          id: string
          first_name: string
          last_name: string
          phone: string | null
          email: string | null
        } | null
      } | null

      // Merge server findings with locally pending findings
      // This ensures progress shows correctly even if sync is delayed
      const serverFindings = (data.findings || {}) as Record<string, ChecklistItemFinding>
      let mergedFindings = { ...serverFindings }

      try {
        const pendingFindings = await getPendingFindings(inspectionId)
        for (const { item_id, finding } of pendingFindings) {
          // Pending findings take priority (they're more recent)
          mergedFindings[item_id] = finding
        }
      } catch (e) {
        // IndexedDB may not be available, continue with server findings only
        console.warn('Could not load pending findings from IndexedDB:', e)
      }

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
        checklist: data.checklist as unknown as InspectorInspection['checklist'],
        findings: mergedFindings,
        overall_condition: data.overall_condition,
        summary: data.summary,
        weather_conditions: data.weather_conditions as unknown as InspectorInspection['weather_conditions'],
        property: property
          ? {
              id: property.id,
              name: property.name,
              address_line1: property.address_line1,
              address_line2: property.address_line2,
              city: property.city,
              state: property.state,
              zip: property.zip,
              access_codes: {
                ...(property.gate_code && { 'Gate Code': property.gate_code }),
                ...(property.garage_code && { 'Garage Code': property.garage_code }),
                ...(property.lockbox_code && { 'Lockbox Code': property.lockbox_code }),
                ...(property.alarm_code && { 'Alarm Code': property.alarm_code }),
              },
              special_instructions: property.access_instructions,
            }
          : null,
        client: property?.clients || null,
      }
    },
    enabled: !!inspectionId && isAuthenticated,
  })
}

// Fetch upcoming inspections for inspector (next 7 days)
export function useInspectorUpcoming() {
  const { user } = useAuthStore()
  const isAuthenticated = useIsAuthenticated()
  const inspectorId = user?.id

  return useQuery({
    queryKey: inspectorScheduleKeys.upcoming(inspectorId || ''),
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
    enabled: !!inspectorId && isAuthenticated,
  })
}
