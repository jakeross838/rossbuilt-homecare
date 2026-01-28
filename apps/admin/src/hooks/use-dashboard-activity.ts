import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type {
  ActivityLogEntry,
  UpcomingInspection,
  OverdueItem,
} from '@/lib/types/analytics'
import { STALE_ACTIVITY, STALE_STANDARD, dashboardKeys } from '@/lib/queries'

/**
 * Hook to fetch recent activity for activity feed
 */
export function useRecentActivity(limit: number = 10) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: [...dashboardKeys.activity(), limit],
    queryFn: async (): Promise<ActivityLogEntry[]> => {
      const orgId = profile!.organization_id
      const activities: ActivityLogEntry[] = []

      // Fetch recent inspections
      const { data: inspections } = await supabase
        .from('inspections')
        .select(`
          id,
          status,
          updated_at,
          property:properties(name),
          inspector:users!inspector_id(first_name, last_name)
        `)
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false })
        .limit(5)

      inspections?.forEach((insp) => {
        const property = insp.property as unknown as { name: string } | null
        const inspector = insp.inspector as unknown as { first_name: string; last_name: string } | null
        activities.push({
          id: `inspection-${insp.id}`,
          type: 'inspection',
          action: insp.status === 'completed' ? 'completed' : 'updated',
          title: insp.status === 'completed' ? 'Inspection completed' : 'Inspection updated',
          description: property?.name || 'Unknown property',
          entityId: insp.id,
          userName: inspector ? `${inspector.first_name} ${inspector.last_name}` : undefined,
          timestamp: insp.updated_at || new Date().toISOString(),
        })
      })

      // Fetch recent work orders
      const { data: workOrders } = await supabase
        .from('work_orders')
        .select(`
          id,
          work_order_number,
          status,
          title,
          updated_at,
          property:properties(name)
        `)
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false })
        .limit(5)

      workOrders?.forEach((wo) => {
        const property = wo.property as unknown as { name: string } | null
        activities.push({
          id: `work-order-${wo.id}`,
          type: 'work_order',
          action: wo.status === 'completed' ? 'completed' : 'updated',
          title: wo.status === 'completed' ? 'Work order completed' : `Work order ${(wo.status || '').replace('_', ' ')}`,
          description: wo.title || property?.name || wo.work_order_number,
          entityId: wo.id,
          timestamp: wo.updated_at || new Date().toISOString(),
        })
      })

      // Fetch recent invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          status,
          total,
          updated_at,
          client:clients(first_name, last_name)
        `)
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false })
        .limit(5)

      invoices?.forEach((inv) => {
        const client = inv.client as unknown as { first_name: string; last_name: string } | null
        const clientName = client ? `${client.first_name} ${client.last_name}` : 'Unknown'
        activities.push({
          id: `invoice-${inv.id}`,
          type: 'invoice',
          action: inv.status === 'paid' ? 'paid' : 'updated',
          title: inv.status === 'paid' ? 'Invoice paid' : `Invoice ${inv.status}`,
          description: `${inv.invoice_number} - ${clientName}`,
          entityId: inv.id,
          timestamp: inv.updated_at || new Date().toISOString(),
        })
      })

      // Sort by timestamp and take limit
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    },
    enabled: !!profile?.organization_id,
    staleTime: STALE_ACTIVITY,
  })
}

/**
 * Hook to fetch upcoming inspections
 */
export function useUpcomingInspections(days: number = 7, limit: number = 5) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: [...dashboardKeys.upcoming(), days, limit],
    queryFn: async (): Promise<UpcomingInspection[]> => {
      const orgId = profile!.organization_id
      const today = new Date()
      const endDate = new Date()
      endDate.setDate(today.getDate() + days)

      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id,
          scheduled_date,
          inspection_type,
          property:properties(
            name,
            client:clients(first_name, last_name)
          ),
          inspector:users!inspector_id(first_name, last_name)
        `)
        .eq('organization_id', orgId)
        .in('status', ['scheduled', 'rescheduled'])
        .gte('scheduled_date', today.toISOString())
        .lte('scheduled_date', endDate.toISOString())
        .order('scheduled_date', { ascending: true })
        .limit(limit)

      if (error) throw error

      return (data || []).map((insp) => {
        const property = insp.property as unknown as {
          name: string
          client: { first_name: string; last_name: string } | null
        } | null
        const inspector = insp.inspector as unknown as { first_name: string; last_name: string } | null
        const client = property?.client

        return {
          id: insp.id,
          propertyName: property?.name || 'Unknown property',
          clientName: client ? `${client.first_name} ${client.last_name}` : 'Unknown',
          scheduledDate: insp.scheduled_date || '',
          tier: insp.inspection_type || 'scheduled',
          inspectorName: inspector ? `${inspector.first_name} ${inspector.last_name}` : undefined,
        }
      })
    },
    enabled: !!profile?.organization_id,
    staleTime: STALE_STANDARD,
  })
}

