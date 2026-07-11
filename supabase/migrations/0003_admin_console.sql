-- ============================================================================
-- Tactiq backend — admin console (user management + privacy)
-- ============================================================================
-- Apply AFTER 0002_orders_and_admin.sql: Dashboard → SQL Editor → paste → Run.
--
-- Adds:
--   profiles.is_banned / banned_reason / banned_at   soft-ban a user
--   admin SELECT/UPDATE on profiles                  manage every account
--   admin DELETE on waitlist                         prune signups
--   admin SELECT/DELETE on gesture_configs           privacy tooling
--
-- IMPORTANT — what a soft ban can and can't do from the browser:
--   These columns let your app *refuse service* to a banned user (the app checks
--   the flag on sign-in and gates the UI). They do NOT disable the underlying
--   Supabase Auth login — that requires the `service_role` key via the Admin API
--   (auth.admin.updateUserById / deleteUser) and must run on a SERVER, never in
--   this frontend. Treat the flag as an application-level ban; wire a server
--   function for a hard auth ban when you need one.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Soft-ban columns
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_banned     boolean not null default false,
  add column if not exists banned_reason text,
  add column if not exists banned_at     timestamptz;

-- ---------------------------------------------------------------------------
-- 2. Admin access to profiles (read + manage every account)
-- ---------------------------------------------------------------------------
-- Admins can read all profiles (owners already read their own via 0001).
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

-- Admins can update any profile (e.g. flip is_admin / is_banned); owners keep
-- their own update policy from 0001 for name/category.
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Keep banned_at in sync whenever is_banned changes.
create or replace function public.touch_banned_at()
returns trigger
language plpgsql
as $$
begin
  if new.is_banned is distinct from old.is_banned then
    new.banned_at := case when new.is_banned then now() else null end;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_touch_banned_at on public.profiles;
create trigger profiles_touch_banned_at
  before update on public.profiles
  for each row execute function public.touch_banned_at();

-- ---------------------------------------------------------------------------
-- 3. Admin privacy tooling
-- ---------------------------------------------------------------------------
-- Admins may delete waitlist signups (right-to-be-forgotten / spam cleanup).
drop policy if exists "waitlist_admin_delete" on public.waitlist;
create policy "waitlist_admin_delete"
  on public.waitlist for delete
  to authenticated
  using (public.is_admin());

-- Admins may read & delete any gesture config (data export / erasure).
drop policy if exists "gesture_configs_admin_select" on public.gesture_configs;
create policy "gesture_configs_admin_select"
  on public.gesture_configs for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "gesture_configs_admin_delete" on public.gesture_configs;
create policy "gesture_configs_admin_delete"
  on public.gesture_configs for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- Admins may delete any order (e.g. as part of erasing a user's data).
drop policy if exists "orders_admin_delete" on public.orders;
create policy "orders_admin_delete"
  on public.orders for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin());
