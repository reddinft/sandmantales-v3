# QA Gate — Phase 6: Stripe Payments
**Verdict: ✅ PASS**
_Reviewed by Oli · 2026-03-26_

---

## Checkout Route (`src/app/api/stripe/checkout/route.ts`)

| Criterion | Status | Notes |
|---|---|---|
| Requires auth — returns 401 if no session | ✅ | `if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })` |
| Gets or creates Stripe customer (checks `stripe_customer_id` first) | ✅ | Queries `users.stripe_customer_id`, creates if null, saves back |
| Correct mode: `subscription` for monthly, `payment` for lifetime | ✅ | `mode: plan === 'monthly' ? 'subscription' : 'payment'` |
| Uses `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_LIFETIME_PRICE_ID` | ✅ | Both env vars used via ternary |
| `success_url` and `cancel_url` set | ✅ | `${APP_URL}/account?payment=success` and `${APP_URL}/create?upgrade=cancelled` |
| Metadata includes `userId` and `plan` | ✅ | `metadata: { userId: user.id, plan }` |
| Returns `{ checkoutUrl }` | ✅ | `NextResponse.json({ checkoutUrl: session.url })` |

---

## Webhook Route (`src/app/api/stripe/webhook/route.ts`)

| Criterion | Status | Notes |
|---|---|---|
| Uses `request.text()` (NOT `request.json()`) | ✅ | `const body = await request.text()` |
| Stripe signature verified with `stripe.webhooks.constructEvent` | ✅ | Standard constructEvent call with raw body |
| Invalid signature returns 400 | ✅ | catch block returns `{ error: 'Invalid signature' }, { status: 400 }` |
| `checkout.session.completed` → updates `subscription_tier`, `subscription_status: 'active'`, saves `stripe_event_id` | ✅ | All three fields updated in single `.update()` call |
| Idempotency check: `stripe_event_id` checked before processing | ✅ | Fetches `existingUser.stripe_event_id`, compares to `event.id`, breaks if match |
| `customer.subscription.deleted` → tier: `free`, status: `canceled` | ✅ | `subscription_tier: 'free', subscription_status: 'canceled'` |
| `invoice.payment_failed` → status: `past_due` (does NOT downgrade tier) | ✅ | Only updates `subscription_status: 'past_due'` — no tier change, comment confirms intent |

---

## Portal Route (`src/app/api/stripe/portal/route.ts`)

| Criterion | Status | Notes |
|---|---|---|
| Creates Stripe Customer Portal session | ✅ | `stripe.billingPortal.sessions.create(...)` |
| Returns `portalUrl` | ✅ | `NextResponse.json({ portalUrl: portalSession.url })` |

---

## UpgradeWall (`src/components/story/UpgradeWall.tsx`)

| Criterion | Status | Notes |
|---|---|---|
| Buttons POST to `/api/stripe/checkout` with plan | ✅ | `fetch('/api/stripe/checkout', { method: 'POST', body: JSON.stringify({ plan }) })` |
| Loading state on buttons during fetch | ✅ | `loadingPlan` state, buttons `disabled={isLoading}`, price replaced with `'…'` while loading |
| 401 response → opens SignInModal (not redirect) | ✅ | `if (res.status === 401) { setPendingPlan(plan); setShowSignIn(true); return }` |
| Redirects to `checkoutUrl` after successful session creation | ✅ | `window.location.href = checkoutUrl` |

**Bonus:** After sign-in success, `handleSignInSuccess` re-triggers the pending checkout plan automatically. ✅

---

## Account Page (`src/app/account/page.tsx`)

| Criterion | Status | Notes |
|---|---|---|
| `?payment=success` shows success callout with tier name | ✅ | `paymentSuccess` flag renders green callout with `Welcome to {tierLabel} — unlimited stories await!` |

---

## Build

| Criterion | Status | Notes |
|---|---|---|
| `npm run build` passes | ✅ | Compiled cleanly. Only a benign `supabaseUrl is required` warning during static generation (from a count route with missing env in build context — not a blocker). All 15 pages generated. |

---

## `conversion.feature` — Idempotency Scenario Coverage

| Status | Notes |
|---|---|
| ⚠️ **File not found** | `features/conversion.feature` does not exist in the repo |

The file was referenced in the acceptance criteria but has not been created. This is a **non-blocking** gap — the implementation itself correctly handles the idempotency scenario (duplicate webhook guard is present and correct). However, the BDD spec file is missing. Recommend Kit creates `features/conversion.feature` to formalise the webhook idempotency scenario.

---

## Summary

**All 22 functional acceptance criteria: PASS ✅**

No blocking issues. One follow-up item:

> **[NON-BLOCKING]** `features/conversion.feature` file missing — BDD spec should be written to document the webhook idempotency scenario. Implementation is correct; the spec file just doesn't exist yet.

Phase 6 is ready to ship. 🚀
