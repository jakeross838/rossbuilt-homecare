/**
 * Pricing constants for programs and pricing configuration
 * Based on Home Care OS inspection frequency, tiers, and add-ons
 */

/**
 * Inspection frequencies with pricing multipliers
 */
export const INSPECTION_FREQUENCIES = [
  {
    value: 'annual',
    label: 'Annual',
    description: '1 inspection per year',
    inspectionsPerYear: 1,
  },
  {
    value: 'semi_annual',
    label: 'Semi-Annual',
    description: '2 inspections per year',
    inspectionsPerYear: 2,
  },
  {
    value: 'quarterly',
    label: 'Quarterly',
    description: '4 inspections per year',
    inspectionsPerYear: 4,
  },
  {
    value: 'monthly',
    label: 'Monthly',
    description: '12 inspections per year',
    inspectionsPerYear: 12,
  },
  {
    value: 'bi_weekly',
    label: 'Bi-Weekly',
    description: '26 inspections per year',
    inspectionsPerYear: 26,
  },
] as const

/**
 * Inspection tiers with detailed scope descriptions
 * Each tier builds on the previous one
 */
export const INSPECTION_TIERS = [
  {
    value: 'visual',
    label: 'Visual',
    description: 'Eyes-only walkthrough with photo documentation',
    includes: [
      'Exterior visual inspection',
      'Interior visual inspection',
      'Photo documentation',
      'Written report',
    ],
    doesNotInclude: [
      'Testing/operating equipment',
      'Opening panels or access points',
      'Measurements',
    ],
  },
  {
    value: 'functional',
    label: 'Functional',
    description: 'Visual inspection plus operation of all systems',
    includes: [
      'Everything in Visual tier',
      'Run all plumbing fixtures',
      'Cycle HVAC systems',
      'Test electrical outlets',
      'Operate appliances',
      'Test garage doors & gates',
    ],
    doesNotInclude: [
      'Attic/crawl space entry',
      'Detailed measurements',
      'Preventative maintenance',
    ],
  },
  {
    value: 'comprehensive',
    label: 'Comprehensive',
    description: 'Deep inspection with measurements and detailed analysis',
    includes: [
      'Everything in Functional tier',
      'Attic entry and inspection',
      'Crawl space inspection (if accessible)',
      'Temperature differential readings',
      'Water pressure measurements',
      'Electrical panel inspection',
      'Drone roof inspection (weather permitting)',
    ],
    doesNotInclude: ['Filter replacement', 'Minor maintenance tasks'],
  },
  {
    value: 'preventative',
    label: 'Preventative',
    description: 'Comprehensive inspection plus minor maintenance',
    includes: [
      'Everything in Comprehensive tier',
      'Replace HVAC filters',
      'Replace smoke/CO batteries',
      'Clear condensate drains',
      'Lubricate door hardware',
      'Minor caulking touch-ups',
      'Clean dryer vent connection',
    ],
    doesNotInclude: [],
    note: 'Materials billed separately at cost',
  },
] as const

/**
 * Program add-on services
 */
export const PROGRAM_ADDONS = [
  {
    value: 'digital_manual',
    label: 'Digital Home Manual',
    description:
      'Comprehensive digital manual for your home with maintenance schedules and equipment details',
  },
  {
    value: 'warranty_tracking',
    label: 'Warranty Tracking',
    description: 'Track all equipment warranties with expiration alerts',
  },
  {
    value: 'emergency_response',
    label: 'Emergency Response',
    description: 'Priority response for emergencies with dedicated contact line',
  },
  {
    value: 'hurricane_monitoring',
    label: 'Hurricane Monitoring',
    description:
      'Storm tracking with pre and post-storm inspection coordination',
  },
] as const

/**
 * Days of week for scheduling preferences
 */
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const

/**
 * Time slots for scheduling preferences
 */
export const TIME_SLOTS = [
  { value: 'morning', label: 'Morning (8am - 12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
  { value: 'anytime', label: 'Anytime' },
] as const

/**
 * Type exports for type inference
 */
export type InspectionFrequency = (typeof INSPECTION_FREQUENCIES)[number]['value']
export type InspectionTier = (typeof INSPECTION_TIERS)[number]['value']
export type ProgramAddon = (typeof PROGRAM_ADDONS)[number]['value']
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]['value']
export type TimeSlot = (typeof TIME_SLOTS)[number]['value']
