import { z } from 'zod'

// Schema for recording a checklist item finding
export const checklistItemFindingSchema = z.object({
  status: z.enum(['pass', 'fail', 'na', 'needs_attention', 'urgent']),
  response: z.string().optional(),
  numeric_value: z.number().optional(),
  notes: z.string().max(2000).optional(),
  recommendation_added: z.boolean().optional(),
})

export type ChecklistItemFindingInput = z.infer<typeof checklistItemFindingSchema>

// Schema for completing an inspection
export const completeInspectionSchema = z.object({
  overall_condition: z.enum(['excellent', 'good', 'fair', 'needs_attention', 'poor']),
  summary: z.string().min(10, 'Summary must be at least 10 characters').max(5000),
  weather_conditions: z.object({
    temperature: z.number().optional(),
    humidity: z.number().min(0).max(100).optional(),
    conditions: z.string().optional(),
    wind_speed: z.number().optional(),
  }).optional(),
})

export type CompleteInspectionInput = z.infer<typeof completeInspectionSchema>

// Defaults
export function defaultChecklistFinding(): ChecklistItemFindingInput {
  return {
    status: 'pass',
    notes: '',
  }
}

export function defaultCompletionInput(): CompleteInspectionInput {
  return {
    overall_condition: 'good',
    summary: '',
  }
}
