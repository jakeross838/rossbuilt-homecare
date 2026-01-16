import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  VendorComplianceBadge,
  VendorRating,
  VendorTradeBadges,
  VendorForm,
  VendorComplianceForm,
} from '@/components/vendors'
import {
  useVendor,
  useUpdateVendor,
  useUpdateVendorCompliance,
  useToggleVendorPreferred,
  useDeactivateVendor,
} from '@/hooks/use-vendors'
import { useVendorWorkOrders } from '@/hooks/use-work-orders'
import { checkVendorCompliance } from '@/lib/constants/vendor'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Star,
  StarOff,
  Edit,
  Trash2,
  FileCheck,
  Loader2,
} from 'lucide-react'
import type {
  UpdateVendorFormData,
  VendorComplianceFormData,
} from '@/lib/validations/vendor'

// Type for work orders returned by useVendorWorkOrders
interface VendorWorkOrder {
  id: string
  work_order_number: string
  title: string
  status: string
  priority: string | null
  scheduled_date: string | null
  property: {
    name: string
    address_line1: string | null
    city: string | null
  } | null
}

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showComplianceSheet, setShowComplianceSheet] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)

  const { data: vendor, isLoading } = useVendor(id)
  const { data: workOrders = [] } = useVendorWorkOrders(id)
  const updateVendor = useUpdateVendor()
  const updateCompliance = useUpdateVendorCompliance()
  const togglePreferred = useToggleVendorPreferred()
  const deactivateVendor = useDeactivateVendor()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="container py-6">
        <p className="text-muted-foreground">Vendor not found</p>
      </div>
    )
  }

  const compliance = checkVendorCompliance({
    license_expiration: vendor.license_expiration,
    insurance_expiration: vendor.insurance_expiration,
    w9_on_file: vendor.w9_on_file,
  })

  const handleUpdate = async (data: UpdateVendorFormData) => {
    try {
      await updateVendor.mutateAsync({ id: vendor.id, data })
      setShowEditSheet(false)
      toast({
        title: 'Vendor updated',
        description: 'Vendor information has been saved',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update vendor',
      })
    }
  }

  const handleComplianceUpdate = async (data: VendorComplianceFormData) => {
    try {
      await updateCompliance.mutateAsync({ id: vendor.id, data })
      setShowComplianceSheet(false)
      toast({
        title: 'Compliance updated',
        description: 'Compliance information has been saved',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update compliance',
      })
    }
  }

  const handleTogglePreferred = async () => {
    try {
      await togglePreferred.mutateAsync({
        id: vendor.id,
        isPreferred: !vendor.is_preferred,
      })
      toast({
        title: vendor.is_preferred ? 'Removed from preferred' : 'Marked as preferred',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update vendor',
      })
    }
  }

  const handleDeactivate = async () => {
    try {
      await deactivateVendor.mutateAsync(vendor.id)
      setShowDeactivateDialog(false)
      toast({
        title: 'Vendor deactivated',
        description: 'Vendor has been deactivated',
      })
      navigate('/vendors')
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to deactivate vendor',
      })
    }
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/vendors')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{vendor.company_name}</h1>
            {vendor.is_preferred && (
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          <VendorTradeBadges trades={vendor.trade_categories || []} maxShow={5} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleTogglePreferred}
            disabled={togglePreferred.isPending}
          >
            {vendor.is_preferred ? (
              <StarOff className="h-4 w-4" />
            ) : (
              <Star className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" onClick={() => setShowEditSheet(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeactivateDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deactivate
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders ({workOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vendor.contact_name && (
                  <p className="font-medium">{vendor.contact_name}</p>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {vendor.phone}
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {vendor.email}
                  </div>
                )}
                {vendor.address_line1 && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{vendor.address_line1}</p>
                      {vendor.address_line2 && <p>{vendor.address_line2}</p>}
                      <p>
                        {vendor.city}, {vendor.state} {vendor.zip}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <VendorRating
                    rating={vendor.average_rating}
                    showLabel
                    size="lg"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jobs Completed</p>
                  <p className="text-2xl font-bold">
                    {vendor.completed_jobs || 0}
                    <span className="text-sm font-normal text-muted-foreground">
                      {' '}
                      / {vendor.total_jobs || 0}
                    </span>
                  </p>
                  {vendor.completion_rate !== null && (
                    <p className="text-sm text-muted-foreground">
                      {(vendor.completion_rate * 100).toFixed(0)}% completion rate
                    </p>
                  )}
                </div>
                {vendor.average_response_hours && (
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-lg font-semibold">
                      {vendor.average_response_hours.toFixed(1)} hours
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compliance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Compliance</span>
                  <VendorComplianceBadge compliance={compliance} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {compliance.issues.length > 0 ? (
                  <ul className="space-y-1">
                    {compliance.issues.map((issue, i) => (
                      <li
                        key={i}
                        className="text-sm text-destructive flex items-center gap-2"
                      >
                        * {issue}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-600">
                    All compliance requirements met
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowComplianceSheet(true)}
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  Update Compliance
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {vendor.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{vendor.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Compliance Details</CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowComplianceSheet(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Update
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* License */}
                <div className="space-y-2">
                  <h4 className="font-medium">License</h4>
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number:</span>
                      <span>{vendor.license_number || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span
                        className={
                          !compliance.license_valid
                            ? 'text-destructive'
                            : compliance.license_expires_soon
                              ? 'text-yellow-600'
                              : ''
                        }
                      >
                        {vendor.license_expiration || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Insurance */}
                <div className="space-y-2">
                  <h4 className="font-medium">Insurance</h4>
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company:</span>
                      <span>{vendor.insurance_company || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Policy #:</span>
                      <span>{vendor.insurance_policy_number || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span
                        className={
                          !compliance.insurance_valid
                            ? 'text-destructive'
                            : compliance.insurance_expires_soon
                              ? 'text-yellow-600'
                              : ''
                        }
                      >
                        {vendor.insurance_expiration || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* W-9 */}
                <div className="space-y-2">
                  <h4 className="font-medium">W-9 Form</h4>
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">On File:</span>
                      <span
                        className={
                          compliance.w9_on_file ? 'text-green-600' : 'text-destructive'
                        }
                      >
                        {compliance.w9_on_file ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {vendor.w9_received_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Received:</span>
                        <span>{vendor.w9_received_date}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work-orders" className="pt-4">
          {workOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No work orders for this vendor
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {workOrders.map((wo: VendorWorkOrder) => (
                <Card
                  key={wo.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => navigate(`/work-orders/${wo.id}`)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{wo.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {wo.work_order_number} - {wo.property?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{wo.status}</p>
                        {wo.scheduled_date && (
                          <p className="text-sm text-muted-foreground">
                            {wo.scheduled_date}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Sheet */}
      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Vendor</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <VendorForm
              defaultValues={{
                company_name: vendor.company_name,
                contact_first_name: vendor.contact_first_name,
                contact_last_name: vendor.contact_last_name,
                email: vendor.email,
                phone: vendor.phone,
                address_line1: vendor.address_line1,
                address_line2: vendor.address_line2,
                city: vendor.city,
                state: vendor.state as UpdateVendorFormData['state'],
                zip: vendor.zip,
                trade_categories: vendor.trade_categories || [],
                is_preferred: vendor.is_preferred || false,
                notes: vendor.notes,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setShowEditSheet(false)}
              isLoading={updateVendor.isPending}
              isEdit
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Compliance Sheet */}
      <Sheet open={showComplianceSheet} onOpenChange={setShowComplianceSheet}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update Compliance</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <VendorComplianceForm
              defaultValues={{
                license_number: vendor.license_number,
                license_expiration: vendor.license_expiration,
                insurance_company: vendor.insurance_company,
                insurance_policy_number: vendor.insurance_policy_number,
                insurance_expiration: vendor.insurance_expiration,
                w9_on_file: vendor.w9_on_file || false,
                w9_received_date: vendor.w9_received_date,
              }}
              onSubmit={handleComplianceUpdate}
              onCancel={() => setShowComplianceSheet(false)}
              isLoading={updateCompliance.isPending}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Deactivate Dialog */}
      <AlertDialog
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              This vendor will be marked as inactive and won't appear in vendor
              selection. Existing work orders will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
