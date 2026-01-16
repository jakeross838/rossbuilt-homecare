import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { portalKeys } from './use-portal-dashboard'
import type { PortalInvoice } from '@/lib/types/portal'

/**
 * Hook to fetch invoices for client portal
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
          issue_date,
          due_date,
          total,
          balance_due,
          stripe_payment_url,
          line_items:invoice_line_items (
            description,
            quantity,
            unit_price,
            amount
          )
        `)
        .order('issue_date', { ascending: false })

      if (error) throw error

      return (data || []).map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        status: inv.status,
        issue_date: inv.issue_date,
        due_date: inv.due_date,
        total: inv.total,
        balance_due: inv.balance_due,
        line_items: (inv.line_items || []).map((li: unknown) => {
          const item = li as {
            description: string
            quantity: number
            unit_price: number
            amount: number
          }
          return {
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.amount,
          }
        }),
        stripe_payment_url: inv.stripe_payment_url,
      }))
    },
    enabled: profile?.role === 'client',
  })
}

/**
 * Hook to fetch single invoice for portal
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
          issue_date,
          due_date,
          total,
          balance_due,
          stripe_payment_url,
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
        issue_date: data.issue_date,
        due_date: data.due_date,
        total: data.total,
        balance_due: data.balance_due,
        line_items: (data.line_items || []).map((li: unknown) => {
          const item = li as {
            description: string
            quantity: number
            unit_price: number
            amount: number
          }
          return {
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.amount,
          }
        }),
        stripe_payment_url: data.stripe_payment_url,
      }
    },
    enabled: !!invoiceId && profile?.role === 'client',
  })
}
