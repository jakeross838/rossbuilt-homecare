import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, Clock, User, MapPin, FileText, Download, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePortalInspection } from '@/hooks/use-portal-inspections'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }> = {
  scheduled: { label: 'Scheduled', variant: 'secondary' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
}

const conditionColors: Record<string, string> = {
  excellent: 'text-green-600 bg-green-50 border-green-200',
  good: 'text-blue-600 bg-blue-50 border-blue-200',
  fair: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  poor: 'text-orange-600 bg-orange-50 border-orange-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
}

export default function PortalInspectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: inspection, isLoading, error } = usePortalInspection(id)

  if (isLoading) {
    return <div className="p-4 text-center">Loading inspection...</div>
  }

  if (error || !inspection) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive mb-4">Inspection not found</p>
        <Link to="/portal/inspections" className="text-blue-600">
          Back to Inspections
        </Link>
      </div>
    )
  }

  const status = statusConfig[inspection.status] || statusConfig.scheduled
  const condition = inspection.overall_condition
  const property = inspection.property as { id: string; name: string; address_line1: string; city: string; state: string } | null
  const inspector = inspection.inspector as { first_name: string; last_name: string } | null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/portal/inspections">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold capitalize">
              {inspection.inspection_type.replace('_', ' ')} Inspection
            </h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          {property && (
            <p className="text-muted-foreground">{property.name}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(inspection.scheduled_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {inspection.actual_start_at && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">
                        {format(new Date(inspection.actual_start_at), 'h:mm a')}
                        {inspection.actual_end_at && (
                          <> - {format(new Date(inspection.actual_end_at), 'h:mm a')}</>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {inspector && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Inspector</p>
                      <p className="font-medium">
                        {inspector.first_name} {inspector.last_name}
                      </p>
                    </div>
                  </div>
                )}

                {property && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Property</p>
                      <p className="font-medium">{property.address_line1}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.city}, {property.state}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Condition & Summary */}
          {(condition || inspection.summary) && (
            <Card>
              <CardHeader>
                <CardTitle>Condition Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {condition && (
                  <div className={`inline-block px-4 py-2 rounded-lg border capitalize ${conditionColors[condition] || ''}`}>
                    <span className="font-medium">Overall Condition: </span>
                    {condition}
                  </div>
                )}

                {inspection.summary && (
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {inspection.summary}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Weather Conditions */}
          {inspection.weather_conditions && (
            <Card>
              <CardHeader>
                <CardTitle>Weather Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {typeof inspection.weather_conditions === 'string'
                    ? inspection.weather_conditions
                    : JSON.stringify(inspection.weather_conditions)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          {inspection.photos && inspection.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos ({inspection.photos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {inspection.photos.map((photo: { id: string; url: string; caption?: string }) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Inspection photo'}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {photo.caption && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Report Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inspection.report_url ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-600">Report available</p>
                  <div className="flex flex-col gap-2">
                    <a
                      href={inspection.report_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <Button className="w-full gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Report
                      </Button>
                    </a>
                    <a
                      href={inspection.report_url}
                      download
                    >
                      <Button variant="outline" className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {inspection.status === 'completed'
                      ? 'Report being generated...'
                      : 'Report will be available after inspection'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {property && (
                <Link to={`/portal/properties/${property.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Property
                  </Button>
                </Link>
              )}
              <Link to="/portal/inspections">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  All Inspections
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
