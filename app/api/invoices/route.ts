import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const client_id = searchParams.get('client_id')
  const property_id = searchParams.get('property_id')
  const status = searchParams.get('status')

  let query = supabase
    .from('pm_invoices')
    .select(`
      *,
      property:pm_properties(id, name, address),
      client:pm_clients(id, name, email),
      items:pm_invoice_items(*)
    `)
    .order('created_at', { ascending: false })

  if (client_id) {
    query = query.eq('client_id', client_id)
  }
  if (property_id) {
    query = query.eq('property_id', property_id)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.property_id || !body.client_id) {
    return NextResponse.json({ error: 'Property ID and Client ID are required' }, { status: 400 })
  }

  // Create the invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('pm_invoices')
    .insert({
      property_id: body.property_id,
      client_id: body.client_id,
      period_start: body.period_start || null,
      period_end: body.period_end || null,
      due_date: body.due_date || null,
      notes: body.notes || null,
      status: 'draft'
    })
    .select()
    .single()

  if (invoiceError) {
    return NextResponse.json({ error: invoiceError.message }, { status: 500 })
  }

  // If items are provided, create them
  if (body.items && Array.isArray(body.items) && body.items.length > 0) {
    const items = body.items.map((item: {
      description: string
      work_order_id?: string
      quantity?: number
      unit_price: number
      item_type?: string
    }) => ({
      invoice_id: invoice.id,
      description: item.description,
      work_order_id: item.work_order_id || null,
      quantity: item.quantity || 1,
      unit_price: item.unit_price,
      total: (item.quantity || 1) * item.unit_price,
      item_type: item.item_type || 'service'
    }))

    await supabase.from('pm_invoice_items').insert(items)

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: { total: number }) => sum + item.total, 0)
    const tax = body.tax_rate ? subtotal * (body.tax_rate / 100) : 0
    const total = subtotal + tax

    // Update invoice totals
    await supabase
      .from('pm_invoices')
      .update({ subtotal, tax, total })
      .eq('id', invoice.id)
  }

  // Fetch complete invoice with items
  const { data, error } = await supabase
    .from('pm_invoices')
    .select(`
      *,
      property:pm_properties(id, name, address),
      client:pm_clients(id, name, email),
      items:pm_invoice_items(*)
    `)
    .eq('id', invoice.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
