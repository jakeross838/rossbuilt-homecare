import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Tables, type InsertTables, type UpdateTables } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { clientKeys } from '@/lib/queries'
import { useOptimisticMutation } from './use-base-mutation'

type Client = Tables<'clients'>
type ClientInsert = InsertTables<'clients'>
type ClientUpdate = UpdateTables<'clients'>

interface UseClientsOptions {
  search?: string
  active?: boolean
}

/**
 * Hook to fetch list of clients with optional search and active filter
 */
export function useClients(options: UseClientsOptions = {}) {
  const { search, active = true } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: clientKeys.list({ search, active }),
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      let query = supabase
        .from('clients')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })

      // Filter by active status
      if (active !== undefined) {
        query = query.eq('is_active', active)
      }

      // Search by name or email
      if (search && search.trim()) {
        const searchTerm = `%${search.trim().toLowerCase()}%`
        query = query.or(
          `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`
        )
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data as Client[]
    },
    enabled: !!profile?.organization_id,
  })
}

/**
 * Hook to fetch a single client by ID with related properties
 */
export function useClient(id: string | undefined) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: clientKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Client ID is required')
      }

      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      // Fetch client with properties
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          properties (
            id,
            name,
            address_line1,
            city,
            state,
            is_active
          ),
          user:users (
            id,
            email,
            first_name,
            last_name
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
 * Hook to create a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (
      data: Omit<ClientInsert, 'id' | 'organization_id' | 'created_at' | 'updated_at'>
    ) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const { data: client, error } = await supabase
        .from('clients')
        .insert({
          ...data,
          organization_id: profile.organization_id,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return client as Client
    },
    onSuccess: () => {
      // Invalidate client list queries to refetch
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
    },
  })
}

/**
 * Hook to update an existing client
 *
 * Uses useOptimisticMutation for optimistic UI updates (SYNC-06.4 proof-of-concept)
 * - Immediately updates UI before server response
 * - Rolls back on error
 * - Always refetches to ensure consistency
 */
export function useUpdateClient() {
  const profile = useAuthStore((state) => state.profile)

  return useOptimisticMutation<
    Client,
    Error,
    { id: string; data: Partial<Client> },
    Client[]
  >({
    mutationFn: async ({ id, data }) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const { data: client, error } = await supabase
        .from('clients')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('organization_id', profile.organization_id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return client as Client
    },
    queryKey: clientKeys.list({}),
    updateCache: (oldData, { id, data }) => {
      if (!oldData) return []
      return oldData.map((client) =>
        client.id === id ? { ...client, ...data } : client
      )
    },
    successMessage: 'Client updated successfully',
    errorMessage: 'Failed to update client',
    invalidateKeys: [clientKeys.lists()],
  })
}

/**
 * Hook to soft delete a client (sets is_active = false)
 */
export function useDeleteClient() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (id: string) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const { data: client, error } = await supabase
        .from('clients')
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

      return client as Client
    },
    onSuccess: (client) => {
      // Invalidate specific client and list queries
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(client.id) })
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
    },
  })
}
