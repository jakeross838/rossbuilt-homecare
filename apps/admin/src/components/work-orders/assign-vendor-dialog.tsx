import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Star, AlertTriangle, CheckCircle, Plus } from 'lucide-react'
import { useVendorsByTrade } from '@/hooks/use-vendors'
import {
  assignVendorSchema,
  type AssignVendorFormData,
} from '@/lib/validations/work-order'
import { formatRating } from '@/lib/constants/vendor'
import type { Resolver } from 'react-hook-form'

interface AssignVendorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workOrderId: string
  category: string | null
  onAssign: (data: AssignVendorFormData) => void
  isLoading?: boolean
}

export function AssignVendorDialog({
  open,
  onOpenChange,
  category,
  onAssign,
  isLoading,
}: AssignVendorDialogProps) {
  const navigate = useNavigate()
  const { data: vendors = [], isLoading: loadingVendors } = useVendorsByTrade(
    category || undefined
  )

  const form = useForm<AssignVendorFormData>({
    resolver: zodResolver(assignVendorSchema) as Resolver<AssignVendorFormData>,
    defaultValues: {
      vendor_id: '',
      scheduled_date: '',
      scheduled_time_start: '',
      scheduled_time_end: '',
      estimated_cost: undefined,
    },
  })

  const handleSubmit = (data: AssignVendorFormData) => {
    onAssign(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Vendor</DialogTitle>
          <DialogDescription>
            Select a vendor to assign to this work order
            {category && ` (${category})`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vendor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Vendor</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-2"
                    >
                      {loadingVendors ? (
                        <p className="text-sm text-muted-foreground">
                          Loading vendors...
                        </p>
                      ) : vendors.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            No vendors available for this category
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              onOpenChange(false)
                              navigate('/vendors/new')
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Vendor
                          </Button>
                        </div>
                      ) : (
                        vendors.map((vendor) => (
                          <label
                            key={vendor.id}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50 ${
                              field.value === vendor.id
                                ? 'border-primary bg-accent/50'
                                : ''
                            }`}
                          >
                            <RadioGroupItem
                              value={vendor.id}
                              className="sr-only"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {vendor.company_name}
                                </span>
                                {vendor.is_preferred && (
                                  <Badge variant="secondary">Preferred</Badge>
                                )}
                              </div>
                              {vendor.contact_name && (
                                <p className="text-sm text-muted-foreground">
                                  {vendor.contact_name}
                                  {vendor.phone && ` • ${vendor.phone}`}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                {vendor.average_rating && (
                                  <span className="flex items-center gap-1 text-sm">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {formatRating(vendor.average_rating)}
                                  </span>
                                )}
                                {vendor.compliance.is_compliant ? (
                                  <span className="flex items-center gap-1 text-sm text-green-600">
                                    <CheckCircle className="h-3 w-3" />
                                    Compliant
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-sm text-yellow-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    {vendor.compliance.issues[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))
                      )}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="scheduled_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduled_time_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduled_time_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estimated_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Cost (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !form.watch('vendor_id')}>
                {isLoading ? 'Assigning...' : 'Assign Vendor'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
