import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { notifyVisitScheduled } from '@/lib/notifications'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const property_id = searchParams.get('property_id')
  const client_id = searchParams.get('client_id')
  const status = searchParams.get('status')
  const upcoming = searchParams.get('upcoming')

  let query = supabase
    .from('pm_owner_visits')
    .select(`
      *,
      property:pm_properties(id, name, address, city, state),
      client:pm_clients(id, name, email)
    `)
    .order('arrival_date', { ascending: true })

  if (property_id) {
    query = query.eq('property_id', property_id)
  }
  if (client_id) {
    query = query.eq('client_id', client_id)
  }
  if (status) {
    query = query.eq('status', status)
  }
  if (upcoming === 'true') {
    const today = new Date().toISOString().split('T')[0]
    query = query.gte('arrival_date', today)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.property_id || !body.arrival_date) {
    return NextResponse.json({ error: 'Property ID and arrival date are required' }, { status: 400 })
  }

  // Verify this property has Premier Protection (tier 3) or Estate Management (tier 4)
  const { data: property, error: propError } = await supabase
    .from('pm_properties')
    .select(`
      id,
      current_plan_id,
      client_id,
      current_plan:pm_service_plans(id, tier_level, name)
    `)
    .eq('id', body.property_id)
    .single()

  if (propError || !property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  // Handle Supabase join which can return array or object
  const planData = Array.isArray(property.current_plan)
    ? property.current_plan[0]
    : property.current_plan
  const plan = planData as { id: string; tier_level: number; name: string } | null
  if (!plan || plan.tier_level < 3) {
    return NextResponse.json({
      error: 'Owner visit scheduling is only available for Premier Protection and Estate Management tiers'
    }, { status: 403 })
  }

  // Create the visit record
  const { data, error } = await supabase
    .from('pm_owner_visits')
    .insert({
      property_id: body.property_id,
      client_id: body.client_id || property.client_id,
      arrival_date: body.arrival_date,
      departure_date: body.departure_date || null,
      special_requests: body.special_requests || null,
      status: 'scheduled'
    })
    .select(`
      *,
      property:pm_properties(id, name, address),
      client:pm_clients(id, name, email)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send confirmation notification to client
  const clientId = data.client_id || property.client_id
  if (clientId) {
    notifyVisitScheduled(
      clientId,
      body.property_id,
      data.property?.name || 'Your property',
      new Date(body.arrival_date).toLocaleDateString(),
      body.special_requests
    ).catch(err => console.error('Failed to send visit notification:', err))
  }

  return NextResponse.json(data, { status: 201 })
}
