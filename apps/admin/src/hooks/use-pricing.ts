import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type InsertTables } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type { PricingConfig } from '@/lib/validations/pricing'
import { pricingKeys } from '@/lib/queries'

type PricingConfigInsert = InsertTables<'pricing_config'>

/**
 * Hook to fetch current pricing configuration
 * Returns the active pricing config (is_current = true)
 */
export function usePricingConfig() {
  return useQuery({
    queryKey: pricingKeys.config(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_config')
        .select('*')
        .eq('is_current', true)
        .single()

      if (error) throw error

      // Cast JSONB fields through unknown to PricingConfig structure
      return {
        id: data.id,
        version: data.version,
        frequency_pricing: data.frequency_pricing as unknown as PricingConfig['frequency_pricing'],
        tier_pricing: data.tier_pricing as unknown as PricingConfig['tier_pricing'],
        addon_pricing: data.addon_pricing as unknown as PricingConfig['addon_pricing'],
        service_rates: data.service_rates as unknown as PricingConfig['service_rates'],
      } as PricingConfig & { id: string; version: number }
    },
  })
}

/**
 * Hook to update pricing configuration
 * Creates a new version and marks old config as not current
 */
export function useUpdatePricingConfig() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (config: Partial<PricingConfig>) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      // Get current config to increment version
      const { data: current } = await supabase
        .from('pricing_config')
        .select('id, version')
        .eq('is_current', true)
        .single()

      // Mark current config as not current
      if (current) {
        await supabase
          .from('pricing_config')
          .update({ is_current: false })
          .eq('id', current.id)
      }

      // Insert new config with incremented version
      const insertData: PricingConfigInsert = {
        organization_id: profile.organization_id,
        frequency_pricing: config.frequency_pricing,
        tier_pricing: config.tier_pricing,
        addon_pricing: config.addon_pricing,
        service_rates: config.service_rates,
        version: (current?.version || 0) + 1,
        effective_date: new Date().toISOString().split('T')[0],
        is_current: true,
      }

      const { data, error } = await supabase
        .from('pricing_config')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.config() })
    },
  })
}

/**
 * Calculate program price based on selections
 * Pure function - not a hook
 *
 * @param config - Current pricing configuration
 * @param frequency - Inspection frequency (annual, semi_annual, etc.)
 * @param tier - Inspection tier (visual, functional, etc.)
 * @param addons - Object with boolean flags for each addon
 * @returns Price breakdown with baseFee, tierFee, addonsFee, monthlyTotal
 */
export function calculateProgramPrice(
  config: PricingConfig,
  frequency: string,
  tier: string,
  addons: {
    digital_manual: boolean
    warranty_tracking: boolean
    emergency_response: boolean
    hurricane_monitoring: boolean
  }
): {
  baseFee: number
  tierFee: number
  addonsFee: number
  monthlyTotal: number
} {
  const baseFee =
    config.frequency_pricing[
      frequency as keyof typeof config.frequency_pricing
    ] || 0
  const tierFee =
    config.tier_pricing[tier as keyof typeof config.tier_pricing] || 0

  let addonsFee = 0
  if (addons.digital_manual) addonsFee += config.addon_pricing.digital_manual
  if (addons.warranty_tracking)
    addonsFee += config.addon_pricing.warranty_tracking
  if (addons.emergency_response)
    addonsFee += config.addon_pricing.emergency_response
  if (addons.hurricane_monitoring)
    addonsFee += config.addon_pricing.hurricane_monitoring

  return {
    baseFee,
    tierFee,
    addonsFee,
    monthlyTotal: baseFee + tierFee + addonsFee,
  }
}
