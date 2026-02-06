import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { DEFAULT_QUERY_OPTIONS } from '@/lib/queries/config'

import { AuthProvider } from '@/components/providers/auth-provider'
import { PermissionProvider } from '@/components/providers/permission-provider'
import { ErrorBoundary, PageErrorBoundary } from '@/components/shared/error-boundary'
import { AppLayout } from '@/components/layout/app-layout'

// Retry wrapper for lazy imports - handles chunk load failures after deployments
function lazyRetry(importFn: () => Promise<{ default: React.ComponentType }>) {
  return lazy(() =>
    importFn().catch(() => {
      // Chunk failed to load (likely a new deployment with new chunk hashes)
      // Reload once to get fresh assets
      const hasReloaded = sessionStorage.getItem('chunk-reload')
      if (!hasReloaded) {
        sessionStorage.setItem('chunk-reload', '1')
        window.location.reload()
        return new Promise(() => {}) // never resolves, page is reloading
      }
      sessionStorage.removeItem('chunk-reload')
      // If reload didn't help, show error
      return importFn()
    })
  )
}

// Clear the reload flag on successful page load
sessionStorage.removeItem('chunk-reload')

// Eagerly loaded pages (critical path)
import LoginPage from '@/pages/auth/login'
import DashboardPage from '@/pages/dashboard'

// Lazy-loaded pages (code splitting) - wrapped with retry for deployment resilience
const ClientsPage = lazyRetry(() => import('@/pages/clients'))
const NewClientPage = lazyRetry(() => import('@/pages/clients/new'))
const ClientDetailPage = lazyRetry(() => import('@/pages/clients/[id]'))
const EditClientPage = lazyRetry(() => import('@/pages/clients/[id]/edit'))
const PropertiesPage = lazyRetry(() => import('@/pages/properties'))
const PropertiesOverviewPage = lazyRetry(() => import('@/pages/properties/overview'))
const NewPropertyPage = lazyRetry(() => import('@/pages/properties/new'))
const PropertyDetailPage = lazyRetry(() => import('@/pages/properties/[id]'))
const EditPropertyPage = lazyRetry(() => import('@/pages/properties/[id]/edit'))
const SettingsPage = lazyRetry(() => import('@/pages/settings'))
const OrganizationSettingsPage = lazyRetry(() => import('@/pages/settings/organization'))
const ProfileSettingsPage = lazyRetry(() => import('@/pages/settings/profile'))
const PricingSettingsPage = lazyRetry(() => import('@/pages/settings/pricing'))
const TemplatesPage = lazyRetry(() => import('@/pages/settings/templates'))
const UsersSettingsPage = lazyRetry(() => import('@/pages/settings/users'))
const NewUserPage = lazyRetry(() => import('@/pages/settings/users/new'))
const UserDetailPage = lazyRetry(() => import('@/pages/settings/users/[id]'))
const EditUserPage = lazyRetry(() => import('@/pages/settings/users/[id]/edit'))
const PermissionsPage = lazyRetry(() => import('@/pages/settings/permissions'))
const CalendarPage = lazyRetry(() => import('@/pages/calendar'))
const InspectionsPage = lazyRetry(() => import('@/pages/inspections'))
const InspectionReportPage = lazyRetry(() => import('@/pages/inspections/report'))
// Inspector pages - now integrated into admin view
const InspectionExecutionPage = lazyRetry(() => import('@/pages/inspector/inspection'))
const WorkOrdersPage = lazyRetry(() => import('@/pages/work-orders'))
const NewWorkOrderPage = lazyRetry(() => import('@/pages/work-orders/new'))
const WorkOrderDetailPage = lazyRetry(() => import('@/pages/work-orders/[id]'))
const ServiceRequestsPage = lazyRetry(() => import('@/pages/service-requests'))
const ServiceRequestDetailPage = lazyRetry(() => import('@/pages/service-requests/[id]'))
const VendorsPage = lazyRetry(() => import('@/pages/vendors'))
const NewVendorPage = lazyRetry(() => import('@/pages/vendors/new'))
const VendorDetailPage = lazyRetry(() => import('@/pages/vendors/[id]'))
const BillingDashboard = lazyRetry(() => import('@/pages/billing/index'))
const InvoicesPage = lazyRetry(() => import('@/pages/billing/invoices/index'))
const InvoiceDetailPage = lazyRetry(() => import('@/pages/billing/invoices/[id]'))
const ReportsPage = lazyRetry(() => import('@/pages/dashboard/reports'))
const NotificationsPage = lazyRetry(() => import('@/pages/notifications'))
const NotificationSettingsPage = lazyRetry(() => import('@/pages/settings/notifications'))
const ActivityPage = lazyRetry(() => import('@/pages/activity'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-rb-green" />
    </div>
  )
}

