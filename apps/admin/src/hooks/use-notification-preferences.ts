import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type { NotificationPreferences } from '@/lib/types/notification'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/lib/constants/notifications'
import { STALE_STANDARD } from '@/lib/queries/config'

/**
 * Query key factory for preferences
 */
export const preferencesKeys = {
  all: ['notification-preferences'] as const,
  user: (userId: string) => [...preferencesKeys.all, userId] as const,
}

/**
 * Parse user settings JSONB to notification preferences
 */
function parsePreferences(settings: unknown): NotificationPreferences {
  const defaultPrefs = { ...DEFAULT_NOTIFICATION_PREFERENCES }

  if (!settings || typeof settings !== 'object') {
    return defaultPrefs
  }

  const s = settings as Record<string, unknown>
  const notifications = s.notifications as Record<string, boolean> | undefined

  if (notifications) {
    return {
      email: notifications.email ?? defaultPrefs.email,
      push: notifications.push ?? defaultPrefs.push,
      sms: notifications.sms ?? defaultPrefs.sms,
      inspection_reminders: notifications.inspection_reminders ?? defaultPrefs.inspection_reminders,
      work_order_updates: notifications.work_order_updates ?? defaultPrefs.work_order_updates,
      payment_alerts: notifications.payment_alerts ?? defaultPrefs.payment_alerts,
      daily_digest: notifications.daily_digest ?? defaultPrefs.daily_digest,
      weekly_summary: notifications.weekly_summary ?? defaultPrefs.weekly_summary,
    }
  }

  return defaultPrefs
}

/**
 * Hook: Get notification preferences
 */
export function useNotificationPreferences() {
  const { profile } = useAuthStore()

  return useQuery({
    queryKey: preferencesKeys.user(profile?.id ?? ''),
    queryFn: async (): Promise<NotificationPreferences> => {
      if (!profile?.id) {
        return DEFAULT_NOTIFICATION_PREFERENCES
      }

      const { data, error } = await supabase
        .from('users')
        .select('settings')
        .eq('id', profile.id)
        .single()

      if (error) throw error
      return parsePreferences(data?.settings)
    },
    enabled: !!profile?.id,
    staleTime: STALE_STANDARD,
  })
}

/**
 * Hook: Update notification preferences
 */
export function useUpdateNotificationPreferences() {
  const { profile } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      if (!profile?.id) throw new Error('Not authenticated')

      // First get current settings
      const { data: currentData } = await supabase
        .from('users')
        .select('settings')
        .eq('id', profile.id)
        .single()

      const currentSettings = (currentData?.settings as Record<string, unknown>) ?? {}
      const currentNotifications = (currentSettings.notifications as Record<string, unknown>) ?? {}

      // Merge new preferences
      const updatedSettings = {
        ...currentSettings,
        notifications: {
          ...currentNotifications,
          ...preferences,
        },
      }

      const { error } = await supabase
        .from('users')
        .update({ settings: updatedSettings })
        .eq('id', profile.id)

      if (error) throw error
      return preferences
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: preferencesKeys.all })
    },
  })
}

/**
 * Hook: Toggle single preference
 */
export function useTogglePreference() {
  const updatePrefs = useUpdateNotificationPreferences()

  return {
    ...updatePrefs,
    toggle: async (key: keyof NotificationPreferences, currentValue: boolean) => {
      return updatePrefs.mutateAsync({ [key]: !currentValue })
    },
  }
}

/**
 * Hook: Reset preferences to default
 */
export function useResetPreferences() {
  const updatePrefs = useUpdateNotificationPreferences()

  return {
    ...updatePrefs,
    reset: async () => {
      return updatePrefs.mutateAsync(DEFAULT_NOTIFICATION_PREFERENCES)
    },
  }
}
