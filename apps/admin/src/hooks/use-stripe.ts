import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { invoiceKeys } from '@/lib/queries'

interface PaymentLinkResponse {
  url: string
  session_id: string
}

/**
 * Hook to create a Stripe payment link for an invoice
 */
export function useCreatePaymentLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      invoiceId,
      successUrl,
      cancelUrl,
    }: {
      invoiceId: string
      successUrl?: string
      cancelUrl?: string
    }) => {
      const { data, error } = await supabase.functions.invoke<PaymentLinkResponse>(
        'create-payment-link',
        {
          body: {
            invoice_id: invoiceId,
            success_url: successUrl,
            cancel_url: cancelUrl,
          },
        }
      )

      if (error) throw error
      if (!data) throw new Error('No response from payment link function')

      return data
    },
    onSuccess: (data, variables) => {
      // Could invalidate invoice if needed
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.detail(variables.invoiceId),
      })
    },
  })
}

/**
 * Open Stripe payment link in new tab
 */
export function openPaymentLink(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
