/**
 * Trade categories for vendors (aligned with work order categories)
 */
export const TRADE_CATEGORIES = [
  { value: 'hvac', label: 'HVAC', icon: 'Thermometer' },
  { value: 'plumbing', label: 'Plumbing', icon: 'Droplets' },
  { value: 'electrical', label: 'Electrical', icon: 'Zap' },
  { value: 'appliance', label: 'Appliance Repair', icon: 'Refrigerator' },
  { value: 'pool_spa', label: 'Pool & Spa', icon: 'Waves' },
  { value: 'roofing', label: 'Roofing', icon: 'Home' },
  { value: 'painting', label: 'Painting', icon: 'Paintbrush' },
  { value: 'flooring', label: 'Flooring', icon: 'LayoutGrid' },
  { value: 'landscaping', label: 'Landscaping', icon: 'TreePine' },
  { value: 'pest_control', label: 'Pest Control', icon: 'Bug' },
  { value: 'cleaning', label: 'Cleaning', icon: 'Sparkles' },
  { value: 'security', label: 'Security Systems', icon: 'Shield' },
  { value: 'general', label: 'General Maintenance', icon: 'Wrench' },
] as const

export type TradeCategory = (typeof TRADE_CATEGORIES)[number]['value']

/**
 * Compliance warning thresholds (days before expiration)
 */
export const COMPLIANCE_WARNING_DAYS = 30

/**
 * Rating configuration
 */
export const RATING_CONFIG = {
  min: 1,
  max: 5,
  labels: {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  },
}

/**
 * US States for address forms
 */
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
] as const

/**
 * Get trade category label by value
 */
export function getTradeCategoryLabel(value: string): string {
  const category = TRADE_CATEGORIES.find((c) => c.value === value)
  return category?.label || value
}

/**
 * Get trade category icon by value
 */
export function getTradeCategoryIcon(value: string): string {
  const category = TRADE_CATEGORIES.find((c) => c.value === value)
  return category?.icon || 'Wrench'
}

/**
 * Format contact name from first and last name
 */
export function formatContactName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string | null {
  const parts = [firstName, lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : null
}

/**
 * Check vendor compliance status
 */
export function checkVendorCompliance(vendor: {
  license_expiration: string | null
  insurance_expiration: string | null
  w9_on_file: boolean | null
}): {
  license_valid: boolean
  license_expires_soon: boolean
  insurance_valid: boolean
  insurance_expires_soon: boolean
  w9_on_file: boolean
  is_compliant: boolean
  issues: string[]
} {
  const today = new Date()
  const warningDate = new Date()
  warningDate.setDate(warningDate.getDate() + COMPLIANCE_WARNING_DAYS)

  const licenseExpiration = vendor.license_expiration
    ? new Date(vendor.license_expiration)
    : null
  const insuranceExpiration = vendor.insurance_expiration
    ? new Date(vendor.insurance_expiration)
    : null

  const license_valid = !licenseExpiration || licenseExpiration > today
  const license_expires_soon =
    licenseExpiration !== null &&
    licenseExpiration > today &&
    licenseExpiration <= warningDate
  const insurance_valid = !insuranceExpiration || insuranceExpiration > today
  const insurance_expires_soon =
    insuranceExpiration !== null &&
    insuranceExpiration > today &&
    insuranceExpiration <= warningDate
  const w9_on_file = vendor.w9_on_file ?? false

  const issues: string[] = []
  if (!license_valid) issues.push('License expired')
  else if (license_expires_soon) issues.push('License expires soon')
  if (!insurance_valid) issues.push('Insurance expired')
  else if (insurance_expires_soon) issues.push('Insurance expires soon')
  if (!w9_on_file) issues.push('W-9 not on file')

  const is_compliant = license_valid && insurance_valid && w9_on_file

  return {
    license_valid,
    license_expires_soon,
    insurance_valid,
    insurance_expires_soon,
    w9_on_file,
    is_compliant,
    issues,
  }
}

/**
 * Format rating as stars
 */
export function formatRating(rating: number | null): string {
  if (rating === null) return 'No rating'
  return `${rating.toFixed(1)} / 5`
}

/**
 * Get rating label
 */
export function getRatingLabel(rating: number): string {
  const rounded = Math.round(rating)
  return RATING_CONFIG.labels[rounded as keyof typeof RATING_CONFIG.labels] || 'Unknown'
}
