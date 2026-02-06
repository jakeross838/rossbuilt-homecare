import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Tables } from '@/lib/supabase'

/**
 * User profile from the users table
 */
type UserProfile = Tables<'users'>

interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  isInitialized: boolean
}

interface AuthActions {
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  setProfile: (profile: UserProfile | null) => void
  fetchProfile: (userId: string) => Promise<void>
}

type AuthStore = AuthState & AuthActions

/**
 * Auth store with Zustand + persist middleware
 * Manages user authentication state and profile
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      isInitialized: false,

      // Actions
      initialize: async () => {
        try {
          set({ isLoading: true })

          // Get current session
          let session = null
          try {
            const { data, error } = await supabase.auth.getSession()
            if (error) {
              console.error('Error getting session:', error)
            } else {
              session = data.session
            }
          } catch (sessionError) {
            // AbortError or network errors during getSession - clear stale state
            console.warn('Session fetch failed, clearing auth state:', sessionError)
            await supabase.auth.signOut().catch(() => {})
          }

          if (session?.user) {
            set({ user: session.user, session })
            // Fetch user profile from users table
            await get().fetchProfile(session.user.id)
          } else {
            // No valid session - clear any stale persisted state
            set({ user: null, session: null, profile: null })
          }

          set({ isLoading: false, isInitialized: true })

          // Set up auth state listener
          supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (event === 'SIGNED_IN' && newSession?.user) {
              set({ user: newSession.user, session: newSession })
              await get().fetchProfile(newSession.user.id)
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, session: null, profile: null })
            } else if (event === 'TOKEN_REFRESHED' && newSession) {
              set({ session: newSession })
            }
          })
        } catch (error) {
          console.error('Error initializing auth:', error)
          // Ensure we always finish initialization even on error
          set({ user: null, session: null, profile: null, isLoading: false, isInitialized: true })
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true })

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({ isLoading: false })
            return { error, profile: null }
          }

          let userProfile = null
          if (data.user) {
            set({ user: data.user, session: data.session })
            userProfile = await get().fetchProfile(data.user.id)
          }

          set({ isLoading: false })
          return { error: null, profile: userProfile }
        } catch (error) {
          set({ isLoading: false })
          return { error: error as Error, profile: null }
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true })
          await supabase.auth.signOut()
          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false
          })
        } catch (error) {
          console.error('Error signing out:', error)
          set({ isLoading: false })
        }
      },

      setProfile: (profile: UserProfile | null) => {
        set({ profile })
      },

      fetchProfile: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

          if (error) {
            console.error('Error fetching profile:', error)
            return null
          }

          set({ profile: data })
          return data
        } catch (error) {
          console.error('Error fetching profile:', error)
          return null
        }
      },
    }),
    {
      name: 'home-care-os-auth',
      partialize: (state) => ({
        // Only persist user and profile, not session (handled by Supabase)
        user: state.user,
        profile: state.profile,
      }),
    }
  )
)
