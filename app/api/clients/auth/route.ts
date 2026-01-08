import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyPassword, isHashedPassword, hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.email || !body.password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('pm_clients')
    .select(`
      *,
      properties:pm_properties(
        id, name, address, city, state, zip, type,
        current_plan:pm_service_plans(id, tier_level, name)
      )
    `)
    .eq('email', body.email.toLowerCase())
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Verify password using bcrypt (with fallback for legacy plain text)
  const passwordValid = await verifyPassword(body.password, data.password_hash)
  if (!passwordValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // If password was stored as plain text, upgrade to hashed version
  if (!isHashedPassword(data.password_hash)) {
    const hashedPassword = await hashPassword(body.password)
    await supabase
      .from('pm_clients')
      .update({ password_hash: hashedPassword })
      .eq('id', data.id)
  }

  const { password_hash, ...safeData } = data
  return NextResponse.json(safeData)
}
