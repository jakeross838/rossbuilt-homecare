import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { useUpdateProgram } from '@/hooks/use-programs'
import {
  usePricingConfig,
  calculateProgramPrice,
} from '@/hooks/use-pricing'
import {
  INSPECTION_FREQUENCIES,
  INSPECTION_TIERS,
  PROGRAM_ADDONS,
} from '@/lib/constants/pricing'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { Program } from '@/types'

const editProgramSchema = z.object({
  inspection_frequency: z.enum([
    'annual',
    'semi_annual',
    'quarterly',
    'monthly',
    'bi_weekly',
  ]),
  inspection_tier: z.enum([
    'visual',
    'functional',
    'comprehensive',
    'preventative',
  ]),
  addon_digital_manual: z.boolean(),
  addon_warranty_tracking: z.boolean(),
  addon_emergency_response: z.boolean(),
  addon_hurricane_monitoring: z.boolean(),
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
  const { toast } = useToast()
  const updateProgram = useUpdateProgram()
  const { data: pricingConfig, isLoading: isPricingLoading } = usePricingConfig()

  const [pricing, setPricing] = useState({
    baseFee: 0,
    tierFee: 0,
    addonsFee: 0,
    monthlyTotal: 0,
  })

  const form = useForm<EditProgramData>({
    resolver: zodResolver(editProgramSchema) as Resolver<EditProgramData>,
    defaultValues: {
      inspection_frequency: program.inspection_frequency || 'quarterly',
      inspection_tier: program.inspection_tier || 'functional',
      addon_digital_manual: program.addon_digital_manual || false,
      addon_warranty_tracking: program.addon_warranty_tracking || false,
      addon_emergency_response: program.addon_emergency_response || false,
      addon_hurricane_monitoring: program.addon_hurricane_monitoring || false,
    },
  })

  const { watch, setValue, handleSubmit } = form

  const inspectionFrequency = watch('inspection_frequency')
  const inspectionTier = watch('inspection_tier')
  const addonDigitalManual = watch('addon_digital_manual')
  const addonWarrantyTracking = watch('addon_warranty_tracking')
  const addonEmergencyResponse = watch('addon_emergency_response')
  const addonHurricaneMonitoring = watch('addon_hurricane_monitoring')

  // Recalculate pricing when selections change
  useEffect(() => {
    if (pricingConfig) {
      const newPricing = calculateProgramPrice(
        pricingConfig,
        inspectionFrequency,
        inspectionTier,
        {
          digital_manual: addonDigitalManual ?? false,
          warranty_tracking: addonWarrantyTracking ?? false,
          emergency_response: addonEmergencyResponse ?? false,
          hurricane_monitoring: addonHurricaneMonitoring ?? false,
        }
      )
      setPricing(newPricing)
    }
  }, [
    pricingConfig,
    inspectionFrequency,
    inspectionTier,
    addonDigitalManual,
    addonWarrantyTracking,
    addonEmergencyResponse,
    addonHurricaneMonitoring,
  ])

  // Reset form when program changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        inspection_frequency: program.inspection_frequency || 'quarterly',
        inspection_tier: program.inspection_tier || 'functional',
        addon_digital_manual: program.addon_digital_manual || false,
        addon_warranty_tracking: program.addon_warranty_tracking || false,
        addon_emergency_response: program.addon_emergency_response || false,
        addon_hurricane_monitoring: program.addon_hurricane_monitoring || false,
      })
    }
  }, [open, program, form])

  const onSubmit = async (data: EditProgramData) => {
    try {
      await updateProgram.mutateAsync({
        id: program.id,
        data: {
          ...data,
          base_fee: pricing.baseFee,
          tier_fee: pricing.tierFee,
          addons_fee: pricing.addonsFee,
          monthly_total: pricing.monthlyTotal,
        },
        shouldCreateInvoice: true,
      })

      toast({
        title: 'Program updated',
        description: 'Home care program has been updated successfully.',
      })

      onOpenChange(false)
      onSuccess?.()
    } catch {
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

        {isPricingLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading pricing...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Inspection Frequency */}
            <div className="space-y-2">
              <Label>Inspection Frequency</Label>
              <Select
                value={inspectionFrequency}
                onValueChange={(v) =>
                  setValue('inspection_frequency', v as EditProgramData['inspection_frequency'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {INSPECTION_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{freq.label}</span>
                        <span className="text-xs text-muted-foreground">
                          - {freq.description}
                        </span>
                        {pricingConfig && (
                          <Badge variant="secondary" className="ml-auto">
                            ${pricingConfig.frequency_pricing[freq.value as keyof typeof pricingConfig.frequency_pricing]}/mo
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Inspection Tier */}
            <div className="space-y-2">
              <Label>Inspection Tier</Label>
              <Select
                value={inspectionTier}
                onValueChange={(v) =>
                  setValue('inspection_tier', v as EditProgramData['inspection_tier'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {INSPECTION_TIERS.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{tier.label}</span>
                        <span className="text-xs text-muted-foreground">
                          - {tier.description}
                        </span>
                        {pricingConfig && (
                          <Badge variant="secondary" className="ml-auto">
                            +${pricingConfig.tier_pricing[tier.value as keyof typeof pricingConfig.tier_pricing]}/mo
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add-ons */}
            <div className="space-y-3">
              <Label>Add-On Services</Label>
              {PROGRAM_ADDONS.map((addon) => {
                const fieldName = `addon_${addon.value}` as keyof EditProgramData
                const isChecked = !!watch(fieldName)
                const price = pricingConfig?.addon_pricing[
                  addon.value as keyof typeof pricingConfig.addon_pricing
                ] || addon.price

                return (
                  <div
                    key={addon.value}
                    className={cn(
                      'flex items-start gap-3 rounded-md border p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                      isChecked && 'border-primary bg-primary/5'
                    )}
                    onClick={() => setValue(fieldName, !isChecked as never)}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        setValue(fieldName, !!checked as never)
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{addon.label}</span>
                        <Badge variant="outline">+${price}/mo</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {addon.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pricing Summary */}
            <div className="rounded-lg border bg-primary/5 border-primary p-4 space-y-3">
              <h3 className="font-semibold">Updated Pricing</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Base Fee ({INSPECTION_FREQUENCIES.find(f => f.value === inspectionFrequency)?.label})
                  </span>
                  <span>${pricing.baseFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tier ({INSPECTION_TIERS.find(t => t.value === inspectionTier)?.label})
                  </span>
                  <span>+${pricing.tierFee.toFixed(2)}</span>
                </div>
                {pricing.addonsFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Add-Ons</span>
                    <span>+${pricing.addonsFee.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Monthly Total</span>
                  <span>${pricing.monthlyTotal.toFixed(2)}</span>
                </div>
              </div>
              {pricing.monthlyTotal !== (program.monthly_total || 0) && (
                <p className="text-xs text-muted-foreground">
                  Previous: ${(program.monthly_total || 0).toFixed(2)}/month
                  {pricing.monthlyTotal > (program.monthly_total || 0)
                    ? ` (+$${(pricing.monthlyTotal - (program.monthly_total || 0)).toFixed(2)})`
                    : ` (-$${((program.monthly_total || 0) - pricing.monthlyTotal).toFixed(2)})`
                  }
                </p>
              )}
            </div>

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
                {updateProgram.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
