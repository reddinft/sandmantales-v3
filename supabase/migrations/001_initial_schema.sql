-- Users (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  subscription_tier text not null default 'free', -- 'free' | 'monthly' | 'lifetime'
  subscription_status text, -- 'active' | 'canceled' | 'past_due' | null
  stripe_customer_id text unique,
  stripe_subscription_id text,
  stripe_event_id text, -- for idempotency
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Stories
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  guest_session_id text, -- for guest stories
  child_name text not null,
  child_age int,
  prompt text not null,
  story_text text,
  audio_url text,
  image_url text,
  image_cost_usd numeric(6,4),
  is_public boolean default false,
  created_at timestamptz default now()
);

-- Guest sessions (cookie-based, TTL enforced by app)
create table public.guest_sessions (
  id text primary key, -- cookie value (nanoid)
  story_count int not null default 0,
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '7 days'
);

-- Usage counts (per user per billing period)
create table public.usage_counts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  period_start date not null,
  story_count int not null default 0,
  unique(user_id, period_start)
);

-- RLS policies
alter table public.users enable row level security;
alter table public.stories enable row level security;
alter table public.guest_sessions enable row level security;
alter table public.usage_counts enable row level security;

create policy "Users can read own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can read own stories" on public.stories
  for select using (auth.uid() = user_id or is_public = true);
create policy "Users can insert own stories" on public.stories
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "Service role only on guest_sessions" on public.guest_sessions
  for all using (auth.role() = 'service_role');

create policy "Users can read own usage" on public.usage_counts
  for select using (auth.uid() = user_id);
