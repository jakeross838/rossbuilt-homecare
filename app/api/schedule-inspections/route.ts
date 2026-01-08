import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Property {
  id: string
  name: string
  current_plan_id: string | null
  next_inspection_date: string | null
  last_inspection_date: string | null
  current_plan?: {
    id: string
    inspection_frequency: string
  } | null
}

interface ChecklistTemplate {
  id: string
  property_id: string
  frequency: string
}

// Helper to normalize Supabase join data (can be array or object)
function normalizeProperty(rawProperty: Record<string, unknown>): Property {
  const currentPlanRaw = rawProperty.current_plan
  const currentPlan = Array.isArray(currentPlanRaw) ? currentPlanRaw[0] : currentPlanRaw

  return {
    id: rawProperty.id as string,
    name: rawProperty.name as string,
    current_plan_id: rawProperty.current_plan_id as string | null,
    next_inspection_date: rawProperty.next_inspection_date as string | null,
    last_inspection_date: rawProperty.last_inspection_date as string | null,
    current_plan: currentPlan as Property['current_plan']
  }
}

/**
 * Calculate the next inspection date based on frequency
 */
function calculateNextInspectionDate(frequency: string, fromDate: Date = new Date()): Date {
  const date = new Date(fromDate)
  date.setHours(0, 0, 0, 0)

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'biweekly':
      date.setDate(date.getDate() + 14)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'quarterly':
      date.setMonth(date.getMonth() + 3)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
    default:
      date.setMonth(date.getMonth() + 1) // Default to monthly
  }

  return date
}

/**
 * GET - Get properties that need inspection scheduling
 */
export async function GET() {
  // Get properties with plans that need inspection scheduling
  const { data: properties, error } = await supabase
    .from('pm_properties')
    .select(`
      id,
      name,
      current_plan_id,
      next_inspection_date,
      last_inspection_date,
      current_plan:pm_service_plans(id, inspection_frequency)
    `)
    .not('current_plan_id', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Find properties that need scheduling
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const normalizedProperties = (properties || []).map(p => normalizeProperty(p as Record<string, unknown>))

  const needsScheduling = normalizedProperties.filter(p => {
    if (!p.next_inspection_date) return true
    const nextDate = new Date(p.next_inspection_date)
    // Schedule if next inspection is in the past or within next 7 days
    return nextDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  })

  return NextResponse.json({
    total_with_plans: properties?.length || 0,
    needs_scheduling: needsScheduling.length,
    properties: needsScheduling
  })
}

/**
 * POST - Run the inspection scheduling process
 * Creates checklist completions for properties that need inspections
 */
export async function POST() {
  const results = {
    scheduled: 0,
    errors: [] as string[],
    details: [] as { property: string; date: string }[]
  }

  try {
    // Get all properties with plans
    const { data: properties, error: propError } = await supabase
      .from('pm_properties')
      .select(`
        id,
        name,
        current_plan_id,
        next_inspection_date,
        last_inspection_date,
        current_plan:pm_service_plans(id, inspection_frequency)
      `)
      .not('current_plan_id', 'is', null)

    if (propError) {
      return NextResponse.json({ error: propError.message }, { status: 500 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const normalizedPostProperties = (properties || []).map(p => normalizeProperty(p as Record<string, unknown>))

    for (const property of normalizedPostProperties) {
      try {
        const frequency = property.current_plan?.inspection_frequency || 'monthly'

        // Get or create a checklist template for this property
        let { data: templates } = await supabase
          .from('pm_checklist_templates')
          .select('id, frequency')
          .eq('property_id', property.id)
          .eq('is_active', true)
          .limit(1)

        // If no template exists, create a default one
        if (!templates || templates.length === 0) {
          const { data: newTemplate, error: templateError } = await supabase
            .from('pm_checklist_templates')
            .insert({
              property_id: property.id,
              name: 'Property Inspection',
              frequency: frequency,
              items: [
                { name: 'Exterior condition', category: 'exterior' },
                { name: 'Entry/doors', category: 'interior' },
                { name: 'Windows', category: 'interior' },
                { name: 'HVAC running', category: 'hvac' },
                { name: 'Water fixtures', category: 'plumbing' },
                { name: 'Appliances', category: 'appliance' },
                { name: 'Smoke detectors', category: 'safety' },
                { name: 'General cleanliness', category: 'general' }
              ]
            })
            .select()
            .single()

          if (templateError) {
            results.errors.push(`${property.name}: Failed to create template - ${templateError.message}`)
            continue
          }
          templates = [newTemplate]
        }

        const template = templates[0] as ChecklistTemplate

        // Calculate next inspection date
        let nextDate: Date
        if (property.last_inspection_date) {
          nextDate = calculateNextInspectionDate(frequency, new Date(property.last_inspection_date))
          // If calculated date is in the past, schedule from today
          if (nextDate < today) {
            nextDate = calculateNextInspectionDate(frequency, today)
          }
        } else if (property.next_inspection_date) {
          const existingNext = new Date(property.next_inspection_date)
          if (existingNext > today) {
            // Already have a future scheduled date
            continue
          }
          nextDate = calculateNextInspectionDate(frequency, today)
        } else {
          // No previous inspection, schedule one week from now
          nextDate = new Date(today)
          nextDate.setDate(nextDate.getDate() + 7)
        }

        // Check if we already have a scheduled completion for this date
        const dateStr = nextDate.toISOString().split('T')[0]
        const { data: existing } = await supabase
          .from('pm_checklist_completions')
          .select('id')
          .eq('property_id', property.id)
          .eq('scheduled_date', dateStr)
          .eq('status', 'scheduled')
          .limit(1)

        if (existing && existing.length > 0) {
          // Already scheduled for this date
          continue
        }

        // Create the checklist completion
        const { error: completionError } = await supabase
          .from('pm_checklist_completions')
          .insert({
            template_id: template.id,
            property_id: property.id,
            scheduled_date: dateStr,
            status: 'scheduled'
          })

        if (completionError) {
          results.errors.push(`${property.name}: Failed to create completion - ${completionError.message}`)
          continue
        }

        // Update property's next_inspection_date
        await supabase
          .from('pm_properties')
          .update({ next_inspection_date: dateStr })
          .eq('id', property.id)

        results.scheduled++
        results.details.push({ property: property.name, date: dateStr })

      } catch (err) {
        results.errors.push(`${property.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json(results)

  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Scheduling failed',
      results
    }, { status: 500 })
  }
}
