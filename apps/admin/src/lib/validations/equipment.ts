import { z } from 'zod'

/**
 * Validation schema for equipment form data
 * Used for creating and updating equipment items
 */
export const equipmentSchema = z.object({
  // Required fields
  property_id: z.string().uuid('Property is required'),
  category: z.string().min(1, 'Category is required'),
  equipment_type: z.string().min(1, 'Equipment type is required'),

  // Optional identification fields
  custom_name: z
    .string()
    .max(100, 'Custom name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  manufacturer: z
    .string()
    .max(100, 'Manufacturer must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  model_number: z
    .string()
    .max(100, 'Model number must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  serial_number: z
    .string()
    .max(100, 'Serial number must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  // Date fields
  install_date: z.string().optional().nullable(),
  warranty_expiration: z.string().optional().nullable(),

  // Location fields
  location: z
    .string()
    .max(200, 'Location must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  serves: z
    .string()
    .max(200, 'Serves must be less than 200 characters')
    .optional()
    .or(z.literal('')),

  // Specification fields
  capacity: z
    .string()
    .max(100, 'Capacity must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  filter_size: z
    .string()
    .max(50, 'Filter size must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  fuel_type: z.string().optional().or(z.literal('')),

  // Notes
  notes: z.string().optional().or(z.literal('')),
})

/**
 * Type for equipment form data inferred from schema
 */
export type EquipmentFormData = z.infer<typeof equipmentSchema>

/**
 * Default values for equipment form
 */
export function equipmentDefaults(propertyId?: string): EquipmentFormData {
  return {
    property_id: propertyId || '',
    category: '',
    equipment_type: '',
    custom_name: '',
    manufacturer: '',
    model_number: '',
    serial_number: '',
    install_date: null,
    warranty_expiration: null,
    location: '',
    serves: '',
    capacity: '',
    filter_size: '',
    fuel_type: '',
    notes: '',
  }
}

/**
 * Transform form data for Supabase insert/update
 * Converts empty strings to null for optional fields
 */
export function transformEquipmentData(data: EquipmentFormData) {
  return {
    property_id: data.property_id,
    category: data.category,
    equipment_type: data.equipment_type,
    custom_name: data.custom_name || null,
    manufacturer: data.manufacturer || null,
    model_number: data.model_number || null,
    serial_number: data.serial_number || null,
    install_date: data.install_date || null,
    warranty_expiration: data.warranty_expiration || null,
    location: data.location || null,
    serves: data.serves || null,
    capacity: data.capacity || null,
    filter_size: data.filter_size || null,
    fuel_type: data.fuel_type || null,
    notes: data.notes || null,
  }
}
