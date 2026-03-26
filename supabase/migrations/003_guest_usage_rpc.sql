create or replace function increment_guest_story_count(p_session_id text)
returns void as $$
  update guest_sessions
  set story_count = story_count + 1
  where id = p_session_id;
$$ language sql security definer;
