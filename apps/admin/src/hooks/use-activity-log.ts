import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type {
  ActivityLogEntry,
  ActivityAction,
  ActivityEntityType,
} from '@/lib/types/notification'

/**
 * Query key factory for activity log
 */
export const activityKeys = {
  all: ['activity-log'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters: { entity_type?: string; user_id?: string }) =>
    [...activityKeys.lists(), filters] as const,
  entity: (entityType: string, entityId: string) =>
    [...activityKeys.all, 'entity', entityType, entityId] as const,
  recent: (limit?: number) => [...activityKeys.all, 'recent', limit] as const,
}

/**
 * Fetch activity log entries
 */
async function fetchActivityLog(params: {
  entity_type?: ActivityEntityType
  user_id?: string
  limit?: number
  offset?: number
}): Promise<ActivityLogEntry[]> {
  let query = supabase
    .from('activity_log')
    .select(`
      *,
      user:users(first_name, last_name)
    `)
    .order('created_at', { ascending: false })
    .range(params.offset ?? 0, (params.offset ?? 0) + (params.limit ?? 50) - 1)

  if (params.entity_type) {
    query = query.eq('entity_type', params.entity_type)
  }

  if (params.user_id) {
    query = query.eq('user_id', params.user_id)
  }

  const { data, error } = await query

  if (error) throw error

  return (data ?? []).map((entry) => {
    const user = entry.user as { first_name?: string; last_name?: string } | null
    return {
      id: entry.id,
      user_id: entry.user_id,
      user_name: user
        ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'Unknown'
        : 'System',
      action: entry.action as ActivityAction,
      entity_type: entry.entity_type as ActivityEntityType,
      entity_id: entry.entity_id,
      entity_name: entry.entity_name ?? undefined,
      changes: entry.changes as Record<string, { old: unknown; new: unknown }> | undefined,
      metadata: entry.metadata as Record<string, unknown> | undefined,
      created_at: entry.created_at ?? new Date().toISOString(),
    }
  })
}

/**
 * Hook: Get recent activity
 */
export function useRecentActivity(limit: number = 20) {
  const { profile } = useAuthStore()

  return useQuery({
    queryKey: activityKeys.recent(limit),
    queryFn: () => fetchActivityLog({ limit }),
    enabled: !!profile,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Hook: Get activity for specific entity
 */
export function useEntityActivity(entityType: ActivityEntityType, entityId: string) {
  const { profile } = useAuthStore()

  return useQuery({
    queryKey: activityKeys.entity(entityType, entityId),
    queryFn: async (): Promise<ActivityLogEntry[]> => {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          user:users(first_name, last_name)
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data ?? []).map((entry) => {
        const user = entry.user as { first_name?: string; last_name?: string } | null
        return {
          id: entry.id,
          user_id: entry.user_id,
          user_name: user
            ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'Unknown'
            : 'System',
          action: entry.action as ActivityAction,
          entity_type: entry.entity_type as ActivityEntityType,
          entity_id: entry.entity_id,
          entity_name: entry.entity_name ?? undefined,
          changes: entry.changes as Record<string, { old: unknown; new: unknown }> | undefined,
          metadata: entry.metadata as Record<string, unknown> | undefined,
          created_at: entry.created_at ?? new Date().toISOString(),
        }
      })
    },
    enabled: !!profile && !!entityId,
  })
}

/**
 * Hook: Get paginated activity log
 */
export function useActivityLogInfinite(params: {
  entity_type?: ActivityEntityType
  user_id?: string
  pageSize?: number
} = {}) {
  const { profile } = useAuthStore()
  const pageSize = params.pageSize ?? 20

  return useInfiniteQuery({
    queryKey: activityKeys.list({ entity_type: params.entity_type, user_id: params.user_id }),
    queryFn: ({ pageParam = 0 }) =>
      fetchActivityLog({
        entity_type: params.entity_type,
        user_id: params.user_id,
        limit: pageSize,
        offset: pageParam * pageSize,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length : undefined
    },
    enabled: !!profile,
  })
}

/**
 * Hook: Log activity
 */
export function useLogActivity() {
  const { profile } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      action: ActivityAction
      entity_type: ActivityEntityType
      entity_id: string
      entity_name?: string
      changes?: Record<string, { old: unknown; new: unknown }>
      metadata?: Record<string, unknown>
    }) => {
      if (!profile?.organization_id) throw new Error('Not authenticated')

      const { error } = await supabase.from('activity_log').insert({
        organization_id: profile.organization_id,
        user_id: profile.id,
        action: params.action,
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        entity_name: params.entity_name,
        changes: params.changes ?? {},
        metadata: params.metadata ?? {},
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}

/**
 * Helper: Log entity creation
 */
export function useLogEntityCreated() {
  const logActivity = useLogActivity()

  return {
    ...logActivity,
    log: async (entityType: ActivityEntityType, entityId: string, entityName?: string) => {
      return logActivity.mutateAsync({
        action: 'created',
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
      })
    },
  }
}

/**
 * Helper: Log entity update
 */
export function useLogEntityUpdated() {
  const logActivity = useLogActivity()

  return {
    ...logActivity,
    log: async (
      entityType: ActivityEntityType,
      entityId: string,
      entityName?: string,
      changes?: Record<string, { old: unknown; new: unknown }>
    ) => {
      return logActivity.mutateAsync({
        action: 'updated',
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        changes,
      })
    },
  }
}

/**
 * Helper: Log entity deletion
 */
export function useLogEntityDeleted() {
  const logActivity = useLogActivity()

  return {
    ...logActivity,
    log: async (entityType: ActivityEntityType, entityId: string, entityName?: string) => {
      return logActivity.mutateAsync({
        action: 'deleted',
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
      })
    },
  }
}
