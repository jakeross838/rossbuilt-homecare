import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useUpdateProgram } from '@/hooks/use-programs'
import {
  INSPECTION_FREQUENCIES,
  INSPECTION_TIERS,
  PROGRAM_ADDONS,
} from '@/lib/constants/pricing'
import { calculateProgramPricing } from '@/lib/pricing'
import { useToast } from '@/hooks/use-toast'
import type { Program } from '@/types'

const editProgramSchema = z.object({
  inspection_frequency: z.enum([
    'monthly',
    'bi_monthly',
    'quarterly',
    'semi_annual',
    'annual',
  ]),
  inspection_tier: z.enum(['essential', 'standard', 'premium']),
  addon_hvac_maintenance: z.boolean(),
  addon_pool_spa: z.boolean(),
  addon_landscape: z.boolean(),
  addon_security_system: z.boolean(),
  addon_smart_home: z.boolean(),
})

type EditProgramData = z.infer<typeof editProgramSchema>

interface EditProgramDialogProps {
  program: Program
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditProgramDialog({
  program,
  open,
  onOpenChange,
  onSuccess,
}: EditProgramDialogProps) {
  const [pricing, setPricing] = useState<ReturnType<
    typeof calculateProgramPricing
  > | null>(null)
  const { toast } = useToast()
  const updateProgram = useUpdateProgram()

  const form = useForm<EditProgramData>({
    resolver: zodResolver(editProgramSchema),
    defaultValues: {
      inspection_frequency: program.inspection_frequency || 'monthly',
      inspection_tier: program.inspection_tier || 'standard',
      addon_hvac_maintenance: program.addon_hvac_maintenance || false,
      addon_pool_spa: program.addon_pool_spa || false,
      addon_landscape: program.addon_landscape || false,
      addon_security_system: program.addon_security_system || false,
      addon_smart_home: program.addon_smart_home || false,
    },
  })

  const watchedValues = form.watch()

  // Calculate pricing whenever form values change
  useEffect(() => {
    const newPricing = calculateProgramPricing({
      frequency: watchedValues.inspection_frequency,
      tier: watchedValues.inspection_tier,
      addons: {
        hvac_maintenance: watchedValues.addon_hvac_maintenance,
        pool_spa: watchedValues.addon_pool_spa,
        landscape: watchedValues.addon_landscape,
        security_system: watchedValues.addon_security_system,
        smart_home: watchedValues.addon_smart_home,
      },
    })
    setPricing(newPricing)
  }, [watchedValues])

  const onSubmit = async (data: EditProgramData) => {
    try {
      await updateProgram.mutateAsync({
        id: program.id,
        data: {
          ...data,
          monthly_total: pricing?.monthlyTotal || 0,
        },
        shouldCreateInvoice: true, // Flag to trigger invoice creation
      })

      toast({
        title: 'Program updated',
        description: 'Home care program has been updated successfully.',
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update program',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Home Care Program</DialogTitle>
          <DialogDescription>
            Update the inspection frequency, tier, or add-ons. An invoice will be
            generated automatically if billing is affected.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Inspection Frequency */}
            <FormField
              control={form.control}
              name="inspection_frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspection Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INSPECTION_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{freq.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {freq.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Inspection Tier */}
            <FormField
              control={form.control}
              name="inspection_tier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspection Tier</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INSPECTION_TIERS.map((tier) => (
                        <SelectItem key={tier.value} value={tier.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{tier.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {tier.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add-ons */}
            <div className="space-y-4">
              <FormLabel>Add-Ons</FormLabel>
              {PROGRAM_ADDONS.map((addon) => (
                <FormField
                  key={addon.value}
                  control={form.control}
                  name={`addon_${addon.value}` as keyof EditProgramData}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="flex-1 space-y-1">
                        <FormLabel className="font-medium">
                          {addon.label}
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {addon.description}
                        </p>
                        <p className="text-sm font-medium">
                          +${addon.price.toFixed(2)}/month
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Pricing Summary */}
            {pricing && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <h3 className="font-semibold">New Pricing</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Base Fee:</span>
                    <span>${pricing.baseFee.toFixed(2)}/month</span>
                  </div>
                  {pricing.addonsTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Add-ons:</span>
                      <span>+${pricing.addonsTotal.toFixed(2)}/month</span>
                    </div>
                  )}
                  {pricing.frequencyDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Frequency Discount:</span>
                      <span>-${pricing.frequencyDiscount.toFixed(2)}/month</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Total Monthly Fee:</span>
                    <span>${pricing.monthlyTotal.toFixed(2)}</span>
                  </div>
                </div>
                {pricing.monthlyTotal !== (program.monthly_total || 0) && (
                  <p className="text-xs text-muted-foreground">
                    Previous: ${(program.monthly_total || 0).toFixed(2)}/month
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateProgram.isPending}>
                {updateProgram.isPending ? 'Updating...' : 'Update Program'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
