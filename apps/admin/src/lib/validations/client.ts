import { z } from 'zod'

/**
 * Validation schema for client form data
 * Used for creating and updating clients
 */
export const clientSchema = z.object({
  // Primary contact (required)
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, 'Phone must be less than 20 characters')
    .optional()
    .or(z.literal('')),

  // Secondary contact (optional spouse/assistant)
  secondary_first_name: z
    .string()
    .max(100, 'First name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  secondary_last_name: z
    .string()
    .max(100, 'Last name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  secondary_email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  secondary_phone: z
    .string()
    .max(20, 'Phone must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  secondary_relationship: z
    .string()
    .max(50, 'Relationship must be less than 50 characters')
    .optional()
    .or(z.literal('')),

  // Billing information
  billing_email: z
    .string()
    .email('Please enter a valid billing email address')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  billing_address_line1: z
    .string()
    .max(255, 'Address must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  billing_address_line2: z
    .string()
    .max(255, 'Address must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  billing_city: z
    .string()
    .max(100, 'City must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  billing_state: z
    .string()
    .regex(/^[A-Z]{2}$/, 'State must be a 2-letter code (e.g., CA)')
    .optional()
    .or(z.literal('')),
  billing_zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789')
    .optional()
    .or(z.literal('')),

  // Additional info
  source: z
    .string()
    .max(100, 'Source must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  referral_source: z
    .string()
    .max(255, 'Referral source must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(5000, 'Notes must be less than 5000 characters')
    .optional()
    .or(z.literal('')),
  tags: z
    .array(z.string())
    .default([]),
})

export type ClientFormData = z.input<typeof clientSchema>

/**
 * Transform form data for Supabase insert/update
 * Converts empty strings to null for optional fields
 */
export function transformClientData(data: ClientFormData) {
  return {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email || null,
    phone: data.phone || null,
    secondary_first_name: data.secondary_first_name || null,
    secondary_last_name: data.secondary_last_name || null,
    secondary_email: data.secondary_email || null,
    secondary_phone: data.secondary_phone || null,
    secondary_relationship: data.secondary_relationship || null,
    billing_email: data.billing_email || null,
    billing_address_line1: data.billing_address_line1 || null,
    billing_address_line2: data.billing_address_line2 || null,
    billing_city: data.billing_city || null,
    billing_state: data.billing_state || null,
    billing_zip: data.billing_zip || null,
    source: data.source || null,
    referral_source: data.referral_source || null,
    notes: data.notes || null,
    tags: data.tags && data.tags.length > 0 ? data.tags : null,
  }
}

/**
 * Default values for client form
 */
export const defaultClientValues: ClientFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  secondary_first_name: '',
  secondary_last_name: '',
  secondary_email: '',
  secondary_phone: '',
  secondary_relationship: '',
  billing_email: '',
  billing_address_line1: '',
  billing_address_line2: '',
  billing_city: '',
  billing_state: '',
  billing_zip: '',
  source: '',
  referral_source: '',
  notes: '',
  tags: [],
}
