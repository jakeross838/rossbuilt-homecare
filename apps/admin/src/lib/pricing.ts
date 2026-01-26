/**
 * Program pricing calculation utilities
 */

import { INSPECTION_FREQUENCIES, PROGRAM_ADDONS } from '@/lib/constants/pricing'

// Base prices per tier (monthly)
const TIER_BASE_PRICES = {
  essential: 150,
  standard: 250,
  premium: 400,
  visual: 150,
  functional: 200,
  comprehensive: 300,
  preventative: 400,
} as const

// Frequency multipliers (discount for more frequent inspections)
const FREQUENCY_MULTIPLIERS = {
  annual: 1.0,
  semi_annual: 0.95,
  quarterly: 0.90,
  bi_monthly: 0.85,
  monthly: 0.80,
  bi_weekly: 0.75,
} as const

interface PricingInput {
  frequency: string
  tier: string
  addons: {
    hvac_maintenance?: boolean
    pool_spa?: boolean
    landscape?: boolean
    security_system?: boolean
    smart_home?: boolean
  }
}

interface PricingResult {
  baseFee: number
  tierFee: number
  addonsTotal: number
  frequencyDiscount: number
  monthlyTotal: number
  annualTotal: number
}

/**
 * Calculate program pricing based on frequency, tier, and add-ons
 */
export function calculateProgramPricing(input: PricingInput): PricingResult {
  // Get base price for tier
  const tierKey = input.tier as keyof typeof TIER_BASE_PRICES
  const baseFee = TIER_BASE_PRICES[tierKey] || TIER_BASE_PRICES.standard

  // Get frequency info
  const frequencyInfo = INSPECTION_FREQUENCIES.find(
    (f) => f.value === input.frequency
  )
  const inspectionsPerYear = frequencyInfo?.inspectionsPerYear || 12

  // Calculate tier fee (base * inspections per year / 12 for monthly)
  const tierFee = (baseFee * inspectionsPerYear) / 12

  // Calculate add-ons total
  let addonsTotal = 0
  for (const addon of PROGRAM_ADDONS) {
    const addonKey = addon.value as keyof typeof input.addons
    if (input.addons[addonKey]) {
      addonsTotal += addon.price
    }
  }

  // Calculate frequency discount
  const frequencyKey = input.frequency as keyof typeof FREQUENCY_MULTIPLIERS
  const multiplier = FREQUENCY_MULTIPLIERS[frequencyKey] || 1.0
  const subtotal = tierFee + addonsTotal
  const discountedTotal = subtotal * multiplier
  const frequencyDiscount = subtotal - discountedTotal

  // Calculate monthly total
  const monthlyTotal = Math.round(discountedTotal * 100) / 100

  return {
    baseFee: Math.round(baseFee * 100) / 100,
    tierFee: Math.round(tierFee * 100) / 100,
    addonsTotal: Math.round(addonsTotal * 100) / 100,
    frequencyDiscount: Math.round(frequencyDiscount * 100) / 100,
    monthlyTotal,
    annualTotal: Math.round(monthlyTotal * 12 * 100) / 100,
  }
}
