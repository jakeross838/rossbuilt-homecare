import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pricingConfigSchema, type PricingConfig } from '@/lib/validations/pricing'
import { usePricingConfig, useUpdatePricingConfig } from '@/hooks/use-pricing'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/layout/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

export function PricingSettingsPage() {
  const { data: config, isLoading } = usePricingConfig()
  const updateConfig = useUpdatePricingConfig()
  const { toast } = useToast()

  const form = useForm<PricingConfig>({
    resolver: zodResolver(pricingConfigSchema) as Resolver<PricingConfig>,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = form

  // Reset form when config loads
  useEffect(() => {
    if (config) {
      reset({
        frequency_pricing: config.frequency_pricing,
        tier_pricing: config.tier_pricing,
        addon_pricing: config.addon_pricing,
        service_rates: config.service_rates,
      })
    }
  }, [config, reset])

  const onSubmit = async (data: PricingConfig) => {
    try {
      await updateConfig.mutateAsync(data)
      toast({
        title: 'Pricing updated',
        description: 'Your pricing configuration has been saved.',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update pricing configuration.',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-64" />
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing Configuration"
        description="Configure program pricing and service rates"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Frequency Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Inspection Frequency Base Pricing</CardTitle>
            <CardDescription>
              Monthly fee based on inspection frequency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Annual</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('frequency_pricing.annual')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Semi-Annual</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('frequency_pricing.semi_annual')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Quarterly</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('frequency_pricing.quarterly')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Monthly</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('frequency_pricing.monthly')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bi-Weekly</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('frequency_pricing.bi_weekly')}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Inspection Tier Pricing</CardTitle>
            <CardDescription>
              Additional monthly fee based on tier level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Visual</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('tier_pricing.visual')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Functional</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('tier_pricing.functional')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Comprehensive</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('tier_pricing.comprehensive')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Preventative</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('tier_pricing.preventative')}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add-on Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Add-On Pricing</CardTitle>
            <CardDescription>Monthly fee for optional add-ons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Digital Home Manual</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('addon_pricing.digital_manual')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Warranty Tracking</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('addon_pricing.warranty_tracking')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Emergency Response</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('addon_pricing.emergency_response')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hurricane Monitoring</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('addon_pricing.hurricane_monitoring')}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Service Rates</CardTitle>
            <CardDescription>
              Rates for additional services and vendor markup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Hourly Rate</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('service_rates.hourly_rate')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pre-Storm Prep</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('service_rates.pre_storm_prep')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Post-Storm Inspection</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7"
                    {...register('service_rates.post_storm_inspection')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Vendor Markup %</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.5"
                    className="pr-7"
                    {...register('service_rates.vendor_markup_percent')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={!isDirty || updateConfig.isPending}>
            {updateConfig.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PricingSettingsPage
