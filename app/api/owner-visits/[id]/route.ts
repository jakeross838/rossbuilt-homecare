import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabase
    .from('pm_owner_visits')
    .select(`
      *,
      property:pm_properties(id, name, address, city, state),
      client:pm_clients(id, name, email)
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

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }

  if (body.arrival_date !== undefined) updates.arrival_date = body.arrival_date
  if (body.departure_date !== undefined) updates.departure_date = body.departure_date
  if (body.special_requests !== undefined) updates.special_requests = body.special_requests
  if (body.status !== undefined) updates.status = body.status
  if (body.pre_arrival_notes !== undefined) updates.pre_arrival_notes = body.pre_arrival_notes
  if (body.post_departure_notes !== undefined) updates.post_departure_notes = body.post_departure_notes
  if (body.pre_arrival_checklist_id !== undefined) updates.pre_arrival_checklist_id = body.pre_arrival_checklist_id
  if (body.post_departure_checklist_id !== undefined) updates.post_departure_checklist_id = body.post_departure_checklist_id

  const { data, error } = await supabase
    .from('pm_owner_visits')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      property:pm_properties(id, name, address),
      client:pm_clients(id, name, email)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await supabase
    .from('pm_owner_visits')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
