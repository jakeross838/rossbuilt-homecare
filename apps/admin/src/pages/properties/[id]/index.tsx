import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  MapPin,
  Home,
  Key,
  Wifi,
  Shield,
  FileText,
  ClipboardCheck,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/page-header'
import { useProperty } from '@/hooks/use-properties'
import {
  propertyFeatureLabels,
  propertyFeatureCategories,
  constructionTypes,
  roofTypes,
  foundationTypes,
  type PropertyFeatures,
} from '@/lib/validations/property'
import { EquipmentList } from '../components/equipment-list'
import { ProgramBuilder, ProgramStatusCard } from '@/components/programs'
import { usePropertyProgram } from '@/hooks/use-programs'
import { useGenerateChecklist } from '@/hooks/use-checklist'
import { ChecklistPreview } from '@/components/inspections'

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: property, isLoading, error } = useProperty(id)
  const { data: program, isLoading: programLoading } = usePropertyProgram(id || '')

  // Generate checklist when program is active
  const isProgramActive = program && ['active', 'pending', 'paused'].includes(program.status || '')
  const {
    data: checklist,
    isLoading: checklistLoading,
  } = useGenerateChecklist(
    isProgramActive ? id : undefined,
    isProgramActive ? program?.id : undefined
  )

  // State for showing/hiding sensitive codes
  const [showCodes, setShowCodes] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-destructive mb-4">Property not found</p>
        <Button variant="outline" onClick={() => navigate('/properties')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>
      </div>
    )
  }

  // Get enabled features
  const features = (property.features || {}) as PropertyFeatures
  const enabledFeatures = Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key as keyof PropertyFeatures)

  // Helper to get display label for select values
  const getLabel = (
    value: string | null | undefined,
    options: { value: string; label: string }[]
  ) => {
    if (!value) return null
    return options.find((opt) => opt.value === value)?.label || value
  }

  // Format address
  const fullAddress = [
    property.address_line1,
    property.address_line2,
    `${property.city}, ${property.state} ${property.zip}`,
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <div className="space-y-8">
      <PageHeader
        title={property.name}
        description={
          <div className="flex items-center gap-2">
            <Badge variant={property.is_active ? 'success' : 'secondary'}>
              {property.is_active ? 'Active' : 'Archived'}
            </Badge>
            {property.client && (
              <Link
                to={`/clients/${property.client.id}`}
                className="text-primary hover:underline"
              >
                {property.client.first_name} {property.client.last_name}
              </Link>
            )}
          </div>
        }
      >
        <Button variant="outline" onClick={() => navigate('/properties')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button asChild>
          <Link to={`/properties/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Address & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="whitespace-pre-line">{fullAddress}</div>
            {property.county && (
              <div className="text-sm text-muted-foreground">
                County: {property.county}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {property.is_gated_community && (
                <Badge variant="outline">Gated Community</Badge>
              )}
              {property.is_coastal && (
                <Badge variant="outline">Coastal Property</Badge>
              )}
              {property.flood_zone && (
                <Badge variant="outline">Flood Zone: {property.flood_zone}</Badge>
              )}
            </div>
            {property.hoa_name && (
              <div className="text-sm">
                <span className="text-muted-foreground">HOA:</span>{' '}
                {property.hoa_name}
              </div>
            )}
            {/* Map placeholder */}
            <div className="h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              Map view (coming soon)
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {property.year_built && (
                <div>
                  <p className="text-sm text-muted-foreground">Year Built</p>
                  <p className="font-medium">{property.year_built}</p>
                </div>
              )}
              {property.square_footage && (
                <div>
                  <p className="text-sm text-muted-foreground">Square Footage</p>
                  <p className="font-medium">
                    {property.square_footage.toLocaleString()} sq ft
                  </p>
                </div>
              )}
              {property.lot_size_sqft && (
                <div>
                  <p className="text-sm text-muted-foreground">Lot Size</p>
                  <p className="font-medium">
                    {property.lot_size_sqft.toLocaleString()} sq ft
                  </p>
                </div>
              )}
              {property.bedrooms && (
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-medium">{property.bedrooms}</p>
                </div>
              )}
              {property.bathrooms && (
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-medium">{property.bathrooms}</p>
                </div>
              )}
              {property.stories && (
                <div>
                  <p className="text-sm text-muted-foreground">Stories</p>
                  <p className="font-medium">{property.stories}</p>
                </div>
              )}
              {property.construction_type && (
                <div>
                  <p className="text-sm text-muted-foreground">Construction</p>
                  <p className="font-medium">
                    {getLabel(property.construction_type, constructionTypes)}
                  </p>
                </div>
              )}
              {property.roof_type && (
                <div>
                  <p className="text-sm text-muted-foreground">Roof</p>
                  <p className="font-medium">
                    {getLabel(property.roof_type, roofTypes)}
                  </p>
                </div>
              )}
              {property.foundation_type && (
                <div>
                  <p className="text-sm text-muted-foreground">Foundation</p>
                  <p className="font-medium">
                    {getLabel(property.foundation_type, foundationTypes)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Access Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Access Information
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCodes(!showCodes)}
              >
                {showCodes ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide Codes
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Show Codes
                  </>
                )}
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {property.gate_code && (
                <div>
                  <p className="text-sm text-muted-foreground">Gate Code</p>
                  <p className="font-medium font-mono">
                    {showCodes ? property.gate_code : '****'}
                  </p>
                </div>
              )}
              {property.garage_code && (
                <div>
                  <p className="text-sm text-muted-foreground">Garage Code</p>
                  <p className="font-medium font-mono">
                    {showCodes ? property.garage_code : '****'}
                  </p>
                </div>
              )}
              {property.alarm_code && (
                <div>
                  <p className="text-sm text-muted-foreground">Alarm Code</p>
                  <p className="font-medium font-mono">
                    {showCodes ? property.alarm_code : '****'}
                  </p>
                </div>
              )}
              {property.lockbox_code && (
                <div>
                  <p className="text-sm text-muted-foreground">Lockbox Code</p>
                  <p className="font-medium font-mono">
                    {showCodes ? property.lockbox_code : '****'}
                  </p>
                </div>
              )}
            </div>
            {property.lockbox_location && (
              <div>
                <p className="text-sm text-muted-foreground">Lockbox Location</p>
                <p className="font-medium">{property.lockbox_location}</p>
              </div>
            )}
            {(property.alarm_company || property.alarm_company_phone) && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Alarm Company
                </p>
                <p className="font-medium">
                  {property.alarm_company}
                  {property.alarm_company_phone && (
                    <span className="ml-2 text-muted-foreground">
                      ({property.alarm_company_phone})
                    </span>
                  )}
                </p>
              </div>
            )}
            {(property.wifi_network || property.wifi_password) && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  WiFi
                </p>
                {property.wifi_network && (
                  <p className="font-medium">
                    Network: {property.wifi_network}
                  </p>
                )}
                {property.wifi_password && (
                  <p className="font-medium font-mono">
                    Password: {showCodes ? property.wifi_password : '****'}
                  </p>
                )}
              </div>
            )}
            {property.access_instructions && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Access Instructions
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {property.access_instructions}
                </p>
              </div>
            )}
            {!property.gate_code &&
              !property.garage_code &&
              !property.alarm_code &&
              !property.lockbox_code &&
              !property.wifi_network &&
              !property.access_instructions && (
                <p className="text-muted-foreground">
                  No access information on file
                </p>
              )}
          </CardContent>
        </Card>

        {/* Property Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              Property Features
            </CardTitle>
            <CardDescription>
              {enabledFeatures.length} features enabled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enabledFeatures.length > 0 ? (
              <div className="space-y-4">
                {Object.entries(propertyFeatureCategories).map(
                  ([category, categoryFeatures]) => {
                    const enabledInCategory = categoryFeatures.filter(
                      (f) => features[f]
                    )
                    if (enabledInCategory.length === 0) return null
                    return (
                      <div key={category}>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {category}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {enabledInCategory.map((feature) => (
                            <Badge key={feature} variant="outline">
                              {propertyFeatureLabels[feature]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No features selected</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Inspections (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Recent Inspections
            </CardTitle>
            <CardDescription>
              Inspection history for this property
            </CardDescription>
          </CardHeader>
          <CardContent>
            {property.inspections && property.inspections.length > 0 ? (
              <div className="space-y-2">
                {property.inspections.slice(0, 5).map((inspection) => (
                    <div
                      key={inspection.id}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {inspection.scheduled_date || 'No date'}
                        </p>
                      </div>
                      <Badge>{inspection.status}</Badge>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No inspections yet</p>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              Inspections module coming in Phase 6
            </p>
          </CardContent>
        </Card>

        {/* Notes */}
        {(property.notes || property.internal_notes) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Client-Visible Notes
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{property.notes}</p>
                </div>
              )}
              {property.internal_notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Internal Notes (Staff Only)
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {property.internal_notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Equipment Section - Full Width */}
      {id && (
        <section>
          <EquipmentList propertyId={id} />
        </section>
      )}

      {/* Home Care Program Section - Full Width */}
      {id && property && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Home Care Program</h2>
          {programLoading ? (
            <Skeleton className="h-48" />
          ) : program && ['active', 'pending', 'paused'].includes(program.status || '') ? (
            <ProgramStatusCard propertyId={id} />
          ) : (
            <ProgramBuilder
              propertyId={id}
              clientId={property.client_id}
              propertyName={property.name || property.address_line1 || 'Property'}
            />
          )}
        </section>
      )}

      {/* Inspection Checklist Section - Full Width */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Inspection Checklist</h2>
        {!isProgramActive ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Activate a program to view inspection checklist
            </CardContent>
          </Card>
        ) : checklistLoading ? (
          <Skeleton className="h-64" />
        ) : checklist ? (
          <ChecklistPreview checklist={checklist} />
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Unable to generate checklist
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}

export default PropertyDetailPage
