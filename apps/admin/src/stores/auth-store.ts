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
          const { data: { session }, error } = await supabase.auth.getSession()

          if (error) {
            console.error('Error getting session:', error)
            set({
              user: null,
              session: null,
              profile: null,
              isLoading: false,
              isInitialized: true
            })
            return
          }

          if (session?.user) {
            set({ user: session.user, session })
            // Fetch user profile from users table
            await get().fetchProfile(session.user.id)
          }

          set({ isLoading: false, isInitialized: true })

          // Set up auth state listener
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              set({ user: session.user, session })
              await get().fetchProfile(session.user.id)
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, session: null, profile: null })
            } else if (event === 'TOKEN_REFRESHED' && session) {
              set({ session })
            }
          })
        } catch (error) {
          console.error('Error initializing auth:', error)
          set({ isLoading: false, isInitialized: true })
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
            return { error }
          }

          if (data.user) {
            set({ user: data.user, session: data.session })
            await get().fetchProfile(data.user.id)
          }

          set({ isLoading: false })
          return { error: null }
        } catch (error) {
          set({ isLoading: false })
          return { error: error as Error }
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
            return
          }

          set({ profile: data })
        } catch (error) {
          console.error('Error fetching profile:', error)
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
