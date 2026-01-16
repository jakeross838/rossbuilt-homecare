import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthProvider } from '@/components/providers/auth-provider'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { AppLayout } from '@/components/layout/app-layout'
import LoginPage from '@/pages/auth/login'
import DashboardPage from '@/pages/dashboard'
import ClientsPage from '@/pages/clients'
import NewClientPage from '@/pages/clients/new'
import ClientDetailPage from '@/pages/clients/[id]'
import EditClientPage from '@/pages/clients/[id]/edit'
import PropertiesPage from '@/pages/properties'
import NewPropertyPage from '@/pages/properties/new'
import PropertyDetailPage from '@/pages/properties/[id]'
import EditPropertyPage from '@/pages/properties/[id]/edit'
import PricingSettingsPage from '@/pages/settings/pricing'
import TemplatesPage from '@/pages/settings/templates'
import CalendarPage from '@/pages/calendar'
import InspectionsPage from '@/pages/inspections'
import InspectionReportPage from '@/pages/inspections/report'
import InspectorDashboard from '@/pages/inspector'
import InspectionPage from '@/pages/inspector/inspection'
import WorkOrdersPage from '@/pages/work-orders'
import WorkOrderDetailPage from '@/pages/work-orders/[id]'
import VendorsPage from '@/pages/vendors'
import VendorDetailPage from '@/pages/vendors/[id]'
import BillingDashboard from '@/pages/billing/index'
import InvoicesPage from '@/pages/billing/invoices/index'
import InvoiceDetailPage from '@/pages/billing/invoices/[id]'

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Placeholder pages for routes not yet implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <h2 className="text-2xl font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground">Coming soon in future phases</p>
    </div>
  )
}

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
            <Route path="/inspector" element={<InspectorDashboard />} />
            <Route path="/inspector/inspection/:id" element={<InspectionPage />} />

            {/* Protected routes with AppLayout */}
            <Route element={<AppLayout />}>
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard */}
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Clients */}
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/clients/new" element={<NewClientPage />} />
              <Route path="/clients/:id" element={<ClientDetailPage />} />
              <Route path="/clients/:id/edit" element={<EditClientPage />} />

              {/* Properties */}
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/new" element={<NewPropertyPage />} />
              <Route path="/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/properties/:id/edit" element={<EditPropertyPage />} />

              {/* Calendar */}
              <Route path="/calendar" element={<CalendarPage />} />

              {/* Inspections */}
              <Route path="/inspections" element={<InspectionsPage />} />
              <Route path="/inspections/:id/report" element={<InspectionReportPage />} />

              {/* Work Orders */}
              <Route path="/work-orders" element={<WorkOrdersPage />} />
              <Route path="/work-orders/:id" element={<WorkOrderDetailPage />} />

              {/* Billing */}
              <Route path="/billing" element={<BillingDashboard />} />
              <Route path="/billing/invoices" element={<InvoicesPage />} />
              <Route path="/billing/invoices/:id" element={<InvoiceDetailPage />} />

              {/* Vendors */}
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/vendors/:id" element={<VendorDetailPage />} />

              {/* Reports */}
              <Route path="/reports" element={<PlaceholderPage title="Reports" />} />

              {/* Settings */}
              <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
              <Route path="/settings/profile" element={<PlaceholderPage title="Profile Settings" />} />
              <Route path="/settings/pricing" element={<PricingSettingsPage />} />
              <Route path="/settings/templates" element={<TemplatesPage />} />
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
