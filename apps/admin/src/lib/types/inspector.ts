import type { Enums } from '@/lib/supabase'

// Inspection with full details needed for execution
export interface InspectorInspection {
  id: string
  property_id: string
  program_id: string | null
  inspection_type: string
  status: Enums<'inspection_status'> | null
  scheduled_date: string
  scheduled_time_start: string | null
  scheduled_time_end: string | null
  estimated_duration_minutes: number | null
  actual_start_at: string | null
  actual_end_at: string | null
  checklist: InspectionChecklist
  findings: Record<string, ChecklistItemFinding>
  overall_condition: Enums<'condition_rating'> | null
  summary: string | null
  weather_conditions: WeatherConditions | null
  // Joined data
  property: {
    id: string
    name: string
    address_line1: string
    address_line2: string | null
    city: string
    state: string
    zip: string
    access_codes: Record<string, string> | null
    special_instructions: string | null
  } | null
  client: {
    id: string
    first_name: string
    last_name: string
    phone: string | null
    email: string | null
  } | null
}

// Checklist structure (snapshot from template)
export interface InspectionChecklist {
  sections: ChecklistSection[]
  generated_at?: string
  template_versions?: Record<string, number>
}

export interface ChecklistSection {
  id: string
  title: string
  order: number
  items: ChecklistItem[]
}

export interface ChecklistItem {
  id: string
  label: string
  description?: string
  item_type: 'boolean' | 'numeric' | 'text' | 'photo' | 'rating' | 'select'
  required: boolean
  options?: string[] // For select type
  unit?: string // For numeric type
  min_value?: number
  max_value?: number
}

// Finding recorded for each checklist item
export interface ChecklistItemFinding {
  status: 'pass' | 'fail' | 'na' | 'needs_attention' | 'urgent'
  response?: string // Text response
  numeric_value?: number
  photos: string[]
  notes?: string
  recommendation_added?: boolean
  completed_at?: string
}

// Weather conditions at time of inspection
export interface WeatherConditions {
  temperature?: number
  humidity?: number
  conditions?: string
  wind_speed?: number
}

// Inspector's daily schedule view
export interface InspectorDaySchedule {
  date: string
  inspections: InspectorInspection[]
  total_estimated_minutes: number
}

// Inspection execution state (for offline/progress tracking)
export interface InspectionProgress {
  inspection_id: string
  started_at: string | null
  completed_items: number
  total_items: number
  pending_photos: number // Photos not yet uploaded
  is_offline: boolean
  last_synced_at: string | null
}
