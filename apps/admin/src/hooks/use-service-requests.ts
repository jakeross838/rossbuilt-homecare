import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { serviceRequestKeys, portalKeys, STALE_STANDARD } from '@/lib/queries'
import type {
  PortalServiceRequest,
  PortalServiceRequestComment,
} from '@/lib/types/portal'
import type { CreateServiceRequestInput, AddServiceRequestCommentInput } from '@/lib/validations/service-request'

interface UseServiceRequestsOptions {
  status?: string
  propertyId?: string
}

/**
 * Helper to get property IDs for a client user
 * Checks: 1) user_property_assignments, 2) client.user_id match, 3) client.email match
 */
async function getClientPropertyIds(userId: string, userEmail: string | null): Promise<string[]> {
  // First, check user_property_assignments
  const { data: assignments } = await supabase
    .from('user_property_assignments')
    .select('property_id')
    .eq('user_id', userId)

  if (assignments && assignments.length > 0) {
    return assignments.map((a) => a.property_id)
  }

  // Second: Find client by user_id and get their properties
  const { data: clientByUserId } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (clientByUserId) {
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .eq('client_id', clientByUserId.id)
      .eq('is_active', true)

    if (properties && properties.length > 0) {
      return properties.map((p) => p.id)
    }
  }

  // Third fallback: Find client by email and get their properties
  if (userEmail) {
    const { data: clientByEmail } = await supabase
      .from('clients')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (clientByEmail) {
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('client_id', clientByEmail.id)
        .eq('is_active', true)

      if (properties && properties.length > 0) {
        return properties.map((p) => p.id)
      }
    }
  }

  return []
}

/**
 * Hook to fetch service requests for client portal
 * Filters by user's assigned properties OR owned properties
 * Uses portal-specific query keys for proper real-time sync
 */
export function useServiceRequests(options: UseServiceRequestsOptions = {}) {
  const { status, propertyId } = options
  const profile = useAuthStore((state) => state.profile)
  const isClient = profile?.role === 'client'

  // Use portal keys for client users, admin keys for others
  // This ensures real-time sync invalidation works correctly
  const queryKey = isClient
    ? portalKeys.requests({ status })
    : serviceRequestKeys.list({ status, propertyId })

  return useQuery({
    queryKey,
    queryFn: async (): Promise<PortalServiceRequest[]> => {
      if (!profile?.id) {
        throw new Error('User not authenticated')
      }

      // Get property IDs for this client user
      const assignedPropertyIds = await getClientPropertyIds(profile.id, profile.email)

      // If no properties found, return empty array
      if (assignedPropertyIds.length === 0) {
        return []
      }

      let query = supabase
        .from('service_requests')
        .select(`
          id,
          request_number,
          request_type,
          title,
          description,
          priority,
          status,
          photos,
          resolution,
          resolved_at,
          acknowledged_at,
          work_order_id,
          created_at,
          updated_at,
          property:properties (
            id,
            name,
            address_line1
          )
        `)
        .in('property_id', assignedPropertyIds)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      if (propertyId) {
        query = query.eq('property_id', propertyId)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).map((sr) => ({
        id: sr.id,
        request_number: sr.request_number,
        request_type: sr.request_type,
        title: sr.title,
        description: sr.description,
        priority: sr.priority,
        status: sr.status,
        photos: sr.photos || [],
        property: sr.property as { id: string; name: string; address_line1: string },
        resolution: sr.resolution,
        resolved_at: sr.resolved_at,
        acknowledged_at: sr.acknowledged_at,
        work_order_id: sr.work_order_id,
        created_at: sr.created_at,
        updated_at: sr.updated_at,
      }))
    },
    enabled: profile?.role === 'client',
    staleTime: STALE_STANDARD,
  })
}

/**
 * Hook to fetch single service request with comments
 * Verifies request belongs to user's assigned or owned properties
 * Uses portal-specific query keys for client users
 */
