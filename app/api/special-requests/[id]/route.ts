import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { notifyRequestResponse } from '@/lib/notifications'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabase
    .from('pm_special_requests')
    .select(`
      *,
      property:pm_properties(id, name),
      unit:pm_units(id, unit_number),
      tenant:pm_tenants(id, name, email)
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

  // Get current request to check if response is being added
  const { data: currentRequest } = await supabase
    .from('pm_special_requests')
    .select('response, title, property_id')
    .eq('id', id)
    .single()

  const hadResponse = !!currentRequest?.response

  const updates: Record<string, unknown> = {}
  if (body.status !== undefined) updates.status = body.status
  if (body.response !== undefined) updates.response = body.response
  if (body.title !== undefined) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description

  const { data, error } = await supabase
    .from('pm_special_requests')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      property:pm_properties(id, name, client_id)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send notification when a response is added
  if (body.response && !hadResponse && data.property?.client_id) {
    notifyRequestResponse(
      data.property.client_id,
      data.property_id,
      data.title,
      body.response
    ).catch(err => console.error('Failed to send request response notification:', err))
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await supabase
    .from('pm_special_requests')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