// Client Portal imports (lazy-loaded)
import { PortalLayout } from '@/components/portal/portal-layout'
import { PortalAuthGuard } from '@/components/portal/portal-auth-guard'
const PortalDashboardPage = lazyRetry(() => import('@/pages/portal'))
const PortalPropertiesPage = lazyRetry(() => import('@/pages/portal/properties'))
const PortalPropertyDetailPage = lazyRetry(() => import('@/pages/portal/properties/[id]'))
const PortalRequestsPage = lazyRetry(() => import('@/pages/portal/requests'))
const PortalRequestDetailPage = lazyRetry(() => import('@/pages/portal/requests/[id]'))
const PortalInvoicesPage = lazyRetry(() => import('@/pages/portal/invoices'))
const PortalInspectionsPage = lazyRetry(() => import('@/pages/portal/inspections'))
const PortalInspectionDetailPage = lazyRetry(() => import('@/pages/portal/inspections/[id]'))
const PortalCalendarPage = lazyRetry(() => import('@/pages/portal/calendar'))
const PortalPlansPage = lazyRetry(() => import('@/pages/portal/plans'))

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: DEFAULT_QUERY_OPTIONS,
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PermissionProvider>
            <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Client Portal Routes - uses unified /login page */}
              <Route
                path="/portal"
                element={
                  <PageErrorBoundary>
                    <PortalAuthGuard>
                      <PortalLayout />
                    </PortalAuthGuard>
                  </PageErrorBoundary>
                }
              >
                <Route index element={<Suspense fallback={<PageLoader />}><PortalDashboardPage /></Suspense>} />
                <Route path="properties" element={<Suspense fallback={<PageLoader />}><PortalPropertiesPage /></Suspense>} />
                <Route path="properties/:id" element={<Suspense fallback={<PageLoader />}><PortalPropertyDetailPage /></Suspense>} />
                <Route path="calendar" element={<Suspense fallback={<PageLoader />}><PortalCalendarPage /></Suspense>} />
                <Route path="plans" element={<Suspense fallback={<PageLoader />}><PortalPlansPage /></Suspense>} />
                <Route path="requests" element={<Suspense fallback={<PageLoader />}><PortalRequestsPage /></Suspense>} />
                <Route path="requests/:id" element={<Suspense fallback={<PageLoader />}><PortalRequestDetailPage /></Suspense>} />
                <Route path="invoices" element={<Suspense fallback={<PageLoader />}><PortalInvoicesPage /></Suspense>} />
                <Route path="inspections" element={<Suspense fallback={<PageLoader />}><PortalInspectionsPage /></Suspense>} />
                <Route path="inspections/:id" element={<Suspense fallback={<PageLoader />}><PortalInspectionDetailPage /></Suspense>} />
              </Route>

              {/* Protected routes with AppLayout - permission checking done in AppLayout */}
              <Route element={<AppLayout />}>
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard */}
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Clients */}
                <Route path="/clients" element={<Suspense fallback={<PageLoader />}><ClientsPage /></Suspense>} />
                <Route path="/clients/new" element={<Suspense fallback={<PageLoader />}><NewClientPage /></Suspense>} />
                <Route path="/clients/:id" element={<Suspense fallback={<PageLoader />}><ClientDetailPage /></Suspense>} />
                <Route path="/clients/:id/edit" element={<Suspense fallback={<PageLoader />}><EditClientPage /></Suspense>} />

                {/* Properties */}
                <Route path="/properties" element={<Suspense fallback={<PageLoader />}><PropertiesPage /></Suspense>} />
                <Route path="/properties/overview" element={<Suspense fallback={<PageLoader />}><PropertiesOverviewPage /></Suspense>} />
                <Route path="/properties/new" element={<Suspense fallback={<PageLoader />}><NewPropertyPage /></Suspense>} />
                <Route path="/properties/:id" element={<Suspense fallback={<PageLoader />}><PropertyDetailPage /></Suspense>} />
                <Route path="/properties/:id/edit" element={<Suspense fallback={<PageLoader />}><EditPropertyPage /></Suspense>} />

                {/* Calendar */}
                <Route path="/calendar" element={<Suspense fallback={<PageLoader />}><CalendarPage /></Suspense>} />

                {/* Inspections */}
                <Route path="/inspections" element={<Suspense fallback={<PageLoader />}><InspectionsPage /></Suspense>} />
                <Route path="/inspections/:id/execute" element={<Suspense fallback={<PageLoader />}><InspectionExecutionPage /></Suspense>} />
                <Route path="/inspections/:id/report" element={<Suspense fallback={<PageLoader />}><InspectionReportPage /></Suspense>} />

                {/* Work Orders */}
                <Route path="/work-orders" element={<Suspense fallback={<PageLoader />}><WorkOrdersPage /></Suspense>} />
                <Route path="/work-orders/new" element={<Suspense fallback={<PageLoader />}><NewWorkOrderPage /></Suspense>} />
                <Route path="/work-orders/:id" element={<Suspense fallback={<PageLoader />}><WorkOrderDetailPage /></Suspense>} />

                {/* Service Requests (client-submitted) */}
                <Route path="/service-requests" element={<Suspense fallback={<PageLoader />}><ServiceRequestsPage /></Suspense>} />
                <Route path="/service-requests/:id" element={<Suspense fallback={<PageLoader />}><ServiceRequestDetailPage /></Suspense>} />

                {/* Billing */}
                <Route path="/billing" element={<Suspense fallback={<PageLoader />}><BillingDashboard /></Suspense>} />
                <Route path="/billing/invoices" element={<Suspense fallback={<PageLoader />}><InvoicesPage /></Suspense>} />
                <Route path="/billing/invoices/:id" element={<Suspense fallback={<PageLoader />}><InvoiceDetailPage /></Suspense>} />

                {/* Vendors */}
                <Route path="/vendors" element={<Suspense fallback={<PageLoader />}><VendorsPage /></Suspense>} />
                <Route path="/vendors/new" element={<Suspense fallback={<PageLoader />}><NewVendorPage /></Suspense>} />
                <Route path="/vendors/:id" element={<Suspense fallback={<PageLoader />}><VendorDetailPage /></Suspense>} />

                {/* Reports */}
                <Route path="/reports" element={<Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>} />

                {/* Notifications */}
                <Route path="/notifications" element={<Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense>} />

                {/* Activity */}
                <Route path="/activity" element={<Suspense fallback={<PageLoader />}><ActivityPage /></Suspense>} />

                {/* Settings */}
                <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
                <Route path="/settings/organization" element={<Suspense fallback={<PageLoader />}><OrganizationSettingsPage /></Suspense>} />
                <Route path="/settings/profile" element={<Suspense fallback={<PageLoader />}><ProfileSettingsPage /></Suspense>} />
                <Route path="/settings/pricing" element={<Suspense fallback={<PageLoader />}><PricingSettingsPage /></Suspense>} />
                <Route path="/settings/templates" element={<Suspense fallback={<PageLoader />}><TemplatesPage /></Suspense>} />
                <Route path="/settings/notifications" element={<Suspense fallback={<PageLoader />}><NotificationSettingsPage /></Suspense>} />
                <Route path="/settings/users" element={<Suspense fallback={<PageLoader />}><UsersSettingsPage /></Suspense>} />
                <Route path="/settings/users/new" element={<Suspense fallback={<PageLoader />}><NewUserPage /></Suspense>} />
                <Route path="/settings/users/:id" element={<Suspense fallback={<PageLoader />}><UserDetailPage /></Suspense>} />
                <Route path="/settings/users/:id/edit" element={<Suspense fallback={<PageLoader />}><EditUserPage /></Suspense>} />
                <Route path="/settings/permissions" element={<Suspense fallback={<PageLoader />}><PermissionsPage /></Suspense>} />
              </Route>

              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </PermissionProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  )
}

export default App
