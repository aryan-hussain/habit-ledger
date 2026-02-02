create extension if not exists "pgcrypto";

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('good', 'bad')),
  review_window_days int not null default 7,
  sub_activities jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists habits_user_id_idx on public.habits (user_id);

create table if not exists public.habit_entries (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  status text not null check (status in ('success', 'fail')),
  sub_activity_statuses jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (habit_id, entry_date)
);

create index if not exists habit_entries_user_id_idx on public.habit_entries (user_id);

alter table public.habits enable row level security;
alter table public.habit_entries enable row level security;

drop policy if exists "Habits are user owned" on public.habits;
drop policy if exists "Entries are user owned" on public.habit_entries;

create policy "Habits are user owned"
  on public.habits
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Entries are user owned"
  on public.habit_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists habits_set_updated_at on public.habits;
create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

drop trigger if exists habit_entries_set_updated_at on public.habit_entries;
create trigger habit_entries_set_updated_at
  before update on public.habit_entries
  for each row execute function public.set_updated_at();
