/**
 * Application configuration
 * All business rules and magic numbers should come from here
 *
 * This is the single source of truth for:
 * - Pricing configuration
 * - Feature flags
 * - Business constants
 * - Re-exports of status/tier configs for centralized access
 */

// ============================================
// RE-EXPORTS FOR CENTRALIZED ACCESS
// These already exist in constants files but are re-exported
// here for centralized configuration access (SYNC-09.3, SYNC-09.4)
// ============================================

export {
  WORK_ORDER_STATUS,
  PRIORITY_LEVELS,
  WORK_ORDER_CATEGORIES,
  DEFAULT_MARKUP_PERCENT,
} from '@/lib/constants/work-order'

export {
  INSPECTION_TIERS,
  INSPECTION_FREQUENCIES,
  PROGRAM_ADDONS,
} from '@/lib/constants/pricing'

// ============================================
// PRICING CONFIGURATION
// ============================================

/**
 * Builder markup percentage applied to all client-facing prices
 * Used in plan editor and work order client costs
 */
export const BUILDER_MARKUP = 0.20  // 20%

/**
 * Default vendor markup for work orders
 */
export const VENDOR_MARKUP = 0.15  // 15%

/**
 * Calculate client price with builder markup
 * @param basePrice - The base price before markup
 * @returns Price with markup applied
 */
export function calculateClientPrice(basePrice: number): number {
  return Math.round(basePrice * (1 + BUILDER_MARKUP) * 100) / 100
}

/**
 * Calculate vendor markup for work orders
 * @param vendorCost - The vendor's cost
 * @returns Client cost with markup
 */
export function calculateVendorMarkup(vendorCost: number): number {
  return Math.round(vendorCost * (1 + VENDOR_MARKUP) * 100) / 100
}

// ============================================
// FEATURE FLAGS
// ============================================

export const FEATURES = {
  /** Enable realtime subscriptions */
  realtimeEnabled: true,
  /** Enable offline mode for inspectors */
  offlineEnabled: true,
  /** Enable AI report summaries */
  aiSummariesEnabled: true,
  /** Enable email notifications */
  emailNotificationsEnabled: true,
  /** Show debug information in console */
  debugMode: import.meta.env.DEV,
} as const

// ============================================
// DEBUG LOGGING FLAGS
// ============================================

/**
 * Granular debug logging controls
 * Each flag controls a specific subsystem's logging
 * All default to DEV mode only (disabled in production)
 */
export const DEBUG = {
  /** Enable realtime subscription logging */
  REALTIME_LOGGING: import.meta.env.DEV,
  /** Enable query/mutation logging */
  QUERY_LOGGING: false,
  /** Enable offline sync logging */
  OFFLINE_LOGGING: import.meta.env.DEV,
} as const

// ============================================
// PAGINATION DEFAULTS
// ============================================

export const PAGINATION = {
  /** Default page size for lists */
  defaultPageSize: 20,
  /** Max items per page */
  maxPageSize: 100,
  /** Activity feed page size */
  activityPageSize: 10,
} as const

// ============================================
// TIMEOUTS AND INTERVALS
// ============================================

export const TIMEOUTS = {
  /** Toast auto-dismiss duration (ms) */
  toastDuration: 5000,
  /** Debounce delay for search inputs (ms) */
  searchDebounce: 300,
  /** Sync retry delay (ms) */
  syncRetryDelay: 5000,
} as const

// ============================================
// COMBINED APP CONFIG
// ============================================

export const APP_CONFIG = {
  pricing: {
    builderMarkup: BUILDER_MARKUP,
    vendorMarkup: VENDOR_MARKUP,
  },
  features: FEATURES,
  pagination: PAGINATION,
  timeouts: TIMEOUTS,
} as const
