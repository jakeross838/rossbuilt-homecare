import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { Sidebar } from './sidebar'
import { Header } from './header'
import { Toaster } from '@/components/ui/toaster'
import { useAuthStore } from '@/stores/auth-store'

export function AppLayout() {
  const location = useLocation()
  const { user, isLoading } = useAuthStore()

  // Show loading state during auth operations (sign in/out)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 lg:p-6"
          role="main"
          aria-label="Main content"
        >
          <Outlet />
        </main>
      </div>

      {/* Toast notifications - live region for screen readers */}
      <Toaster />
    </div>
  )
}

export default AppLayout
