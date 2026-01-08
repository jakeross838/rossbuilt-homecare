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
  const body = await request.json()

  // First, deactivate any existing active plan for this property
  if (body.property_id) {
    await supabase
      .from('pm_property_plans')
      .update({ is_active: false, end_date: new Date().toISOString().split('T')[0] })
      .eq('property_id', body.property_id)
      .eq('is_active', true)
  }

  // Create new property plan
  const { data, error } = await supabase
    .from('pm_property_plans')
    .insert({
      property_id: body.property_id,
      plan_id: body.plan_id,
      start_date: body.start_date || new Date().toISOString().split('T')[0],
      monthly_rate: body.monthly_rate,
      notes: body.notes
    })
    .select(`
      *,
      plan:pm_service_plans(*)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update property's current_plan_id
  await supabase
    .from('pm_properties')
    .update({ current_plan_id: body.plan_id })
    .eq('id', body.property_id)

  return NextResponse.json(data, { status: 201 })
}
