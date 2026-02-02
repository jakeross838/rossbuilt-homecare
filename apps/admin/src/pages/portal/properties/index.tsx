import { Home } from 'lucide-react'
import { PropertyCard } from '@/components/portal/property-card'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { usePortalProperties } from '@/hooks/use-portal-dashboard'

export default function PortalPropertiesPage() {
  const { data: properties, isLoading, error, refetch } = usePortalProperties()

  // Loading state
  if (isLoading) {
    return <LoadingState message="Loading your properties..." />
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load properties"
        error={error}
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Your Properties</h1>
        <p className="text-gray-500">
          View and manage all your properties under our care
        </p>
      </div>

      {/* Empty state */}
      {!properties?.length ? (
        <EmptyState
          icon={Home}
          title="No properties found"
          description="No properties have been assigned to your account yet. Contact your property manager to get started."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
