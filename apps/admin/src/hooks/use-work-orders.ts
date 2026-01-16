import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, InsertTables, UpdateTables } from '@/lib/supabase'
import type {
  WorkOrderWithRelations,
  WorkOrderListItem,
  WorkOrderFilters,
  WorkOrderStatus,
} from '@/lib/types/work-order'
import { calculateClientCost, DEFAULT_MARKUP_PERCENT } from '@/lib/constants/work-order'

type WorkOrder = Tables<'work_orders'>
type WorkOrderInsert = InsertTables<'work_orders'>
type WorkOrderUpdate = UpdateTables<'work_orders'>

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isValidUUID = (id: string | undefined): boolean => !!id && UUID_REGEX.test(id)

// Query keys for cache management
export const workOrderKeys = {
  all: ['work-orders'] as const,
  lists: () => [...workOrderKeys.all, 'list'] as const,
  list: (filters?: WorkOrderFilters) => [...workOrderKeys.lists(), filters] as const,
  details: () => [...workOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...workOrderKeys.details(), id] as const,
  property: (propertyId: string) => [...workOrderKeys.all, 'property', propertyId] as const,
  client: (clientId: string) => [...workOrderKeys.all, 'client', clientId] as const,
  vendor: (vendorId: string) => [...workOrderKeys.all, 'vendor', vendorId] as const,
}

/**
 * Hook to fetch work orders list with optional filters
 */
export function useWorkOrders(filters?: WorkOrderFilters) {
  return useQuery({
    queryKey: workOrderKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('work_orders')
        .select(`
          id,
          work_order_number,
          title,
          status,
          priority,
          category,
          scheduled_date,
          estimated_cost,
          created_at,
          property:properties!inner(
            id,
            name,
            address_line1,
            city,
            state
          ),
          client:clients!inner(
            id,
            first_name,
            last_name
          ),
          vendor:vendors(
            id,
            company_name
          )
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status)
      }
      if (filters?.priority?.length) {
        query = query.in('priority', filters.priority)
      }
      if (filters?.category?.length) {
        query = query.in('category', filters.category)
      }
      if (filters?.vendor_id) {
        query = query.eq('vendor_id', filters.vendor_id)
      }
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to)
      }
      if (filters?.property_id) {
        query = query.eq('property_id', filters.property_id)
      }
      if (filters?.client_id) {
        query = query.eq('client_id', filters.client_id)
      }
      if (filters?.date_from) {
        query = query.gte('scheduled_date', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('scheduled_date', filters.date_to)
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,work_order_number.ilike.%${filters.search}%`
        )
      }

      const { data, error } = await query

      if (error) throw error

      // Transform to list items
      return (data || []).map((wo): WorkOrderListItem => ({
        id: wo.id,
        work_order_number: wo.work_order_number,
        title: wo.title,
        status: wo.status as WorkOrderStatus,
        priority: wo.priority,
        category: wo.category,
        scheduled_date: wo.scheduled_date,
        property_name: wo.property?.name || '',
        property_address: wo.property
          ? `${wo.property.address_line1}, ${wo.property.city}, ${wo.property.state}`
          : '',
        client_name: wo.client
          ? `${wo.client.first_name} ${wo.client.last_name}`
          : '',
        vendor_name: wo.vendor?.company_name || null,
        estimated_cost: wo.estimated_cost,
        created_at: wo.created_at || '',
      }))
    },
  })
}

/**
 * Hook to fetch a single work order with all relations
 */
