import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tenant_id = searchParams.get('tenant_id')

  if (!tenant_id) {
    return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('pm_work_orders')
    .select(`
      id, title, description, category, priority, status,
      created_at, scheduled_date, completed_at,
      property:pm_properties(name),
      unit:pm_units(unit_number)
    `)
    .eq('tenant_id', tenant_id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { tenant_id, property_id, unit_id, title, description, category, priority } = body

  if (!tenant_id || !property_id || !title) {
    return NextResponse.json(
      { error: 'Tenant ID, property ID, and title are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('pm_work_orders')
    .insert({
      property_id,
      unit_id: unit_id || null,
      tenant_id,
      title,
      description: description || null,
      category: category || 'general',
      priority: priority || 'medium',
      status: 'new',
      source: 'tenant_request'
    })
    .select(`
      id, title, description, category, priority, status, created_at,
      property:pm_properties(name),
      unit:pm_units(unit_number)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  await supabase.from('pm_work_order_activity').insert({
    work_order_id: data.id,
    action: 'created',
    details: `Tenant submitted request: ${title}`,
    created_by: 'Tenant'
  })

  return NextResponse.json(data, { status: 201 })
}
