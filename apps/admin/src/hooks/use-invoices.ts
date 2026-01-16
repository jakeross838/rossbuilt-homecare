import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  supabase,
  type InsertTables,
  type UpdateTables,
} from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import type {
  Invoice,
  InvoiceWithRelations,
  InvoiceListItem,
  InvoiceFilters,
  InvoiceSummary,
  CreateInvoiceData,
} from '@/lib/types/billing'
import {
  calculateSubtotal,
  calculateInvoiceTotal,
  isInvoiceOverdue,
} from '@/lib/helpers/billing'

type InvoiceInsert = InsertTables<'invoices'>
type InvoiceUpdate = UpdateTables<'invoices'>
type LineItemInsert = InsertTables<'invoice_line_items'>

// Query keys factory
export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (filters: InvoiceFilters) => [...invoiceKeys.lists(), filters] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  client: (clientId: string) => [...invoiceKeys.all, 'client', clientId] as const,
  summary: () => [...invoiceKeys.all, 'summary'] as const,
}

/**
 * Hook to fetch invoices with optional filters
 */
export function useInvoices(filters: InvoiceFilters = {}) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          invoice_type,
          invoice_date,
          due_date,
          total,
          balance_due,
          status,
          client:clients!inner(
            id,
            first_name,
            last_name,
            email,
            company_name
          )
        `)
        .eq('organization_id', profile!.organization_id)
        .order('invoice_date', { ascending: false })

      // Apply filters
      if (filters.status?.length) {
        query = query.in('status', filters.status)
      }
      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id)
      }
      if (filters.invoice_type) {
        query = query.eq('invoice_type', filters.invoice_type)
      }
      if (filters.date_from) {
        query = query.gte('invoice_date', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('invoice_date', filters.date_to)
      }
      if (filters.overdue_only) {
        const today = new Date().toISOString().split('T')[0]
        query = query
          .lt('due_date', today)
          .not('status', 'in', '("paid","void")')
      }
      if (filters.search) {
        query = query.or(`invoice_number.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform to list items
      return (data || []).map((inv): InvoiceListItem => {
        const client = inv.client as {
          first_name: string
          last_name: string
          email: string | null
          company_name: string | null
        }
        return {
          id: inv.id,
          invoice_number: inv.invoice_number,
          invoice_type: inv.invoice_type,
          invoice_date: inv.invoice_date,
          due_date: inv.due_date,
          total: Number(inv.total),
          balance_due: Number(inv.balance_due),
          status: inv.status,
          client_name: client.company_name || `${client.first_name} ${client.last_name}`,
          client_email: client.email,
          property_count: 0, // Would need separate query to count
        }
      })
    },
    enabled: !!profile?.organization_id,
  })
}

/**
 * Hook to fetch single invoice with full relations
 */
export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(
            id,
            first_name,
            last_name,
            email,
            company_name
          ),
          line_items:invoice_line_items(
            *
          ),
          payments(
            *
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as unknown as InvoiceWithRelations
    },
    enabled: !!id,
  })
}

/**
 * Hook to fetch invoice summary for dashboard
 */
export function useInvoiceSummary() {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: invoiceKeys.summary(),
    queryFn: async () => {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      const monthStart = startOfMonth.toISOString().split('T')[0]

      // Get outstanding invoices
      const { data: outstanding, error: outstandingError } = await supabase
        .from('invoices')
        .select('balance_due, due_date, status')
        .eq('organization_id', profile!.organization_id)
        .not('status', 'in', '("paid","void")')

      if (outstandingError) throw outstandingError

      // Get paid this month
      const { data: paidThisMonth, error: paidError } = await supabase
        .from('invoices')
        .select('total, paid_at')
        .eq('organization_id', profile!.organization_id)
        .eq('status', 'paid')
        .gte('paid_at', monthStart)

      if (paidError) throw paidError

      // Calculate summary
      const totalOutstanding = (outstanding || []).reduce(
        (sum, inv) => sum + Number(inv.balance_due),
        0
      )
      const totalOverdue = (outstanding || []).reduce((sum, inv) => {
        if (isInvoiceOverdue(inv.due_date, inv.status)) {
          return sum + Number(inv.balance_due)
        }
        return sum
      }, 0)

      return {
        total_outstanding: totalOutstanding,
        total_overdue: totalOverdue,
        invoices_sent: (outstanding || []).filter(
          (inv) => inv.status !== 'draft'
        ).length,
        invoices_paid_this_month: paidThisMonth?.length || 0,
        average_days_to_pay: 0, // Would need historical data
      } as InvoiceSummary
    },
    enabled: !!profile?.organization_id,
  })
}

