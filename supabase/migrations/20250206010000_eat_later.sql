-- Migration to add Eat Later list and update existing restaurant_logs

create extension if not exists pgcrypto;

-- If your project already has restaurant_logs with the original migration:
--   rating smallint not null check (rating >= 1 and rating <= 5)
-- this will relax rating and add tags.

do $$
begin
  -- Drop old rating constraint if it exists
  begin
    alter table public.restaurant_logs drop constraint if exists restaurant_logs_rating_check;
  exception
    when undefined_object then null;
  end;

  -- Change rating type and constraint to allow 0–5 in 0.5 steps
  alter table public.restaurant_logs
    alter column rating type numeric(2,1) using rating::numeric(2,1),
    alter column rating set not null;

  alter table public.restaurant_logs
    add constraint restaurant_logs_rating_check
      check (rating >= 0 and rating <= 5 and rating * 2 = floor(rating * 2));

  -- Add tags array if it doesn't exist yet
  begin
    alter table public.restaurant_logs
      add column if not exists tags text[] not null default '{}'::text[];
  exception
    when duplicate_column then null;
  end;
end $$;

-- Eat Later table: restaurants the user wants to visit in the future
create table if not exists public.eat_later (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  location text,
  notes text,
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

create index if not exists eat_later_user_id_idx on public.eat_later(user_id);

alter table public.eat_later enable row level security;

create policy "Users can read own eat_later"
  on public.eat_later for select
  using (auth.uid() = user_id);

create policy "Users can insert own eat_later"
  on public.eat_later for insert
  with check (auth.uid() = user_id);

create policy "Users can update own eat_later"
  on public.eat_later for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own eat_later"
  on public.eat_later for delete
  using (auth.uid() = user_id);

