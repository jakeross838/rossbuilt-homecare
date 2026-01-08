import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendNotification, NotificationType } from '@/lib/notifications'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const client_id = searchParams.get('client_id')
  const property_id = searchParams.get('property_id')
  const type = searchParams.get('type')
  const limit = parseInt(searchParams.get('limit') || '50')

  let query = supabase
    .from('pm_notifications')
    .select(`
      *,
      client:pm_clients(id, name, email),
      property:pm_properties(id, name)
    `)
    .order('sent_at', { ascending: false })
    .limit(limit)

  if (client_id) {
    query = query.eq('client_id', client_id)
  }
  if (property_id) {
    query = query.eq('property_id', property_id)
  }
  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.client_id || !body.type || !body.subject || !body.body) {
    return NextResponse.json(
      { error: 'client_id, type, subject, and body are required' },
      { status: 400 }
    )
  }

  const result = await sendNotification({
    clientId: body.client_id,
    propertyId: body.property_id,
    type: body.type as NotificationType,
    subject: body.subject,
    body: body.body,
    metadata: body.metadata
  })

  if (!result.success) {
    return NextResponse.json(
      { error: 'Failed to send notification', channels: result.channels },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: `Notification sent via: ${result.channels.join(', ')}`,
    channels: result.channels
  })
}
