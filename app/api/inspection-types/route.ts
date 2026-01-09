import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const planId = searchParams.get('plan_id')

  let query = supabase
    .from('pm_inspection_types')
    .select('*')
    .eq('is_active', true)
    .order('duration_minutes')

  if (code) {
    query = query.eq('code', code)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If plan_id provided, also fetch which types are included in that plan
  if (planId && data) {
    const { data: planTypes } = await supabase
      .from('pm_plan_inspection_types')
      .select('inspection_type_id, frequency, included_count')
      .eq('plan_id', planId)

    const planTypeMap = new Map(
      planTypes?.map(pt => [pt.inspection_type_id, pt]) || []
    )

    const enrichedData = data.map(type => ({
      ...type,
      plan_inclusion: planTypeMap.get(type.id) || null
    }))

    return NextResponse.json(enrichedData)
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('pm_inspection_types')
    .insert({
      code: body.code,
      name: body.name,
      description: body.description,
      purpose: body.purpose,
      duration_minutes: body.duration_minutes,
      checklist_template: body.checklist_template || [],
      deliverables: body.deliverables || []
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('pm_inspection_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
