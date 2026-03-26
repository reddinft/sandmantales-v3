Feature: Story Generation
  As a parent
  I want to generate a personalised bedtime story for my child
  So that they feel special and drift off to sleep

  Background:
    Given the SandmanTales story generation pipeline is available
    And OpenAI, ElevenLabs, and fal.ai APIs are reachable

  Scenario: Guest user generates their first story
    Given the user is not logged in
    And has a guest session ID
    When the user submits the story form with:
      | field      | value                              |
      | childName  | Lily                               |
      | childAge   | 5                                  |
      | prompt     | A brave dragon who loves rainbows  |
    Then a story is generated within 60 seconds
    And the story text contains "Lily"
    And an audio narration URL is returned
    And an illustration image URL is returned
    And the story is saved to the database with guest_session_id
    And stories_remaining shows 2

  Scenario: Story text is age-appropriate
    Given a story is generated for a child aged 4
    Then the story text uses simple vocabulary
    And the story is between 200 and 600 words
    And the story has a clear beginning, middle, and end
    And the story ends on a peaceful, sleep-inducing note

  Scenario: Story generation with illustration graceful degradation
    Given the fal.ai illustration service is unavailable
    When the user generates a story
    Then the story text and audio are still returned successfully
    And imageUrl is null in the response
    And no error is shown to the user for the illustration failure

  Scenario: Story generation with audio graceful degradation
    Given the ElevenLabs TTS service is unavailable
    When the user generates a story
    Then the story text is still returned successfully
    And audioUrl is null in the response
    And no error is shown to the user for the audio failure

  Scenario: Guest hits usage limit (3 stories)
    Given a guest user has generated 3 stories
    When the guest attempts to generate a 4th story
    Then the API returns HTTP 402 with error "limit_reached"
    And the response includes upgradeUrl pointing to "/pricing"
    And the upgrade wall component is displayed

  Scenario: Authenticated free user hits monthly limit
    Given an authenticated user with subscription_tier "free"
    And they have generated 3 stories this calendar month
    When they attempt to generate another story
    Then the API returns HTTP 402 with error "limit_reached"
    And the upgrade wall is shown with the pricing options

  Scenario: Paid subscriber has unlimited stories
    Given an authenticated user with subscription_tier "monthly"
    When they generate their 10th story this month
    Then the story is generated successfully
    And no limit_reached error is returned

  Scenario: Guest stories migrate to new account on sign-up
    Given a guest user has generated 2 stories with guest_session_id "guest_abc"
    When the user creates an account and signs up
    And the auth migration endpoint runs with guestSessionId "guest_abc"
    Then the 2 stories are transferred to the new user account
    And the guest_session_id is cleared from those story records
    And the user's usage count for the current period is 2
