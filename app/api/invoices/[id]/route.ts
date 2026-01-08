import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { notifyInvoiceSent } from '@/lib/notifications'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabase
    .from('pm_invoices')
    .select(`
      *,
      property:pm_properties(id, name, address, city, state, zip),
      client:pm_clients(id, name, email, phone),
      items:pm_invoice_items(*)
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

  if (body.status !== undefined) updates.status = body.status
  if (body.due_date !== undefined) updates.due_date = body.due_date
  if (body.paid_date !== undefined) updates.paid_date = body.paid_date
  if (body.notes !== undefined) updates.notes = body.notes
  if (body.subtotal !== undefined) updates.subtotal = body.subtotal
  if (body.tax !== undefined) updates.tax = body.tax
  if (body.total !== undefined) updates.total = body.total

  // If marking as paid, set the paid_date
  if (body.status === 'paid' && !body.paid_date) {
    updates.paid_date = new Date().toISOString().split('T')[0]
  }

  // Get current status to check for changes
  const { data: currentInvoice } = await supabase
    .from('pm_invoices')
    .select('status')
    .eq('id', id)
    .single()

  const oldStatus = currentInvoice?.status

  const { data, error } = await supabase
    .from('pm_invoices')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      property:pm_properties(id, name, address),
      client:pm_clients(id, name, email),
      items:pm_invoice_items(*)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send notification when invoice is sent to client
  if (body.status === 'sent' && oldStatus !== 'sent' && data.client_id) {
    notifyInvoiceSent(
      data.client_id,
      data.property_id,
      data.invoice_number || `INV-${id.substring(0, 8)}`,
      data.total || 0,
      data.due_date
    ).catch(err => console.error('Failed to send invoice notification:', err))
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Items will cascade delete
  const { error } = await supabase
    .from('pm_invoices')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
