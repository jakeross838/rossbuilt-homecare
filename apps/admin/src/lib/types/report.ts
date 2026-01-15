import type { ChecklistItemFinding, WeatherConditions } from './inspector'
import type { Enums } from '@/lib/supabase'

/**
 * Report generation status
 */
export type ReportStatus = 'pending' | 'generating' | 'ready' | 'sent' | 'viewed'

/**
 * Report section types for the PDF
 */
export type ReportSectionType =
  | 'cover'
  | 'summary'
  | 'findings_overview'
  | 'section_detail'
  | 'recommendations'
  | 'photos'
  | 'weather'
  | 'footer'

/**
 * Finding summary for reports
 */
export interface ReportFindingSummary {
  total_items: number
  passed: number
  failed: number
  needs_attention: number
  urgent: number
  not_applicable: number
  completion_percentage: number
}

/**
 * Section findings for reports
 */
export interface ReportSectionFindings {
  section_id: string
  section_name: string
  items: ReportItemFinding[]
  summary: {
    total: number
    passed: number
    issues: number
  }
}

/**
 * Individual item finding for reports
 */
export interface ReportItemFinding {
  item_id: string
  label: string
  status: ChecklistItemFinding['status']
  notes?: string
  photos: string[]
  recommendation_added: boolean
}

/**
 * Recommendation for reports
 */
export interface ReportRecommendation {
  id: string
  title: string
  description: string
  priority: Enums<'priority_level'>
  category?: string
  photos: string[]
  estimated_cost_low?: number
  estimated_cost_high?: number
  ai_why_it_matters?: string
}

/**
 * Property info for report cover
 */
export interface ReportPropertyInfo {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  photo_url?: string
}

/**
 * Client info for report
 */
export interface ReportClientInfo {
  id: string
  name: string
  email?: string
  phone?: string
}

/**
 * Inspector info for report
 */
export interface ReportInspectorInfo {
  id: string
  name: string
  title?: string
}

/**
 * Complete report data structure
 */
export interface InspectionReport {
  // Metadata
  id: string
  inspection_id: string
  generated_at: string
  status: ReportStatus
  report_url?: string

  // Inspection info
  inspection_date: string
  inspection_type: string
  tier: string
  duration_minutes: number

  // Participants
  property: ReportPropertyInfo
  client: ReportClientInfo
  inspector: ReportInspectorInfo

  // Overall assessment
  overall_condition: Enums<'condition_rating'> | null
  summary: string
  ai_summary?: string
  weather?: WeatherConditions

  // Findings
  findings_summary: ReportFindingSummary
  sections: ReportSectionFindings[]

  // Recommendations
  recommendations: ReportRecommendation[]

  // Photos (consolidated)
  cover_photo?: string
  all_photos: Array<{
    url: string
    caption?: string
    section?: string
    item_label?: string
  }>
}

/**
 * Report generation options
 */
export interface ReportGenerationOptions {
  include_photos: boolean
  include_recommendations: boolean
  include_ai_summary: boolean
  include_weather: boolean
  photo_quality: 'thumbnail' | 'medium' | 'full'
  page_size: 'letter' | 'a4'
}

/**
 * Report delivery options
 */
export interface ReportDeliveryOptions {
  send_email: boolean
  email_to: string[]
  email_subject?: string
  email_message?: string
}

/**
 * Report generation request
 */
export interface GenerateReportRequest {
  inspection_id: string
  options?: Partial<ReportGenerationOptions>
  delivery?: Partial<ReportDeliveryOptions>
}

/**
 * Report generation response
 */
export interface GenerateReportResponse {
  report_id: string
  report_url: string
  generated_at: string
  page_count: number
}
