import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabase
    .from('pm_clients')
    .select(`
      *,
      properties:pm_properties(id, name, address, city, state, zip, type)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  const { password_hash, ...safeData } = data
  return NextResponse.json(safeData)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updates: Record<string, unknown> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.email !== undefined) updates.email = body.email.toLowerCase()
  if (body.phone !== undefined) updates.phone = body.phone
  if (body.is_active !== undefined) updates.is_active = body.is_active

  // Hash password if provided
  if (body.password !== undefined && body.password !== '') {
    updates.password_hash = await hashPassword(body.password)
  }

  const { data, error } = await supabase
    .from('pm_clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { password_hash, ...safeData } = data
  return NextResponse.json(safeData)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await supabase
    .from('pm_clients')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
