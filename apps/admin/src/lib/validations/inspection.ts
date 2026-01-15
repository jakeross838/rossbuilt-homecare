import { z } from 'zod'

/**
 * Inspection type values matching database column
 */
export const inspectionTypeValues = [
  'scheduled',
  'storm_pre',
  'storm_post',
  'arrival',
  'departure',
  'special',
  'initial',
] as const

/**
 * Validation schema for scheduling a new inspection
 * Used for the schedule inspection form
 */
export const scheduleInspectionSchema = z.object({
  // Required fields
  property_id: z.string().uuid('Please select a property'),

  // Optional program/inspector assignment
  program_id: z.string().uuid().optional().or(z.literal('')),
  inspector_id: z.string().uuid().optional().or(z.literal('')),

  // Inspection type
  inspection_type: z.enum(inspectionTypeValues, {
    required_error: 'Please select an inspection type',
  }),

  // Scheduling
  scheduled_date: z.string().min(1, 'Please select a date'),
  scheduled_time_start: z.string().optional().or(z.literal('')),
  scheduled_time_end: z.string().optional().or(z.literal('')),

  // Duration
  estimated_duration_minutes: z
    .number()
    .min(15, 'Minimum duration is 15 minutes')
    .max(480, 'Maximum duration is 8 hours')
    .optional(),

  // Notes
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
})

/**
 * Type for schedule inspection form data
 */
export type ScheduleInspectionInput = z.infer<typeof scheduleInspectionSchema>

/**
 * Validation schema for rescheduling an existing inspection
 * Only requires date/time changes
 */
export const rescheduleInspectionSchema = z.object({
  scheduled_date: z.string().min(1, 'Please select a date'),
  scheduled_time_start: z.string().optional().or(z.literal('')),
  scheduled_time_end: z.string().optional().or(z.literal('')),
  inspector_id: z.string().uuid().optional().or(z.literal('')),
})

/**
 * Type for reschedule inspection form data
 */
export type RescheduleInspectionInput = z.infer<typeof rescheduleInspectionSchema>

/**
 * Default values for schedule inspection form
 */
export function scheduleInspectionDefaults(
  propertyId?: string
): Partial<ScheduleInspectionInput> {
  return {
    property_id: propertyId || '',
    program_id: '',
    inspector_id: '',
    inspection_type: 'scheduled',
    scheduled_date: '',
    scheduled_time_start: '',
    scheduled_time_end: '',
    estimated_duration_minutes: 60,
    notes: '',
  }
}

/**
 * Default values for reschedule inspection form
 */
export function rescheduleInspectionDefaults(): Partial<RescheduleInspectionInput> {
  return {
    scheduled_date: '',
    scheduled_time_start: '',
    scheduled_time_end: '',
    inspector_id: '',
  }
}

/**
 * Transform schedule form data for Supabase insert
 * Converts empty strings to null for optional fields
 */
export function transformScheduleData(data: ScheduleInspectionInput) {
  return {
    property_id: data.property_id,
    program_id: data.program_id || null,
    inspector_id: data.inspector_id || null,
    inspection_type: data.inspection_type,
    scheduled_date: data.scheduled_date,
    scheduled_time_start: data.scheduled_time_start || null,
    scheduled_time_end: data.scheduled_time_end || null,
    estimated_duration_minutes: data.estimated_duration_minutes || null,
    // Notes stored in internal_notes field
    internal_notes: data.notes || null,
  }
}

/**
 * Transform reschedule form data for Supabase update
 */
export function transformRescheduleData(data: RescheduleInspectionInput) {
  return {
    scheduled_date: data.scheduled_date,
    scheduled_time_start: data.scheduled_time_start || null,
    scheduled_time_end: data.scheduled_time_end || null,
    inspector_id: data.inspector_id || null,
    status: 'rescheduled' as const,
  }
}
