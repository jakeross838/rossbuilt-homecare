import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const property_id = searchParams.get('property_id')
  const status = searchParams.get('status')
  const from_date = searchParams.get('from')
  const to_date = searchParams.get('to')

  let query = supabase
    .from('pm_checklist_completions')
    .select(`
      *,
      template:pm_checklist_templates(id, name, frequency, items),
      property:pm_properties(id, name)
    `)
    .order('scheduled_date', { ascending: true })

  if (property_id) {
    query = query.eq('property_id', property_id)
  }
  if (status) {
    query = query.eq('status', status)
  }
  if (from_date) {
    query = query.gte('scheduled_date', from_date)
  }
  if (to_date) {
    query = query.lte('scheduled_date', to_date)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  // First, get the template to copy items
  let items = body.items // Allow passing items directly

  if (!items && body.template_id) {
    const { data: template } = await supabase
      .from('pm_checklist_templates')
      .select('items')
      .eq('id', body.template_id)
      .single()

    if (template) {
      items = template.items
    }
  }

  const { data, error } = await supabase
    .from('pm_checklist_completions')
    .insert({
      template_id: body.template_id,
      property_id: body.property_id,
      scheduled_date: body.scheduled_date,
      status: 'scheduled',
      items: items // Copy items for per-job editing
    })
    .select(`
      *,
      template:pm_checklist_templates(id, name, frequency, items)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
