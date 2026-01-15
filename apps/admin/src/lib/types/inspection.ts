/**
 * Inspection checklist types for the inspection system
 * Based on Home Care OS inspection templates and checklists
 */

/**
 * Types of checklist items that can be included in an inspection
 */
export type ChecklistItemType = 'status' | 'text' | 'number' | 'select' | 'photo'

/**
 * Possible status values for a checklist item
 */
export type ItemStatus = 'pass' | 'fail' | 'na' | 'needs_attention' | 'urgent'

/**
 * Individual checklist item definition
 */
export interface ChecklistItem {
  id: string
  text: string
  type: ChecklistItemType
  options?: string[] // For select type
  photo_required: boolean
  photo_recommended: boolean
  help_text?: string
  recommendation_template_key?: string
  equipment_id?: string // If tied to specific equipment
}

/**
 * Section containing a group of related checklist items
 */
export interface ChecklistSection {
  id: string
  name: string
  order: number
  items: ChecklistItem[]
}

/**
 * Generated checklist for a specific inspection
 */
export interface GeneratedChecklist {
  sections: ChecklistSection[]
  generated_at: string
  property_id: string
  program_id: string
  tier: string
  template_versions: Record<string, number>
  total_items: number
  estimated_duration_minutes: number
}

/**
 * Template item as stored in the constants (partial definition)
 */
export interface TemplateItem {
  id: string
  text: string
  type?: ChecklistItemType
  options?: string[]
  photo_required?: boolean
  photo_recommended?: boolean
  help_text?: string
  recommendation_template_key?: string
}

/**
 * Tier keys for template indexing
 */
export type InspectionTierKey = 'visual' | 'functional' | 'comprehensive' | 'preventative'

/**
 * Template structure with tier-based items
 */
export interface TieredTemplate {
  visual: TemplateItem[]
  functional: TemplateItem[]
  comprehensive: TemplateItem[]
  preventative: TemplateItem[]
}
