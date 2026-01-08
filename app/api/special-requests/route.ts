import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const property_id = searchParams.get('property_id')
  const status = searchParams.get('status')

  let query = supabase
    .from('pm_special_requests')
    .select(`
      *,
      property:pm_properties(id, name),
      unit:pm_units(id, unit_number),
      tenant:pm_tenants(id, name, email)
    `)
    .order('created_at', { ascending: false })

  if (property_id) {
    query = query.eq('property_id', property_id)
  }
  if (status) {
    query = query.eq('status', status)
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
    .from('pm_special_requests')
    .insert({
      property_id: body.property_id,
      unit_id: body.unit_id || null,
      tenant_id: body.tenant_id || null,
      title: body.title,
      description: body.description || null
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
