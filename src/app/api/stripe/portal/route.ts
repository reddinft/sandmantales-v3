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
  // Require auth
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = getServiceClient()

  // Get the user's Stripe customer ID
  const { data: userData } = await service
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  const stripeCustomerId = userData?.stripe_customer_id as string | null

  if (!stripeCustomerId) {
    return NextResponse.json(
      { error: 'No Stripe customer found. Please make a purchase first.' },
      { status: 400 }
    )
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Create Stripe Customer Portal session
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${APP_URL}/account`,
  })

  return NextResponse.json({ portalUrl: portalSession.url })
}

// GET handler for direct navigation from account page link
export async function GET() {
  // Require auth
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(
      new URL('/?signin=true', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
    )
  }

  const service = getServiceClient()

  const { data: userData } = await service
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  const stripeCustomerId = userData?.stripe_customer_id as string | null

  if (!stripeCustomerId) {
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    return NextResponse.redirect(new URL('/account?error=no_subscription', APP_URL))
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${APP_URL}/account`,
  })

  return NextResponse.redirect(portalSession.url)
}
