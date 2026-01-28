import { z } from 'zod'
import { VENDOR_MARKUP } from '@/config/app-config'

/**
 * Validation schema for pricing configuration
 * Matches the JSONB structure in pricing_config table
 */
export const pricingConfigSchema = z.object({
  frequency_pricing: z.object({
    annual: z.coerce.number().min(0),
    semi_annual: z.coerce.number().min(0),
    quarterly: z.coerce.number().min(0),
    monthly: z.coerce.number().min(0),
    bi_weekly: z.coerce.number().min(0),
  }),
  tier_pricing: z.object({
    visual: z.coerce.number().min(0),
    functional: z.coerce.number().min(0),
    comprehensive: z.coerce.number().min(0),
    preventative: z.coerce.number().min(0),
  }),
  addon_pricing: z.object({
    digital_manual: z.coerce.number().min(0),
    warranty_tracking: z.coerce.number().min(0),
    emergency_response: z.coerce.number().min(0),
    hurricane_monitoring: z.coerce.number().min(0),
  }),
  service_rates: z.object({
    hourly_rate: z.coerce.number().min(0),
    pre_storm_prep: z.coerce.number().min(0),
    post_storm_inspection: z.coerce.number().min(0),
    arrival_prep: z.coerce.number().min(0),
    departure_check: z.coerce.number().min(0),
    home_manual_creation: z.coerce.number().min(0),
    vendor_markup_percent: z.coerce.number().min(0).max(100),
  }),
})

/**
 * Type for pricing configuration inferred from schema
 */
export type PricingConfig = z.infer<typeof pricingConfigSchema>

/**
 * Default pricing configuration values
 */
export function pricingConfigDefaults(): PricingConfig {
  return {
    frequency_pricing: {
      annual: 0,
      semi_annual: 0,
      quarterly: 0,
      monthly: 0,
      bi_weekly: 0,
    },
    tier_pricing: {
      visual: 0,
      functional: 0,
      comprehensive: 0,
      preventative: 0,
    },
    addon_pricing: {
      digital_manual: 0,
      warranty_tracking: 0,
      emergency_response: 0,
      hurricane_monitoring: 0,
    },
    service_rates: {
      hourly_rate: 0,
      pre_storm_prep: 0,
      post_storm_inspection: 0,
      arrival_prep: 0,
      departure_check: 0,
      home_manual_creation: 0,
      vendor_markup_percent: VENDOR_MARKUP * 100,
    },
  }
}
