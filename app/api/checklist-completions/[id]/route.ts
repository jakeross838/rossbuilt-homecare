import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { notifyInspectionComplete } from '@/lib/notifications'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabase
    .from('pm_checklist_completions')
    .select(`
      *,
      template:pm_checklist_templates(id, name, frequency, items),
      property:pm_properties(id, name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updates: Record<string, unknown> = {}

  // Start the checklist
  if (body.action === 'start') {
    updates.status = 'in_progress'
    updates.started_at = new Date().toISOString()
  }

  // Complete the checklist
  if (body.action === 'complete') {
    const completedAt = new Date().toISOString()
    updates.status = 'completed'
    updates.completed_at = completedAt
    updates.completed_by = body.completed_by || 'Admin'
    if (body.results) updates.results = body.results
    if (body.notes) updates.notes = body.notes

    // Get the completion record to get property_id and client info
    const { data: completion } = await supabase
      .from('pm_checklist_completions')
      .select(`
        property_id,
        scheduled_date,
        template:pm_checklist_templates(name),
        property:pm_properties(id, name, client_id)
      `)
      .eq('id', id)
      .single()

    if (completion) {
      // Update property's last_inspection_date
      const completedDate = completedAt.split('T')[0]
      await supabase
        .from('pm_properties')
        .update({ last_inspection_date: completedDate })
        .eq('id', completion.property_id)

      // Count issues and auto-create work orders
      let issueCount = 0
      if (body.results && Array.isArray(body.results)) {
        const issues = body.results.filter((r: { status: string }) => r.status === 'issue')
        issueCount = issues.length

        if (issues.length > 0) {
          // Handle Supabase join which can return array or object
          const template = Array.isArray(completion.template)
            ? completion.template[0]
            : completion.template
          const templateName = (template as { name?: string })?.name || 'Unknown'

          const workOrders = issues.map((issue: { name: string; notes: string; category: string }) => ({
            property_id: completion.property_id,
            title: `[Checklist] ${issue.name}`,
            description: issue.notes || `Issue found during checklist: ${templateName}`,
            category: mapCategory(issue.category),
            priority: 'medium',
            status: 'new',
            source: 'checklist'
          }))

          await supabase.from('pm_work_orders').insert(workOrders)
        }
      }

      // Send notification to client about completed inspection
      // Handle Supabase join which can return array or object
      const propertyData = Array.isArray(completion.property)
        ? completion.property[0]
        : completion.property
      const property = propertyData as { id: string; name: string; client_id: string } | null
      if (property?.client_id) {
        const inspectionDate = completion.scheduled_date || completedDate
        notifyInspectionComplete(
          property.client_id,
          property.id,
          property.name,
          new Date(inspectionDate).toLocaleDateString(),
          issueCount
        ).catch(err => console.error('Failed to send inspection notification:', err))
      }
    }
  }

  // Update results during walkthrough
  if (body.results && !body.action) {
    updates.results = body.results
  }
  if (body.notes && !body.action) {
    updates.notes = body.notes
  }

  // Allow updating items for per-job customization
  if (body.items) {
    updates.items = body.items
  }

  const { data, error } = await supabase
    .from('pm_checklist_completions')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      template:pm_checklist_templates(id, name, frequency, items)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

function mapCategory(category: string): string {
  const validCategories = ['plumbing', 'electrical', 'hvac', 'appliance', 'general']
  return validCategories.includes(category) ? category : 'general'
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await supabase
    .from('pm_checklist_completions')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
