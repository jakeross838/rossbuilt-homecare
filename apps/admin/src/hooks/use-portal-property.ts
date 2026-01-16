import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { portalKeys } from './use-portal-dashboard'
import type {
  PortalPropertyDetail,
  PortalEquipment,
  PortalInspection,
  PortalWorkOrder,
  PortalRecommendation,
} from '@/lib/types/portal'

/**
 * Hook to fetch detailed property info for client portal
 */
export function usePortalProperty(propertyId: string | undefined) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: portalKeys.property(propertyId || ''),
    queryFn: async (): Promise<PortalPropertyDetail> => {
      if (!propertyId) throw new Error('Property ID required')

      // Fetch property with program
      const { data: property, error } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          address_line1,
          address_line2,
          city,
          state,
          zip,
          primary_photo_url,
          property_type,
          square_footage,
          year_built,
          gate_code,
          alarm_code,
          programs (
            id,
            tier,
            frequency,
            status,
            monthly_price,
            next_inspection_date
          )
        `)
        .eq('id', propertyId)
        .single()

      if (error) throw error

      // Fetch equipment
      const { data: equipmentData } = await supabase
        .from('equipment')
        .select(`
          id,
          name,
          category,
          location,
          condition,
          last_serviced_at,
          next_service_date
        `)
        .eq('property_id', propertyId)
        .eq('is_active', true)
        .order('category')

      const equipment: PortalEquipment[] = (equipmentData || []).map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        location: e.location,
        condition: e.condition,
        last_serviced_at: e.last_serviced_at,
        next_service_date: e.next_service_date,
      }))

      // Fetch recent inspections (last 5)
      const { data: inspectionsData } = await supabase
        .from('inspections')
        .select(`
          id,
          scheduled_date,
          inspection_type,
          status,
          overall_condition,
          summary,
          report_url,
          inspector:users!inspector_id (
            first_name,
            last_name
          ),
          findings
        `)
        .eq('property_id', propertyId)
        .in('status', ['completed', 'scheduled', 'in_progress'])
        .order('scheduled_date', { ascending: false })
        .limit(5)

      const recentInspections: PortalInspection[] = (inspectionsData || []).map((i) => {
        // Parse findings from JSONB to get summary
        const findings = i.findings as unknown as Array<{ status: string }> | null
        const findingsSummary = {
          total: findings?.length || 0,
          passed: findings?.filter((f) => f.status === 'pass').length || 0,
          needs_attention: findings?.filter((f) => f.status === 'needs_attention').length || 0,
          urgent: findings?.filter((f) => f.status === 'urgent').length || 0,
        }

        return {
          id: i.id,
          inspection_date: i.scheduled_date,
          inspection_type: i.inspection_type,
          status: i.status,
          overall_condition: i.overall_condition,
          summary: i.summary,
          report_url: i.report_url,
          inspector: i.inspector as { first_name: string; last_name: string } | null,
          findings_summary: findingsSummary,
        }
      })

      // Fetch active work orders
      const { data: workOrdersData } = await supabase
        .from('work_orders')
        .select(`
          id,
          work_order_number,
          title,
          description,
          category,
          priority,
          status,
          estimated_cost,
          client_cost,
          scheduled_date,
          completed_at,
          created_at
        `)
        .eq('property_id', propertyId)
        .in('status', ['pending', 'vendor_assigned', 'scheduled', 'in_progress'])
        .order('created_at', { ascending: false })

      const activeWorkOrders: PortalWorkOrder[] = (workOrdersData || []).map((wo) => ({
        id: wo.id,
        work_order_number: wo.work_order_number,
        title: wo.title,
        description: wo.description,
        category: wo.category,
        priority: wo.priority,
        status: wo.status,
        estimated_cost: wo.estimated_cost,
        client_cost: wo.client_cost,
        scheduled_date: wo.scheduled_date,
        completed_at: wo.completed_at,
        created_at: wo.created_at,
      }))

      // Fetch pending recommendations
      const { data: recommendationsData } = await supabase
        .from('recommendations')
        .select(`
          id,
          title,
          description,
          priority,
          status,
          estimated_cost,
          category,
          created_at,
          inspection:inspections (
            id,
            scheduled_date
          )
        `)
        .eq('property_id', propertyId)
        .eq('status', 'pending')
        .order('priority', { ascending: true })

      const pendingRecommendations: PortalRecommendation[] = (recommendationsData || []).map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        priority: r.priority,
        status: r.status,
        estimated_cost: r.estimated_cost,
        category: r.category,
        created_at: r.created_at,
        inspection: r.inspection as { id: string; scheduled_date: string } | null,
      }))

      // Get counts for summary
      const { count: equipmentCount } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId)
        .eq('is_active', true)

      const { count: openWorkOrders } = await supabase
        .from('work_orders')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId)
        .in('status', ['pending', 'vendor_assigned', 'scheduled', 'in_progress'])

      const { count: pendingRecs } = await supabase
        .from('recommendations')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId)
        .eq('status', 'pending')

      const program = Array.isArray(property.programs) ? property.programs[0] : property.programs

      return {
        id: property.id,
        name: property.name,
        address_line1: property.address_line1,
        address_line2: property.address_line2,
        city: property.city,
        state: property.state,
        zip: property.zip,
        primary_photo_url: property.primary_photo_url,
        property_type: property.property_type,
        square_footage: property.square_footage,
        year_built: property.year_built,
        gate_code: property.gate_code,
        alarm_code: property.alarm_code,
        program: program ? {
          id: program.id,
          tier: program.tier,
          frequency: program.frequency,
          status: program.status,
          monthly_price: program.monthly_price,
          next_inspection_date: program.next_inspection_date,
        } : null,
        equipment_count: equipmentCount || 0,
        open_work_order_count: openWorkOrders || 0,
        pending_recommendation_count: pendingRecs || 0,
        last_inspection_date: recentInspections[0]?.inspection_date || null,
        overall_condition: recentInspections[0]?.overall_condition || null,
        equipment,
        recent_inspections: recentInspections,
        active_work_orders: activeWorkOrders,
        pending_recommendations: pendingRecommendations,
      }
    },
    enabled: !!propertyId && profile?.role === 'client',
  })
}
