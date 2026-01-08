import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const property_id = searchParams.get('property_id')

  let query = supabase
    .from('pm_work_orders')
    .select(`
      *,
      property:pm_properties(id, name, address),
      unit:pm_units(id, unit_number),
      tenant:pm_tenants(id, name, email)
    `)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (priority && priority !== 'all') {
    query = query.eq('priority', priority)
  }
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
    .from('pm_work_orders')
    .insert({
      property_id: body.property_id,
      unit_id: body.unit_id || null,
      tenant_id: body.tenant_id || null,
      title: body.title,
      description: body.description || null,
      category: body.category || 'general',
      priority: body.priority || 'medium',
      status: 'new',
      source: body.source || 'admin',
      assigned_to: body.assigned_to || null,
      scheduled_date: body.scheduled_date || null,
      notes: body.notes || null
    })
    .select(`
      *,
      property:pm_properties(id, name, address),
      unit:pm_units(id, unit_number),
      tenant:pm_tenants(id, name, email)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  await supabase.from('pm_work_order_activity').insert({
    work_order_id: data.id,
    action: 'created',
    details: `Work order created: ${body.title}`,
    created_by: 'Admin'
  })

  return NextResponse.json(data, { status: 201 })
}
