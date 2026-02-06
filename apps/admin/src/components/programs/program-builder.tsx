import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Info, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

import {
  programSchema,
  type ProgramFormData,
  programDefaults,
} from '@/lib/validations/program'
import {
  usePricingConfig,
  calculateProgramPrice,
} from '@/hooks/use-pricing'
import { useCreateProgram } from '@/hooks/use-programs'
import {
  INSPECTION_FREQUENCIES,
  INSPECTION_TIERS,
  PROGRAM_ADDONS,
  DAYS_OF_WEEK,
  TIME_SLOTS,
} from '@/lib/constants/pricing'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { supabase, type Tables } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { useQuery } from '@tanstack/react-query'

type User = Tables<'users'>

interface ProgramBuilderProps {
  propertyId: string
  clientId: string
  propertyName: string
  onSuccess?: () => void
  onCancel?: () => void
}

/**
 * Program Builder - 4-step wizard for creating home care programs
 *
 * Steps:
 * 1. Inspection Frequency - How often to inspect
 * 2. Inspection Tier - Level of inspection detail
 * 3. Add-On Services - Optional enhancements
 * 4. Scheduling Preferences - Day, time, inspector preferences
 */
export function ProgramBuilder({
  propertyId,
  clientId,
  propertyName,
  onSuccess,
  onCancel,
}: ProgramBuilderProps) {
  const { toast } = useToast()
  const profile = useAuthStore((state) => state.profile)
  const { data: pricingConfig, isLoading: isPricingLoading } = usePricingConfig()
  const createProgram = useCreateProgram()

  // Fetch inspectors for scheduling preferences
  const { data: inspectors } = useQuery({
    queryKey: ['users', 'inspectors', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return []
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('organization_id', profile.organization_id)
        .eq('role', 'inspector')
        .eq('is_active', true)
        .order('first_name')
      if (error) throw error
      return data as Pick<User, 'id' | 'first_name' | 'last_name'>[]
    },
    enabled: !!profile?.organization_id,
  })

  // Pricing state
  const [pricing, setPricing] = useState({
    baseFee: 0,
    tierFee: 0,
    addonsFee: 0,
    monthlyTotal: 0,
  })

  // Form setup
  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema) as Resolver<ProgramFormData>,
    defaultValues: programDefaults(propertyId, clientId),
  })

  const { watch, setValue, handleSubmit, getValues } = form

  // Watch specific fields to avoid infinite re-renders
  const inspectionFrequency = watch('inspection_frequency')
  const inspectionTier = watch('inspection_tier')
  const addonDigitalManual = watch('addon_digital_manual')
  const addonWarrantyTracking = watch('addon_warranty_tracking')
  const addonEmergencyResponse = watch('addon_emergency_response')
  const addonHurricaneMonitoring = watch('addon_hurricane_monitoring')
  const preferredDayOfWeek = watch('preferred_day_of_week')
  const preferredTimeSlot = watch('preferred_time_slot')
  const preferredInspectorId = watch('preferred_inspector_id')

  // Find selected tier for expanded details display
  const selectedTier = INSPECTION_TIERS.find(
    (t) => t.value === inspectionTier
  )

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

  // Form submission
  const onSubmit = async (data: ProgramFormData) => {
    try {
      await createProgram.mutateAsync({
        ...data,
        base_fee: pricing.baseFee,
        tier_fee: pricing.tierFee,
        addons_fee: pricing.addonsFee,
        monthly_total: pricing.monthlyTotal,
      })
      toast({
        title: 'Success',
        description: 'Program activated successfully!',
      })
      onSuccess?.()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create program. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isPricingLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Loading pricing configuration...
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Create Home Care Program</h2>
        <p className="text-muted-foreground">for {propertyName}</p>
      </div>

      {/* Step 1: Inspection Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              1
            </span>
            Inspection Frequency
          </CardTitle>
          <CardDescription>
            How often should we inspect this property?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={inspectionFrequency}
            onValueChange={(v) =>
              setValue('inspection_frequency', v as ProgramFormData['inspection_frequency'])
            }
            className="grid grid-cols-5 gap-4"
          >
            {INSPECTION_FREQUENCIES.map((freq) => (
              <Label
                key={freq.value}
                htmlFor={freq.value}
                className={cn(
                  'flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                  inspectionFrequency === freq.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted'
                )}
              >
                <RadioGroupItem
                  value={freq.value}
                  id={freq.value}
                  className="sr-only"
                />
                <span className="font-semibold">{freq.label}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {freq.description}
                </span>
                {pricingConfig && (
                  <span className="mt-2 text-sm font-medium">
                    $
                    {
                      pricingConfig.frequency_pricing[
                        freq.value as keyof typeof pricingConfig.frequency_pricing
                      ]
                    }
                    /mo
                  </span>
                )}
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Step 2: Inspection Tier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              2
            </span>
            Inspection Tier
          </CardTitle>
          <CardDescription>
            What level of inspection is needed?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={inspectionTier}
            onValueChange={(v) =>
              setValue('inspection_tier', v as ProgramFormData['inspection_tier'])
            }
            className="grid grid-cols-2 gap-4"
          >
            {INSPECTION_TIERS.map((tier) => (
              <Label
                key={tier.value}
                htmlFor={`tier-${tier.value}`}
                className={cn(
                  'flex flex-col rounded-md border-2 p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                  inspectionTier === tier.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted'
                )}
              >
                <RadioGroupItem
                  value={tier.value}
                  id={`tier-${tier.value}`}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{tier.label}</span>
                  {pricingConfig && (
                    <Badge variant="secondary">
                      +$
                      {
                        pricingConfig.tier_pricing[
                          tier.value as keyof typeof pricingConfig.tier_pricing
                        ]
                      }
                      /mo
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground mt-1">
                  {tier.description}
                </span>
                <ul className="mt-3 space-y-1">
                  {tier.includes.slice(0, 4).map((item, i) => (
                    <li key={i} className="text-xs flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-600" />
                      {item}
                    </li>
                  ))}
                  {tier.includes.length > 4 && (
                    <li className="text-xs text-muted-foreground">
                      +{tier.includes.length - 4} more
                    </li>
                  )}
                </ul>
              </Label>
            ))}
          </RadioGroup>

          {/* Selected tier expanded details */}
          {selectedTier && (
            <Card className="mt-4 bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {selectedTier.label} Inspection Includes:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {selectedTier.includes.map((item, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                {'note' in selectedTier && selectedTier.note && (
                  <p className="mt-3 text-sm text-muted-foreground flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    {selectedTier.note}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Add-On Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              3
            </span>
            Add-On Services
          </CardTitle>
          <CardDescription>
            Enhance your program with additional services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {PROGRAM_ADDONS.map((addon) => {
              // Get the current value directly based on addon type
              const isChecked = (() => {
                switch (addon.value) {
                  case 'digital_manual':
                    return addonDigitalManual ?? false
                  case 'warranty_tracking':
                    return addonWarrantyTracking ?? false
                  case 'emergency_response':
                    return addonEmergencyResponse ?? false
                  case 'hurricane_monitoring':
                    return addonHurricaneMonitoring ?? false
                  default:
                    return false
                }
              })()

              const fieldName =
                `addon_${addon.value}` as keyof ProgramFormData
              const price =
                pricingConfig?.addon_pricing[
                  addon.value as keyof typeof pricingConfig.addon_pricing
                ] || 0

              return (
                <div
                  key={addon.value}
                  className={cn(
                    'flex items-start gap-3 rounded-md border p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                    isChecked && 'border-primary bg-primary/5'
                  )}
                  onClick={(e) => {
                    // Only toggle if click was NOT from Radix's internal BubbleInput
                    // (which dispatches synthetic click events that bubble up and cause infinite loops)
                    if (e.target instanceof HTMLInputElement) return
                    setValue(fieldName, !isChecked as never)
                  }}
                >
                  <Checkbox
                    id={addon.value}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      setValue(fieldName, !!checked as never)
                    }
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium cursor-pointer">
                        {addon.label}
                      </Label>
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
        </CardContent>
      </Card>

      {/* Step 4: Scheduling Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              4
            </span>
            Scheduling Preferences
          </CardTitle>
          <CardDescription>
            When would inspections work best?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Preferred Day */}
            <div className="space-y-2">
              <Label>Preferred Day</Label>
              <Select
                value={preferredDayOfWeek?.toString() ?? 'any'}
                onValueChange={(v) =>
                  setValue(
                    'preferred_day_of_week',
                    v && v !== 'any' ? parseInt(v) : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any day</SelectItem>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Time */}
            <div className="space-y-2">
              <Label>Preferred Time</Label>
              <Select
                value={preferredTimeSlot ?? 'anytime'}
                onValueChange={(v) =>
                  setValue(
                    'preferred_time_slot',
                    v as ProgramFormData['preferred_time_slot']
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Inspector */}
            <div className="space-y-2">
              <Label>Preferred Inspector</Label>
              <Select
                value={preferredInspectorId ?? 'any'}
                onValueChange={(v) =>
                  setValue('preferred_inspector_id', v && v !== 'any' ? v : null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any inspector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any inspector</SelectItem>
                  {inspectors?.map((inspector) => (
                    <SelectItem key={inspector.id} value={inspector.id}>
                      {inspector.first_name} {inspector.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card className="bg-primary/5 border-primary">
        <CardHeader>
          <CardTitle>Program Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Base Fee (
                {
                  INSPECTION_FREQUENCIES.find(
                    (f) => f.value === inspectionFrequency
                  )?.label
                }
                )
              </span>
              <span>${pricing.baseFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Tier (
                {
                  INSPECTION_TIERS.find(
                    (t) => t.value === inspectionTier
                  )?.label
                }
                )
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
            <div className="flex justify-between text-lg font-semibold">
              <span>Monthly Total</span>
              <span>${pricing.monthlyTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Section */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={createProgram.isPending}>
          {createProgram.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Activating...
            </>
          ) : (
            'Activate Program'
          )}
        </Button>
      </div>
    </form>
  )
}

export default ProgramBuilder
