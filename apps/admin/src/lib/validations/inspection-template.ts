import { z } from 'zod'

/**
 * Validation schemas for inspection templates
 * Based on the inspection_templates database schema
 */

/**
 * Schema for individual checklist item within a template section
 */
export const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Item text is required'),
  type: z
    .enum(['status', 'text', 'number', 'select', 'photo'])
    .default('status'),
  options: z.array(z.string()).optional(),
  photo_required: z.boolean().default(false),
  photo_recommended: z.boolean().default(false),
  help_text: z.string().optional(),
  recommendation_template_key: z.string().optional(),
})

/**
 * Schema for a section containing grouped checklist items
 */
export const checklistSectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Section name is required'),
  order: z.number(),
  items: z.array(checklistItemSchema),
})

/**
 * Schema for inspection template form data
 */
export const inspectionTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  tier: z.enum(['visual', 'functional', 'comprehensive', 'preventative']),
  category: z.string().optional().nullable(),
  feature_type: z.string().optional().nullable(),
  equipment_category: z.string().optional().nullable(),
  sections: z.array(checklistSectionSchema),
  estimated_minutes: z.number().optional(),
})

/**
 * Type for checklist item input
 */
export type ChecklistItemInput = z.infer<typeof checklistItemSchema>

/**
 * Type for checklist section input
 */
export type ChecklistSectionInput = z.infer<typeof checklistSectionSchema>

/**
 * Type for inspection template form data
 */
export type InspectionTemplateFormData = z.infer<typeof inspectionTemplateSchema>

/**
 * Default values for a new checklist item
 */
export function defaultChecklistItem(id?: string): ChecklistItemInput {
  return {
    id: id || crypto.randomUUID(),
    text: '',
    type: 'status',
    photo_required: false,
    photo_recommended: false,
  }
}

/**
 * Default values for a new checklist section
 */
export function defaultChecklistSection(
  order: number,
  id?: string
): ChecklistSectionInput {
  return {
    id: id || crypto.randomUUID(),
    name: '',
    order,
    items: [],
  }
}

/**
 * Default values for a new inspection template
 */
export function defaultInspectionTemplate(): InspectionTemplateFormData {
  return {
    name: '',
    description: '',
    tier: 'visual',
    category: null,
    feature_type: null,
    equipment_category: null,
    sections: [],
    estimated_minutes: undefined,
  }
}

/**
 * Transform form data for Supabase insert/update
 * Converts empty strings to null for optional fields
 */
export function transformTemplateData(data: InspectionTemplateFormData) {
  return {
    name: data.name,
    description: data.description || null,
    tier: data.tier,
    category: data.category || null,
    feature_type: data.feature_type || null,
    equipment_category: data.equipment_category || null,
    sections: data.sections,
    estimated_minutes: data.estimated_minutes || null,
  }
}
