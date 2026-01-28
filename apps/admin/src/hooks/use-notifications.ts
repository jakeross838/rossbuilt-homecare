import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type {
  Notification,
  NotificationType,
  CreateNotificationPayload,
  NotificationSummary,
} from '@/lib/types/notification'
import { sortNotifications, countUnreadByType } from '@/lib/helpers/notifications'
import { STALE_FAST, notificationKeys } from '@/lib/queries'

/**
 * Fetch notifications for current user
 */
async function fetchNotifications(params: {
  unread?: boolean
  type?: NotificationType
  limit?: number
}): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(params.limit ?? 50)

  if (params.unread) {
    query = query.eq('is_read', false)
  }

  if (params.type) {
    query = query.eq('notification_type', params.type)
  }

  const { data, error } = await query

  if (error) throw error
  return sortNotifications(data ?? [])
}

/**
 * Hook: Get notifications list
 */
export function useNotifications(params: {
  unread?: boolean
  type?: NotificationType
  limit?: number
} = {}) {
  const { profile } = useAuthStore()

  return useQuery({
    queryKey: notificationKeys.list({ unread: params.unread, type: params.type }),
    queryFn: () => fetchNotifications(params),
    enabled: !!profile,
    staleTime: STALE_FAST,
    refetchInterval: 60 * 1000,
  })
}

/**
 * Hook: Get unread notification count
 */
export function useUnreadNotificationCount() {
  const { profile } = useAuthStore()

  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)

      if (error) throw error
      return count ?? 0
    },
    enabled: !!profile,
    staleTime: STALE_FAST,
    refetchInterval: 30 * 1000,
  })
}

/**
 * Hook: Get notification summary for dashboard
 */
export function useNotificationSummary() {
  const { profile } = useAuthStore()

  return useQuery({
    queryKey: notificationKeys.summary(),
    queryFn: async (): Promise<NotificationSummary> => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      const notifications = data ?? []
      const byType = countUnreadByType(notifications)

      return {
        total_unread: notifications.length,
        by_type: byType,
        recent: notifications.slice(0, 5),
      }
    },
    enabled: !!profile,
    staleTime: STALE_FAST,
  })
}

/**
 * Hook: Mark notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Hook: Mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('is_read', false)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Hook: Create notification
 */
export function useCreateNotification() {
  const queryClient = useQueryClient()
  const { profile } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: CreateNotificationPayload) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          organization_id: profile?.organization_id,
          user_id: payload.user_id,
          title: payload.title,
          message: payload.message,
          notification_type: payload.notification_type,
          priority: payload.priority ?? 'medium',
          entity_type: payload.entity_type,
          entity_id: payload.entity_id,
          action_url: payload.action_url,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Hook: Delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Hook: Delete all read notifications
 */
export function useClearReadNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('is_read', true)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Real-time notification subscription - returns subscribe function
 * Must be used with useEffect at component level
 */
export function useNotificationSubscription(
  onNewNotification: (notification: Notification) => void
) {
  const { profile } = useAuthStore()
  const queryClient = useQueryClient()

  // Memoize the subscribe function to prevent infinite re-renders
  const subscribe = useCallback(() => {
    if (!profile?.id) return () => {}

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          const notification = payload.new as Notification
          onNewNotification(notification)
          queryClient.invalidateQueries({ queryKey: notificationKeys.all })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, queryClient])

  return subscribe
}