export function useServiceRequest(requestId: string | undefined) {
  const profile = useAuthStore((state) => state.profile)
  const isClient = profile?.role === 'client'

  // Use portal keys for client users
  const queryKey = isClient
    ? portalKeys.request(requestId || '')
    : serviceRequestKeys.detail(requestId || '')

  return useQuery({
    queryKey,
    queryFn: async (): Promise<PortalServiceRequest & { comments: PortalServiceRequestComment[] }> => {
      if (!requestId) throw new Error('Request ID required')
      if (!profile?.id) throw new Error('User not authenticated')

      // Get property IDs for this client user
      const assignedPropertyIds = await getClientPropertyIds(profile.id, profile.email)

      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          id,
          request_number,
          request_type,
          title,
          description,
          priority,
          status,
          photos,
          resolution,
          resolved_at,
          acknowledged_at,
          work_order_id,
          created_at,
          updated_at,
          property_id,
          property:properties (
            id,
            name,
            address_line1
          )
        `)
        .eq('id', requestId)
        .single()

      if (error) throw error

      // Verify request belongs to user's assigned properties
      if (!assignedPropertyIds.includes(data.property_id)) {
        throw new Error('Request not found')
      }

      // Fetch comments (RLS filters to non-internal for clients)
      const { data: comments } = await supabase
        .from('service_request_comments')
        .select(`
          id,
          comment,
          created_at,
          user:users (
            first_name,
            last_name,
            role
          )
        `)
        .eq('service_request_id', requestId)
        .order('created_at', { ascending: true })

      return {
        id: data.id,
        request_number: data.request_number,
        request_type: data.request_type,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        photos: data.photos || [],
        property: data.property as { id: string; name: string; address_line1: string },
        resolution: data.resolution,
        resolved_at: data.resolved_at,
        acknowledged_at: data.acknowledged_at,
        work_order_id: data.work_order_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        comments: (comments || []).map((c) => ({
          id: c.id,
          comment: c.comment,
          created_at: c.created_at,
          user: c.user as { first_name: string; last_name: string; role: string } | null,
        })),
      }
    },
    enabled: !!requestId && profile?.role === 'client',
    staleTime: STALE_STANDARD,
  })
}

/**
 * Hook to create a new service request
 * Note: request_number is auto-generated by database trigger
 */
export function useCreateServiceRequest() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (input: CreateServiceRequestInput) => {
      if (!profile?.id) throw new Error('User not authenticated')

      // Get client_id from current user's linked client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', profile.id)
        .single()

      if (clientError || !client) {
        throw new Error('Client account not found. Please contact support.')
      }

      // Get organization_id from property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('organization_id')
        .eq('id', input.property_id)
        .single()

      if (propertyError || !property) {
        throw new Error('Property not found. Please select a valid property.')
      }

      // Insert request - request_number is auto-generated by database trigger
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          organization_id: property.organization_id,
          property_id: input.property_id,
          client_id: client.id,
          request_type: input.request_type,
          title: input.title,
          description: input.description,
          priority: input.priority,
          photos: input.photos || [],
          status: 'new',
        })
        .select()
        .single()

      if (error) throw error

      return data
    },
    onSuccess: () => {
      // Invalidate both admin and portal query keys
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.lists() })
      queryClient.invalidateQueries({ queryKey: portalKeys.requests() })
      queryClient.invalidateQueries({ queryKey: portalKeys.dashboard() })
    },
  })
}

/**
 * Hook to add a comment to a service request
 */
export function useAddServiceRequestComment() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async (input: AddServiceRequestCommentInput) => {
      const { data, error } = await supabase
        .from('service_request_comments')
        .insert({
          service_request_id: input.service_request_id,
          user_id: user?.id,
          comment: input.comment,
          is_internal: false, // Clients can only post non-internal comments
        })
        .select()
        .single()

      if (error) throw error

      return data
    },
    onSuccess: (_, variables) => {
      // Invalidate both admin and portal query keys
      queryClient.invalidateQueries({
        queryKey: serviceRequestKeys.detail(variables.service_request_id),
      })
      queryClient.invalidateQueries({
        queryKey: portalKeys.request(variables.service_request_id),
      })
    },
  })
}

/**
 * Hook to upload photos for service request
 */
export function useUploadServiceRequestPhoto() {
  return useMutation({
    mutationFn: async ({
      file,
      requestId,
    }: {
      file: File
      requestId?: string
    }): Promise<string> => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${requestId || 'temp'}-${Date.now()}.${fileExt}`
      const filePath = `service-requests/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('service-request-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('service-request-photos')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    },
  })
}

// ============================================================================
// ADMIN HOOKS - For admin view of all service requests
// ============================================================================

export interface AdminServiceRequest {
  id: string
  request_number: string
  request_type: string
  title: string
  description: string | null
  priority: string
  status: string
  photos: string[]
  resolution: string | null
  resolved_at: string | null
  acknowledged_at: string | null
  work_order_id: string | null
  created_at: string
  updated_at: string
  property: {
    id: string
    name: string
    address_line1: string | null
  }
  client: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
  }
}

interface AdminServiceRequestFilters {
  status?: string[]
  priority?: string[]
  propertyId?: string
  clientId?: string
  search?: string
}

/**
 * Hook to fetch ALL service requests for admin view
 * Shows requests from all clients across the organization
 */
export function useAdminServiceRequests(filters?: AdminServiceRequestFilters) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: serviceRequestKeys.list({
      status: filters?.status?.join(','),
      propertyId: filters?.propertyId
    }),
    queryFn: async (): Promise<AdminServiceRequest[]> => {
      if (!profile?.organization_id) {
        throw new Error('User not authenticated')
      }

      let query = supabase
        .from('service_requests')
        .select(`
          id,
          request_number,
          request_type,
          title,
          description,
          priority,
          status,
          photos,
          resolution,
          resolved_at,
          acknowledged_at,
          work_order_id,
          created_at,
          updated_at,
          property:properties (
            id,
            name,
            address_line1
          ),
          client:clients (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status)
      }
      if (filters?.priority?.length) {
        query = query.in('priority', filters.priority)
      }
      if (filters?.propertyId) {
        query = query.eq('property_id', filters.propertyId)
      }
      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId)
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,request_number.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        )
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).map((sr) => ({
        id: sr.id,
        request_number: sr.request_number,
        request_type: sr.request_type,
        title: sr.title,
        description: sr.description,
        priority: sr.priority,
        status: sr.status,
        photos: sr.photos || [],
        resolution: sr.resolution,
        resolved_at: sr.resolved_at,
        acknowledged_at: sr.acknowledged_at,
        work_order_id: sr.work_order_id,
        created_at: sr.created_at,
        updated_at: sr.updated_at,
        property: sr.property as AdminServiceRequest['property'],
        client: sr.client as AdminServiceRequest['client'],
      }))
    },
    enabled: !!profile?.organization_id && profile?.role !== 'client',
    staleTime: STALE_STANDARD,
  })
}

