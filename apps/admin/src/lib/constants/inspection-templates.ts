/**
 * Default inspection templates for checklist generation
 * Templates are organized by tier: visual, functional, comprehensive, preventative
 * Each tier builds on the previous - comprehensive includes all functional and visual items
 */

import type { TemplateItem, TieredTemplate } from '../types/inspection'

/**
 * Base exterior inspection template
 * Items covering roof, gutters, siding, foundation, etc.
 */
export const BASE_EXTERIOR_TEMPLATE: TieredTemplate = {
  visual: [
    { id: 'ext_v_001', text: 'Roof surface condition (from ground)', photo_recommended: true },
    { id: 'ext_v_002', text: 'Gutters and downspouts condition', photo_recommended: true },
    { id: 'ext_v_003', text: 'Fascia and soffit condition', photo_recommended: false },
    { id: 'ext_v_004', text: 'Exterior walls and siding', photo_recommended: true },
    { id: 'ext_v_005', text: 'Windows and doors (exterior)', photo_recommended: false },
    { id: 'ext_v_006', text: 'Foundation visible areas', photo_recommended: true },
    { id: 'ext_v_007', text: 'Driveway and walkways', photo_recommended: false },
    { id: 'ext_v_008', text: 'Landscaping condition', photo_recommended: false },
    { id: 'ext_v_009', text: 'Exterior lighting fixtures', photo_recommended: false },
    { id: 'ext_v_010', text: 'Fencing and gates', photo_recommended: false },
  ],
  functional: [
    { id: 'ext_f_001', text: 'Test exterior outlets (GFCI)', photo_required: false },
    { id: 'ext_f_002', text: 'Test exterior lighting', photo_required: false },
    { id: 'ext_f_003', text: 'Operate garage door(s)', photo_required: false },
    { id: 'ext_f_004', text: 'Test exterior hose bibs', photo_required: false },
    { id: 'ext_f_005', text: 'Cycle gate opener (if applicable)', photo_required: false },
  ],
  comprehensive: [
    { id: 'ext_c_001', text: 'Drone roof inspection', photo_required: true, help_text: 'Weather permitting' },
    { id: 'ext_c_002', text: 'Measure roof drainage slope', type: 'text' },
    { id: 'ext_c_003', text: 'Inspect roof penetrations and flashing', photo_required: true },
    { id: 'ext_c_004', text: 'Check attic from exterior access', photo_recommended: true },
  ],
  preventative: [
    { id: 'ext_p_001', text: 'Clear debris from gutters', photo_required: false },
    { id: 'ext_p_002', text: 'Lubricate garage door hardware', photo_required: false },
    { id: 'ext_p_003', text: 'Touch up exterior caulking', photo_required: false },
  ],
} as const

/**
 * Base interior inspection template
 * Items covering flooring, walls, fixtures, appliances, etc.
 */
export const BASE_INTERIOR_TEMPLATE: TieredTemplate = {
  visual: [
    { id: 'int_v_001', text: 'Entry door and hardware', photo_recommended: false },
    { id: 'int_v_002', text: 'Flooring condition throughout', photo_recommended: true },
    { id: 'int_v_003', text: 'Walls and ceilings (signs of damage/stains)', photo_recommended: true },
    { id: 'int_v_004', text: 'Windows and window treatments', photo_recommended: false },
    { id: 'int_v_005', text: 'Interior doors and hardware', photo_recommended: false },
    { id: 'int_v_006', text: 'Kitchen cabinets and counters', photo_recommended: false },
    { id: 'int_v_007', text: 'Bathroom fixtures visual check', photo_recommended: false },
    { id: 'int_v_008', text: 'Signs of pest activity', photo_required: true, help_text: 'Document any evidence' },
    { id: 'int_v_009', text: 'Signs of water intrusion', photo_required: true },
  ],
  functional: [
    { id: 'int_f_001', text: 'Run all faucets (hot and cold)', photo_required: false },
    { id: 'int_f_002', text: 'Flush all toilets', photo_required: false },
    { id: 'int_f_003', text: 'Run all showers/tubs', photo_required: false },
    { id: 'int_f_004', text: 'Test garbage disposal', photo_required: false },
    { id: 'int_f_005', text: 'Run dishwasher (quick cycle)', photo_required: false },
    { id: 'int_f_006', text: 'Test range/cooktop burners', photo_required: false },
    { id: 'int_f_007', text: 'Check refrigerator operation', photo_required: false },
    { id: 'int_f_008', text: 'Test washer (quick cycle)', photo_required: false },
    { id: 'int_f_009', text: 'Test dryer operation', photo_required: false },
    { id: 'int_f_010', text: 'Test all light switches', photo_required: false },
    { id: 'int_f_011', text: 'Test ceiling fans', photo_required: false },
    { id: 'int_f_012', text: 'Test smoke detectors', photo_required: false },
    { id: 'int_f_013', text: 'Test CO detectors', photo_required: false },
    { id: 'int_f_014', text: 'Check thermostat operation', photo_required: false },
  ],
  comprehensive: [
    { id: 'int_c_001', text: 'Water pressure reading', type: 'number', help_text: 'PSI at main' },
    { id: 'int_c_002', text: 'Under-sink cabinet inspection (all)', photo_recommended: true },
    { id: 'int_c_003', text: 'Attic entry and inspection', photo_required: true },
    { id: 'int_c_004', text: 'Electrical panel inspection', photo_required: true },
    { id: 'int_c_005', text: 'Water heater inspection', photo_required: true },
  ],
  preventative: [
    { id: 'int_p_001', text: 'Replace smoke detector batteries', photo_required: false },
    { id: 'int_p_002', text: 'Replace CO detector batteries', photo_required: false },
    { id: 'int_p_003', text: 'Pour water in floor drains', help_text: 'Prevent sewer gas' },
    { id: 'int_p_004', text: 'Run water in unused fixtures', help_text: 'Prevent trap dry-out' },
    { id: 'int_p_005', text: 'Clean dryer vent connection', photo_required: false },
  ],
} as const