/**
 * Hook to fetch invoices for a specific client
 */
export function useClientInvoices(clientId: string) {
  return useInvoices({ client_id: clientId })
}

/**
 * Hook to create a new invoice with line items
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  return useMutation({
    mutationFn: async (data: CreateInvoiceData) => {
      if (!profile?.organization_id) {
        throw new Error('No organization found')
      }

      // Calculate totals
      const subtotal = calculateSubtotal(data.line_items)
      const { taxAmount, total } = calculateInvoiceTotal(
        subtotal,
        data.tax_rate || 0,
        data.discount_amount || 0
      )

      // Generate invoice number using sequence
      const { data: seqResult, error: seqError } = await supabase
        .rpc('nextval', { sequence_name: 'invoice_seq' })

      let invoiceNumber: string
      if (seqError) {
        // Fallback to timestamp-based number if sequence fails
        const timestamp = Date.now().toString().slice(-6)
        invoiceNumber = `INV-${timestamp}`
      } else {
        invoiceNumber = `INV-${(seqResult as number).toString().padStart(5, '0')}`
      }

      // Create invoice
      const invoiceInsert: InvoiceInsert = {
        organization_id: profile.organization_id,
        client_id: data.client_id,
        invoice_number: invoiceNumber,
        invoice_type: data.invoice_type,
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        period_start: data.period_start || null,
        period_end: data.period_end || null,
        subtotal,
        tax_rate: data.tax_rate || 0,
        tax_amount: taxAmount,
        discount_amount: data.discount_amount || 0,
        discount_description: data.discount_description || null,
        total,
        balance_due: total,
        status: 'draft',
        notes: data.notes || null,
        terms: data.terms || null,
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceInsert)
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Create line items
      const lineItemsInsert: LineItemInsert[] = data.line_items.map(
        (item, index) => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.quantity * item.unit_price,
          line_type: item.line_type || null,
          reference_type: item.reference_type || null,
          reference_id: item.reference_id || null,
          property_id: item.property_id || null,
          display_order: index,
        })
      )

      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItemsInsert)

      if (lineItemsError) throw lineItemsError

      return invoice as Invoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.summary() })
    },
  })
}

/**
 * Hook to update a draft invoice
 */
export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<CreateInvoiceData>
    }) => {
      // If line items provided, recalculate totals
      let updateData: InvoiceUpdate = {
        updated_at: new Date().toISOString(),
      }

      if (data.line_items) {
        const subtotal = calculateSubtotal(data.line_items)
        const { taxAmount, total } = calculateInvoiceTotal(
          subtotal,
          data.tax_rate || 0,
          data.discount_amount || 0
        )
        updateData = {
          ...updateData,
          subtotal,
          tax_amount: taxAmount,
          total,
          balance_due: total,
        }
      }

      // Apply other fields
      if (data.client_id) updateData.client_id = data.client_id
      if (data.invoice_type) updateData.invoice_type = data.invoice_type
      if (data.invoice_date) updateData.invoice_date = data.invoice_date
      if (data.due_date) updateData.due_date = data.due_date
      if (data.period_start !== undefined) updateData.period_start = data.period_start || null
      if (data.period_end !== undefined) updateData.period_end = data.period_end || null
      if (data.tax_rate !== undefined) updateData.tax_rate = data.tax_rate
      if (data.discount_amount !== undefined) updateData.discount_amount = data.discount_amount
      if (data.discount_description !== undefined) updateData.discount_description = data.discount_description
      if (data.notes !== undefined) updateData.notes = data.notes
      if (data.terms !== undefined) updateData.terms = data.terms

      const { data: invoice, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id)
        .eq('status', 'draft') // Only update drafts
        .select()
        .single()

      if (error) throw error

      // Update line items if provided
      if (data.line_items) {
        // Delete existing line items
        await supabase.from('invoice_line_items').delete().eq('invoice_id', id)

        // Insert new line items
        const lineItemsInsert: LineItemInsert[] = data.line_items.map(
          (item, index) => ({
            invoice_id: id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.quantity * item.unit_price,
            line_type: item.line_type || null,
            reference_type: item.reference_type || null,
            reference_id: item.reference_id || null,
            property_id: item.property_id || null,
            display_order: index,
          })
        )

        const { error: lineItemsError } = await supabase
          .from('invoice_line_items')
          .insert(lineItemsInsert)

        if (lineItemsError) throw lineItemsError
      }

      return invoice as Invoice
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
    },
  })
}

