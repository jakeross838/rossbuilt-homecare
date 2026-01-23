import { useState } from 'react'
import { Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PortalCalendar } from '@/components/portal/portal-calendar'
import { usePortalInspections } from '@/hooks/use-portal-inspections'
import { usePortalProperties } from '@/hooks/use-portal-dashboard'

export default function PortalCalendarPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all')
  const { data: properties, isLoading: propertiesLoading } = usePortalProperties()
  const { data: inspections, isLoading: inspectionsLoading } = usePortalInspections({
    propertyId: selectedPropertyId === 'all' ? undefined : selectedPropertyId,
    limit: 100, // Get more inspections for calendar view
  })

  const isLoading = propertiesLoading || inspectionsLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-1">
            View your inspection schedule
          </p>
        </div>

        {/* Property Filter */}
        {properties && properties.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select
              value={selectedPropertyId}
              onValueChange={setSelectedPropertyId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <PortalCalendar
        inspections={inspections || []}
        isLoading={isLoading}
      />

      {/* Summary Stats */}
      {inspections && inspections.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {inspections.filter((i) => i.status === 'scheduled').length}
            </p>
            <p className="text-sm text-blue-700">Scheduled</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {inspections.filter((i) => i.status === 'in_progress').length}
            </p>
            <p className="text-sm text-yellow-700">In Progress</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {inspections.filter((i) => i.status === 'completed').length}
            </p>
            <p className="text-sm text-green-700">Completed</p>
          </div>
        </div>
      )}
    </div>
  )
}
