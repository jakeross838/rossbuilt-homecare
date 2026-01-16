import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Tables, type InsertTables, type UpdateTables } from '@/lib/supabase'
import type {
  Vendor,
  VendorListItem,
  VendorWithStats,
  VendorFilters,
  VendorSearchResult,
} from '@/lib/types/vendor'
import {
  formatContactName,
  checkVendorCompliance,
} from '@/lib/constants/vendor'

type VendorRow = Tables<'vendors'>
type VendorInsert = InsertTables<'vendors'>
type VendorUpdate = UpdateTables<'vendors'>

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isValidUUID = (id: string | undefined): boolean => !!id && UUID_REGEX.test(id)

// Query keys for cache management
export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (filters?: VendorFilters) => [...vendorKeys.lists(), filters] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
  search: (query: string, category?: string) =>
    [...vendorKeys.all, 'search', query, category] as const,
  byTrade: (category: string) => [...vendorKeys.all, 'trade', category] as const,
}

/**
 * Hook to fetch vendors list with optional filters
 */
export function useVendors(filters?: VendorFilters) {
  return useQuery({
    queryKey: vendorKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('vendors')
        .select('*')
        .order('company_name')

      // Apply filters
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      } else {
        // Default to active only
        query = query.eq('is_active', true)
      }

      if (filters?.is_preferred !== undefined) {
        query = query.eq('is_preferred', filters.is_preferred)
      }

      if (filters?.trade_category) {
        query = query.contains('trade_categories', [filters.trade_category])
      }

      if (filters?.search) {
        query = query.or(
          `company_name.ilike.%${filters.search}%,contact_first_name.ilike.%${filters.search}%,contact_last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        )
      }

      const { data, error } = await query

      if (error) throw error

      // Transform to list items
      return (data || []).map((vendor): VendorListItem => ({
        id: vendor.id,
        company_name: vendor.company_name,
        contact_name: formatContactName(
          vendor.contact_first_name,
          vendor.contact_last_name
        ),
        email: vendor.email,
        phone: vendor.phone,
        trade_categories: vendor.trade_categories || [],
        is_preferred: vendor.is_preferred || false,
        is_active: vendor.is_active ?? true,
        total_jobs: vendor.total_jobs || 0,
        completed_jobs: vendor.completed_jobs || 0,
        average_rating: vendor.average_rating,
      }))
    },
  })
}

/**
 * Hook to fetch a single vendor with stats
 */
export function useVendor(id: string | undefined) {
  return useQuery({
    queryKey: vendorKeys.detail(id || ''),
    queryFn: async () => {
      if (!id || !isValidUUID(id)) throw new Error('Valid vendor ID is required')

      const { data: vendor, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      // Get open work orders count
      const { count: openWorkOrders } = await supabase
        .from('work_orders')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', id)
        .not('status', 'in', '("completed","cancelled","invoiced")')

      // Calculate completion rate
      const completionRate =
        vendor.total_jobs && vendor.total_jobs > 0
          ? (vendor.completed_jobs || 0) / vendor.total_jobs
          : null

      return {
        ...vendor,
        contact_name: formatContactName(
          vendor.contact_first_name,
          vendor.contact_last_name
        ),
        completion_rate: completionRate,
        open_work_orders: openWorkOrders || 0,
      } as VendorWithStats
    },
    enabled: isValidUUID(id),
  })
}

/**
 * Hook to fetch vendors by trade category (for work order assignment)
 */
export function useVendorsByTrade(category: string | undefined) {
  return useQuery({
    queryKey: vendorKeys.byTrade(category || ''),
    queryFn: async () => {
      if (!category) return []

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .contains('trade_categories', [category])
        .eq('is_active', true)
        .order('is_preferred', { ascending: false })
        .order('average_rating', { ascending: false, nullsFirst: false })

      if (error) throw error

      // Transform to search results with compliance
      return (data || []).map((vendor): VendorSearchResult => ({
        id: vendor.id,
        company_name: vendor.company_name,
        contact_name: formatContactName(
          vendor.contact_first_name,
          vendor.contact_last_name
        ),
        phone: vendor.phone,
        trade_categories: vendor.trade_categories || [],
        is_preferred: vendor.is_preferred || false,
        average_rating: vendor.average_rating,
        average_response_hours: vendor.average_response_hours,
        compliance: checkVendorCompliance({
          license_expiration: vendor.license_expiration,
          insurance_expiration: vendor.insurance_expiration,
          w9_on_file: vendor.w9_on_file,
        }),
      }))
    },
    enabled: !!category,
  })
}

/**
 * Hook to search vendors
 */
export function useSearchVendors(query: string, category?: string) {
  return useQuery({
    queryKey: vendorKeys.search(query, category),
    queryFn: async () => {
      if (!query || query.length < 2) return []

      let dbQuery = supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .or(
          `company_name.ilike.%${query}%,contact_first_name.ilike.%${query}%,contact_last_name.ilike.%${query}%`
        )
        .order('is_preferred', { ascending: false })
        .limit(10)

      if (category) {
        dbQuery = dbQuery.contains('trade_categories', [category])
      }

      const { data, error } = await dbQuery

      if (error) throw error

      return (data || []).map((vendor): VendorSearchResult => ({
        id: vendor.id,
        company_name: vendor.company_name,
        contact_name: formatContactName(
          vendor.contact_first_name,
          vendor.contact_last_name
        ),
        phone: vendor.phone,
        trade_categories: vendor.trade_categories || [],
        is_preferred: vendor.is_preferred || false,
        average_rating: vendor.average_rating,
        average_response_hours: vendor.average_response_hours,
        compliance: checkVendorCompliance({
          license_expiration: vendor.license_expiration,
          insurance_expiration: vendor.insurance_expiration,
          w9_on_file: vendor.w9_on_file,
        }),
      }))
    },
    enabled: query.length >= 2,
  })
}

/**
 * Hook to create a new vendor
 */
export function useCreateVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: Omit<VendorInsert, 'id' | 'created_at' | 'updated_at' | 'organization_id'>
    ) => {
      // Get organization_id from current user context
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userData.user.id)
        .single()

      if (!profile) throw new Error('User profile not found')

      const { data: vendor, error } = await supabase
        .from('vendors')
        .insert({
          ...data,
          organization_id: profile.organization_id,
        })
        .select()
        .single()

      if (error) throw error
      return vendor as Vendor
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all })
    },
  })
}

/**
 * Hook to update a vendor
 */
export function useUpdateVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Omit<VendorUpdate, 'id' | 'created_at' | 'updated_at' | 'organization_id'>
    }) => {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return vendor as Vendor
    },
    onSuccess: (vendor) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendor.id) })
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() })
    },
  })
}

/**
 * Hook to update vendor compliance information
 */
export function useUpdateVendorCompliance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: {
        license_number?: string | null
        license_expiration?: string | null
        insurance_company?: string | null
        insurance_policy_number?: string | null
        insurance_expiration?: string | null
        w9_on_file?: boolean
        w9_received_date?: string | null
      }
    }) => {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return vendor as Vendor
    },
    onSuccess: (vendor) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendor.id) })
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() })
    },
  })
}

/**
 * Hook to toggle vendor preferred status
 */
export function useToggleVendorPreferred() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      isPreferred,
    }: {
      id: string
      isPreferred: boolean
    }) => {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .update({
          is_preferred: isPreferred,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return vendor as Vendor
    },
    onSuccess: (vendor) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendor.id) })
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() })
    },
  })
}

/**
 * Hook to deactivate a vendor (soft delete)
 */
export function useDeactivateVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return vendor as Vendor
    },
    onSuccess: (vendor) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendor.id) })
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() })
    },
  })
}

/**
 * Hook to reactivate a vendor
 */
export function useReactivateVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return vendor as Vendor
    },
    onSuccess: (vendor) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendor.id) })
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() })
    },
  })
}

/**
 * Hook to update vendor rating after work order completion
 */
export function useRateVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      vendorId,
      rating,
      workOrderId,
    }: {
      vendorId: string
      rating: number
      workOrderId: string
    }) => {
      // Get current vendor stats
      const { data: currentVendor } = await supabase
        .from('vendors')
        .select('average_rating, completed_jobs')
        .eq('id', vendorId)
        .single()

      // Calculate new average rating
      const completedJobs = currentVendor?.completed_jobs || 1
      const currentRating = currentVendor?.average_rating || rating
      const newRating =
        (currentRating * (completedJobs - 1) + rating) / completedJobs

      const { data: vendor, error } = await supabase
        .from('vendors')
        .update({
          average_rating: Math.round(newRating * 100) / 100,
          updated_at: new Date().toISOString(),
        })
        .eq('id', vendorId)
        .select()
        .single()

      if (error) throw error

      // Update work order with rating (if we add a rating field later)
      // For now, just return the vendor

      return vendor as Vendor
    },
    onSuccess: (vendor) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendor.id) })
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() })
    },
  })
}

/**
 * Hook to get vendor counts by compliance status
 */
export function useVendorComplianceCounts() {
  return useQuery({
    queryKey: [...vendorKeys.all, 'compliance-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('license_expiration, insurance_expiration, w9_on_file')
        .eq('is_active', true)

      if (error) throw error

      let compliant = 0
      let issues = 0
      let expiringSoon = 0

      data?.forEach((vendor) => {
        const compliance = checkVendorCompliance({
          license_expiration: vendor.license_expiration,
          insurance_expiration: vendor.insurance_expiration,
          w9_on_file: vendor.w9_on_file,
        })

        if (compliance.is_compliant) {
          if (
            compliance.license_expires_soon ||
            compliance.insurance_expires_soon
          ) {
            expiringSoon++
          } else {
            compliant++
          }
        } else {
          issues++
        }
      })

      return {
        total: data?.length || 0,
        compliant,
        expiringSoon,
        issues,
      }
    },
  })
}