/**
 * Hook to send an invoice (mark as sent)
 */
export function useSendInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      email,
    }: {
      id: string
      email: string
    }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_to_email: email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Invoice
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.summary() })
    },
  })
}

/**
 * Hook to void an invoice
 */
export function useVoidInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'void',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Invoice
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.summary() })
    },
  })
}

/**
 * Hook to delete a draft invoice
 */
export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Line items cascade delete
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('status', 'draft') // Only delete drafts

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.summary() })
    },
  })
}

/**
 * Hook to fetch unbilled items for a client (work orders + programs)
 * Used to auto-populate invoice line items
 */
export function useClientBillableItems(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client-billable-items', clientId],
    queryFn: async () => {
      if (!clientId) return { workOrders: [], programs: [] }

      // Fetch completed work orders that haven't been invoiced
      const { data: workOrders, error: woError } = await supabase
        .from('work_orders')
        .select(`
          id,
          work_order_number,
          title,
          description,
          total_client_cost,
          actual_cost,
          markup_amount,
          completed_at,
          property:properties(id, name)
        `)
        .eq('client_id', clientId)
        .eq('status', 'completed')
        .is('invoice_id', null)
        .order('completed_at', { ascending: false })

      if (woError) throw woError

      // Fetch active programs for client's properties
      const { data: programs, error: progError } = await supabase
        .from('programs')
        .select(`
          id,
          inspection_frequency,
          inspection_tier,
          monthly_total,
          addon_digital_manual,
          addon_warranty_tracking,
          addon_emergency_response,
          addon_hurricane_monitoring,
          property:properties(id, name)
        `)
        .eq('client_id', clientId)
        .eq('status', 'active')

      if (progError) throw progError

      return {
        workOrders: (workOrders || []).map((wo) => ({
          id: wo.id,
          work_order_number: wo.work_order_number,
          title: wo.title,
          description: wo.description,
          amount: wo.total_client_cost || wo.actual_cost || 0,
          property_id: (wo.property as { id: string } | null)?.id,
          property_name: (wo.property as { name: string } | null)?.name || 'Unknown',
          completed_at: wo.completed_at,
        })),
        programs: (programs || []).map((prog) => ({
          id: prog.id,
          inspection_frequency: prog.inspection_frequency,
          inspection_tier: prog.inspection_tier,
          monthly_total: prog.monthly_total || 0,
          property_id: (prog.property as { id: string } | null)?.id,
          property_name: (prog.property as { name: string } | null)?.name || 'Unknown',
          addons: {
            digital_manual: prog.addon_digital_manual,
            warranty_tracking: prog.addon_warranty_tracking,
            emergency_response: prog.addon_emergency_response,
            hurricane_monitoring: prog.addon_hurricane_monitoring,
          },
        })),
      }
    },
    enabled: !!clientId,
  })
}

/**
 * Hook to mark invoice as viewed
 */
export function useMarkInvoiceViewed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'viewed',
          viewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'sent') // Only update from sent status
        .select()
        .single()

      if (error) throw error
      return data as Invoice
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
    },
  })
}
