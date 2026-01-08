import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('pm_service_plans')
    .select(`
      *,
      services:pm_plan_services(
        id,
        included_quantity,
        frequency_override,
        service:pm_services(*)
      )
    `)
    .eq('is_active', true)
    .order('tier_level')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('pm_service_plans')
    .insert({
      name: body.name,
      tier_level: body.tier_level,
      description: body.description,
      monthly_base_price: body.monthly_base_price,
      inspection_frequency: body.inspection_frequency,
      features: body.features || []
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