/**
 * HVAC system inspection template
 * Items for air handlers, condensers, thermostats, ductwork
 */
export const HVAC_TEMPLATE: TieredTemplate = {
  visual: [
    { id: 'hvac_v_001', text: 'Air handler cabinet condition' },
    { id: 'hvac_v_002', text: 'Condenser unit condition' },
    { id: 'hvac_v_003', text: 'Visible ductwork condition' },
    { id: 'hvac_v_004', text: 'Thermostat condition' },
  ],
  functional: [
    { id: 'hvac_f_001', text: 'Cycle cooling mode' },
    { id: 'hvac_f_002', text: 'Cycle heating mode' },
    { id: 'hvac_f_003', text: 'Check airflow at registers' },
    { id: 'hvac_f_004', text: 'Listen for unusual sounds' },
  ],
  comprehensive: [
    { id: 'hvac_c_001', text: 'Supply temperature', type: 'number', help_text: 'Degrees F' },
    { id: 'hvac_c_002', text: 'Return temperature', type: 'number', help_text: 'Degrees F' },
    { id: 'hvac_c_003', text: 'Temperature differential', type: 'number', help_text: 'Should be 15-20 degrees F' },
    { id: 'hvac_c_004', text: 'Inspect evaporator coil', photo_required: true },
    { id: 'hvac_c_005', text: 'Check condensate drain flow' },
    { id: 'hvac_c_006', text: 'Inspect electrical connections' },
  ],
  preventative: [
    { id: 'hvac_p_001', text: 'Replace air filter', photo_required: true },
    { id: 'hvac_p_002', text: 'Clear condensate drain', photo_required: false },
    { id: 'hvac_p_003', text: 'Clean condenser coils', help_text: 'If accessible and needed' },
  ],
} as const

/**
 * Pool and spa inspection template
 * Items for pool equipment, water quality, enclosures
 */
export const POOL_TEMPLATE: TieredTemplate = {
  visual: [
    { id: 'pool_v_001', text: 'Pool water clarity' },
    { id: 'pool_v_002', text: 'Pool surface condition' },
    { id: 'pool_v_003', text: 'Tile and coping condition' },
    { id: 'pool_v_004', text: 'Pool deck condition' },
    { id: 'pool_v_005', text: 'Screen enclosure condition' },
    { id: 'pool_v_006', text: 'Equipment pad condition' },
  ],
  functional: [
    { id: 'pool_f_001', text: 'Pool pump operation' },
    { id: 'pool_f_002', text: 'Pool filter pressure', type: 'number', help_text: 'PSI' },
    { id: 'pool_f_003', text: 'Pool heater operation', help_text: 'If equipped' },
    { id: 'pool_f_004', text: 'Salt cell operation', help_text: 'If equipped' },
    { id: 'pool_f_005', text: 'Automation system check' },
    { id: 'pool_f_006', text: 'Pool lights operation' },
  ],
  comprehensive: [
    { id: 'pool_c_001', text: 'Water chemistry test', type: 'text' },
    { id: 'pool_c_002', text: 'Inspect pump strainer basket' },
    { id: 'pool_c_003', text: 'Inspect filter cartridge/grids' },
    { id: 'pool_c_004', text: 'Check for leaks at equipment' },
  ],
  preventative: [
    { id: 'pool_p_001', text: 'Empty skimmer baskets' },
    { id: 'pool_p_002', text: 'Empty pump strainer basket' },
    { id: 'pool_p_003', text: 'Add algaecide treatment' },
    { id: 'pool_p_004', text: 'Backwash filter', help_text: 'If needed' },
  ],
} as const

