import { z } from 'zod'
import { TRADE_CATEGORIES, US_STATES } from '@/lib/constants/vendor'

const tradeCategoryValues = TRADE_CATEGORIES.map((c) => c.value) as [string, ...string[]]
const stateValues = US_STATES.map((s) => s.value) as [string, ...string[]]

/**
 * Phone number validation regex
 */
const phoneRegex = /^[\d\s\-().+]+$/

/**
 * Schema for creating a new vendor
 */
export const createVendorSchema = z.object({
  company_name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must be less than 200 characters'),
  contact_first_name: z.string().max(100).optional().nullable(),
  contact_last_name: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  phone: z
    .string()
    .regex(phoneRegex, 'Invalid phone number format')
    .optional()
    .nullable()
    .or(z.literal('')),
  address_line1: z.string().max(200).optional().nullable(),
  address_line2: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.enum(stateValues).optional().nullable(),
  zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code')
    .optional()
    .nullable()
    .or(z.literal('')),
  trade_categories: z.array(z.enum(tradeCategoryValues)).default([]),
  service_area: z.array(z.string()).default([]),
  license_number: z.string().max(100).optional().nullable(),
  license_expiration: z.string().optional().nullable(),
  insurance_company: z.string().max(200).optional().nullable(),
  insurance_policy_number: z.string().max(100).optional().nullable(),
  insurance_expiration: z.string().optional().nullable(),
  w9_on_file: z.boolean().default(false),
  w9_received_date: z.string().optional().nullable(),
  is_preferred: z.boolean().default(false),
  notes: z.string().max(2000).optional().nullable(),
})

export type CreateVendorFormData = z.infer<typeof createVendorSchema>

/**
 * Schema for updating a vendor
 */
export const updateVendorSchema = createVendorSchema.partial().extend({
  is_active: z.boolean().optional(),
})

export type UpdateVendorFormData = z.infer<typeof updateVendorSchema>

/**
 * Schema for vendor compliance update
 */
export const vendorComplianceSchema = z.object({
  license_number: z.string().max(100).optional().nullable(),
  license_expiration: z.string().optional().nullable(),
  insurance_company: z.string().max(200).optional().nullable(),
  insurance_policy_number: z.string().max(100).optional().nullable(),
  insurance_expiration: z.string().optional().nullable(),
  w9_on_file: z.boolean(),
  w9_received_date: z.string().optional().nullable(),
})

export type VendorComplianceFormData = z.infer<typeof vendorComplianceSchema>

/**
 * Schema for vendor search/filter
 */
export const vendorFilterSchema = z.object({
  trade_category: z.enum(tradeCategoryValues).optional(),
  is_preferred: z.boolean().optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(),
})

export type VendorFilterFormData = z.infer<typeof vendorFilterSchema>
