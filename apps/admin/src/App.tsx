import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

import { AuthProvider } from '@/components/providers/auth-provider'
import { ErrorBoundary, PageErrorBoundary } from '@/components/shared/error-boundary'
import { AppLayout } from '@/components/layout/app-layout'

// Eagerly loaded pages (critical path)
import LoginPage from '@/pages/auth/login'
import DashboardPage from '@/pages/dashboard'

// Lazy-loaded pages (code splitting)
const ClientsPage = lazy(() => import('@/pages/clients'))
const NewClientPage = lazy(() => import('@/pages/clients/new'))
const ClientDetailPage = lazy(() => import('@/pages/clients/[id]'))
const EditClientPage = lazy(() => import('@/pages/clients/[id]/edit'))
const PropertiesPage = lazy(() => import('@/pages/properties'))
const NewPropertyPage = lazy(() => import('@/pages/properties/new'))
const PropertyDetailPage = lazy(() => import('@/pages/properties/[id]'))
const EditPropertyPage = lazy(() => import('@/pages/properties/[id]/edit'))
const SettingsPage = lazy(() => import('@/pages/settings'))
const OrganizationSettingsPage = lazy(() => import('@/pages/settings/organization'))
const ProfileSettingsPage = lazy(() => import('@/pages/settings/profile'))
const PricingSettingsPage = lazy(() => import('@/pages/settings/pricing'))
const TemplatesPage = lazy(() => import('@/pages/settings/templates'))
const CalendarPage = lazy(() => import('@/pages/calendar'))
const InspectionsPage = lazy(() => import('@/pages/inspections'))
const InspectionReportPage = lazy(() => import('@/pages/inspections/report'))
const InspectorDashboard = lazy(() => import('@/pages/inspector'))
const InspectionPage = lazy(() => import('@/pages/inspector/inspection'))
const WorkOrdersPage = lazy(() => import('@/pages/work-orders'))
const NewWorkOrderPage = lazy(() => import('@/pages/work-orders/new'))
const WorkOrderDetailPage = lazy(() => import('@/pages/work-orders/[id]'))
const VendorsPage = lazy(() => import('@/pages/vendors'))
const NewVendorPage = lazy(() => import('@/pages/vendors/new'))
const VendorDetailPage = lazy(() => import('@/pages/vendors/[id]'))
const BillingDashboard = lazy(() => import('@/pages/billing/index'))
const InvoicesPage = lazy(() => import('@/pages/billing/invoices/index'))
const InvoiceDetailPage = lazy(() => import('@/pages/billing/invoices/[id]'))
const ReportsPage = lazy(() => import('@/pages/dashboard/reports'))
const NotificationsPage = lazy(() => import('@/pages/notifications'))
const NotificationSettingsPage = lazy(() => import('@/pages/settings/notifications'))
const ActivityPage = lazy(() => import('@/pages/activity'))

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
const PortalLoginPage = lazy(() => import('@/pages/portal/login'))
const PortalDashboardPage = lazy(() => import('@/pages/portal'))
const PortalPropertiesPage = lazy(() => import('@/pages/portal/properties'))
const PortalPropertyDetailPage = lazy(() => import('@/pages/portal/properties/[id]'))
const PortalRequestsPage = lazy(() => import('@/pages/portal/requests'))
const PortalRequestDetailPage = lazy(() => import('@/pages/portal/requests/[id]'))
const PortalInvoicesPage = lazy(() => import('@/pages/portal/invoices'))
const PortalInspectionsPage = lazy(() => import('@/pages/portal/inspections'))
const PortalInspectionDetailPage = lazy(() => import('@/pages/portal/inspections/[id]'))
const PortalCalendarPage = lazy(() => import('@/pages/portal/calendar'))
const PortalPlansPage = lazy(() => import('@/pages/portal/plans'))

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Inspector routes (standalone mobile PWA - no AppLayout) */}
            <Route path="/inspector" element={<PageErrorBoundary><Suspense fallback={<PageLoader />}><InspectorDashboard /></Suspense></PageErrorBoundary>} />
            <Route path="/inspector/inspection/:id" element={<PageErrorBoundary><Suspense fallback={<PageLoader />}><InspectionPage /></Suspense></PageErrorBoundary>} />

            {/* Client Portal Routes */}
            <Route path="/portal/login" element={<Suspense fallback={<PageLoader />}><PortalLoginPage /></Suspense>} />
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

            {/* Protected routes with AppLayout */}
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
              <Route path="/properties/new" element={<Suspense fallback={<PageLoader />}><NewPropertyPage /></Suspense>} />
              <Route path="/properties/:id" element={<Suspense fallback={<PageLoader />}><PropertyDetailPage /></Suspense>} />
              <Route path="/properties/:id/edit" element={<Suspense fallback={<PageLoader />}><EditPropertyPage /></Suspense>} />

              {/* Calendar */}
              <Route path="/calendar" element={<Suspense fallback={<PageLoader />}><CalendarPage /></Suspense>} />

              {/* Inspections */}
              <Route path="/inspections" element={<Suspense fallback={<PageLoader />}><InspectionsPage /></Suspense>} />
              <Route path="/inspections/:id/report" element={<Suspense fallback={<PageLoader />}><InspectionReportPage /></Suspense>} />

              {/* Work Orders */}
              <Route path="/work-orders" element={<Suspense fallback={<PageLoader />}><WorkOrdersPage /></Suspense>} />
              <Route path="/work-orders/new" element={<Suspense fallback={<PageLoader />}><NewWorkOrderPage /></Suspense>} />
              <Route path="/work-orders/:id" element={<Suspense fallback={<PageLoader />}><WorkOrderDetailPage /></Suspense>} />

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
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