/**
 * Hook to fetch overdue items requiring attention
 */
export function useOverdueItems() {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: dashboardKeys.overdue(),
    queryFn: async (): Promise<OverdueItem[]> => {
      const orgId = profile!.organization_id
      const today = new Date().toISOString().split('T')[0]
      const items: OverdueItem[] = []

      // Overdue inspections (scheduled in past, not completed)
      const { data: inspections } = await supabase
        .from('inspections')
        .select('id, scheduled_date, property:properties(name)')
        .eq('organization_id', orgId)
        .in('status', ['scheduled', 'rescheduled'])
        .lt('scheduled_date', today)
        .limit(10)

      inspections?.forEach((insp) => {
        const property = insp.property as unknown as { name: string } | null
        const scheduledDate = new Date(insp.scheduled_date)
        const daysOverdue = Math.floor((Date.now() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24))
        items.push({
          type: 'inspection',
          id: insp.id,
          title: property?.name || 'Unknown property',
          dueDate: insp.scheduled_date,
          daysOverdue,
          priority: daysOverdue > 7 ? 'high' : daysOverdue > 3 ? 'medium' : 'low',
        })
      })

      // Overdue work orders (past scheduled completion)
      const { data: workOrders } = await supabase
        .from('work_orders')
        .select('id, title, scheduled_completion_date, priority')
        .eq('organization_id', orgId)
        .not('status', 'in', '("completed","cancelled")')
        .lt('scheduled_completion_date', today)
        .limit(10)

      workOrders?.forEach((wo) => {
        const dueDate = new Date(wo.scheduled_completion_date)
        const daysOverdue = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        items.push({
          type: 'work_order',
          id: wo.id,
          title: wo.title,
          dueDate: wo.scheduled_completion_date,
          daysOverdue,
          priority: wo.priority as 'low' | 'medium' | 'high' | 'urgent',
        })
      })

      // Overdue invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, due_date, client:clients(first_name, last_name)')
        .eq('organization_id', orgId)
        .in('status', ['sent', 'viewed', 'partial'])
        .lt('due_date', today)
        .limit(10)

      invoices?.forEach((inv) => {
        const client = inv.client as unknown as { first_name: string; last_name: string } | null
        const dueDate = new Date(inv.due_date)
        const daysOverdue = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        items.push({
          type: 'invoice',
          id: inv.id,
          title: `${inv.invoice_number} - ${client ? `${client.first_name} ${client.last_name}` : 'Unknown'}`,
          dueDate: inv.due_date,
          daysOverdue,
          priority: daysOverdue > 30 ? 'urgent' : daysOverdue > 14 ? 'high' : daysOverdue > 7 ? 'medium' : 'low',
        })
      })

      // Sort by days overdue (most urgent first)
      return items.sort((a, b) => b.daysOverdue - a.daysOverdue)
    },
    enabled: !!profile?.organization_id,
    staleTime: STALE_STANDARD,
  })
}
