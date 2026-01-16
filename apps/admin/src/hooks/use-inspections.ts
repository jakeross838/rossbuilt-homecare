import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  supabase,
  type Tables,
  type InsertTables,
  type UpdateTables,
} from '@/lib/supabase'
import type { CalendarInspection } from '@/lib/types/scheduling'
import type {
  ScheduleInspectionInput,
  RescheduleInspectionInput,
} from '@/lib/validations/inspection'

type Inspection = Tables<'inspections'>

// Query keys for cache management
export const inspectionKeys = {
  all: ['inspections'] as const,
  calendar: (startDate: string, endDate: string) =>
    ['calendar-inspections', startDate, endDate] as const,
  detail: (id: string) => ['inspection', id] as const,
  property: (propertyId: string) => ['property-inspections', propertyId] as const,
  inspectorWorkload: () => ['inspector-workload'] as const,
}

/**
 * Fetch inspections for a date range (calendar view)
 * Returns inspections with property and inspector joins for display
 */
export function useCalendarInspections(startDate: string, endDate: string) {
  return useQuery({
    queryKey: inspectionKeys.calendar(startDate, endDate),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id,
          property_id,
          program_id,
          inspector_id,
          inspection_type,
          status,
          scheduled_date,
          scheduled_time_start,
          scheduled_time_end,
          estimated_duration_minutes,
          properties (
            id,
            name,
            address_line1,
            city
          ),
          inspector:users!inspector_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .order('scheduled_date')
        .order('scheduled_time_start')

      if (error) throw error

      // Transform to CalendarInspection type, filtering out any with null properties
      return (data || [])
        .filter((row) => row.id && row.properties)
        .map((row) => ({
          id: row.id,
          property_id: row.property_id,
          program_id: row.program_id,
          inspector_id: row.inspector_id,
          inspection_type: row.inspection_type,
          status: row.status,
          scheduled_date: row.scheduled_date,
          scheduled_time_start: row.scheduled_time_start,
          scheduled_time_end: row.scheduled_time_end,
          estimated_duration_minutes: row.estimated_duration_minutes,
          property: row.properties as unknown as CalendarInspection['property'],
          inspector: row.inspector as unknown as CalendarInspection['inspector'],
        })) as CalendarInspection[]
    },
    enabled: !!startDate && !!endDate,
  })
}

/**
 * Fetch single inspection by ID with full details
 * Includes property, inspector, and program joins
 */
export function useInspection(id: string | undefined) {
  return useQuery({
    queryKey: inspectionKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null

      const { data, error } = await supabase
        .from('inspections')
        .select(`
          *,
          properties (
            id,
            name,
            address_line1,
            city,
            state,
            zip
          ),
          inspector:users!inspector_id (
            id,
            first_name,
            last_name,
            email
          ),
          programs (
            id,
            inspection_tier,
            inspection_frequency
          )
        `)
        .eq('id', id)
        .single()

      // PGRST116 = no rows found - return null instead of throwing
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data
    },
    enabled: !!id,
  })
}

/**
 * Fetch inspections for a specific property
 * Returns recent inspections with inspector info for property detail view
 */
export function usePropertyInspections(propertyId: string | undefined) {
  return useQuery({
    queryKey: inspectionKeys.property(propertyId || ''),
    queryFn: async () => {
      if (!propertyId) return []

      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id,
          inspection_type,
          status,
          scheduled_date,
          scheduled_time_start,
          actual_end_at,
          inspector:users!inspector_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('property_id', propertyId)
        .order('scheduled_date', { ascending: false })
        .limit(10)

      if (error) throw error
      return data
    },
    enabled: !!propertyId,
  })
}

/**
 * Schedule a new inspection
 * Creates an inspection with the provided property, date, and optional details
 */
export function useScheduleInspection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ScheduleInspectionInput) => {
      // Get current user's org
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (userError) throw userError
      if (!userData.organization_id) throw new Error('User has no organization')

      const insertData: InsertTables<'inspections'> = {
        organization_id: userData.organization_id,
        property_id: input.property_id,
        program_id: input.program_id || null,
        inspector_id: input.inspector_id || null,
        inspection_type: input.inspection_type,
        scheduled_date: input.scheduled_date,
        scheduled_time_start: input.scheduled_time_start || null,
        scheduled_time_end: input.scheduled_time_end || null,
        estimated_duration_minutes: input.estimated_duration_minutes || null,
        status: 'scheduled',
        checklist: {},
      }

      const { data, error } = await supabase
        .from('inspections')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      return data as Inspection
    },
    onSuccess: () => {
      // Force immediate refetch to show new inspection on calendar
      queryClient.refetchQueries({ queryKey: ['calendar-inspections'] })
      queryClient.invalidateQueries({ queryKey: ['property-inspections'] })
      queryClient.invalidateQueries({ queryKey: ['inspector-workload'] })
    },
  })
}

/**
 * Reschedule an existing inspection
 * Updates date, time, and optionally the inspector assignment
 */
export function useRescheduleInspection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: RescheduleInspectionInput & { id: string }) => {
      const updateData: UpdateTables<'inspections'> = {
        scheduled_date: input.scheduled_date,
        scheduled_time_start: input.scheduled_time_start || null,
        scheduled_time_end: input.scheduled_time_end || null,
        inspector_id: input.inspector_id || null,
        status: 'rescheduled',
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('inspections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Inspection
    },
    onSuccess: (_, variables) => {
      // Force immediate refetch to update calendar
      queryClient.refetchQueries({ queryKey: ['calendar-inspections'] })
      queryClient.invalidateQueries({ queryKey: ['inspection', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['property-inspections'] })
      queryClient.invalidateQueries({ queryKey: ['inspector-workload'] })
    },
  })
}

/**
 * Cancel an inspection
 * Sets the inspection status to 'cancelled'
 */
export function useCancelInspection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('inspections')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Inspection
    },
    onSuccess: (_, id) => {
      // Force immediate refetch to update calendar
      queryClient.refetchQueries({ queryKey: ['calendar-inspections'] })
      queryClient.invalidateQueries({ queryKey: ['inspection', id] })
      queryClient.invalidateQueries({ queryKey: ['property-inspections'] })
      queryClient.invalidateQueries({ queryKey: ['inspector-workload'] })
    },
  })
}

/**
 * Assign an inspector to an inspection
 * Updates the inspector_id field, can also be used to unassign (null)
 */
export function useAssignInspector() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      inspectionId,
      inspectorId,
    }: {
      inspectionId: string
      inspectorId: string | null
    }) => {
      const { data, error } = await supabase
        .from('inspections')
        .update({
          inspector_id: inspectorId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inspectionId)
        .select()
        .single()

      if (error) throw error
      return data as Inspection
    },
    onSuccess: (_, variables) => {
      // Force immediate refetch to update calendar
      queryClient.refetchQueries({ queryKey: ['calendar-inspections'] })
      queryClient.invalidateQueries({
        queryKey: ['inspection', variables.inspectionId],
      })
      queryClient.invalidateQueries({ queryKey: ['inspector-workload'] })
    },
  })
}
