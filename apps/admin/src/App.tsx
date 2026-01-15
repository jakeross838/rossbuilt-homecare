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
              <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />

              {/* Inspections */}
              <Route path="/inspections" element={<PlaceholderPage title="Inspections" />} />
              <Route path="/inspections/:id" element={<PlaceholderPage title="Inspection Details" />} />

              {/* Work Orders */}
              <Route path="/work-orders" element={<PlaceholderPage title="Work Orders" />} />
              <Route path="/work-orders/:id" element={<PlaceholderPage title="Work Order Details" />} />

              {/* Billing */}
              <Route path="/billing" element={<PlaceholderPage title="Billing" />} />

              {/* Vendors */}
              <Route path="/vendors" element={<PlaceholderPage title="Vendors" />} />
              <Route path="/vendors/:id" element={<PlaceholderPage title="Vendor Details" />} />

              {/* Reports */}
              <Route path="/reports" element={<PlaceholderPage title="Reports" />} />

              {/* Settings */}
              <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
              <Route path="/settings/profile" element={<PlaceholderPage title="Profile Settings" />} />
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
