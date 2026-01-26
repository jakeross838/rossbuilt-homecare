import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Home,
  ClipboardCheck,
  MessageSquare,
  Receipt,
  LogOut,
  Menu,
  X,
  User,
  Calendar,
  FileText,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { usePortalAuth } from '@/hooks/use-portal-auth'
import { usePortalRealtimeSync } from '@/hooks/use-realtime-sync'

const navItems = [
  { label: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { label: 'Properties', href: '/portal/properties', icon: Home },
  { label: 'Calendar', href: '/portal/calendar', icon: Calendar },
  { label: 'Plans', href: '/portal/plans', icon: FileText },
  { label: 'Inspections', href: '/portal/inspections', icon: ClipboardCheck },
  { label: 'Requests', href: '/portal/requests', icon: MessageSquare },
  { label: 'Invoices', href: '/portal/invoices', icon: Receipt },
]

export function PortalLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = usePortalAuth()
  const signOut = useAuthStore((state) => state.signOut)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Enable real-time sync for portal data (STAB-29 through STAB-34)
  // Admin changes automatically appear in Client portal without refresh
  usePortalRealtimeSync()

  const handleSignOut = async () => {
    await signOut()
    navigate('/portal/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/portal" className="flex items-center gap-2">
              <span className="text-xl font-semibold text-gray-900">
                Ross Built
              </span>
              <span className="text-sm text-gray-500">Client Portal</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href ||
                  (item.href !== '/portal' && location.pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>
                  {profile?.first_name} {profile?.last_name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hidden sm:flex"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href ||
                  (item.href !== '/portal' && location.pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md text-sm font-medium text-gray-600"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Ross Built. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
