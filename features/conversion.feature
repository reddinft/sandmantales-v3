Feature: Subscription and Purchase Conversion
  As a parent who has used free stories
  I want to upgrade to a paid plan
  So that I can create unlimited bedtime stories for my child

  Background:
    Given the user has an authenticated SandmanTales account
    And Stripe is configured in test mode

  Scenario: Monthly subscription checkout happy path
    Given the user has used all 3 free stories
    When the user clicks "Upgrade" on the upgrade wall
    And selects the "Monthly" plan at $9.99/month
    And completes Stripe checkout with a valid test card
    Then the Stripe webhook fires a "checkout.session.completed" event
    And the user's subscription_tier is updated to "monthly"
    And the user can create unlimited stories
    And the user sees a success confirmation message

  Scenario: Lifetime purchase happy path
    Given the user is on the pricing page
    When the user selects the "Lifetime" plan at $99 one-time
    And completes Stripe checkout with a valid test card
    Then the Stripe webhook fires a "checkout.session.completed" event
    And the user's subscription_tier is updated to "lifetime"
    And the user can create unlimited stories forever
    And no recurring charges appear in Stripe

  Scenario: Webhook idempotency bug guard
    Given a "checkout.session.completed" webhook event with session ID "cs_test_abc123"
    When the webhook is delivered twice (Stripe retry simulation)
    Then the user's subscription is only updated once
    And no duplicate records are created in the database
    And both webhook responses return HTTP 200

  Scenario: Abandoned checkout leaves state unchanged
    Given the user has 0 free stories remaining
    When the user starts a Stripe checkout session
    And the user closes the Stripe checkout modal without completing payment
    Then the user's subscription_tier remains "free"
    And no payment is charged
    And the user can retry checkout at any time

  Scenario: Stripe portal — cancel subscription
    Given the user has an active monthly subscription
    When the user visits the billing portal via "/api/stripe/portal"
    And cancels their subscription in the Stripe portal
    Then the "customer.subscription.deleted" webhook fires
    And the user's subscription_tier is updated to "free" at period end
    And the user retains access until the billing period ends
