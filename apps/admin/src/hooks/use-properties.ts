import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Tables, type InsertTables, type UpdateTables } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { clientKeys, propertyKeys } from '@/lib/queries'
import { DEBUG } from '@/config/app-config'

type Property = Tables<'properties'>
type PropertyInsert = InsertTables<'properties'>
type PropertyUpdate = UpdateTables<'properties'>

interface UsePropertiesOptions {
  search?: string
  clientId?: string
  active?: boolean
}

/**
 * Hook to fetch list of properties with optional search, client filter, and active filter
 */
export function useProperties(options: UsePropertiesOptions = {}) {
  const { search, clientId, active = true } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: propertyKeys.list({ search, clientId, active }),
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      let query = supabase
        .from('properties')
        .select(`
          *,
          client:clients (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('organization_id', profile.organization_id)
        .order('name', { ascending: true })

      // Filter by active status
      if (active !== undefined) {
        query = query.eq('is_active', active)
      }

      // Filter by client
      if (clientId) {
        query = query.eq('client_id', clientId)
      }

      // Search by name, address, or city
      if (search && search.trim()) {
        const searchTerm = `%${search.trim().toLowerCase()}%`
        query = query.or(
          `name.ilike.${searchTerm},address_line1.ilike.${searchTerm},city.ilike.${searchTerm}`
        )
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data as (Property & {
        client: {
          id: string
          first_name: string
          last_name: string
          email: string | null
        } | null
      })[]
    },
    enabled: !!profile?.organization_id,
  })
}

/**
 * Hook to fetch a single property by ID with related data
 */
export function useProperty(id: string | undefined) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: propertyKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Property ID is required')
      }

      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      // Fetch property with client, equipment, and inspections
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          client:clients (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          equipment (
            id,
            custom_name,
            equipment_type,
            category,
            manufacturer,
            model_number,
            is_active
          ),
          inspections (
            id,
            status,
            scheduled_date,
            actual_end_at,
            inspector_id
          )
        `)
        .eq('id', id)
        .eq('organization_id', profile.organization_id)
        .single()

      if (error) {
        throw error
      }

      return data
    },
    enabled: !!id && !!profile?.organization_id,
  })
}

/**
 * Hook to create a new property
 */
export function useCreateProperty() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (
      data: Omit<PropertyInsert, 'id' | 'organization_id' | 'created_at' | 'updated_at'>
    ) => {
      if (DEBUG.QUERY_LOGGING) {
        console.log('[useCreateProperty] Starting mutation with data:', data)
        console.log('[useCreateProperty] Profile:', profile)
      }

      if (!profile?.organization_id) {
        console.error('[useCreateProperty] No organization found!')
        throw new Error('No organization found')
      }

      if (DEBUG.QUERY_LOGGING) {
        console.log('[useCreateProperty] Inserting with org_id:', profile.organization_id)
      }

      const { data: property, error } = await supabase
        .from('properties')
        .insert({
          ...data,
          organization_id: profile.organization_id,
        })
        .select()
        .single()

      if (error) {
        console.error('[useCreateProperty] Supabase error:', error)
        throw error
      }

      if (DEBUG.QUERY_LOGGING) {
        console.log('[useCreateProperty] Success! Created property:', property)
      }

      return property as Property
    },
    onSuccess: (property) => {
      if (DEBUG.QUERY_LOGGING) {
        console.log('[useCreateProperty] onSuccess - invalidating queries')
      }
      // Invalidate property list queries to refetch
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
      // Also invalidate the client detail to update property count
      if (property.client_id) {
        queryClient.invalidateQueries({ queryKey: clientKeys.detail(property.client_id) })
      }
    },
    onError: (error) => {
      console.error('[useCreateProperty] Mutation error:', error)
    },
  })
}

/**
 * Hook to update an existing property
 */
export function useUpdateProperty() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Omit<PropertyUpdate, 'id' | 'organization_id' | 'created_at' | 'updated_at'>
    }) => {
      if (DEBUG.QUERY_LOGGING) {
        console.log('[useUpdateProperty] Starting mutation for id:', id)
        console.log('[useUpdateProperty] Update data:', data)
      }

      if (!profile?.organization_id) {
        console.error('[useUpdateProperty] No organization found!')
        throw new Error('No organization found')
      }

      const { data: property, error } = await supabase
        .from('properties')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('organization_id', profile.organization_id)
        .select()
        .single()

      if (error) {
        console.error('[useUpdateProperty] Supabase error:', error)
        throw error
      }

      if (DEBUG.QUERY_LOGGING) {
        console.log('[useUpdateProperty] Success! Updated property:', property)
      }

      return property as Property
    },
    onSuccess: (property) => {
      if (DEBUG.QUERY_LOGGING) {
        console.log('[useUpdateProperty] onSuccess - invalidating queries')
      }
      // Invalidate specific property and list queries
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(property.id) })
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
      // Also invalidate client detail if client changed
      if (property.client_id) {
        queryClient.invalidateQueries({ queryKey: clientKeys.detail(property.client_id) })
      }
    },
    onError: (error) => {
      console.error('[useUpdateProperty] Mutation error:', error)
    },
  })
}

/**
 * Hook to soft delete a property (sets is_active = false)
 */
export function useDeleteProperty() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (id: string) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const { data: property, error } = await supabase
        .from('properties')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('organization_id', profile.organization_id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return property as Property
    },
    onSuccess: (property) => {
      // Invalidate specific property and list queries
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(property.id) })
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
      // Also invalidate client detail
      if (property.client_id) {
        queryClient.invalidateQueries({ queryKey: clientKeys.detail(property.client_id) })
      }
    },
  })
}
