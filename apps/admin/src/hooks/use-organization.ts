import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type { Tables, UpdateTables } from '@/lib/supabase'

type Organization = Tables<'organizations'>
type OrganizationUpdate = UpdateTables<'organizations'>

export interface OrganizationSettings {
  business_hours: {
    start: string
    end: string
    lunch_start: string
    lunch_end: string
  }
  scheduling: {
    buffer_minutes: number
    max_daily_hours: number
    lead_days: number
  }
  notifications: {
    email_enabled: boolean
    sms_enabled: boolean
  }
}

export const organizationKeys = {
  all: ['organization'] as const,
  current: () => [...organizationKeys.all, 'current'] as const,
}

/**
 * Hook to fetch current organization
 */
export function useOrganization() {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: organizationKeys.current(),
    queryFn: async () => {
      if (!profile?.organization_id) throw new Error('No organization found')

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single()

      if (error) throw error
      return data as Organization
    },
    enabled: !!profile?.organization_id,
  })
}

/**
 * Hook to update organization details
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (data: Partial<OrganizationUpdate>) => {
      if (!profile?.organization_id) throw new Error('No organization found')

      const { data: org, error } = await supabase
        .from('organizations')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.organization_id)
        .select()
        .single()

      if (error) throw error
      return org as Organization
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all })
    },
  })
}

/**
 * Hook to update organization settings (JSONB field)
 */
export function useUpdateOrganizationSettings() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (settings: Partial<OrganizationSettings>) => {
      if (!profile?.organization_id) throw new Error('No organization found')

      // First get current settings
      const { data: org, error: fetchError } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', profile.organization_id)
        .single()

      if (fetchError) throw fetchError

      // Merge with new settings
      const currentSettings = (org.settings || {}) as OrganizationSettings
      const mergedSettings = {
        ...currentSettings,
        ...settings,
        business_hours: {
          ...currentSettings.business_hours,
          ...settings.business_hours,
        },
        scheduling: {
          ...currentSettings.scheduling,
          ...settings.scheduling,
        },
        notifications: {
          ...currentSettings.notifications,
          ...settings.notifications,
        },
      }

      const { data: updated, error } = await supabase
        .from('organizations')
        .update({
          settings: mergedSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.organization_id)
        .select()
        .single()

      if (error) throw error
      return updated as Organization
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all })
    },
  })
}

/**
 * Hook to upload organization logo
 */
export function useUploadOrganizationLogo() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (file: File) => {
      if (!profile?.organization_id) throw new Error('No organization found')

      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.organization_id}/logo.${fileExt}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('organization-assets')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('organization-assets')
        .getPublicUrl(fileName)

      // Update organization with logo URL
      const { data: org, error } = await supabase
        .from('organizations')
        .update({
          logo_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.organization_id)
        .select()
        .single()

      if (error) throw error
      return org as Organization
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all })
    },
  })
}
