import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const preferred = searchParams.get('preferred')

  let query = supabase
    .from('pm_vendors')
    .select(`
      *,
      rates:pm_vendor_rates(*)
    `)
    .eq('is_active', true)
    .order('is_preferred', { ascending: false })
    .order('name')

  if (category) {
    query = query.contains('service_categories', [category])
  }

  if (preferred === 'true') {
    query = query.eq('is_preferred', true)
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
    .from('pm_vendors')
    .insert({
      name: body.name,
      company: body.company,
      email: body.email,
      phone: body.phone,
      service_categories: body.service_categories || [],
      notes: body.notes,
      is_preferred: body.is_preferred ?? false
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
