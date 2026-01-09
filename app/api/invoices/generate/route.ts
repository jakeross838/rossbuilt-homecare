import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface PropertyWithPlan {
  id: string
  name: string
  client_id: string
  current_plan_id: string
  client: { id: string; name: string; email: string }
  current_plan: {
    id: string
    name: string
    monthly_base_price: number
    tier_level: number
  }
}

interface WorkOrder {
  id: string
  title: string
  client_price: number | null
  vendor_cost: number | null
  property_id: string
}

/**
 * POST /api/invoices/generate
 * Generates monthly invoices for all properties with active plans
 * Also includes completed work orders that haven't been billed
 */
export async function POST(request: Request) {
  let body: {
    period_start?: string
    period_end?: string
    include_work_orders?: boolean
    property_id?: string // Optional: generate for specific property only
  } = {}

  try {
    body = await request.json()
  } catch {
    // Use defaults
  }

  const today = new Date()
  const periodStart = body.period_start || new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const periodEnd = body.period_end || new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
  const dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 15).toISOString().split('T')[0] // Due 15th of next month
  const includeWorkOrders = body.include_work_orders !== false // Default true

  const results = {
    generated: 0,
    skipped: 0,
    errors: [] as string[],
    invoices: [] as { id: string; property: string; total: number }[]
  }

  try {
    // Get all properties with active plans and clients
    let propertiesQuery = supabase
      .from('pm_properties')
      .select(`
        id,
        name,
        client_id,
        current_plan_id,
        client:pm_clients(id, name, email),
        current_plan:pm_service_plans(id, name, monthly_base_price, tier_level)
      `)
      .not('current_plan_id', 'is', null)
      .not('client_id', 'is', null)

    if (body.property_id) {
      propertiesQuery = propertiesQuery.eq('id', body.property_id)
    }

    const { data: properties, error: propError } = await propertiesQuery

    if (propError) {
      return NextResponse.json({ error: propError.message }, { status: 500 })
    }

    if (!properties || properties.length === 0) {
      return NextResponse.json({
        message: 'No properties with active plans found',
        results
      })
    }

    // Check for existing invoices in this period to avoid duplicates
    const { data: existingInvoices } = await supabase
      .from('pm_invoices')
      .select('property_id')
      .eq('period_start', periodStart)
      .eq('period_end', periodEnd)

    const invoicedPropertyIds = new Set(existingInvoices?.map(i => i.property_id) || [])

    // Process each property
    for (const rawProperty of properties) {
      // Normalize Supabase join data
      const property = rawProperty as unknown as PropertyWithPlan
      const client = Array.isArray(property.client) ? property.client[0] : property.client
      const plan = Array.isArray(property.current_plan) ? property.current_plan[0] : property.current_plan

      if (!client || !plan) {
        results.skipped++
        continue
      }

      // Skip if already invoiced for this period
      if (invoicedPropertyIds.has(property.id)) {
        results.skipped++
        continue
      }

      try {
        const items: {
          description: string
          quantity: number
          unit_price: number
          total: number
          item_type: string
          work_order_id?: string
        }[] = []

        // Add subscription fee
        if (plan.monthly_base_price) {
          items.push({
            description: `${plan.name} - Monthly Service (${new Date(periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`,
            quantity: 1,
            unit_price: plan.monthly_base_price,
            total: plan.monthly_base_price,
            item_type: 'subscription'
          })
        }

        // Get completed work orders for this property that have a client price
        if (includeWorkOrders) {
          const { data: workOrders } = await supabase
            .from('pm_work_orders')
            .select('id, title, client_price, vendor_cost, property_id')
            .eq('property_id', property.id)
            .eq('status', 'completed')
            .not('client_price', 'is', null)
            .gte('completed_at', periodStart)
            .lte('completed_at', periodEnd + 'T23:59:59')

          if (workOrders && workOrders.length > 0) {
            // Check which work orders haven't been invoiced yet
            const { data: invoicedWorkOrders } = await supabase
              .from('pm_invoice_items')
              .select('work_order_id')
              .in('work_order_id', workOrders.map(wo => wo.id))

            const invoicedWoIds = new Set(invoicedWorkOrders?.map(i => i.work_order_id) || [])

            for (const wo of workOrders as WorkOrder[]) {
              if (!invoicedWoIds.has(wo.id) && wo.client_price) {
                items.push({
                  description: `Service: ${wo.title}`,
                  quantity: 1,
                  unit_price: wo.client_price,
                  total: wo.client_price,
                  item_type: 'service',
                  work_order_id: wo.id
                })
              }
            }
          }
        }

        // Skip if no items to invoice
        if (items.length === 0) {
          results.skipped++
          continue
        }

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + item.total, 0)
        const tax = 0 // Add tax calculation if needed
        const total = subtotal + tax

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
          .from('pm_invoices')
          .insert({
            property_id: property.id,
            client_id: client.id,
            period_start: periodStart,
            period_end: periodEnd,
            due_date: dueDate,
            subtotal,
            tax,
            total,
            status: 'draft'
          })
          .select()
          .single()

        if (invoiceError) {
          results.errors.push(`${property.name}: ${invoiceError.message}`)
          continue
        }

        // Create invoice items
        const invoiceItems = items.map(item => ({
          invoice_id: invoice.id,
          description: item.description,
          work_order_id: item.work_order_id || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          item_type: item.item_type
        }))

        await supabase.from('pm_invoice_items').insert(invoiceItems)

        results.generated++
        results.invoices.push({
          id: invoice.id,
          property: property.name,
          total
        })

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        results.errors.push(`${property.name}: ${message}`)
      }
    }

    return NextResponse.json({
      message: `Generated ${results.generated} invoice(s), skipped ${results.skipped}`,
      results
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invoice generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * GET /api/invoices/generate
 * Preview what invoices would be generated
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const propertyId = searchParams.get('property_id')

  const today = new Date()
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

  // Get properties that would be invoiced
  let query = supabase
    .from('pm_properties')
    .select(`
      id,
      name,
      client:pm_clients(name),
      current_plan:pm_service_plans(name, monthly_base_price)
    `)
    .not('current_plan_id', 'is', null)
    .not('client_id', 'is', null)

  if (propertyId) {
    query = query.eq('id', propertyId)
  }

  const { data: properties, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Check existing invoices
  const { data: existingInvoices } = await supabase
    .from('pm_invoices')
    .select('property_id')
    .eq('period_start', periodStart)
    .eq('period_end', periodEnd)

  const invoicedPropertyIds = new Set(existingInvoices?.map(i => i.property_id) || [])

  const preview = (properties || [])
    .filter(p => !invoicedPropertyIds.has(p.id))
    .map(p => {
      const client = Array.isArray(p.client) ? p.client[0] : p.client
      const plan = Array.isArray(p.current_plan) ? p.current_plan[0] : p.current_plan
      return {
        property_id: p.id,
        property_name: p.name,
        client_name: (client as { name: string })?.name,
        plan_name: (plan as { name: string; monthly_base_price: number })?.name,
        subscription_amount: (plan as { monthly_base_price: number })?.monthly_base_price || 0
      }
    })

  return NextResponse.json({
    period: { start: periodStart, end: periodEnd },
    properties_to_invoice: preview.length,
    already_invoiced: invoicedPropertyIds.size,
    preview
  })
}
