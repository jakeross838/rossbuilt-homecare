import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const property_id = searchParams.get('property_id')

  let query = supabase
    .from('pm_checklist_templates')
    .select(`
      *,
      property:pm_properties(id, name)
    `)
    .eq('is_active', true)
    .order('frequency')

  if (property_id) {
    query = query.eq('property_id', property_id)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('pm_checklist_templates')
    .insert({
      property_id: body.property_id,
      name: body.name,
      frequency: body.frequency,
      items: body.items || []
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
