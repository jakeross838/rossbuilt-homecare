import { PropertyCard } from '@/components/portal/property-card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePortalProperties } from '@/hooks/use-portal-dashboard'

export default function PortalPropertiesPage() {
  const { data: properties, isLoading } = usePortalProperties()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Your Properties</h1>
        <p className="text-gray-500">
          View and manage all your properties under our care
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : properties?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No properties found</p>
        </div>
      )}
    </div>
  )
}
