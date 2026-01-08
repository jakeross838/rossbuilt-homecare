import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const propertyId = searchParams.get('property_id')

  let query = supabase
    .from('pm_property_addons')
    .select(`
      *,
      property:pm_properties(id, name),
      service:pm_services(*)
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

  const { data, error } = await supabase
    .from('pm_property_addons')
    .insert({
      property_id: body.property_id,
      service_id: body.service_id,
      frequency: body.frequency,
      price: body.price,
      start_date: body.start_date || new Date().toISOString().split('T')[0]
    })
    .select(`
      *,
      service:pm_services(*)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
