import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { portalKeys } from './use-portal-dashboard'
import type {
  PortalServiceRequest,
  PortalServiceRequestComment,
} from '@/lib/types/portal'
import type { CreateServiceRequestInput, AddServiceRequestCommentInput } from '@/lib/validations/service-request'

// Service request query keys
export const serviceRequestKeys = {
  all: ['service-requests'] as const,
  lists: () => [...serviceRequestKeys.all, 'list'] as const,
  list: (filters: { status?: string; propertyId?: string }) =>
    [...serviceRequestKeys.lists(), filters] as const,
  details: () => [...serviceRequestKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceRequestKeys.details(), id] as const,
  comments: (requestId: string) =>
    [...serviceRequestKeys.detail(requestId), 'comments'] as const,
}

interface UseServiceRequestsOptions {
  status?: string
  propertyId?: string
}

/**
 * Hook to fetch service requests for client portal
 * Filters by user's assigned properties
 */
export function useServiceRequests(options: UseServiceRequestsOptions = {}) {
  const { status, propertyId } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: serviceRequestKeys.list({ status, propertyId }),
    queryFn: async (): Promise<PortalServiceRequest[]> => {
      if (!profile?.id) {
        throw new Error('User not authenticated')
      }

      // First, get the property IDs assigned to this user
      const { data: assignments, error: assignmentError } = await supabase
        .from('user_property_assignments')
        .select('property_id')
        .eq('user_id', profile.id)

      if (assignmentError) throw assignmentError

      // If no assignments, return empty array
      if (!assignments || assignments.length === 0) {
        return []
      }

      const assignedPropertyIds = assignments.map((a) => a.property_id)

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
  })
}

/**
 * Hook to fetch single service request with comments
 * Verifies request belongs to user's assigned properties
 */
export function useServiceRequest(requestId: string | undefined) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: serviceRequestKeys.detail(requestId || ''),
    queryFn: async (): Promise<PortalServiceRequest & { comments: PortalServiceRequestComment[] }> => {
      if (!requestId) throw new Error('Request ID required')
      if (!profile?.id) throw new Error('User not authenticated')

      // First, get the property IDs assigned to this user
      const { data: assignments, error: assignmentError } = await supabase
        .from('user_property_assignments')
        .select('property_id')
        .eq('user_id', profile.id)

      if (assignmentError) throw assignmentError

      const assignedPropertyIds = assignments?.map((a) => a.property_id) || []

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
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.lists() })
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
      queryClient.invalidateQueries({
        queryKey: serviceRequestKeys.detail(variables.service_request_id),
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
