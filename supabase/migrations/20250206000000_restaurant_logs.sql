-- Restaurant logs table: one row per logged restaurant per user
create extension if not exists pgcrypto;

create table if not exists public.restaurant_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  location text,
  rating numeric(2,1) not null check (
    rating >= 0 and rating <= 5 and rating * 2 = floor(rating * 2)
  ),
  date_visited date not null,
  review text,
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

-- Index for listing a user's logs
create index if not exists restaurant_logs_user_id_idx on public.restaurant_logs(user_id);

-- RLS: users can only read/write their own logs
alter table public.restaurant_logs enable row level security;

create policy "Users can read own logs"
  on public.restaurant_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on public.restaurant_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own logs"
  on public.restaurant_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own logs"
  on public.restaurant_logs for delete
  using (auth.uid() = user_id);
