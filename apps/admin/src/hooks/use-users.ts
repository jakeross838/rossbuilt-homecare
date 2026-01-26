import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Tables, type UpdateTables } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

type User = Tables<'users'>
type UserUpdate = UpdateTables<'users'>

// Query keys for cache management
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: { search?: string; role?: string; active?: boolean }) =>
    [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

interface UseUsersOptions {
  search?: string
  role?: string
  active?: boolean
}

/**
 * Hook to fetch list of users with optional search, role, and active filter
 */
export function useUsers(options: UseUsersOptions = {}) {
  const { search, role, active } = options
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: userKeys.list({ search, role, active }),
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      let query = supabase
        .from('users')
        .select(`
          *,
          client:clients!clients_user_id_fkey (
            id,
            first_name,
            last_name
          ),
          assignment_count:user_property_assignments!user_property_assignments_user_id_fkey(count)
        `)
        .eq('organization_id', profile.organization_id)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })

      // Filter by active status
      if (active !== undefined) {
        query = query.eq('is_active', active)
      }

      // Filter by role
      if (role) {
        query = query.eq('role', role)
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

      // Transform the count from array to number
      return (data || []).map((user) => ({
        ...user,
        assignment_count:
          Array.isArray(user.assignment_count) && user.assignment_count[0]
            ? user.assignment_count[0].count
            : 0,
      }))
    },
    enabled: !!profile?.organization_id,
  })
}

/**
 * Hook to fetch a single user by ID with related data
 */
export function useUser(id: string | undefined) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: userKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('User ID is required')
      }

      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      // Fetch user with linked client and property assignments
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          client:clients!clients_user_id_fkey (
            id,
            first_name,
            last_name,
            email
          ),
          property_assignments:user_property_assignments!user_property_assignments_user_id_fkey (
            id,
            property_id,
            assigned_at,
            notes,
            property:properties (
              id,
              name,
              address_line1,
              city,
              state
            )
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

interface CreateUserData {
  email: string
  password: string
  first_name: string
  last_name: string
  role: 'admin' | 'manager' | 'inspector' | 'client'
  phone?: string
  client_id?: string
}

/**
 * Hook to create a new user via edge function
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('Not authenticated')
      }

      const response = await supabase.functions.invoke('create-user', {
        body: data,
      })

      if (response.error) {
        throw new Error(response.error.message)
      }

      if (response.data?.error) {
        throw new Error(response.data.error)
      }

      return response.data as { success: boolean; user_id: string; email: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Hook to update an existing user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Omit<UserUpdate, 'id' | 'organization_id' | 'created_at' | 'updated_at'>
    }) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const { data: user, error } = await supabase
        .from('users')
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

      return user as User
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(user.id) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Hook to deactivate a user (sets is_active = false)
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (id: string) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const { data: user, error } = await supabase
        .from('users')
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

      return user as User
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(user.id) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Hook to link a user to a client record
 */
export function useLinkUserToClient() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async ({ userId, clientId }: { userId: string; clientId: string }) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const { data, error } = await supabase
        .from('clients')
        .update({
          user_id: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)
        .eq('organization_id', profile.organization_id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

/**
 * Hook to unlink a user from a client record
 */
export function useUnlinkUserFromClient() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async ({ userId, clientId }: { userId: string; clientId: string }) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      const { data, error } = await supabase
        .from('clients')
        .update({
          user_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)
        .eq('organization_id', profile.organization_id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
