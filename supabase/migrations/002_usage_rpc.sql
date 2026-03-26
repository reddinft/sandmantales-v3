-- Migration 002: Atomic usage increment RPC
-- Fixes the read-then-write race condition in incrementAuthUserUsage
-- Uses INSERT ... ON CONFLICT DO UPDATE to atomically increment story_count

create or replace function increment_usage(p_user_id uuid, p_period_start date)
returns void as $$
  insert into usage_counts (user_id, period_start, story_count)
  values (p_user_id, p_period_start, 1)
  on conflict (user_id, period_start)
  do update set story_count = usage_counts.story_count + 1;
$$ language sql security definer;
