import type { Enums } from '@/lib/supabase'

/**
 * Client portal types for client-facing views
 */

// Client profile as seen in portal
export interface PortalClient {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  secondary_first_name: string | null
  secondary_last_name: string | null
  secondary_email: string | null
  secondary_phone: string | null
}

// Property summary for portal dashboard
export interface PortalProperty {
  id: string
  name: string
  address_line1: string
  city: string
  state: string
  zip: string
  primary_photo_url: string | null

  // Program summary
  program: {
    id: string
    tier: Enums<'inspection_tier'>
    frequency: Enums<'inspection_frequency'>
    status: Enums<'program_status'>
    monthly_price: number
    next_inspection_date: string | null
  } | null

  // Status indicators
  equipment_count: number
  open_work_order_count: number
  pending_recommendation_count: number
  last_inspection_date: string | null
  overall_condition: Enums<'condition_rating'> | null
}

// Property detail with full information for portal
export interface PortalPropertyDetail extends PortalProperty {
  address_line2: string | null
  property_type: string | null
  square_footage: number | null
  year_built: number | null

  // Access info (limited view for client)
  gate_code: string | null
  alarm_code: string | null

  // Equipment list
  equipment: PortalEquipment[]

  // Recent inspections
  recent_inspections: PortalInspection[]

  // Active work orders
  active_work_orders: PortalWorkOrder[]

  // Pending recommendations
  pending_recommendations: PortalRecommendation[]
}

// Equipment as seen by client
export interface PortalEquipment {
  id: string
  name: string
  category: string
  location: string | null
  condition: Enums<'condition_rating'> | null
  last_serviced_at: string | null
  next_service_date: string | null
}

// Inspection summary for client
export interface PortalInspection {
  id: string
  inspection_date: string
  inspection_type: Enums<'inspection_tier'>
  status: Enums<'inspection_status'>
  overall_condition: Enums<'condition_rating'> | null
  summary: string | null
  report_url: string | null

  // Inspector info
  inspector: {
    first_name: string
    last_name: string
  } | null

  // Findings summary
  findings_summary: {
    total: number
    passed: number
    needs_attention: number
    urgent: number
  }
}

// Work order as seen by client
export interface PortalWorkOrder {
  id: string
  work_order_number: string
  title: string
  description: string | null
  category: string
  priority: Enums<'priority_level'>
  status: Enums<'work_order_status'>
  estimated_cost: number | null
  client_cost: number | null
  scheduled_date: string | null
  completed_at: string | null
  created_at: string
}

// Recommendation awaiting client approval
export interface PortalRecommendation {
  id: string
  title: string
  description: string
  priority: Enums<'priority_level'>
  status: Enums<'recommendation_status'>
  estimated_cost: number | null
  category: string

  // Source inspection
  inspection: {
    id: string
    inspection_date: string
  } | null

  created_at: string
}

// Service request from client portal
export interface PortalServiceRequest {
  id: string
  request_number: string
  request_type: string
  title: string
  description: string
  priority: Enums<'priority_level'>
  status: Enums<'service_request_status'>
  photos: string[]

  // Property info
  property: {
    id: string
    name: string
    address_line1: string
  }

  // Resolution
  resolution: string | null
  resolved_at: string | null

  // Communication
  acknowledged_at: string | null
  work_order_id: string | null

  created_at: string
  updated_at: string
}

// Service request comment (non-internal only for clients)
export interface PortalServiceRequestComment {
  id: string
  comment: string
  created_at: string

  // User info (may be client or staff)
  user: {
    first_name: string
    last_name: string
    role: Enums<'user_role'>
  } | null
}

// Invoice as seen by client
export interface PortalInvoice {
  id: string
  invoice_number: string
  status: Enums<'invoice_status'>
  issue_date: string
  due_date: string
  total: number
  balance_due: number

  // Line items
  line_items: {
    description: string
    quantity: number
    unit_price: number
    amount: number
  }[]

  // Payment link (generated on-demand via edge function)
  stripe_payment_url: string | null

  // PDF download URL
  pdf_url?: string | null
}

// Dashboard summary for client portal home
export interface PortalDashboardSummary {
  properties_count: number
  upcoming_inspections: number
  open_service_requests: number
  pending_approvals: number
  outstanding_balance: number
}
