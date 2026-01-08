import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const property_id = searchParams.get('property_id')
  const period = searchParams.get('period') || '30'

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(period))

  try {
    let woQuery = supabase
      .from('pm_work_orders')
      .select('id, status, priority, category, created_at, completed_at, vendor_cost, client_price')

    if (property_id) {
      woQuery = woQuery.eq('property_id', property_id)
    }

    const { data: workOrders } = await woQuery

    let checklistQuery = supabase
      .from('pm_checklist_completions')
      .select('id, status, scheduled_date, completed_at, results')

    if (property_id) {
      checklistQuery = checklistQuery.eq('property_id', property_id)
    }

    const { data: completions } = await checklistQuery

    let invoiceQuery = supabase
      .from('pm_invoices')
      .select('id, status, total, created_at, paid_date')

    if (property_id) {
      invoiceQuery = invoiceQuery.eq('property_id', property_id)
    }

    const { data: invoices } = await invoiceQuery

    const { count: propertyCount } = await supabase
      .from('pm_properties')
      .select('id', { count: 'exact', head: true })

    const { count: clientCount } = await supabase
      .from('pm_clients')
      .select('id', { count: 'exact', head: true })

    const allWorkOrders = workOrders || []
    const allCompletions = completions || []
    const allInvoices = invoices || []

    const woByStatus = {
      new: allWorkOrders.filter(wo => wo.status === 'new').length,
      assigned: allWorkOrders.filter(wo => wo.status === 'assigned').length,
      in_progress: allWorkOrders.filter(wo => wo.status === 'in_progress').length,
      completed: allWorkOrders.filter(wo => wo.status === 'completed').length,
      cancelled: allWorkOrders.filter(wo => wo.status === 'cancelled').length
    }

    const woByPriority = {
      emergency: allWorkOrders.filter(wo => wo.priority === 'emergency').length,
      high: allWorkOrders.filter(wo => wo.priority === 'high').length,
      medium: allWorkOrders.filter(wo => wo.priority === 'medium').length,
      low: allWorkOrders.filter(wo => wo.priority === 'low').length
    }

    const woByCategory = {
      plumbing: allWorkOrders.filter(wo => wo.category === 'plumbing').length,
      electrical: allWorkOrders.filter(wo => wo.category === 'electrical').length,
      hvac: allWorkOrders.filter(wo => wo.category === 'hvac').length,
      appliance: allWorkOrders.filter(wo => wo.category === 'appliance').length,
      general: allWorkOrders.filter(wo => wo.category === 'general').length
    }

    const recentWO = allWorkOrders.filter(wo => new Date(wo.created_at) >= startDate)

    const completedInspections = allCompletions.filter(c => c.status === 'completed').length
    const scheduledInspections = allCompletions.filter(c => c.status === 'scheduled').length
    const inProgressInspections = allCompletions.filter(c => c.status === 'in_progress').length

    let totalIssuesFound = 0
    for (const completion of allCompletions) {
      if (completion.results && Array.isArray(completion.results)) {
        totalIssuesFound += completion.results.filter((r: { status: string }) => r.status === 'issue').length
      }
    }

    const totalVendorCost = allWorkOrders.reduce((sum, wo) => sum + (Number(wo.vendor_cost) || 0), 0)
    const totalClientBilled = allWorkOrders.reduce((sum, wo) => sum + (Number(wo.client_price) || 0), 0)
    const grossMargin = totalClientBilled - totalVendorCost

    const paidInvoices = allInvoices.filter(inv => inv.status === 'paid')
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0)
    const pendingInvoices = allInvoices.filter(inv => ['draft', 'sent'].includes(inv.status))
    const pendingRevenue = pendingInvoices.reduce((sum, inv) => sum + Number(inv.total), 0)
    const overdueInvoices = allInvoices.filter(inv => inv.status === 'overdue')
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + Number(inv.total), 0)

    const monthlyData: { month: string; workOrders: number; inspections: number; revenue: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)

      const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

      const monthWO = allWorkOrders.filter(wo => {
        const d = new Date(wo.created_at)
        return d >= monthStart && d < monthEnd
      }).length

      const monthInspections = allCompletions.filter(c => {
        if (!c.completed_at) return false
        const d = new Date(c.completed_at)
        return d >= monthStart && d < monthEnd
      }).length

      const monthRevenue = paidInvoices.filter(inv => {
        if (!inv.paid_date) return false
        const d = new Date(inv.paid_date)
        return d >= monthStart && d < monthEnd
      }).reduce((sum, inv) => sum + Number(inv.total), 0)

      monthlyData.push({ month: monthLabel, workOrders: monthWO, inspections: monthInspections, revenue: monthRevenue })
    }

    return NextResponse.json({
      overview: {
        totalProperties: propertyCount || 0,
        totalClients: clientCount || 0,
        activeWorkOrders: woByStatus.new + woByStatus.assigned + woByStatus.in_progress,
        completedWorkOrders: woByStatus.completed,
        completedInspections, scheduledInspections, inProgressInspections, totalIssuesFound
      },
      workOrders: { byStatus: woByStatus, byPriority: woByPriority, byCategory: woByCategory, recentCount: recentWO.length },
      financial: {
        totalVendorCost, totalClientBilled, grossMargin,
        marginPercent: totalClientBilled > 0 ? ((grossMargin / totalClientBilled) * 100).toFixed(1) : 0,
        totalRevenue, pendingRevenue, overdueAmount,
        paidInvoiceCount: paidInvoices.length, pendingInvoiceCount: pendingInvoices.length, overdueInvoiceCount: overdueInvoices.length
      },
      trends: { monthly: monthlyData }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
