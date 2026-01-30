import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { portalKeys, STALE_STANDARD } from '@/lib/queries'
import type { PortalInvoice } from '@/lib/types/portal'

/**
 * Helper to get property IDs for a client user
 * Checks: 1) user_property_assignments, 2) client.user_id match, 3) client.email match
 */
async function getClientPropertyIds(userId: string, userEmail: string | null): Promise<string[]> {
  // First, check user_property_assignments
  const { data: assignments } = await supabase
    .from('user_property_assignments')
    .select('property_id')
    .eq('user_id', userId)

  if (assignments && assignments.length > 0) {
    return assignments.map((a) => a.property_id)
  }

  // Second: Find client by user_id and get their properties
  const { data: clientByUserId } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (clientByUserId) {
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .eq('client_id', clientByUserId.id)
      .eq('is_active', true)

    if (properties && properties.length > 0) {
      return properties.map((p) => p.id)
    }
  }

  // Third fallback: Find client by email and get their properties
  if (userEmail) {
    const { data: clientByEmail } = await supabase
      .from('clients')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (clientByEmail) {
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('client_id', clientByEmail.id)
        .eq('is_active', true)

      if (properties && properties.length > 0) {
        return properties.map((p) => p.id)
      }
    }
  }

  return []
}

/**
 * Hook to fetch invoices for client portal
 * Filters by user's assigned properties
 */
export function usePortalInvoices() {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: portalKeys.invoices(),
    queryFn: async (): Promise<PortalInvoice[]> => {
      if (!profile?.id) {
        throw new Error('User not authenticated')
      }

      // Get property IDs for this client user
      const assignedPropertyIds = await getClientPropertyIds(profile.id, profile.email)

      // If no properties found, return empty array
      if (assignedPropertyIds.length === 0) {
        return []
      }

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          status,
          invoice_date,
          due_date,
          total,
          balance_due,
          pdf_url,
          line_items:invoice_line_items (
            description,
            quantity,
            unit_price,
            amount
          )
        `)
        .in('property_id', assignedPropertyIds)
        .order('invoice_date', { ascending: false })

      if (error) throw error

      return (data || []).map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        status: inv.status,
        issue_date: inv.invoice_date, // Map invoice_date to issue_date for type compatibility
        due_date: inv.due_date,
        total: Number(inv.total),
        balance_due: Number(inv.balance_due),
        line_items: (inv.line_items || []).map((li: unknown) => {
          const item = li as {
            description: string
            quantity: number
            unit_price: number
            amount: number
          }
          return {
            description: item.description,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            amount: Number(item.amount),
          }
        }),
        // Payment links are generated on-demand via edge function, not stored
        stripe_payment_url: null,
        pdf_url: inv.pdf_url,
      }))
    },
    enabled: profile?.role === 'client',
    staleTime: STALE_STANDARD,
  })
}

/**
 * Hook to fetch single invoice for portal
 * Verifies invoice belongs to user's assigned properties
 */
export function usePortalInvoice(invoiceId: string | undefined) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: portalKeys.invoice(invoiceId || ''),
    queryFn: async (): Promise<PortalInvoice> => {
      if (!invoiceId) throw new Error('Invoice ID required')
      if (!profile?.id) throw new Error('User not authenticated')

      // Get property IDs for this client user
      const assignedPropertyIds = await getClientPropertyIds(profile.id, profile.email)

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          status,
          invoice_date,
          due_date,
          total,
          balance_due,
          pdf_url,
          property_id,
          notes,
          terms,
          line_items:invoice_line_items (
            description,
            quantity,
            unit_price,
            amount
          )
        `)
        .eq('id', invoiceId)
        .single()

      if (error) throw error

      // Verify invoice belongs to user's assigned properties
      if (!assignedPropertyIds.includes(data.property_id)) {
        throw new Error('Invoice not found')
      }

      return {
        id: data.id,
        invoice_number: data.invoice_number,
        status: data.status,
        issue_date: data.invoice_date, // Map invoice_date to issue_date for type compatibility
        due_date: data.due_date,
        total: Number(data.total),
        balance_due: Number(data.balance_due),
        line_items: (data.line_items || []).map((li: unknown) => {
          const item = li as {
            description: string
            quantity: number
            unit_price: number
            amount: number
          }
          return {
            description: item.description,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            amount: Number(item.amount),
          }
        }),
        // Payment links are generated on-demand via edge function, not stored
        stripe_payment_url: null,
        pdf_url: data.pdf_url,
      }
    },
    enabled: !!invoiceId && profile?.role === 'client',
    staleTime: STALE_STANDARD,
  })
}
