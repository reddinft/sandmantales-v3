import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  // 1. Get current user from Supabase session (require auth)
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  let plan: 'monthly' | 'lifetime'
  try {
    const body = await request.json()
    plan = body.plan
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (plan !== 'monthly' && plan !== 'lifetime') {
    return NextResponse.json({ error: 'Invalid plan. Must be "monthly" or "lifetime".' }, { status: 400 })
  }

  const service = getServiceClient()

  // 2. Get or create Stripe customer
  const { data: userData } = await service
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let stripeCustomerId = userData?.stripe_customer_id as string | null

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    })
    stripeCustomerId = customer.id

    await service
      .from('users')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', user.id)
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const priceId =
    plan === 'monthly'
      ? process.env.STRIPE_MONTHLY_PRICE_ID!
      : process.env.STRIPE_LIFETIME_PRICE_ID!

  // 3. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: plan === 'monthly' ? 'subscription' : 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/account?payment=success`,
    cancel_url: `${APP_URL}/create?upgrade=cancelled`,
    customer: stripeCustomerId,
    metadata: { userId: user.id, plan },
  })

  // 4. Return checkoutUrl
  return NextResponse.json({ checkoutUrl: session.url })
}
