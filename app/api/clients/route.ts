import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'

export async function GET() {
  const { data, error } = await supabase
    .from('pm_clients')
    .select(`
      *,
      properties:pm_properties(count)
    `)
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Remove password_hash from response
  const safeData = data.map(({ password_hash, ...client }) => client)
  return NextResponse.json(safeData)
}

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.name || !body.email || !body.password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
  }

  // Hash the password using bcrypt
  const hashedPassword = await hashPassword(body.password)

  const { data, error } = await supabase
    .from('pm_clients')
    .insert({
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone || null,
      password_hash: hashedPassword
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { password_hash, ...safeData } = data
  return NextResponse.json(safeData, { status: 201 })
}
