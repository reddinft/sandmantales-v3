Feature: Homepage
  As a parent visiting SandmanTales for the first time
  I want to understand what the product does and try it
  So that I can decide whether to create an account

  Scenario: Homepage loads with key marketing sections
    Given a visitor opens sandmantales.com
    Then the page title is "SandmanTales — Personalised Bedtime Stories for Your Child"
    And the hero section is visible with a clear CTA
    And the social proof bar shows the total story count
    And the "How It Works" section explains the 3-step process
    And the pricing section shows Free, Monthly, and Lifetime plans
    And the testimonials section shows at least 2 testimonials
    And the footer contains navigation links

  Scenario: JSON-LD structured data is present
    Given a search crawler visits the homepage
    Then the page contains a script tag with type "application/ld+json"
    And the JSON-LD specifies "@type": "WebApplication"
    And the name is "SandmanTales"
    And the offers price is "9.99" USD

  Scenario: OG meta tags are set for social sharing
    Given a visitor shares the homepage URL on social media
    Then the og:title is "SandmanTales — Tonight, Your Child Is the Hero"
    And the og:image points to "/api/og"
    And the og:type is "website"
    And the twitter:card is "summary_large_image"

  Scenario: Story count is live and updates via ISR
    Given the database has 1,350 published stories
    When the homepage is loaded
    Then the social proof bar displays approximately 1,350 stories
    And the count is refreshed at most every 60 seconds via ISR

  Scenario: Sign-in modal auto-opens via query param
    Given a user visits "/?signin=true"
    Then the sign-in modal opens automatically
    And the user can enter their email to sign in

  Scenario: Visitor clicks "Get Started Free" CTA
    Given a visitor is on the homepage
    When they click the primary CTA button
    Then they are navigated to the /create page
    And no sign-in is required to start

  Scenario: Homepage is accessible on mobile
    Given a visitor opens the homepage on a 375px wide screen
    Then the hero text is readable without horizontal scrolling
    And the CTA button is tappable with at least 44px height
    And the navigation is properly responsive