/**
 * Generator inspection template
 * Items for whole-home generators and transfer switches
 */
export const GENERATOR_TEMPLATE: TieredTemplate = {
  visual: [
    { id: 'gen_v_001', text: 'Generator enclosure condition' },
    { id: 'gen_v_002', text: 'Visible oil/fuel leaks' },
    { id: 'gen_v_003', text: 'Transfer switch condition' },
  ],
  functional: [
    { id: 'gen_f_001', text: 'Start generator manually' },
    { id: 'gen_f_002', text: 'Transfer switch operation' },
    { id: 'gen_f_003', text: 'Run under load (10 min minimum)' },
    { id: 'gen_f_004', text: 'Check for error codes' },
  ],
  comprehensive: [
    { id: 'gen_c_001', text: 'Check oil level', photo_required: false },
    { id: 'gen_c_002', text: 'Check coolant level', help_text: 'If liquid cooled' },
    { id: 'gen_c_003', text: 'Inspect battery condition' },
    { id: 'gen_c_004', text: 'Check fuel level/supply' },
    { id: 'gen_c_005', text: 'Review maintenance history display' },
  ],
  preventative: [
    { id: 'gen_p_001', text: 'Exercise generator', help_text: 'Weekly exercise cycle' },
  ],
} as const

/**
 * All templates grouped for easy access
 */
export const ALL_INSPECTION_TEMPLATES = {
  exterior: BASE_EXTERIOR_TEMPLATE,
  interior: BASE_INTERIOR_TEMPLATE,
  hvac: HVAC_TEMPLATE,
  pool: POOL_TEMPLATE,
  generator: GENERATOR_TEMPLATE,
} as const

/**
 * Template category labels for display
 */
export const TEMPLATE_CATEGORY_LABELS: Record<string, string> = {
  exterior: 'Exterior',
  interior: 'Interior',
  hvac: 'HVAC Systems',
  pool: 'Pool & Spa',
  generator: 'Generator',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  kitchen: 'Kitchen Appliances',
  laundry: 'Laundry',
  outdoor: 'Outdoor',
  safety: 'Safety & Security',
  specialty: 'Specialty Systems',
} as const

/**
 * Get all tiers up to and including the specified tier (cumulative)
 * Visual includes only visual
 * Functional includes visual + functional
 * Comprehensive includes visual + functional + comprehensive
 * Preventative includes all four
 */
export function getTiersToInclude(tier: string): string[] {
  const allTiers = ['visual', 'functional', 'comprehensive', 'preventative']
  const index = allTiers.indexOf(tier)
  return index >= 0 ? allTiers.slice(0, index + 1) : ['visual']
}

/**
 * Get items from a template for a specific tier (cumulative)
 */
export function getTemplateItemsForTier(
  template: TieredTemplate,
  tier: string
): TemplateItem[] {
  const tiers = getTiersToInclude(tier)
  return tiers.flatMap((t) => template[t as keyof TieredTemplate] || [])
}

/**
 * Calculate estimated inspection duration based on property characteristics
 */
export function calculateEstimatedDuration(
  tier: string,
  squareFootage: number | null,
  hasPool: boolean,
  hasGenerator: boolean,
  hasDock: boolean
): number {
  const baseTimes: Record<string, number> = {
    visual: 30,
    functional: 60,
    comprehensive: 120,
    preventative: 180,
  }

  let duration = baseTimes[tier] || 60

  // Add time for square footage
  if (squareFootage) {
    const sqftFactor: Record<string, number> = {
      visual: 5,
      functional: 10,
      comprehensive: 15,
      preventative: 20,
    }
    duration += Math.ceil(squareFootage / 1000) * (sqftFactor[tier] || 10)
  }

  // Add time for features
  if (hasPool) duration += tier === 'preventative' ? 35 : 15
  if (hasGenerator) duration += 15
  if (hasDock) duration += 15

  return duration
}
