import { useAuthStore } from '@/stores/auth-store'

/**
 * Hook to check if current user is a client
 * and get client-specific auth info
 */
export function usePortalAuth() {
  const { user, profile, isLoading, isInitialized } = useAuthStore()

  const isClient = profile?.role === 'client'
  const isAuthenticated = !!user && !!profile

  return {
    user,
    profile,
    isClient,
    isAuthenticated,
    isLoading,
    isInitialized,
  }
}
