import type { Enums, Tables } from '@/lib/supabase'

/**
 * Work order status flow
 */
export type WorkOrderStatus = Enums<'work_order_status'>

/**
 * Priority level for work orders
 */
export type PriorityLevel = Enums<'priority_level'>

/**
 * Work order from database with relations
 */
export type WorkOrder = Tables<'work_orders'>

/**
 * Work order with expanded relations for display
 */
export interface WorkOrderWithRelations extends WorkOrder {
  property?: {
    id: string
    name: string
    address_line1: string
    city: string
    state: string
    zip: string
  }
  client?: {
    id: string
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
  }
  vendor?: {
    id: string
    company_name: string
    contact_first_name: string | null
    contact_last_name: string | null
    email: string | null
    phone: string | null
  }
  assigned_user?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  recommendation?: {
    id: string
    title: string
    description: string
    priority: PriorityLevel
  }
}

/**
 * Work order list item (minimal fields for list views)
 */
export interface WorkOrderListItem {
  id: string
  work_order_number: string
  title: string
  status: WorkOrderStatus
  priority: PriorityLevel | null
  category: string | null
  scheduled_date: string | null
  property_name: string
  property_address: string
  client_name: string
  vendor_name: string | null
  estimated_cost: number | null
  created_at: string
}

/**
 * Work order cost breakdown
 */
export interface WorkOrderCostBreakdown {
  estimated_cost: number | null
  actual_cost: number | null
  markup_percent: number | null
  markup_amount: number | null
  total_client_cost: number | null
}

/**
 * Work order creation source
 */
export type WorkOrderSource = 'recommendation' | 'service_request' | 'manual'

/**
 * Form data for creating a work order
 */
export interface CreateWorkOrderData {
  property_id: string
  client_id: string
  title: string
  description: string
  category?: string
  priority?: PriorityLevel
  vendor_id?: string
  assigned_to?: string
  scheduled_date?: string
  scheduled_time_start?: string
  scheduled_time_end?: string
  estimated_cost?: number
  recommendation_id?: string
  internal_notes?: string
}

/**
 * Form data for updating a work order
 */
export interface UpdateWorkOrderData {
  title?: string
  description?: string
  category?: string
  priority?: PriorityLevel
  status?: WorkOrderStatus
  vendor_id?: string | null
  assigned_to?: string | null
  scheduled_date?: string | null
  scheduled_time_start?: string | null
  scheduled_time_end?: string | null
  estimated_cost?: number | null
  actual_cost?: number | null
  markup_percent?: number | null
  completion_notes?: string
  internal_notes?: string
  client_visible_notes?: string
}

/**
 * Work order completion data
 */
export interface CompleteWorkOrderData {
  actual_cost: number
  completion_notes?: string
  after_photos?: string[]
}

/**
 * Work order filter options
 */
export interface WorkOrderFilters {
  status?: WorkOrderStatus[]
  priority?: PriorityLevel[]
  category?: string[]
  vendor_id?: string
  assigned_to?: string
  property_id?: string
  client_id?: string
  date_from?: string
  date_to?: string
  search?: string
}
