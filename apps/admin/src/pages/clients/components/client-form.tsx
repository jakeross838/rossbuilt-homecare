import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  clientSchema,
  type ClientFormData,
  defaultClientValues,
} from '@/lib/validations/client'

interface ClientFormProps {
  defaultValues?: Partial<ClientFormData>
  onSubmit: (data: ClientFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

/**
 * Reusable client form component
 * Used for both creating and editing clients
 */
export function ClientForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save Client',
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      ...defaultClientValues,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Primary Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Contact</CardTitle>
          <CardDescription>
            The main contact information for this client
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="first_name"
              placeholder="John"
              error={!!errors.first_name}
              {...register('first_name')}
            />
            {errors.first_name && (
              <p className="text-sm text-destructive">
                {errors.first_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="last_name"
              placeholder="Smith"
              error={!!errors.last_name}
              {...register('last_name')}
            />
            {errors.last_name && (
              <p className="text-sm text-destructive">
                {errors.last_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              error={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              error={!!errors.phone}
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle>Secondary Contact</CardTitle>
          <CardDescription>
            Optional spouse, assistant, or alternate contact
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="secondary_first_name">First Name</Label>
            <Input
              id="secondary_first_name"
              placeholder="Jane"
              error={!!errors.secondary_first_name}
              {...register('secondary_first_name')}
            />
            {errors.secondary_first_name && (
              <p className="text-sm text-destructive">
                {errors.secondary_first_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_last_name">Last Name</Label>
            <Input
              id="secondary_last_name"
              placeholder="Smith"
              error={!!errors.secondary_last_name}
              {...register('secondary_last_name')}
            />
            {errors.secondary_last_name && (
              <p className="text-sm text-destructive">
                {errors.secondary_last_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_email">Email</Label>
            <Input
              id="secondary_email"
              type="email"
              placeholder="jane@example.com"
              error={!!errors.secondary_email}
              {...register('secondary_email')}
            />
            {errors.secondary_email && (
              <p className="text-sm text-destructive">
                {errors.secondary_email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_phone">Phone</Label>
            <Input
              id="secondary_phone"
              type="tel"
              placeholder="(555) 987-6543"
              error={!!errors.secondary_phone}
              {...register('secondary_phone')}
            />
            {errors.secondary_phone && (
              <p className="text-sm text-destructive">
                {errors.secondary_phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="secondary_relationship">Relationship</Label>
            <Input
              id="secondary_relationship"
              placeholder="Spouse, Assistant, Property Manager, etc."
              error={!!errors.secondary_relationship}
              {...register('secondary_relationship')}
            />
            {errors.secondary_relationship && (
              <p className="text-sm text-destructive">
                {errors.secondary_relationship.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Billing address and contact for invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="billing_email">Billing Email</Label>
            <Input
              id="billing_email"
              type="email"
              placeholder="billing@example.com"
              error={!!errors.billing_email}
              {...register('billing_email')}
            />
            {errors.billing_email && (
              <p className="text-sm text-destructive">
                {errors.billing_email.message}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="billing_address_line1">Address Line 1</Label>
            <Input
              id="billing_address_line1"
              placeholder="123 Main Street"
              error={!!errors.billing_address_line1}
              {...register('billing_address_line1')}
            />
            {errors.billing_address_line1 && (
              <p className="text-sm text-destructive">
                {errors.billing_address_line1.message}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="billing_address_line2">Address Line 2</Label>
            <Input
              id="billing_address_line2"
              placeholder="Suite 100"
              error={!!errors.billing_address_line2}
              {...register('billing_address_line2')}
            />
            {errors.billing_address_line2 && (
              <p className="text-sm text-destructive">
                {errors.billing_address_line2.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing_city">City</Label>
            <Input
              id="billing_city"
              placeholder="San Francisco"
              error={!!errors.billing_city}
              {...register('billing_city')}
            />
            {errors.billing_city && (
              <p className="text-sm text-destructive">
                {errors.billing_city.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing_state">State</Label>
              <Input
                id="billing_state"
                placeholder="CA"
                maxLength={2}
                className="uppercase"
                error={!!errors.billing_state}
                {...register('billing_state', {
                  setValueAs: (v) => v.toUpperCase(),
                })}
              />
              {errors.billing_state && (
                <p className="text-sm text-destructive">
                  {errors.billing_state.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_zip">ZIP Code</Label>
              <Input
                id="billing_zip"
                placeholder="94102"
                error={!!errors.billing_zip}
                {...register('billing_zip')}
              />
              {errors.billing_zip && (
                <p className="text-sm text-destructive">
                  {errors.billing_zip.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>
            Source tracking and notes about the client
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              placeholder="Website, Referral, etc."
              error={!!errors.source}
              {...register('source')}
            />
            {errors.source && (
              <p className="text-sm text-destructive">{errors.source.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referral_source">Referral Source</Label>
            <Input
              id="referral_source"
              placeholder="Name of referrer or company"
              error={!!errors.referral_source}
              {...register('referral_source')}
            />
            {errors.referral_source && (
              <p className="text-sm text-destructive">
                {errors.referral_source.message}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this client..."
              rows={4}
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
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

export default ClientForm
