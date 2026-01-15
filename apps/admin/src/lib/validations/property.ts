import { z } from 'zod'

/**
 * Property features - 24 boolean flags for various property amenities
 */
export const propertyFeaturesSchema = z.object({
  // Water features
  pool: z.boolean().default(false),
  spa: z.boolean().default(false),
  dock: z.boolean().default(false),
  boat_lift: z.boolean().default(false),
  seawall: z.boolean().default(false),

  // Outdoor features
  outdoor_kitchen: z.boolean().default(false),
  fire_pit: z.boolean().default(false),
  fountain: z.boolean().default(false),
  irrigation: z.boolean().default(false),
  tennis_court: z.boolean().default(false),

  // Systems
  generator: z.boolean().default(false),
  solar_panels: z.boolean().default(false),
  water_softener: z.boolean().default(false),
  water_filtration: z.boolean().default(false),
  smart_home: z.boolean().default(false),

  // Property characteristics
  elevator: z.boolean().default(false),
  wine_cellar: z.boolean().default(false),
  theater_room: z.boolean().default(false),
  guest_house: z.boolean().default(false),
  detached_garage: z.boolean().default(false),

  // Climate
  hurricane_shutters: z.boolean().default(false),
  impact_windows: z.boolean().default(false),
  whole_house_fan: z.boolean().default(false),
  radiant_heating: z.boolean().default(false),
})

export type PropertyFeatures = z.infer<typeof propertyFeaturesSchema>

/**
 * Default property features (all false)
 */
export const defaultPropertyFeatures: PropertyFeatures = {
  pool: false,
  spa: false,
  dock: false,
  boat_lift: false,
  seawall: false,
  outdoor_kitchen: false,
  fire_pit: false,
  fountain: false,
  irrigation: false,
  tennis_court: false,
  generator: false,
  solar_panels: false,
  water_softener: false,
  water_filtration: false,
  smart_home: false,
  elevator: false,
  wine_cellar: false,
  theater_room: false,
  guest_house: false,
  detached_garage: false,
  hurricane_shutters: false,
  impact_windows: false,
  whole_house_fan: false,
  radiant_heating: false,
}

/**
 * Feature labels for display
 */
export const propertyFeatureLabels: Record<keyof PropertyFeatures, string> = {
  pool: 'Pool',
  spa: 'Spa/Hot Tub',
  dock: 'Dock',
  boat_lift: 'Boat Lift',
  seawall: 'Seawall',
  outdoor_kitchen: 'Outdoor Kitchen',
  fire_pit: 'Fire Pit',
  fountain: 'Fountain',
  irrigation: 'Irrigation System',
  tennis_court: 'Tennis Court',
  generator: 'Generator',
  solar_panels: 'Solar Panels',
  water_softener: 'Water Softener',
  water_filtration: 'Water Filtration',
  smart_home: 'Smart Home System',
  elevator: 'Elevator',
  wine_cellar: 'Wine Cellar',
  theater_room: 'Theater Room',
  guest_house: 'Guest House',
  detached_garage: 'Detached Garage',
  hurricane_shutters: 'Hurricane Shutters',
  impact_windows: 'Impact Windows',
  whole_house_fan: 'Whole House Fan',
  radiant_heating: 'Radiant Heating',
}

/**
 * Feature categories for organized display
 */
export const propertyFeatureCategories = {
  'Water Features': ['pool', 'spa', 'dock', 'boat_lift', 'seawall'] as const,
  'Outdoor Features': ['outdoor_kitchen', 'fire_pit', 'fountain', 'irrigation', 'tennis_court'] as const,
  'Systems': ['generator', 'solar_panels', 'water_softener', 'water_filtration', 'smart_home'] as const,
  'Property Characteristics': ['elevator', 'wine_cellar', 'theater_room', 'guest_house', 'detached_garage'] as const,
  'Climate Control': ['hurricane_shutters', 'impact_windows', 'whole_house_fan', 'radiant_heating'] as const,
}

/**
 * ZIP code validation pattern (US format)
 */
const zipPattern = /^\d{5}(-\d{4})?$/

/**
 * Property form validation schema
 */
export const propertyFormSchema = z.object({
  // Required fields
  client_id: z.string().min(1, 'Client is required'),
  name: z.string().min(1, 'Property name is required'),
  address_line1: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'Use 2-letter state code'),
  zip: z.string().regex(zipPattern, 'Invalid ZIP code format (e.g., 12345 or 12345-6789)'),

  // Optional address fields
  address_line2: z.string().optional().nullable(),
  county: z.string().optional().nullable(),

  // Property details - coerce numbers for form inputs
  year_built: z.coerce.number().min(1800).max(new Date().getFullYear() + 5).optional().nullable(),
  square_footage: z.coerce.number().min(0).optional().nullable(),
  lot_size_sqft: z.coerce.number().min(0).optional().nullable(),
  bedrooms: z.coerce.number().min(0).max(50).optional().nullable(),
  bathrooms: z.coerce.number().min(0).max(50).optional().nullable(),
  stories: z.coerce.number().min(1).max(100).optional().nullable(),

  // Construction details
  construction_type: z.string().optional().nullable(),
  roof_type: z.string().optional().nullable(),
  foundation_type: z.string().optional().nullable(),

  // Location details
  is_gated_community: z.boolean().default(false),
  is_coastal: z.boolean().default(false),
  hoa_name: z.string().optional().nullable(),
  flood_zone: z.string().optional().nullable(),

  // Access codes
  gate_code: z.string().optional().nullable(),
  garage_code: z.string().optional().nullable(),
  alarm_code: z.string().optional().nullable(),
  alarm_company: z.string().optional().nullable(),
  alarm_company_phone: z.string().optional().nullable(),
  lockbox_code: z.string().optional().nullable(),
  lockbox_location: z.string().optional().nullable(),

  // WiFi
  wifi_network: z.string().optional().nullable(),
  wifi_password: z.string().optional().nullable(),

  // Access instructions
  access_instructions: z.string().optional().nullable(),

  // Features (JSONB)
  features: propertyFeaturesSchema.default(defaultPropertyFeatures),

  // Notes
  notes: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),

  // Status
  is_active: z.boolean().default(true),
})

export type PropertyFormData = z.infer<typeof propertyFormSchema>

/**
 * Construction type options
 */
export const constructionTypes = [
  { value: 'block', label: 'Concrete Block' },
  { value: 'frame', label: 'Wood Frame' },
  { value: 'steel', label: 'Steel Frame' },
  { value: 'brick', label: 'Brick' },
  { value: 'stone', label: 'Stone' },
  { value: 'stucco', label: 'Stucco' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'other', label: 'Other' },
]

/**
 * Roof type options
 */
export const roofTypes = [
  { value: 'tile', label: 'Tile' },
  { value: 'shingle', label: 'Shingle' },
  { value: 'metal', label: 'Metal' },
  { value: 'flat', label: 'Flat/Built-up' },
  { value: 'slate', label: 'Slate' },
  { value: 'wood_shake', label: 'Wood Shake' },
  { value: 'other', label: 'Other' },
]

/**
 * Foundation type options
 */
export const foundationTypes = [
  { value: 'slab', label: 'Slab' },
  { value: 'crawl_space', label: 'Crawl Space' },
  { value: 'basement', label: 'Basement' },
  { value: 'pier_beam', label: 'Pier & Beam' },
  { value: 'piling', label: 'Piling' },
  { value: 'other', label: 'Other' },
]

/**
 * State options (US states)
 */
export const usStates = [
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
  { value: 'DC', label: 'District of Columbia' },
]
