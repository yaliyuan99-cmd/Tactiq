-- ============================================================================
-- Tactiq backend — orders + admin role
-- ============================================================================
-- Apply AFTER 0001_init.sql: Dashboard → SQL Editor → paste → Run.
--
-- Adds:
--   profiles.is_admin   per-account admin flag (default false)
--   public.is_admin()   helper used by RLS policies
--   orders              pre-launch reservations, owned per user
--   admin read access   to waitlist + orders for admins
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Admin flag + helper
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- SECURITY DEFINER so the function can read profiles regardless of the caller's
-- own row-level policy, without causing recursive policy evaluation.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- Admins may read the whole waitlist through the API (anon still cannot).
drop policy if exists "waitlist_admin_select" on public.waitlist;
create policy "waitlist_admin_select"
  on public.waitlist for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. Orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  plan          text not null,                       -- 'essential' | 'pro'
  status        text not null default 'reserved',    -- reserved|paid|shipped|cancelled
  amount_cents  integer not null,
  currency      text not null default 'AUD',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);

alter table public.orders enable row level security;

-- Owners get full access to their own orders...
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "orders_update_own" on public.orders;
create policy "orders_update_own"
  on public.orders for update
  to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Keep updated_at fresh (reuses the trigger function from 0001).
drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Make yourself an admin
-- ---------------------------------------------------------------------------
-- After signing up, run this once (replace the email) to grant admin access:
--
--   update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'you@example.com');
