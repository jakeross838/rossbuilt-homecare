import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('pm_tenants')
    .select('*, unit:pm_units(unit_number, property:pm_properties(name))')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('pm_tenants')
    .insert({
      unit_id: body.unit_id || null,
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      lease_start: body.lease_start || null,
      lease_end: body.lease_end || null
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}