import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentLinkRequest {
  invoice_id: string
  success_url?: string
  cancel_url?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured')
    }
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Initialize Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request
    const { invoice_id, success_url, cancel_url }: PaymentLinkRequest = await req.json()

    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: 'invoice_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch invoice with client details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(
          id,
          email,
          first_name,
          last_name,
          company_name,
          stripe_customer_id
        ),
        line_items:invoice_line_items(*)
      `)
      .eq('id', invoice_id)
      .single()

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check invoice is payable
    if (invoice.status === 'paid' || invoice.status === 'void') {
      return new Response(
        JSON.stringify({ error: 'Invoice is not payable' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const client = invoice.client as {
      id: string
      email: string | null
      first_name: string
      last_name: string
      company_name: string | null
      stripe_customer_id: string | null
    }

    // Create or get Stripe customer
    let customerId = client.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: client.email || undefined,
        name: client.company_name || `${client.first_name} ${client.last_name}`,
        metadata: {
          supabase_client_id: client.id,
        },
      })
      customerId = customer.id

      // Save customer ID to client record
      await supabase
        .from('clients')
        .update({ stripe_customer_id: customerId })
        .eq('id', client.id)
    }

    // Create line items for Stripe
    const lineItems = (invoice.line_items || []).map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.description,
        },
        unit_amount: Math.round(item.unit_price * 100), // Convert to cents
      },
      quantity: Math.round(item.quantity),
    }))

    // Add tax if applicable
    if (invoice.tax_amount && invoice.tax_amount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
          },
          unit_amount: Math.round(invoice.tax_amount * 100),
        },
        quantity: 1,
      })
    }

    // Apply discount if applicable
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = []
    if (invoice.discount_amount && invoice.discount_amount > 0) {
      // Create a coupon for the discount
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(invoice.discount_amount * 100),
        currency: 'usd',
        name: invoice.discount_description || 'Discount',
        duration: 'once',
      })
      discounts = [{ coupon: coupon.id }]
    }

    // Base URL for redirects
    const baseUrl = Deno.env.get('APP_URL') || 'https://app.rossbuilt.com'

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: lineItems,
      discounts,
      success_url: success_url || `${baseUrl}/invoices/${invoice_id}?payment=success`,
      cancel_url: cancel_url || `${baseUrl}/invoices/${invoice_id}?payment=cancelled`,
      metadata: {
        invoice_id: invoice_id,
        invoice_number: invoice.invoice_number,
      },
      payment_intent_data: {
        metadata: {
          invoice_id: invoice_id,
          invoice_number: invoice.invoice_number,
        },
      },
    })

    // Save session ID to invoice
    await supabase
      .from('invoices')
      .update({
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoice_id)

    return new Response(
      JSON.stringify({
        url: session.url,
        session_id: session.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating payment link:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
