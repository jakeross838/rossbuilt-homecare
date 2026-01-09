import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const propertyId = searchParams.get('property_id')

  let query = supabase
    .from('pm_property_plans')
    .select(`
      *,
      property:pm_properties(id, name),
      plan:pm_service_plans(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (propertyId) {
    query = query.eq('property_id', propertyId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate required fields
  if (!body.property_id) {
    return NextResponse.json({ error: 'property_id is required' }, { status: 400 })
  }
  if (!body.plan_id) {
    return NextResponse.json({ error: 'plan_id is required' }, { status: 400 })
  }

  // Verify property exists
  const { data: property, error: propError } = await supabase
    .from('pm_properties')
    .select('id, name, current_plan_id')
    .eq('id', body.property_id)
    .single()

  if (propError || !property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  // Verify plan exists
  const { data: plan, error: planError } = await supabase
    .from('pm_service_plans')
    .select('id, name, monthly_base_price')
    .eq('id', body.plan_id)
    .eq('is_active', true)
    .single()

  if (planError || !plan) {
    return NextResponse.json({ error: 'Service plan not found or inactive' }, { status: 404 })
  }

  const today = new Date().toISOString().split('T')[0]
  let newPropertyPlanId: string | null = null

  try {
    // Step 1: Create new property plan first (most critical)
    const { data: newPlan, error: insertError } = await supabase
      .from('pm_property_plans')
      .insert({
        property_id: body.property_id,
        plan_id: body.plan_id,
        start_date: body.start_date || today,
        monthly_rate: body.monthly_rate || plan.monthly_base_price,
        notes: body.notes,
        is_active: true
      })
      .select(`
        *,
        plan:pm_service_plans(*)
      `)
      .single()

    if (insertError) {
      throw new Error(`Failed to create plan assignment: ${insertError.message}`)
    }

    newPropertyPlanId = newPlan.id

    // Step 2: Deactivate old plans (after new one is created successfully)
    const { error: deactivateError } = await supabase
      .from('pm_property_plans')
      .update({ is_active: false, end_date: today })
      .eq('property_id', body.property_id)
      .eq('is_active', true)
      .neq('id', newPropertyPlanId) // Don't deactivate the one we just created

    if (deactivateError) {
      console.error('Warning: Failed to deactivate old plans:', deactivateError.message)
      // Continue anyway - the new plan is already active
    }

    // Step 3: Update property's current_plan_id
    const { error: updateError } = await supabase
      .from('pm_properties')
      .update({ current_plan_id: body.plan_id })
      .eq('id', body.property_id)

    if (updateError) {
      console.error('Warning: Failed to update property current_plan_id:', updateError.message)
      // Continue anyway - the property_plans table is the source of truth
    }

    return NextResponse.json(newPlan, { status: 201 })

  } catch (err) {
    // If we created a property plan but subsequent steps failed catastrophically,
    // try to clean it up
    if (newPropertyPlanId) {
      await supabase
        .from('pm_property_plans')
        .delete()
        .eq('id', newPropertyPlanId)
    }

    const message = err instanceof Error ? err.message : 'Failed to assign plan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
