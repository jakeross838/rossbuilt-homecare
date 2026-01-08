import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Add a service to a plan
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: planId } = await params
  const body = await request.json()

  const { data, error } = await supabase
    .from('pm_plan_services')
    .insert({
      plan_id: planId,
      service_id: body.service_id,
      included_quantity: body.included_quantity || 1,
      frequency_override: body.frequency_override
    })
    .select(`
      *,
      service:pm_services(*)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// Remove a service from a plan
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: planId } = await params
  const { searchParams } = new URL(request.url)
  const serviceId = searchParams.get('service_id')

  if (!serviceId) {
    return NextResponse.json({ error: 'service_id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('pm_plan_services')
    .delete()
    .eq('plan_id', planId)
    .eq('service_id', serviceId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
