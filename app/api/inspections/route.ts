import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('pm_inspections')
    .select('*, property:pm_properties(name), unit:pm_units(unit_number)')
    .order('scheduled_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('pm_inspections')
    .insert({
      property_id: body.property_id,
      unit_id: body.unit_id || null,
      type: body.type || 'routine',
      scheduled_date: body.scheduled_date,
      inspector: body.inspector || process.env.DEFAULT_INSPECTOR || 'Admin',
      status: 'scheduled',
      notes: body.notes || null
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}