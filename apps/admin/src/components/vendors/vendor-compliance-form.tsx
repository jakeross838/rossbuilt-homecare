import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  vendorComplianceSchema,
  type VendorComplianceFormData,
} from '@/lib/validations/vendor'
import type { Resolver } from 'react-hook-form'

interface VendorComplianceFormProps {
  defaultValues?: Partial<VendorComplianceFormData>
  onSubmit: (data: VendorComplianceFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function VendorComplianceForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: VendorComplianceFormProps) {
  const form = useForm<VendorComplianceFormData>({
    resolver: zodResolver(vendorComplianceSchema) as Resolver<VendorComplianceFormData>,
    defaultValues: {
      license_number: '',
      license_expiration: '',
      insurance_company: '',
      insurance_policy_number: '',
      insurance_expiration: '',
      w9_on_file: false,
      w9_received_date: '',
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* License Info */}
        <div className="space-y-4">
          <h3 className="font-medium">License Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="license_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Number</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="license_expiration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Insurance Info */}
        <div className="space-y-4">
          <h3 className="font-medium">Insurance Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="insurance_company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Company</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="insurance_policy_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Number</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="insurance_expiration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiration Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* W-9 Info */}
        <div className="space-y-4">
          <h3 className="font-medium">W-9 Form</h3>
          <FormField
            control={form.control}
            name="w9_on_file"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">W-9 on file</FormLabel>
              </FormItem>
            )}
          />
          {form.watch('w9_on_file') && (
            <FormField
              control={form.control}
              name="w9_received_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Received</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Compliance Info'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
