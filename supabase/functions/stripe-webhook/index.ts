import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Get raw body for signature verification
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Processing webhook event:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const invoiceId = session.metadata?.invoice_id

        if (invoiceId && session.payment_status === 'paid') {
          // Get invoice to calculate payment
          const { data: invoice } = await supabase
            .from('invoices')
            .select('balance_due, client_id, organization_id')
            .eq('id', invoiceId)
            .single()

          if (invoice) {
            // Record payment
            await supabase.from('payments').insert({
              organization_id: invoice.organization_id,
              invoice_id: invoiceId,
              client_id: invoice.client_id,
              amount: invoice.balance_due,
              payment_method: 'card',
              stripe_payment_id: session.payment_intent as string,
              payment_date: new Date().toISOString(),
            })

            // Update invoice status
            await supabase
              .from('invoices')
              .update({
                status: 'paid',
                amount_paid: invoice.balance_due,
                balance_due: 0,
                paid_at: new Date().toISOString(),
                stripe_payment_intent_id: session.payment_intent as string,
                payment_method: 'card',
                updated_at: new Date().toISOString(),
              })
              .eq('id', invoiceId)

            console.log('Invoice marked as paid:', invoiceId)
          }
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const invoiceId = paymentIntent.metadata?.invoice_id

        if (invoiceId) {
          // Get payment method details
          let last_four: string | undefined
          let card_brand: string | undefined

          if (paymentIntent.payment_method) {
            try {
              const paymentMethod = await stripe.paymentMethods.retrieve(
                paymentIntent.payment_method as string
              )
              if (paymentMethod.card) {
                last_four = paymentMethod.card.last4
                card_brand = paymentMethod.card.brand
              }
            } catch (err) {
              console.error('Error fetching payment method:', err)
            }
          }

          // Update payment record with card details
          await supabase
            .from('payments')
            .update({
              stripe_charge_id: paymentIntent.latest_charge as string,
              last_four,
              card_brand,
            })
            .eq('stripe_payment_id', paymentIntent.id)

          console.log('Payment details updated for:', invoiceId)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const invoiceId = paymentIntent.metadata?.invoice_id

        if (invoiceId) {
          console.log('Payment failed for invoice:', invoiceId)
          // Could add notification or status update here
        }
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
