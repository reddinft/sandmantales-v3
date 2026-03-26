import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Note: In Next.js App Router, raw body access is via request.text().
// No config export needed — App Router does not use Pages Router bodyParser config.

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const service = getServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, plan } = session.metadata ?? {}

        if (!userId || !plan) {
          console.error('Missing metadata in checkout.session.completed', session.id)
          break
        }

        // Idempotency check — skip if this event was already processed
        const { data: existingUser } = await service
          .from('users')
          .select('stripe_event_id')
          .eq('id', userId)
          .single()

        if (existingUser?.stripe_event_id === event.id) {
          console.log('Duplicate webhook event, skipping:', event.id)
          break
        }

        await service
          .from('users')
          .update({
            subscription_tier: plan === 'lifetime' ? 'lifetime' : 'monthly',
            subscription_status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string | null ?? null,
            stripe_event_id: event.id,
          })
          .eq('id', userId)

        console.log(`User ${userId} upgraded to ${plan}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await service
          .from('users')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId)

        console.log(`Subscription canceled for customer ${customerId}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Set past_due but do NOT downgrade — Stripe retries 3x
        await service
          .from('users')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', customerId)

        console.log(`Payment failed for customer ${customerId}`)
        break
      }

      default:
        // Ignore unhandled events
        break
    }
  } catch (err) {
    console.error('Error processing webhook event:', event.type, err)
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
