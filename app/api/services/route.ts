import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const isAddOn = searchParams.get('is_add_on')

  let query = supabase
    .from('pm_services')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('name')

  if (category) {
    query = query.eq('category', category)
  }

  if (isAddOn !== null) {
    query = query.eq('is_add_on', isAddOn === 'true')
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
    .from('pm_services')
    .insert({
      name: body.name,
      category: body.category,
      description: body.description,
      default_frequency: body.default_frequency,
      estimated_duration_minutes: body.estimated_duration_minutes,
      requires_vendor: body.requires_vendor ?? true,
      is_add_on: body.is_add_on ?? false,
      billing_type: body.billing_type ?? 'managed_markup',
      materials_billable: body.materials_billable ?? false
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
