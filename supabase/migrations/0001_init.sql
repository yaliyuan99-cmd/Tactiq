-- ============================================================================
-- Tactiq backend — initial schema
-- ============================================================================
-- Apply this in your Supabase project: Dashboard → SQL Editor → paste → Run.
-- (Or, with the Supabase CLI: `supabase db push`.)
--
-- Tables:
--   waitlist         public sign-ups from the landing page (anon insert only)
--   profiles         1:1 extension of auth.users (per-account details)
--   gesture_configs  saved 9-grid / shortcut layouts, owned per user
--
-- Security model: Row-Level Security is ON for every table. The browser uses the
-- anon/public key, so these policies are the real access control.
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Waitlist
-- ---------------------------------------------------------------------------
create table if not exists public.waitlist (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text not null,
  user_category text,
  country       text,
  joined_at     timestamptz not null default now()
);

-- One signup per email address.
create unique index if not exists waitlist_email_key
  on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

-- Anyone (even logged-out visitors) may add themselves to the waitlist...
drop policy if exists "waitlist_public_insert" on public.waitlist;
create policy "waitlist_public_insert"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

-- ...but nobody can read the list through the public API. Read it from the
-- dashboard, or via a server using the service_role key / a future admin role.
-- (No SELECT policy => no public reads.)

-- ---------------------------------------------------------------------------
-- 2. Profiles (per authenticated user)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text,
  user_category text,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, user_category)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'user_category'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. Gesture configs (saved layouts, owned per user)
-- ---------------------------------------------------------------------------
create table if not exists public.gesture_configs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null default 'My Layout',
  layout      jsonb not null default '{}'::jsonb,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists gesture_configs_user_id_idx
  on public.gesture_configs (user_id);

alter table public.gesture_configs enable row level security;

-- Owners get full CRUD over their own rows; nobody else can see them.
drop policy if exists "gesture_configs_select_own" on public.gesture_configs;
create policy "gesture_configs_select_own"
  on public.gesture_configs for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "gesture_configs_insert_own" on public.gesture_configs;
create policy "gesture_configs_insert_own"
  on public.gesture_configs for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "gesture_configs_update_own" on public.gesture_configs;
create policy "gesture_configs_update_own"
  on public.gesture_configs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "gesture_configs_delete_own" on public.gesture_configs;
create policy "gesture_configs_delete_own"
  on public.gesture_configs for delete
  to authenticated
  using (auth.uid() = user_id);

-- Keep updated_at fresh on every change.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists gesture_configs_touch_updated_at on public.gesture_configs;
create trigger gesture_configs_touch_updated_at
  before update on public.gesture_configs
  for each row execute function public.touch_updated_at();
