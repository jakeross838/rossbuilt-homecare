import type { Tables } from '@/lib/supabase'

/**
 * Vendor from database
 */
export type Vendor = Tables<'vendors'>

/**
 * Vendor for list views (minimal fields)
 */
export interface VendorListItem {
  id: string
  company_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  trade_categories: string[]
  is_preferred: boolean
  is_active: boolean
  total_jobs: number
  completed_jobs: number
  average_rating: number | null
}

/**
 * Vendor with computed fields for display
 */
export interface VendorWithStats extends Vendor {
  contact_name: string | null
  completion_rate: number | null
  open_work_orders: number
}

/**
 * Vendor compliance status
 */
export interface VendorCompliance {
  license_valid: boolean
  license_expires_soon: boolean
  insurance_valid: boolean
  insurance_expires_soon: boolean
  w9_on_file: boolean
  is_compliant: boolean
  issues: string[]
}

/**
 * Form data for creating a vendor
 */
export interface CreateVendorData {
  company_name: string
  contact_first_name?: string
  contact_last_name?: string
  email?: string
  phone?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip?: string
  trade_categories?: string[]
  service_area?: string[]
  license_number?: string
  license_expiration?: string
  insurance_company?: string
  insurance_policy_number?: string
  insurance_expiration?: string
  w9_on_file?: boolean
  w9_received_date?: string
  is_preferred?: boolean
  notes?: string
}

/**
 * Form data for updating a vendor
 */
export interface UpdateVendorData extends Partial<CreateVendorData> {
  is_active?: boolean
}

/**
 * Vendor filter options
 */
export interface VendorFilters {
  trade_category?: string
  service_area?: string
  is_preferred?: boolean
  is_active?: boolean
  has_valid_license?: boolean
  has_valid_insurance?: boolean
  search?: string
}

/**
 * Vendor search result for assignment
 */
export interface VendorSearchResult {
  id: string
  company_name: string
  contact_name: string | null
  phone: string | null
  trade_categories: string[]
  is_preferred: boolean
  average_rating: number | null
  average_response_hours: number | null
  compliance: VendorCompliance
}
