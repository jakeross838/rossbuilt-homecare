import { z } from 'zod'

/**
 * Validation schema for program form data
 * Used for creating and updating programs
 */
export const programSchema = z.object({
  // Required IDs
  property_id: z.string().uuid('Property is required'),
  client_id: z.string().uuid('Client is required'),

  // Inspection configuration
  inspection_frequency: z.enum([
    'annual',
    'semi_annual',
    'quarterly',
    'monthly',
    'bi_weekly',
  ]),
  inspection_tier: z.enum([
    'visual',
    'functional',
    'comprehensive',
    'preventative',
  ]),

  // Add-ons
  addon_digital_manual: z.boolean().default(false),
  addon_warranty_tracking: z.boolean().default(false),
  addon_emergency_response: z.boolean().default(false),
  addon_hurricane_monitoring: z.boolean().default(false),

  // Scheduling preferences
  preferred_day_of_week: z.coerce.number().min(0).max(6).optional().nullable(),
  preferred_time_slot: z.enum(['morning', 'afternoon', 'anytime']).optional(),
  preferred_inspector_id: z.string().uuid().optional().nullable(),

  // Billing
  billing_start_date: z.string().optional(),
  billing_day_of_month: z.coerce.number().min(1).max(28).default(1),

  // Vendor markup
  vendor_markup_percent: z.coerce.number().min(0).max(50).default(15),

  // Notes
  notes: z.string().optional(),
})

/**
 * Type for program form data inferred from schema
 */
export type ProgramFormData = z.infer<typeof programSchema>

/**
 * Default values for program form
 */
export function programDefaults(
  propertyId?: string,
  clientId?: string
): Partial<ProgramFormData> {
  return {
    property_id: propertyId || '',
    client_id: clientId || '',
    inspection_frequency: 'quarterly',
    inspection_tier: 'functional',
    addon_digital_manual: false,
    addon_warranty_tracking: false,
    addon_emergency_response: false,
    addon_hurricane_monitoring: false,
    preferred_day_of_week: null,
    preferred_time_slot: 'anytime',
    preferred_inspector_id: null,
    billing_day_of_month: 1,
    vendor_markup_percent: 15,
    notes: '',
  }
}

/**
 * Transform form data for Supabase insert/update
 * Converts empty strings to null for optional fields
 */
export function transformProgramData(data: ProgramFormData) {
  return {
    property_id: data.property_id,
    client_id: data.client_id,
    inspection_frequency: data.inspection_frequency,
    inspection_tier: data.inspection_tier,
    addon_digital_manual: data.addon_digital_manual,
    addon_warranty_tracking: data.addon_warranty_tracking,
    addon_emergency_response: data.addon_emergency_response,
    addon_hurricane_monitoring: data.addon_hurricane_monitoring,
    preferred_day_of_week: data.preferred_day_of_week ?? null,
    preferred_time_slot: data.preferred_time_slot || null,
    preferred_inspector_id: data.preferred_inspector_id || null,
    billing_start_date: data.billing_start_date || null,
    billing_day_of_month: data.billing_day_of_month,
    vendor_markup_percent: data.vendor_markup_percent,
    notes: data.notes || null,
  }
}
