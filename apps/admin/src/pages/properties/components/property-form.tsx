import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  propertyFormSchema,
  type PropertyFormData,
  defaultPropertyFeatures,
  propertyFeatureLabels,
  propertyFeatureCategories,
  constructionTypes,
  roofTypes,
  foundationTypes,
  usStates,
  type PropertyFeatures,
} from '@/lib/validations/property'
import { useClients } from '@/hooks/use-clients'

interface PropertyFormProps {
  defaultValues?: Partial<PropertyFormData>
  onSubmit: (data: PropertyFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  submitLabel?: string
  preselectedClientId?: string
}

/**
 * Reusable property form component
 * Used for both creating and editing properties
 */
export function PropertyForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save Property',
  preselectedClientId,
}: PropertyFormProps) {
  const { data: clients, isLoading: clientsLoading } = useClients({ active: true })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      client_id: preselectedClientId || '',
      name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip: '',
      county: '',
      year_built: null,
      square_footage: null,
      lot_size_sqft: null,
      bedrooms: null,
      bathrooms: null,
      stories: null,
      construction_type: '',
      roof_type: '',
      foundation_type: '',
      is_gated_community: false,
      is_coastal: false,
      hoa_name: '',
      flood_zone: '',
      gate_code: '',
      garage_code: '',
      alarm_code: '',
      alarm_company: '',
      alarm_company_phone: '',
      lockbox_code: '',
      lockbox_location: '',
      wifi_network: '',
      wifi_password: '',
      access_instructions: '',
      features: defaultPropertyFeatures,
      notes: '',
      internal_notes: '',
      is_active: true,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Client</CardTitle>
          <CardDescription>
            Select the client who owns this property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="client_id">
              Client <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="client_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={clientsLoading || !!preselectedClientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                        {client.email && ` (${client.email})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.client_id && (
              <p className="text-sm text-destructive">
                {errors.client_id.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
          <CardDescription>
            Basic details about the property
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">
              Property Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Oceanfront Estate, Main Residence"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address_line1">
              Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address_line1"
              placeholder="123 Ocean Drive"
              {...register('address_line1')}
            />
            {errors.address_line1 && (
              <p className="text-sm text-destructive">
                {errors.address_line1.message}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input
              id="address_line2"
              placeholder="Unit, Suite, etc."
              {...register('address_line2')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              placeholder="Palm Beach"
              {...register('city')}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">
                State <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {usStates.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.state && (
                <p className="text-sm text-destructive">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">
                ZIP Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="zip"
                placeholder="33480"
                {...register('zip')}
              />
              {errors.zip && (
                <p className="text-sm text-destructive">{errors.zip.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="county">County</Label>
            <Input
              id="county"
              placeholder="Palm Beach County"
              {...register('county')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>
            Physical characteristics of the property
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="year_built">Year Built</Label>
            <Input
              id="year_built"
              type="number"
              placeholder="2020"
              {...register('year_built')}
            />
            {errors.year_built && (
              <p className="text-sm text-destructive">
                {errors.year_built.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="square_footage">Square Footage</Label>
            <Input
              id="square_footage"
              type="number"
              placeholder="5000"
              {...register('square_footage')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lot_size_sqft">Lot Size (sq ft)</Label>
            <Input
              id="lot_size_sqft"
              type="number"
              placeholder="15000"
              {...register('lot_size_sqft')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              placeholder="5"
              {...register('bedrooms')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              type="number"
              step="0.5"
              placeholder="4.5"
              {...register('bathrooms')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stories">Stories</Label>
            <Input
              id="stories"
              type="number"
              placeholder="2"
              {...register('stories')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="construction_type">Construction Type</Label>
            <Controller
              name="construction_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {constructionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roof_type">Roof Type</Label>
            <Controller
              name="roof_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roofTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foundation_type">Foundation Type</Label>
            <Controller
              name="foundation_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {foundationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hoa_name">HOA Name</Label>
            <Input
              id="hoa_name"
              placeholder="Palm Beach HOA"
              {...register('hoa_name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flood_zone">Flood Zone</Label>
            <Input
              id="flood_zone"
              placeholder="Zone X"
              {...register('flood_zone')}
            />
          </div>

          <div className="space-y-4 sm:col-span-2 lg:col-span-3">
            <div className="flex items-center space-x-2">
              <Controller
                name="is_gated_community"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="is_gated_community"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="is_gated_community">Gated Community</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="is_coastal"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="is_coastal"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="is_coastal">Coastal Property</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Information */}
      <Card>
        <CardHeader>
          <CardTitle>Access Information</CardTitle>
          <CardDescription>
            Codes and instructions for property access
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gate_code">Gate Code</Label>
            <Input
              id="gate_code"
              type="password"
              placeholder="****"
              autoComplete="off"
              {...register('gate_code')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="garage_code">Garage Code</Label>
            <Input
              id="garage_code"
              type="password"
              placeholder="****"
              autoComplete="off"
              {...register('garage_code')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alarm_code">Alarm Code</Label>
            <Input
              id="alarm_code"
              type="password"
              placeholder="****"
              autoComplete="off"
              {...register('alarm_code')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alarm_company">Alarm Company</Label>
            <Input
              id="alarm_company"
              placeholder="ADT"
              {...register('alarm_company')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alarm_company_phone">Alarm Company Phone</Label>
            <Input
              id="alarm_company_phone"
              type="tel"
              placeholder="(800) 555-0123"
              {...register('alarm_company_phone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lockbox_code">Lockbox Code</Label>
            <Input
              id="lockbox_code"
              type="password"
              placeholder="****"
              autoComplete="off"
              {...register('lockbox_code')}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="lockbox_location">Lockbox Location</Label>
            <Input
              id="lockbox_location"
              placeholder="On rear gate, left side"
              {...register('lockbox_location')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wifi_network">WiFi Network</Label>
            <Input
              id="wifi_network"
              placeholder="MyNetwork"
              {...register('wifi_network')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wifi_password">WiFi Password</Label>
            <Input
              id="wifi_password"
              type="password"
              placeholder="****"
              autoComplete="off"
              {...register('wifi_password')}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="access_instructions">Access Instructions</Label>
            <Textarea
              id="access_instructions"
              placeholder="Park in driveway, enter through side gate..."
              rows={3}
              {...register('access_instructions')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Features */}
      <Card>
        <CardHeader>
          <CardTitle>Property Features</CardTitle>
          <CardDescription>
            Select all features that apply to this property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(propertyFeatureCategories).map(
              ([category, features]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium mb-3">{category}</h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center space-x-2"
                      >
                        <Controller
                          name={`features.${feature}`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id={`feature-${feature}`}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label
                          htmlFor={`feature-${feature}`}
                          className="text-sm font-normal"
                        >
                          {propertyFeatureLabels[feature as keyof PropertyFeatures]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>
            Additional information about this property
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Client-Visible Notes</Label>
            <Textarea
              id="notes"
              placeholder="Notes that may be shared with the client..."
              rows={3}
              {...register('notes')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="internal_notes">Internal Notes (Staff Only)</Label>
            <Textarea
              id="internal_notes"
              placeholder="Private notes for staff only..."
              rows={3}
              {...register('internal_notes')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  )
}

export default PropertyForm
