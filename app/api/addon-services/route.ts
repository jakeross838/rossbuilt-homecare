import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const propertyId = searchParams.get('property_id')

  let query = supabase
    .from('pm_addon_services')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('name')

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If property_id provided, also fetch active subscriptions
  if (propertyId && data) {
    const { data: subscriptions } = await supabase
      .from('pm_property_addons')
      .select('addon_id, start_date, end_date, is_active')
      .eq('property_id', propertyId)
      .eq('is_active', true)

    const subMap = new Map(
      subscriptions?.map(s => [s.addon_id, s]) || []
    )

    const enrichedData = data.map(addon => ({
      ...addon,
      subscription: subMap.get(addon.id) || null
    }))

    return NextResponse.json(enrichedData)
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('pm_addon_services')
    .insert({
      name: body.name,
      description: body.description,
      price: body.price,
      price_large: body.price_large,
      price_type: body.price_type || 'flat',
      category: body.category,
      included_in_tiers: body.included_in_tiers
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
    .from('pm_addon_services')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// Subscribe a property to an add-on
export async function PUT(request: Request) {
  const body = await request.json()
  const { property_id, addon_id, action } = body

  if (!property_id || !addon_id) {
    return NextResponse.json({ error: 'property_id and addon_id are required' }, { status: 400 })
  }

  if (action === 'unsubscribe') {
    const { error } = await supabase
      .from('pm_property_addons')
      .update({ is_active: false, end_date: new Date().toISOString().split('T')[0] })
      .eq('property_id', property_id)
      .eq('addon_id', addon_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  // Subscribe
  const { data, error } = await supabase
    .from('pm_property_addons')
    .upsert({
      property_id,
      addon_id,
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
      end_date: null
    }, {
      onConflict: 'property_id,addon_id'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
