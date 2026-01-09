import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const property_id = searchParams.get('property_id')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100
  const offset = (page - 1) * limit

  // Build base query for counting (exclude soft-deleted)
  let countQuery = supabase
    .from('pm_work_orders')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Build data query (exclude soft-deleted)
  let query = supabase
    .from('pm_work_orders')
    .select(`
      *,
      property:pm_properties(id, name, address),
      unit:pm_units(id, unit_number),
      tenant:pm_tenants(id, name, email)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters to both queries
  if (status && status !== 'all') {
    query = query.eq('status', status)
    countQuery = countQuery.eq('status', status)
  }
  if (priority && priority !== 'all') {
    query = query.eq('priority', priority)
    countQuery = countQuery.eq('priority', priority)
  }
  if (property_id) {
    query = query.eq('property_id', property_id)
    countQuery = countQuery.eq('property_id', property_id)
  }

  const [{ data, error }, { count }] = await Promise.all([query, countQuery])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}

// Valid values for validation
const VALID_CATEGORIES = ['plumbing', 'electrical', 'hvac', 'appliance', 'general']
const VALID_PRIORITIES = ['low', 'medium', 'high', 'emergency']
const VALID_SOURCES = ['tenant_request', 'inspection', 'admin', 'checklist', 'client_request']

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate required fields
  if (!body.property_id) {
    return NextResponse.json({ error: 'property_id is required' }, { status: 400 })
  }
  if (!body.title || body.title.trim().length === 0) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  // Validate category if provided
  const category = body.category || 'general'
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 })
  }

  // Validate priority if provided
  const priority = body.priority || 'medium'
  if (!VALID_PRIORITIES.includes(priority)) {
    return NextResponse.json({ error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` }, { status: 400 })
  }

  // Validate source if provided
  const source = body.source || 'admin'
  if (!VALID_SOURCES.includes(source)) {
    return NextResponse.json({ error: `Invalid source. Must be one of: ${VALID_SOURCES.join(', ')}` }, { status: 400 })
  }

  // Determine management type based on property's service tier
  // Tier 1 (Essential) = client_coordinated (we report, they fix)
  // Tier 2+ (Premium/Luxury) = managed (we coordinate repairs)
  let managementType = 'managed' // Default to managed

  const { data: property } = await supabase
    .from('pm_properties')
    .select('id, current_plan:pm_service_plans(tier_level)')
    .eq('id', body.property_id)
    .single()

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  if (property.current_plan) {
    const plan = Array.isArray(property.current_plan)
      ? property.current_plan[0]
      : property.current_plan
    const tierLevel = (plan as { tier_level?: number })?.tier_level || 0
    managementType = tierLevel === 1 ? 'client_coordinated' : 'managed'
  }

  const { data, error } = await supabase
    .from('pm_work_orders')
    .insert({
      property_id: body.property_id,
      unit_id: body.unit_id || null,
      tenant_id: body.tenant_id || null,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      category,
      priority,
      status: 'new',
      source,
      assigned_to: body.assigned_to || null,
      scheduled_date: body.scheduled_date || null,
      notes: body.notes?.trim() || null,
      management_type: managementType
    })
    .select(`
      *,
      property:pm_properties(id, name, address),
      unit:pm_units(id, unit_number),
      tenant:pm_tenants(id, name, email)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  await supabase.from('pm_work_order_activity').insert({
    work_order_id: data.id,
    action: 'created',
    details: `Work order created: ${body.title}`,
    created_by: 'Admin'
  })

  return NextResponse.json(data, { status: 201 })
}
