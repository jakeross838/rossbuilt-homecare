import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const property_id = searchParams.get('property_id')

  let query = supabase
    .from('pm_units')
    .select(`
      *,
      property:pm_properties(id, name),
      tenant:pm_tenants(id, name, email, status)
    `)
    .order('unit_number', { ascending: true })

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
    .from('pm_units')
    .insert({
      property_id: body.property_id,
      unit_number: body.unit_number,
      bedrooms: body.bedrooms || 0,
      bathrooms: body.bathrooms || 1,
      sqft: body.sqft || 0,
      status: body.status || 'vacant'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
