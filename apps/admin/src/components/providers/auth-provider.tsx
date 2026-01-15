import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

import { useAuthStore } from '@/stores/auth-store'

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * AuthProvider initializes authentication on app load
 * Shows loading state until auth is initialized
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { isInitialized, initialize } = useAuthStore()

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [isInitialized, initialize])

  // Show loading state while initializing auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rb-green-500 flex items-center justify-center mb-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-white"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-rb-green-500" />
          <p className="text-muted-foreground text-sm">Loading Home Care OS...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default AuthProvider
