import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  ClipboardCheck,
  Wrench,
  Receipt,
  Truck,
  BarChart3,
  Settings,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useUIStore } from '@/stores/ui-store'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Calendar', href: '/calendar', icon: Calendar },
  { title: 'Clients', href: '/clients', icon: Users },
  { title: 'Properties', href: '/properties', icon: Building2 },
  { title: 'Inspections', href: '/inspections', icon: ClipboardCheck },
  { title: 'Work Orders', href: '/work-orders', icon: Wrench },
  { title: 'Billing', href: '/billing', icon: Receipt },
  { title: 'Vendors', href: '/vendors', icon: Truck },
  { title: 'Reports', href: '/reports', icon: BarChart3 },
]

const bottomNavItems: NavItem[] = [
  { title: 'Pricing', href: '/settings/pricing', icon: DollarSign },
  { title: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()
  const { sidebarOpen, sidebarCollapsed, toggleSidebarCollapsed, setSidebarOpen } = useUIStore()

  // Close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname, setSidebarOpen])

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [setSidebarOpen])

  const sidebarContent = (isMobile: boolean) => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rb-green-500 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-white"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          {(isMobile || !sidebarCollapsed) && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Ross Built</span>
              <span className="text-xs text-muted-foreground">Home Care OS</span>
            </div>
          )}
        </div>
        {/* Mobile close button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto" aria-label="Main navigation">
        <ul className="space-y-1" role="list">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                      : 'text-muted-foreground',
                    !isMobile && sidebarCollapsed && 'justify-center'
                  )
                }
                title={!isMobile && sidebarCollapsed ? item.title : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {(isMobile || !sidebarCollapsed) && <span>{item.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-4 border-t">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                      : 'text-muted-foreground',
                    !isMobile && sidebarCollapsed && 'justify-center'
                  )
                }
                title={!isMobile && sidebarCollapsed ? item.title : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {(isMobile || !sidebarCollapsed) && <span>{item.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Collapse toggle - desktop only */}
        {!isMobile && (
          <>
            <Separator className="my-4" />
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-center',
                !sidebarCollapsed && 'justify-start'
              )}
              onClick={toggleSidebarCollapsed}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Mobile (drawer) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-card border-r transform transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent(true)}
      </aside>

      {/* Sidebar - Desktop (static) */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen bg-card border-r transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent(false)}
      </aside>
    </>
  )
}

export default Sidebar
