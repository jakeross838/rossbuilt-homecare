import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type { UpdateTables } from '@/lib/supabase'
import { profileKeys } from '@/lib/queries'

type UserUpdate = UpdateTables<'users'>

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { profile, setProfile } = useAuthStore()

  return useMutation({
    mutationFn: async (data: Partial<UserUpdate>) => {
      if (!profile?.id) throw new Error('No user found')

      const { data: user, error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) throw error
      return user
    },
    onSuccess: (data) => {
      // Update the auth store with new profile data
      setProfile(data)
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
    },
  })
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ newPassword }: { newPassword: string }) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      return true
    },
  })
}

/**
 * Hook to upload user avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const { profile, setProfile } = useAuthStore()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!profile?.id) throw new Error('No user found')

      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}/avatar.${fileExt}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update user with avatar URL
      const { data: user, error } = await supabase
        .from('users')
        .update({
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) throw error
      return user
    },
    onSuccess: (data) => {
      setProfile(data)
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
    },
  })
}

/**
 * Hook to update user preferences (stored in user settings JSONB)
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  const { profile, setProfile } = useAuthStore()

  return useMutation({
    mutationFn: async (preferences: Record<string, unknown>) => {
      if (!profile?.id) throw new Error('No user found')

      // Merge with existing settings
      const currentSettings = (profile.settings || {}) as Record<string, unknown>
      const mergedSettings = { ...currentSettings, ...preferences }

      const { data: user, error } = await supabase
        .from('users')
        .update({
          settings: mergedSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) throw error
      return user
    },
    onSuccess: (data) => {
      setProfile(data)
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
    },
  })
}