export function useWorkOrder(id: string | undefined) {
  return useQuery({
    queryKey: workOrderKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Work order ID is required')

      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          property:properties(
            id,
            name,
            address_line1,
            city,
            state,
            zip
          ),
          client:clients(
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          vendor:vendors(
            id,
            company_name,
            contact_first_name,
            contact_last_name,
            email,
            phone
          ),
          assigned_user:users!work_orders_assigned_to_fkey(
            id,
            first_name,
            last_name,
            email
          ),
          recommendation:recommendations(
            id,
            title,
            description,
            priority
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      return data as WorkOrderWithRelations
    },
    enabled: !!id,
  })
}

/**
 * Hook to fetch work orders for a property
 */
export function usePropertyWorkOrders(propertyId: string | undefined) {
  return useQuery({
    queryKey: workOrderKeys.property(propertyId || ''),
    queryFn: async () => {
      if (!propertyId) return []

      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          id,
          work_order_number,
          title,
          status,
          priority,
          category,
          scheduled_date,
          vendor:vendors(company_name)
        `)
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!propertyId,
  })
}

/**
 * Hook to fetch work orders for a vendor
 */
export function useVendorWorkOrders(vendorId: string | undefined) {
  return useQuery({
    queryKey: workOrderKeys.vendor(vendorId || ''),
    queryFn: async () => {
      if (!vendorId || !isValidUUID(vendorId)) return []

      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          id,
          work_order_number,
          title,
          status,
          priority,
          scheduled_date,
          property:properties(name, address_line1, city)
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: isValidUUID(vendorId),
  })
}

/**
 * Hook to create a new work order
 */
export function useCreateWorkOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: Omit<WorkOrderInsert, 'id' | 'work_order_number' | 'created_at' | 'updated_at'>
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

      // Generate work order number using sequence
      const { data: seqData, error: seqError } = await supabase
        .rpc('nextval', { sequence_name: 'work_order_seq' })

      let workOrderNumber: string
      if (seqError) {
        // Fallback to timestamp-based number if sequence fails
        const timestamp = Date.now().toString().slice(-6)
        workOrderNumber = `WO-${timestamp}`
      } else {
        workOrderNumber = `WO-${seqData}`
      }

      const { data: workOrder, error } = await supabase
        .from('work_orders')
        .insert({
          ...data,
          organization_id: profile.organization_id,
          work_order_number: workOrderNumber,
          status: data.vendor_id ? 'vendor_assigned' : 'pending',
        })
        .select()
        .single()

      if (error) throw error

      // If created from recommendation, update recommendation status
      if (data.recommendation_id) {
        await supabase
          .from('recommendations')
          .update({
            status: 'in_progress',
            work_order_id: workOrder.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.recommendation_id)
      }

      return workOrder as WorkOrder
    },
    onSuccess: (workOrder) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.all })
      queryClient.invalidateQueries({
        queryKey: workOrderKeys.property(workOrder.property_id),
      })
      if (workOrder.vendor_id) {
        queryClient.invalidateQueries({
          queryKey: workOrderKeys.vendor(workOrder.vendor_id),
        })
      }
      // Invalidate recommendations if linked
      if (workOrder.recommendation_id) {
        queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      }
    },
  })
}

/**
 * Hook to update a work order
 */
export function useUpdateWorkOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Omit<WorkOrderUpdate, 'id' | 'work_order_number' | 'created_at' | 'updated_at'>
    }) => {
      const { data: workOrder, error } = await supabase
        .from('work_orders')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return workOrder as WorkOrder
    },
    onSuccess: (workOrder) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(workOrder.id) })
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() })
    },
  })
}

/**
 * Hook to update work order status
 */
export function useUpdateWorkOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: WorkOrderStatus
    }) => {
      const updates: Partial<WorkOrder> = {
        status,
        updated_at: new Date().toISOString(),
      }

      // Set timestamps based on status
      if (status === 'in_progress') {
        updates.started_at = new Date().toISOString()
      } else if (status === 'completed') {
        updates.completed_at = new Date().toISOString()
      }

      const { data: workOrder, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update recommendation status if linked
      if (workOrder.recommendation_id) {
        const recStatus = status === 'completed' ? 'completed' : 'in_progress'
        await supabase
          .from('recommendations')
          .update({
            status: recStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workOrder.recommendation_id)
      }

      return workOrder as WorkOrder
    },
    onSuccess: (workOrder) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(workOrder.id) })
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() })
      if (workOrder.recommendation_id) {
        queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      }
    },
  })
}

/**
 * Hook to assign a vendor to a work order
 */
export function useAssignVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      workOrderId,
      vendorId,
      scheduledDate,
      scheduledTimeStart,
      scheduledTimeEnd,
      estimatedCost,
    }: {
      workOrderId: string
      vendorId: string
      scheduledDate?: string
      scheduledTimeStart?: string
      scheduledTimeEnd?: string
      estimatedCost?: number
    }) => {
      const updates: Partial<WorkOrder> = {
        vendor_id: vendorId,
        status: scheduledDate ? 'scheduled' : 'vendor_assigned',
        updated_at: new Date().toISOString(),
      }

      if (scheduledDate) updates.scheduled_date = scheduledDate
      if (scheduledTimeStart) updates.scheduled_time_start = scheduledTimeStart
      if (scheduledTimeEnd) updates.scheduled_time_end = scheduledTimeEnd
      if (estimatedCost !== undefined) updates.estimated_cost = estimatedCost

      const { data: workOrder, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', workOrderId)
        .select()
        .single()

      if (error) throw error

      // Update vendor total_jobs count
      await supabase.rpc('increment_vendor_total_jobs', { vendor_id: vendorId })

      return workOrder as WorkOrder
    },
    onSuccess: (workOrder) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(workOrder.id) })
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() })
      if (workOrder.vendor_id) {
        queryClient.invalidateQueries({
          queryKey: workOrderKeys.vendor(workOrder.vendor_id),
        })
        queryClient.invalidateQueries({ queryKey: ['vendors'] })
      }
    },
  })
}

/**
 * Hook to complete a work order
 */
export function useCompleteWorkOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      actualCost,
      markupPercent = DEFAULT_MARKUP_PERCENT,
      completionNotes,
      afterPhotos,
    }: {
      id: string
      actualCost: number
      markupPercent?: number
      completionNotes?: string
      afterPhotos?: string[]
    }) => {
      const { markupAmount, totalCost } = calculateClientCost(actualCost, markupPercent)

      const updates: Partial<WorkOrder> = {
        status: 'completed',
        actual_cost: actualCost,
        markup_percent: markupPercent,
        markup_amount: markupAmount,
        total_client_cost: totalCost,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (completionNotes) updates.completion_notes = completionNotes
      if (afterPhotos?.length) updates.after_photos = afterPhotos

      const { data: workOrder, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update vendor completed_jobs count
      if (workOrder.vendor_id) {
        await supabase.rpc('increment_vendor_completed_jobs', {
          vendor_id: workOrder.vendor_id,
        })
      }

      // Update recommendation status if linked
      if (workOrder.recommendation_id) {
        await supabase
          .from('recommendations')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', workOrder.recommendation_id)
      }

      return workOrder as WorkOrder
    },
    onSuccess: (workOrder) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(workOrder.id) })
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() })
      if (workOrder.vendor_id) {
        queryClient.invalidateQueries({ queryKey: ['vendors'] })
      }
      if (workOrder.recommendation_id) {
        queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      }
    },
  })
}

/**
 * Hook to cancel a work order
 */
export function useCancelWorkOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      reason,
    }: {
      id: string
      reason?: string
    }) => {
      const { data: workOrder, error } = await supabase
        .from('work_orders')
        .update({
          status: 'cancelled',
          internal_notes: reason
            ? `Cancelled: ${reason}`
            : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Reset recommendation status if linked
      if (workOrder.recommendation_id) {
        await supabase
          .from('recommendations')
          .update({
            status: 'pending',
            work_order_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workOrder.recommendation_id)
      }

      return workOrder as WorkOrder
    },
    onSuccess: (workOrder) => {
      queryClient.invalidateQueries({ queryKey: workOrderKeys.detail(workOrder.id) })
      queryClient.invalidateQueries({ queryKey: workOrderKeys.lists() })
      if (workOrder.recommendation_id) {
        queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      }
    },
  })
}

/**
 * Hook to get work order counts by status
 */
export function useWorkOrderCounts() {
  return useQuery({
    queryKey: [...workOrderKeys.all, 'counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('status')

      if (error) throw error

      const counts: Record<WorkOrderStatus, number> = {
        pending: 0,
        vendor_assigned: 0,
        scheduled: 0,
        in_progress: 0,
        completed: 0,
        on_hold: 0,
        cancelled: 0,
      }

      data?.forEach((wo) => {
        if (wo.status && wo.status in counts) {
          counts[wo.status as WorkOrderStatus]++
        }
      })

      return counts
    },
  })
}
