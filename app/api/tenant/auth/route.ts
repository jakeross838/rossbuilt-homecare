import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()
  const { email, access_code } = body

  if (!email || !access_code) {
    return NextResponse.json(
      { error: 'Email and access code are required' },
      { status: 400 }
    )
  }

  const { data: tenant, error } = await supabase
    .from('pm_tenants')
    .select(`
      id, name, email, phone, status,
      unit:pm_units(
        id, unit_number,
        property:pm_properties(id, name, address)
      )
    `)
    .eq('email', email.toLowerCase())
    .eq('access_code', access_code)
    .eq('status', 'active')
    .single()

  if (error || !tenant) {
    return NextResponse.json(
      { error: 'Invalid email or access code' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    tenant: {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      unit: tenant.unit
    }
  })
}
