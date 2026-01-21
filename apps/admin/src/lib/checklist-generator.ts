/**
 * Checklist generation engine
 * Generates dynamic inspection checklists based on property profile, program tier, and equipment
 */

import type {
  GeneratedChecklist,
  ChecklistItem,
  ChecklistSection,
  InspectionTierKey,
  TieredTemplate,
} from './types/inspection'

import {
  BASE_EXTERIOR_TEMPLATE,
  BASE_INTERIOR_TEMPLATE,
  HVAC_TEMPLATE,
  POOL_TEMPLATE,
  GENERATOR_TEMPLATE,
  TEMPLATE_CATEGORY_LABELS,
  getTiersToInclude,
} from './constants/inspection-templates'

import type { PropertyFeatures } from './validations/property'
import type { Tables } from './supabase'

type Equipment = Tables<'equipment'>

/**
 * Parameters for generating a checklist
 */
export interface GenerateChecklistParams {
  property: {
    id: string
    square_footage: number | null
    features: PropertyFeatures | null
  }
  program: {
    id: string
    inspection_tier: string
  }
  equipment: Equipment[]
}

/**
 * Get display label for a category
 */
function getCategoryLabel(category: string): string {
  return TEMPLATE_CATEGORY_LABELS[category] || category
}

/**
 * Calculate estimated inspection duration based on property characteristics and tier
 */
function calculateDuration(
  property: GenerateChecklistParams['property'],
  tier: string
): number {
  const baseTimes: Record<string, number> = {
    visual: 30,
    functional: 60,
    comprehensive: 120,
    preventative: 180,
  }

  let duration = baseTimes[tier] || 60

  // Add time for square footage
  if (property.square_footage) {
    const sqftFactor: Record<string, number> = {
      visual: 5,
      functional: 10,
      comprehensive: 15,
      preventative: 20,
    }
    duration += Math.ceil(property.square_footage / 1000) * (sqftFactor[tier] || 10)
  }

  // Add time for features
  const features = property.features
  if (features?.pool) duration += tier === 'preventative' ? 35 : 15
  if (features?.generator) duration += 15
  if (features?.dock) duration += 15

  return duration
}

/**
 * Convert template items to checklist items with defaults
 * Output format matches inspector UI expectations (label, item_type)
 */
function templateToChecklistItems(
  template: TieredTemplate,
  tiers: string[]
): ChecklistItem[] {
  return tiers.flatMap((t) => {
    const tierItems = template[t as InspectionTierKey] || []
    return tierItems.map((item) => ({
      id: item.id,
      text: item.text,
      // Also include 'label' for inspector UI compatibility
      label: item.text,
      type: item.type || 'status',
      // Also include 'item_type' for inspector UI compatibility
      item_type: (item.type || 'status') === 'status' ? 'boolean' : (item.type || 'boolean'),
      options: item.options,
      photo_required: item.photo_required || false,
      photo_recommended: item.photo_recommended || false,
      help_text: item.help_text,
      recommendation_template_key: item.recommendation_template_key,
      required: false,
    }))
  })
}

/**
 * Extract equipment-specific checklist items from AI-generated inspection_checklist
 * Output format matches inspector UI expectations (label, item_type)
 */
function getEquipmentChecklistItems(
  equipment: Equipment,
  tiers: string[]
): ChecklistItem[] {
  const items: ChecklistItem[] = []
  const checklist = equipment.inspection_checklist as Record<string, string[]> | null

  if (!checklist) return items

  tiers.forEach((tier) => {
    const tierItems = checklist[tier] || []
    tierItems.forEach((text: string, idx: number) => {
      const itemText = `${equipment.custom_name || equipment.equipment_type}: ${text}`
      items.push({
        id: `${equipment.id}_${tier}_${idx}`,
        text: itemText,
        label: itemText, // For inspector UI compatibility
        type: 'status',
        item_type: 'boolean', // For inspector UI compatibility
        photo_required: false,
        photo_recommended: false,
        equipment_id: equipment.id,
        required: false,
      })
    })
  })

  return items
}

/**
 * Main checklist generation function
 * Generates a complete inspection checklist based on property, program, and equipment
 */