/**
 * Hook to fetch single service request for admin view
 */
export function useAdminServiceRequest(requestId: string | undefined) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: serviceRequestKeys.detail(requestId || ''),
    queryFn: async (): Promise<AdminServiceRequest & { comments: PortalServiceRequestComment[] }> => {
      if (!requestId) throw new Error('Request ID required')
      if (!profile?.organization_id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          id,
          request_number,
          request_type,
          title,
          description,
          priority,
          status,
          photos,
          resolution,
          resolved_at,
          acknowledged_at,
          work_order_id,
          created_at,
          updated_at,
          property:properties (
            id,
            name,
            address_line1
          ),
          client:clients (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', requestId)
        .eq('organization_id', profile.organization_id)
        .single()

      if (error) throw error

      // Fetch comments
      const { data: comments } = await supabase
        .from('service_request_comments')
        .select(`
          id,
          comment,
          is_internal,
          created_at,
          user:users (
            first_name,
            last_name,
            role
          )
        `)
        .eq('service_request_id', requestId)
        .order('created_at', { ascending: true })

      return {
        id: data.id,
        request_number: data.request_number,
        request_type: data.request_type,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        photos: data.photos || [],
        resolution: data.resolution,
        resolved_at: data.resolved_at,
        acknowledged_at: data.acknowledged_at,
        work_order_id: data.work_order_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        property: data.property as AdminServiceRequest['property'],
        client: data.client as AdminServiceRequest['client'],
        comments: (comments || []).map((c) => ({
          id: c.id,
          comment: c.comment,
          created_at: c.created_at,
          user: c.user as { first_name: string; last_name: string; role: string } | null,
        })),
      }
    },
    enabled: !!requestId && !!profile?.organization_id && profile?.role !== 'client',
    staleTime: STALE_STANDARD,
  })
}

/**
 * Hook to update service request status (admin only)
 */
export function useUpdateServiceRequestStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
      resolution,
    }: {
      id: string
      status: string
      resolution?: string
    }) => {
      const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === 'acknowledged' && !updates.acknowledged_at) {
        updates.acknowledged_at = new Date().toISOString()
      }
      if (status === 'completed' && resolution) {
        updates.resolution = resolution
        updates.resolved_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('service_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      // Invalidate both admin and portal queries
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.lists() })
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: portalKeys.requests() })
      queryClient.invalidateQueries({ queryKey: portalKeys.request(variables.id) })
      queryClient.invalidateQueries({ queryKey: portalKeys.dashboard() })
    },
  })
}

/**
 * Hook to add internal comment to service request (admin only)
 */
export function useAddAdminComment() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async ({
      service_request_id,
      comment,
      is_internal = false,
    }: {
      service_request_id: string
      comment: string
      is_internal?: boolean
    }) => {
      const { data, error } = await supabase
        .from('service_request_comments')
        .insert({
          service_request_id,
          user_id: user?.id,
          comment,
          is_internal,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: serviceRequestKeys.detail(variables.service_request_id),
      })
      queryClient.invalidateQueries({
        queryKey: portalKeys.request(variables.service_request_id),
      })
    },
  })
}
