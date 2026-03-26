import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { getGuestUsage, getAuthUserUsage } from '@/lib/usage'

export async function GET(req: NextRequest) {
  const user = await getUser()

  if (user) {
    const usage = await getAuthUserUsage(user.id)
    return NextResponse.json({
      used: usage.used,
      limit: usage.limit,
      tier: usage.tier,
    })
  }

  // Guest: read session ID from cookie or query param
  const guestSessionId =
    req.cookies.get('guest_session_id')?.value ||
    req.nextUrl.searchParams.get('guestSessionId')

  if (!guestSessionId) {
    return NextResponse.json({ used: 0, limit: 3, tier: 'guest' })
  }

  const usage = await getGuestUsage(guestSessionId)
  return NextResponse.json({
    used: usage.used,
    limit: usage.limit,
    tier: usage.tier,
  })
}