export function generateChecklist(params: GenerateChecklistParams): GeneratedChecklist {
  const { property, program, equipment } = params
  const tier = program.inspection_tier
  const tiers = getTiersToInclude(tier)
  const sections: ChecklistSection[] = []
  let sectionOrder = 1

  // 1. Add base exterior items
  const exteriorItems = templateToChecklistItems(BASE_EXTERIOR_TEMPLATE, tiers)
  if (exteriorItems.length > 0) {
    sections.push({
      id: 'exterior',
      name: 'Exterior',
      title: 'Exterior', // For inspector UI compatibility
      order: sectionOrder++,
      items: exteriorItems,
    })
  }

  // 2. Add base interior items
  const interiorItems = templateToChecklistItems(BASE_INTERIOR_TEMPLATE, tiers)
  if (interiorItems.length > 0) {
    sections.push({
      id: 'interior',
      name: 'Interior',
      title: 'Interior', // For inspector UI compatibility
      order: sectionOrder++,
      items: interiorItems,
    })
  }

  // 3. Add HVAC section if property has HVAC equipment
  const hvacEquipment = equipment.filter((e) => e.category === 'hvac')
  if (hvacEquipment.length > 0) {
    const hvacItems = templateToChecklistItems(HVAC_TEMPLATE, tiers)

    // Add equipment-specific items from AI-generated checklists
    hvacEquipment.forEach((equip) => {
      hvacItems.push(...getEquipmentChecklistItems(equip, tiers))
    })

    if (hvacItems.length > 0) {
      sections.push({
        id: 'hvac',
        name: 'HVAC Systems',
        title: 'HVAC Systems', // For inspector UI compatibility
        order: sectionOrder++,
        items: hvacItems,
      })
    }
  }

  // 4. Add Pool section if property has pool feature
  if (property.features?.pool) {
    const poolItems = templateToChecklistItems(POOL_TEMPLATE, tiers)

    // Add pool equipment-specific items
    const poolEquipment = equipment.filter((e) => e.category === 'pool_spa')
    poolEquipment.forEach((equip) => {
      poolItems.push(...getEquipmentChecklistItems(equip, tiers))
    })

    if (poolItems.length > 0) {
      sections.push({
        id: 'pool',
        name: 'Pool & Spa',
        title: 'Pool & Spa', // For inspector UI compatibility
        order: sectionOrder++,
        items: poolItems,
      })
    }
  }

  // 5. Add Generator section if property has generator feature
  if (property.features?.generator) {
    const genItems = templateToChecklistItems(GENERATOR_TEMPLATE, tiers)

    // Add generator equipment-specific items
    const genEquipment = equipment.filter((e) => e.category === 'electrical')
    genEquipment.forEach((equip) => {
      // Only include generator-type equipment
      if (equip.equipment_type?.toLowerCase().includes('generator')) {
        genItems.push(...getEquipmentChecklistItems(equip, tiers))
      }
    })

    if (genItems.length > 0) {
      sections.push({
        id: 'generator',
        name: 'Generator',
        title: 'Generator', // For inspector UI compatibility
        order: sectionOrder++,
        items: genItems,
      })
    }
  }

  // 6. Add remaining equipment categories
  const otherCategories = [
    'plumbing',
    'electrical',
    'kitchen',
    'laundry',
    'outdoor',
    'safety',
    'specialty',
  ]

  otherCategories.forEach((category) => {
    // Skip electrical generators as they're handled in generator section
    const categoryEquipment = equipment.filter((e) => {
      if (e.category !== category) return false
      // Skip generators from electrical section if generator section exists
      if (
        category === 'electrical' &&
        property.features?.generator &&
        e.equipment_type?.toLowerCase().includes('generator')
      ) {
        return false
      }
      return true
    })

    if (categoryEquipment.length > 0) {
      const categoryItems: ChecklistItem[] = []

      categoryEquipment.forEach((equip) => {
        categoryItems.push(...getEquipmentChecklistItems(equip, tiers))
      })

      if (categoryItems.length > 0) {
        const categoryLabel = getCategoryLabel(category)
        sections.push({
          id: category,
          name: categoryLabel,
          title: categoryLabel, // For inspector UI compatibility
          order: sectionOrder++,
          items: categoryItems,
        })
      }
    }
  })

  // Calculate totals
  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0)
  const estimatedDuration = calculateDuration(property, tier)

  return {
    sections: sections.sort((a, b) => a.order - b.order),
    generated_at: new Date().toISOString(),
    property_id: property.id,
    program_id: program.id,
    tier,
    template_versions: { base: 1 },
    total_items: totalItems,
    estimated_duration_minutes: estimatedDuration,
  }
}
