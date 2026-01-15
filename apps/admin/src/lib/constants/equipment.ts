/**
 * Equipment categories and types for the equipment registry
 * Based on luxury coastal homes in Tampa Bay, Florida
 */

export const EQUIPMENT_CATEGORIES = {
  hvac: {
    label: 'HVAC',
    icon: 'Thermometer',
    types: [
      { value: 'air_handler', label: 'Air Handler' },
      { value: 'condenser', label: 'Condenser Unit' },
      { value: 'mini_split', label: 'Mini Split' },
      { value: 'thermostat', label: 'Thermostat' },
      { value: 'erv', label: 'ERV/HRV' },
      { value: 'duct_system', label: 'Duct System' },
      { value: 'air_purifier', label: 'Air Purifier/UV Light' },
      { value: 'dehumidifier', label: 'Whole-Home Dehumidifier' },
    ],
  },
  plumbing: {
    label: 'Plumbing',
    icon: 'Droplets',
    types: [
      { value: 'water_heater_tank', label: 'Water Heater (Tank)' },
      { value: 'water_heater_tankless', label: 'Water Heater (Tankless)' },
      { value: 'recirculation_pump', label: 'Recirculation Pump' },
      { value: 'water_softener', label: 'Water Softener' },
      { value: 'ro_system', label: 'Reverse Osmosis System' },
      { value: 'well_pump', label: 'Well Pump' },
      { value: 'septic_system', label: 'Septic System' },
      { value: 'sump_pump', label: 'Sump Pump' },
    ],
  },
  electrical: {
    label: 'Electrical',
    icon: 'Zap',
    types: [
      { value: 'main_panel', label: 'Main Electrical Panel' },
      { value: 'generator', label: 'Generator' },
      { value: 'transfer_switch', label: 'Transfer Switch' },
      { value: 'surge_protector', label: 'Whole-Home Surge Protector' },
      { value: 'ev_charger', label: 'EV Charger' },
      { value: 'solar_inverter', label: 'Solar Inverter' },
    ],
  },
  kitchen: {
    label: 'Kitchen Appliances',
    icon: 'ChefHat',
    types: [
      { value: 'refrigerator', label: 'Refrigerator' },
      { value: 'range', label: 'Range/Oven' },
      { value: 'cooktop', label: 'Cooktop' },
      { value: 'wall_oven', label: 'Wall Oven' },
      { value: 'microwave', label: 'Microwave' },
      { value: 'dishwasher', label: 'Dishwasher' },
      { value: 'disposal', label: 'Garbage Disposal' },
      { value: 'ice_maker', label: 'Ice Maker' },
      { value: 'wine_cooler', label: 'Wine Cooler' },
      { value: 'hood_vent', label: 'Range Hood/Vent' },
    ],
  },
  laundry: {
    label: 'Laundry',
    icon: 'Shirt',
    types: [
      { value: 'washer', label: 'Washing Machine' },
      { value: 'dryer', label: 'Dryer' },
      { value: 'steam_closet', label: 'Steam Closet' },
    ],
  },
  pool_spa: {
    label: 'Pool & Spa',
    icon: 'Waves',
    types: [
      { value: 'pool_pump', label: 'Pool Pump' },
      { value: 'pool_filter', label: 'Pool Filter' },
      { value: 'pool_heater', label: 'Pool Heater' },
      { value: 'heat_pump', label: 'Pool Heat Pump' },
      { value: 'salt_cell', label: 'Salt Chlorine Generator' },
      { value: 'pool_automation', label: 'Pool Automation System' },
      { value: 'pool_cleaner', label: 'Automatic Pool Cleaner' },
    ],
  },
  outdoor: {
    label: 'Outdoor',
    icon: 'TreePine',
    types: [
      { value: 'irrigation_controller', label: 'Irrigation Controller' },
      { value: 'outdoor_grill', label: 'Built-in Grill' },
      { value: 'outdoor_refrigerator', label: 'Outdoor Refrigerator' },
      { value: 'boat_lift', label: 'Boat Lift' },
      { value: 'landscape_lighting', label: 'Landscape Lighting System' },
    ],
  },
  safety: {
    label: 'Safety & Security',
    icon: 'Shield',
    types: [
      { value: 'smoke_detector', label: 'Smoke Detector' },
      { value: 'co_detector', label: 'CO Detector' },
      { value: 'fire_extinguisher', label: 'Fire Extinguisher' },
      { value: 'security_panel', label: 'Security Panel' },
      { value: 'security_cameras', label: 'Security Camera System' },
    ],
  },
  specialty: {
    label: 'Specialty Systems',
    icon: 'Cog',
    types: [
      { value: 'elevator', label: 'Residential Elevator' },
      { value: 'central_vacuum', label: 'Central Vacuum System' },
      { value: 'whole_home_audio', label: 'Whole-Home Audio' },
      { value: 'motorized_shades', label: 'Motorized Shades' },
      { value: 'garage_door_opener', label: 'Garage Door Opener' },
    ],
  },
} as const

/**
 * Type for equipment category keys
 */
export type EquipmentCategory = keyof typeof EQUIPMENT_CATEGORIES

/**
 * Type for equipment type within a category
 */
export type EquipmentType =
  (typeof EQUIPMENT_CATEGORIES)[EquipmentCategory]['types'][number]['value']

/**
 * Fuel types for equipment that uses fuel
 */
export const FUEL_TYPES = [
  { value: 'electric', label: 'Electric' },
  { value: 'natural_gas', label: 'Natural Gas' },
  { value: 'propane', label: 'Propane' },
  { value: 'solar', label: 'Solar' },
  { value: 'na', label: 'N/A' },
] as const

/**
 * Common HVAC filter sizes
 */
export const COMMON_FILTER_SIZES = [
  '14x20x1',
  '14x25x1',
  '16x20x1',
  '16x25x1',
  '18x24x1',
  '20x20x1',
  '20x24x1',
  '20x25x1',
  '20x25x4',
  '20x25x5',
] as const
