Feature: User Onboarding
  As a new visitor to SandmanTales
  I want to create my first story without friction
  So that I experience value before being asked to sign up

  Scenario: Guest user creates first story without account
    Given a new visitor lands on the /create page
    When they fill in the story form:
      | field      | value                              |
      | childName  | Mia                                |
      | childAge   | 4                                  |
      | prompt     | A princess who befriends a cloud   |
    And clicks "Create My Story"
    Then a personalised story is generated for Mia
    And they are shown the story with illustration and audio
    And their guest session is stored in localStorage
    And they are NOT prompted to sign up yet

  Scenario: Guest is nudged to save after their story
    Given a guest user has just generated their first story
    Then a "Save your story" prompt appears below the story
    And the prompt explains that stories are lost without an account
    And there is a sign-up CTA with low friction ("Save with email")

  Scenario: Guest signs up to save their story (email OTP)
    Given a guest user completed a story and clicks "Save with email"
    When they enter their email address
    And click "Send magic link"
    Then a magic link email is sent to that address
    And the UI shows "Check your email" confirmation
    And the guest session ID is stored to be migrated on sign-in

  Scenario: Magic link sign-in completes onboarding
    Given a guest user clicked a magic link from their email
    When they land back on SandmanTales
    Then they are authenticated
    And their previous guest stories are migrated to their account
    And they see their story in the account page
    And they have 2 stories remaining on the free plan

  Scenario: Returning user signs in and sees their stories
    Given a user has an existing account with 2 previous stories
    When they visit sandmantales.com and sign in
    Then they are redirected to the /create page
    And they can see their stories remaining count
    And they can create a new story immediately

  Scenario: First-time user sees empty state on account page
    Given a new user has just signed up
    And has no stories yet
    When they visit /account
    Then they see a friendly empty state
    And a CTA to create their first story

  Scenario: User cannot access /account without authentication
    Given an unauthenticated visitor
    When they navigate to /account directly
    Then they are redirected to the homepage
    And the sign-in modal is opened automatically

  Scenario: Onboarding respects mobile experience
    Given a new visitor on a mobile device
    When they complete the story creation form
    Then the form fields are properly sized for touch input
    And the generated story is readable on a small screen
    And the audio player controls are tappable
