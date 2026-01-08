import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { notifyWorkOrderUpdate } from '@/lib/notifications'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabase
    .from('pm_work_orders')
    .select(`
      *,
      property:pm_properties(id, name, address),
      unit:pm_units(id, unit_number),
      tenant:pm_tenants(id, name, email, phone)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  // Get current work order to check for status changes
  const { data: currentWO } = await supabase
    .from('pm_work_orders')
    .select('status, title, property_id')
    .eq('id', id)
    .single()

  const oldStatus = currentWO?.status

  // Build update object with only provided fields
  const updates: Record<string, unknown> = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description
  if (body.category !== undefined) updates.category = body.category
  if (body.priority !== undefined) updates.priority = body.priority
  if (body.status !== undefined) updates.status = body.status
  if (body.assigned_to !== undefined) updates.assigned_to = body.assigned_to
  if (body.scheduled_date !== undefined) updates.scheduled_date = body.scheduled_date
  if (body.notes !== undefined) updates.notes = body.notes

  // Handle completion
  if (body.status === 'completed' && !body.completed_at) {
    updates.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('pm_work_orders')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      property:pm_properties(id, name, address, client_id),
      unit:pm_units(id, unit_number),
      tenant:pm_tenants(id, name, email)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  const changes = Object.keys(updates).join(', ')
  await supabase.from('pm_work_order_activity').insert({
    work_order_id: id,
    action: 'updated',
    details: `Updated: ${changes}`,
    created_by: 'Admin'
  })

  // Send notification if status changed
  if (body.status && body.status !== oldStatus && data.property?.client_id) {
    notifyWorkOrderUpdate(
      data.property.client_id,
      data.property_id,
      data.title,
      body.status,
      body.notes
    ).catch(err => console.error('Failed to send work order notification:', err))
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await supabase
    .from('pm_work_orders')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
