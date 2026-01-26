import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { portalKeys } from './use-portal-dashboard'
import type { PortalInvoice } from '@/lib/types/portal'

/**
 * Hook to fetch invoices for client portal
 * RLS automatically filters to invoices for client's client_id
 */
export function usePortalInvoices() {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: portalKeys.invoices(),
    queryFn: async (): Promise<PortalInvoice[]> => {
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
  })
}

/**
 * Hook to fetch single invoice for portal
 * RLS automatically filters to invoices for client's client_id
 */
export function usePortalInvoice(invoiceId: string | undefined) {
  const profile = useAuthStore((state) => state.profile)

  return useQuery({
    queryKey: portalKeys.invoice(invoiceId || ''),
    queryFn: async (): Promise<PortalInvoice> => {
      if (!invoiceId) throw new Error('Invoice ID required')

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
  })
}
