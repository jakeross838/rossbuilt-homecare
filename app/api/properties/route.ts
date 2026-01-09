import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('pm_properties')
    .select(`
      *,
      units:pm_units(count),
      client:pm_clients(id, name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('pm_properties')
    .insert({
      name: body.name,
      address: body.address,
      city: body.city,
      state: body.state,
      zip: body.zip,
      type: body.type || 'residential',
      client_id: body.client_id || null,
      sqft: body.sqft ? parseInt(body.sqft) : null
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
