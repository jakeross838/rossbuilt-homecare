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
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}

export default AppLayout
