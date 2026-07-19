/**
 * Tactiq data-access layer.
 *
 * Every backend call the UI needs goes through this module. When Supabase is
 * configured it talks to the real database; otherwise it transparently falls
 * back to localStorage so the site still works during development.
 */
import { supabase, isSupabaseConfigured } from './supabase';
import type {
  GestureLayout,
  GestureConfigRow,
  WaitlistRow,
  OrderRow,
  PlanId,
  OrderStatus,
} from './database.types';

// ---------------------------------------------------------------------------
// Waitlist
// ---------------------------------------------------------------------------

export interface WaitlistInput {
  fullName: string;
  email: string;
  userCategory?: string;
  country?: string;
}

export type WaitlistResult =
  | { ok: true; duplicate?: boolean; local?: boolean }
  | { ok: false; error: string };

const WAITLIST_LS_KEY = 'tactiq_waitlist';

/** Add someone to the launch waitlist. */
export async function joinWaitlist(input: WaitlistInput): Promise<WaitlistResult> {
  const entry = {
    full_name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    user_category: input.userCategory ?? null,
    country: input.country ?? null,
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('waitlist').insert(entry);
    if (error) {
      // 23505 = unique_violation → this email already signed up.
      if (error.code === '23505') return { ok: true, duplicate: true };
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }

  // --- Local fallback -------------------------------------------------------
  try {
    const saved: Array<typeof entry & { joined_at: string }> = JSON.parse(
      localStorage.getItem(WAITLIST_LS_KEY) ?? '[]',
    );
    if (saved.some((s) => s.email === entry.email)) {
      return { ok: true, duplicate: true, local: true };
    }
    saved.push({ ...entry, joined_at: new Date().toISOString() });
    localStorage.setItem(WAITLIST_LS_KEY, JSON.stringify(saved));
    // Small delay so the UI's "submitting" state is perceptible.
    await new Promise((r) => setTimeout(r, 500));
    return { ok: true, local: true };
  } catch {
    return { ok: false, error: 'Could not save your signup. Please try again.' };
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string | null;
  fullName: string | null;
}

// --- Local auth fallback --------------------------------------------------
// When Supabase isn't configured we keep a lightweight account store in
// localStorage so the auth screens are fully usable during development.
// (Dev-only: passwords are NOT hashed here — never ship this as a real backend.)
const AUTH_USERS_KEY = 'tactiq_auth_users';
const AUTH_SESSION_KEY = 'tactiq_auth_session';
const AUTH_EVENT = 'tactiq-auth-change';

interface LocalUser {
  id: string;
  email: string;
  password: string;
  fullName: string | null;
  userCategory: string | null;
  createdAt: string;
  isAdmin?: boolean;
  banned?: boolean;
  bannedReason?: string | null;
  bannedAt?: string | null;
}

function readLocalUsers(): LocalUser[] {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeLocalUsers(users: LocalUser[]): void {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function setLocalSession(userId: string | null): void {
  if (userId) localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ userId }));
  else localStorage.removeItem(AUTH_SESSION_KEY);
  // Notify same-tab listeners (the storage event only fires across tabs).
  window.dispatchEvent(new CustomEvent(AUTH_EVENT));
}

function getLocalSessionUser(): LocalUser | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const { userId } = JSON.parse(raw);
    return readLocalUsers().find((u) => u.id === userId) ?? null;
  } catch {
    return null;
  }
}

function toAuthUser(u: LocalUser): AuthUser {
  return { id: u.id, email: u.email, fullName: u.fullName };
}

/**
 * The localStorage auth fallback stores credentials in plaintext and exists
 * ONLY so the auth screens are usable in local development before a Supabase
 * project is connected. It must never run in a production build: if we reach a
 * credential path here in prod, the Supabase env vars are missing, and we fail
 * loudly rather than silently persisting unhashed passwords in the browser.
 */
function assertLocalAuthAllowed(): void {
  if (!import.meta.env.DEV) {
    throw new Error(
      'Sign-in is unavailable: this deployment is missing its Supabase ' +
        'configuration (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY). ' +
        'The insecure local auth fallback is disabled outside development.',
    );
  }
}

export async function signUp(params: {
  email: string;
  password: string;
  fullName?: string;
  userCategory?: string;
}): Promise<AuthUser> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: { full_name: params.fullName, user_category: params.userCategory },
      },
    });
    if (error) throw error;
    return {
      id: data.user?.id ?? '',
      email: data.user?.email ?? null,
      fullName: params.fullName ?? null,
    };
  }

  // --- Local fallback -------------------------------------------------------
  assertLocalAuthAllowed();
  const email = params.email.trim().toLowerCase();
  const users = readLocalUsers();
  if (users.some((u) => u.email === email)) {
    throw new Error('An account with this email already exists. Try signing in instead.');
  }
  const user: LocalUser = {
    id: crypto.randomUUID(),
    email,
    password: params.password,
    fullName: params.fullName?.trim() || null,
    userCategory: params.userCategory ?? null,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeLocalUsers(users);
  setLocalSession(user.id);
  return toAuthUser(user);
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return {
      id: data.user.id,
      email: data.user.email ?? null,
      fullName: (data.user.user_metadata?.full_name as string) ?? null,
    };
  }

  // --- Local fallback -------------------------------------------------------
  assertLocalAuthAllowed();
  const normalized = email.trim().toLowerCase();
  const user = readLocalUsers().find((u) => u.email === normalized);
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.');
  }
  if (user.banned) {
    throw new Error(
      user.bannedReason
        ? `This account has been suspended: ${user.bannedReason}`
        : 'This account has been suspended. Contact support if you think this is a mistake.',
    );
  }
  setLocalSession(user.id);
  return toAuthUser(user);
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
    return;
  }
  setLocalSession(null);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email ?? null,
      fullName: (data.user.user_metadata?.full_name as string) ?? null,
    };
  }
  const u = getLocalSessionUser();
  return u ? toAuthUser(u) : null;
}

/** Subscribe to auth changes. Returns an unsubscribe function. */
export function onAuthChange(cb: (user: AuthUser | null) => void): () => void {
  if (isSupabaseConfigured && supabase) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      cb(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? null,
              fullName: (session.user.user_metadata?.full_name as string) ?? null,
            }
          : null,
      );
    });
    return () => data.subscription.unsubscribe();
  }

  // --- Local fallback -------------------------------------------------------
  const handler = () => {
    const u = getLocalSessionUser();
    cb(u ? toAuthUser(u) : null);
  };
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener('storage', handler); // cross-tab sign in/out
  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

/**
 * Send a password-reset email. With Supabase the link returns the user to
 * `/reset-password`. In local mode we can't send email, so the caller can
 * route the user straight to the reset page (see `local` flag).
 */
export async function resetPassword(
  email: string,
): Promise<{ ok: true; local?: boolean }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return { ok: true };
  }
  // Local mode: nothing to email. Resetting happens on the reset page.
  return { ok: true, local: true };
}

/**
 * Set a new password. With Supabase this updates the currently-authenticated
 * (or recovery-link) session. In local mode pass the account email so we know
 * which stored user to update.
 */
export async function updatePassword(
  newPassword: string,
  opts?: { email?: string },
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return;
  }
  assertLocalAuthAllowed();
  const users = readLocalUsers();
  const target = opts?.email
    ? users.find((u) => u.email === opts.email!.trim().toLowerCase())
    : (getLocalSessionUser() ?? undefined);
  if (!target) {
    throw new Error('No account found for that email. Please sign up first.');
  }
  target.password = newPassword;
  writeLocalUsers(users);
}

/** Update the signed-in user's profile (display name / category). */
export async function updateProfile(params: {
  fullName?: string;
  userCategory?: string;
}): Promise<AuthUser> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: params.fullName, user_category: params.userCategory },
    });
    if (error) throw error;
    if (data.user) {
      await supabase
        .from('profiles')
        .update({
          full_name: params.fullName ?? null,
          user_category: params.userCategory ?? null,
        })
        .eq('id', data.user.id);
    }
    return {
      id: data.user?.id ?? '',
      email: data.user?.email ?? null,
      fullName: params.fullName ?? null,
    };
  }

  const session = getLocalSessionUser();
  if (!session) throw new Error('Please sign in first.');
  const users = readLocalUsers();
  const target = users.find((u) => u.id === session.id)!;
  if (params.fullName !== undefined) target.fullName = params.fullName.trim() || null;
  if (params.userCategory !== undefined) target.userCategory = params.userCategory;
  writeLocalUsers(users);
  setLocalSession(target.id); // fire change event so the UI refreshes
  return toAuthUser(target);
}

// ---------------------------------------------------------------------------
// Gesture configs
// ---------------------------------------------------------------------------

const GESTURE_LS_KEY = 'tactiq_gesture_configs';

export async function listGestureConfigs(): Promise<GestureConfigRow[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('gesture_configs')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
  return JSON.parse(localStorage.getItem(GESTURE_LS_KEY) ?? '[]');
}

export async function saveGestureConfig(params: {
  id?: string;
  name: string;
  layout: GestureLayout;
  isActive?: boolean;
}): Promise<GestureConfigRow> {
  if (isSupabaseConfigured && supabase) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Please sign in to save a layout.');
    const row = {
      ...(params.id ? { id: params.id } : {}),
      user_id: user.id,
      name: params.name,
      layout: params.layout,
      is_active: params.isActive ?? false,
    };
    const { data, error } = await supabase
      .from('gesture_configs')
      .upsert(row)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --- Local fallback -------------------------------------------------------
  const configs: GestureConfigRow[] = JSON.parse(
    localStorage.getItem(GESTURE_LS_KEY) ?? '[]',
  );
  const now = new Date().toISOString();
  const existingIdx = params.id ? configs.findIndex((c) => c.id === params.id) : -1;
  const record: GestureConfigRow = {
    id: params.id ?? crypto.randomUUID(),
    user_id: 'local',
    name: params.name,
    layout: params.layout,
    is_active: params.isActive ?? false,
    created_at: existingIdx >= 0 ? configs[existingIdx].created_at : now,
    updated_at: now,
  };
  if (existingIdx >= 0) configs[existingIdx] = record;
  else configs.push(record);
  localStorage.setItem(GESTURE_LS_KEY, JSON.stringify(configs));
  return record;
}

export async function deleteGestureConfig(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('gesture_configs').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const configs: GestureConfigRow[] = JSON.parse(
    localStorage.getItem(GESTURE_LS_KEY) ?? '[]',
  );
  localStorage.setItem(
    GESTURE_LS_KEY,
    JSON.stringify(configs.filter((c) => c.id !== id)),
  );
}

// ---------------------------------------------------------------------------
// Admin — waitlist read
// ---------------------------------------------------------------------------

export type WaitlistListResult =
  | { ok: true; entries: WaitlistRow[]; local?: boolean }
  | { ok: false; error: string };

/**
 * Read the waitlist. By design the public anon key has no SELECT policy on the
 * `waitlist` table (see the migration), so in a configured Supabase project this
 * must be done from the dashboard or a server using the service_role key. In
 * local-fallback mode we can read the entries we stored in localStorage.
 */
export async function listWaitlist(): Promise<WaitlistListResult> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('joined_at', { ascending: false });
    if (error) {
      return {
        ok: false,
        error:
          'The public key can’t read the waitlist (row-level security blocks it by design). ' +
          'View signups in your Supabase dashboard, or build a server endpoint with the service_role key.',
      };
    }
    return { ok: true, entries: data ?? [] };
  }

  // --- Local fallback -------------------------------------------------------
  try {
    const saved: Array<{
      full_name: string;
      email: string;
      user_category: string | null;
      country: string | null;
      joined_at: string;
    }> = JSON.parse(localStorage.getItem(WAITLIST_LS_KEY) ?? '[]');
    const entries: WaitlistRow[] = saved
      .map((s, i) => ({
        id: `local-${i}`,
        full_name: s.full_name,
        email: s.email,
        user_category: s.user_category,
        country: s.country,
        joined_at: s.joined_at,
      }))
      .sort((a, b) => b.joined_at.localeCompare(a.joined_at));
    return { ok: true, entries, local: true };
  } catch {
    return { ok: false, error: 'Could not read local waitlist data.' };
  }
}

// ---------------------------------------------------------------------------
// Device telemetry (simulated)
// ---------------------------------------------------------------------------
// The Tactiq rings stream live status to the companion app over Bluetooth. There
// is no physical hardware behind this site, so we synthesise a believable,
// gently-fluctuating snapshot. Values are seeded from the signed-in user so each
// account sees a stable "their device", with small per-tick jitter for realism.

export interface DeviceTelemetry {
  deviceName: string;
  serial: string;
  connected: boolean;
  firmware: string;
  lastSync: string; // ISO
  battery: { level: number; charging: boolean; health: number; estimatedDaysLeft: number };
  signal: { rssiDbm: number; quality: 'excellent' | 'good' | 'fair' | 'weak' };
  location: { label: string; lat: number; lng: number; accuracyM: number };
  wellness: { heartRate: number; steps: number; activeMinutes: number };
  storage: { usedMb: number; totalMb: number };
}

function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff; // 0..1
}

/**
 * Returns a fresh telemetry snapshot. Call it on an interval to animate the
 * dashboard — the base values stay stable per `seedKey`, only live metrics
 * (heart rate, signal, sync time) jitter between calls.
 */
export function getDeviceTelemetry(seedKey = 'demo'): DeviceTelemetry {
  const s = seedFromString(seedKey);
  const jitter = (range: number) => (Math.random() - 0.5) * range;

  const batteryBase = 58 + Math.floor(s * 36); // 58–94
  const restingHr = 60 + Math.floor(s * 18); // 60–78
  const heartRate = Math.max(48, Math.round(restingHr + jitter(8)));
  const rssi = -52 - Math.floor(s * 18) + Math.round(jitter(6)); // ~ -52..-76
  const quality: DeviceTelemetry['signal']['quality'] =
    rssi > -60 ? 'excellent' : rssi > -68 ? 'good' : rssi > -74 ? 'fair' : 'weak';

  // Stable home-ish coordinates (Sydney CBD) nudged per user, tiny live drift.
  const lat = -33.8688 + (s - 0.5) * 0.06 + jitter(0.0004);
  const lng = 151.2093 + (s - 0.5) * 0.06 + jitter(0.0004);

  return {
    deviceName: 'Tactiq Pro',
    serial: 'TQ-' + Math.floor(s * 9000 + 1000) + '-' + Math.floor(s * 9000 + 1000),
    connected: true,
    firmware: '2.4.1',
    lastSync: new Date(Date.now() - Math.floor(Math.random() * 40) * 1000).toISOString(),
    battery: {
      level: batteryBase,
      charging: s > 0.7,
      health: 92 + Math.floor(s * 7), // 92–99 %
      estimatedDaysLeft: Math.max(1, Math.round((batteryBase / 100) * 7)),
    },
    signal: { rssiDbm: rssi, quality },
    location: {
      label: 'Sydney, NSW',
      lat,
      lng,
      accuracyM: 5 + Math.floor(Math.random() * 8),
    },
    wellness: {
      heartRate,
      steps: 3400 + Math.floor(s * 6200) + Math.floor(Math.random() * 40),
      activeMinutes: 22 + Math.floor(s * 50),
    },
    storage: { usedMb: 120 + Math.floor(s * 180), totalMb: 512 },
  };
}

// ---------------------------------------------------------------------------
// Device history (past 24 hours)
// ---------------------------------------------------------------------------
// A stable, seeded 24-hour back-history for each metric so the dashboard cards
// can open a detail view. Unlike getDeviceTelemetry (which jitters per tick for
// a "live" feel), this is deterministic per user + per hour bucket so the chart
// doesn't reshuffle on every render.

export interface HistoryPoint {
  /** ISO timestamp for the top of that hour. */
  t: string;
  /** Hour label like "14:00". */
  label: string;
  value: number;
}

export interface MetricHistory {
  points: HistoryPoint[];
  min: number;
  max: number;
  avg: number;
  unit: string;
}

export type DeviceHistory = {
  heartRate: MetricHistory;
  battery: MetricHistory;
  signal: MetricHistory;
  steps: MetricHistory;
  activeMinutes: MetricHistory;
};

/** Deterministic 0..1 from two integers — stable per (seed, hour). */
function hashed(seedBase: number, n: number): number {
  let h = Math.imul(seedBase ^ (n + 0x9e3779b1), 2654435761);
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519);
  h ^= h >>> 13;
  return (h >>> 0) / 0xffffffff;
}

function summarise(points: HistoryPoint[], unit: string): MetricHistory {
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  return { points, min, max, avg, unit };
}

/**
 * Returns 24 hourly samples (oldest → newest) for each tracked metric, seeded
 * from `seedKey` so each account sees a believable, stable day of data.
 */
export function getDeviceHistory(seedKey = 'demo'): DeviceHistory {
  const s = seedFromString(seedKey);
  const seedBase = Math.floor(s * 0xffffffff) >>> 0;
  const now = new Date();
  // Align to the top of the current hour.
  const top = new Date(now);
  top.setMinutes(0, 0, 0);

  const restingHr = 60 + Math.floor(s * 18); // matches getDeviceTelemetry
  const batteryNow = 58 + Math.floor(s * 36);
  const rssiBase = -52 - Math.floor(s * 18);

  const hr: HistoryPoint[] = [];
  const batt: HistoryPoint[] = [];
  const sig: HistoryPoint[] = [];
  const steps: HistoryPoint[] = [];
  const active: HistoryPoint[] = [];

  // Reconstruct a plausible day. hoursAgo 23 → 0 (oldest first).
  for (let i = 23; i >= 0; i--) {
    const when = new Date(top.getTime() - i * 3600_000);
    const hourOfDay = when.getHours();
    const t = when.toISOString();
    const label = `${String(hourOfDay).padStart(2, '0')}:00`;

    // Heart rate: lower overnight (0–6h), higher midday, with seeded noise.
    const circadian = Math.sin(((hourOfDay - 6) / 24) * Math.PI * 2); // -1..1
    const hrVal = Math.round(
      restingHr + circadian * 9 + (hashed(seedBase, i + 1) - 0.5) * 7,
    );
    hr.push({ t, label, value: Math.max(46, hrVal) });

    // Battery: smoothly draining backwards from "now", with an overnight charge
    // bump if the user charges (s > 0.7). Clamp 5..100.
    const drain = i * (1.6 + s * 0.8);
    let battVal = batteryNow + drain;
    if (s > 0.7 && hourOfDay >= 1 && hourOfDay <= 5) battVal -= 18; // charged later
    batt.push({ t, label, value: Math.max(5, Math.min(100, Math.round(battVal))) });

    // Signal RSSI: wobble around base (closer to 0 = stronger).
    const sigVal = Math.round(rssiBase + (hashed(seedBase, i + 100) - 0.5) * 12);
    sig.push({ t, label, value: sigVal });

    // Steps per hour: almost none overnight, bursts during the day.
    const awake = hourOfDay >= 7 && hourOfDay <= 22;
    const hourSteps = awake
      ? Math.round(120 + hashed(seedBase, i + 200) * 850 * (0.6 + s))
      : Math.round(hashed(seedBase, i + 200) * 40);
    steps.push({ t, label, value: hourSteps });

    // Active minutes per hour (0..~12).
    const actVal = awake ? Math.round(hashed(seedBase, i + 300) * 12 * (0.5 + s)) : 0;
    active.push({ t, label, value: actVal });
  }

  return {
    heartRate: summarise(hr, 'bpm'),
    battery: summarise(batt, '%'),
    signal: summarise(sig, 'dBm'),
    steps: summarise(steps, 'steps/h'),
    activeMinutes: summarise(active, 'min/h'),
  };
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

const ORDERS_LS_KEY = 'tactiq_orders';

function readLocalOrders(): OrderRow[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_LS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeLocalOrders(orders: OrderRow[]): void {
  localStorage.setItem(ORDERS_LS_KEY, JSON.stringify(orders));
}

/** Place a pre-launch reservation. No real payment is taken. */
export async function createOrder(params: {
  plan: PlanId;
  amountCents: number;
  currency?: string;
}): Promise<OrderRow> {
  const currency = params.currency ?? 'AUD';

  if (isSupabaseConfigured && supabase) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Please sign in to place an order.');
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        plan: params.plan,
        amount_cents: params.amountCents,
        currency,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // --- Local fallback -------------------------------------------------------
  const session = getLocalSessionUser();
  const now = new Date().toISOString();
  const order: OrderRow = {
    id: crypto.randomUUID(),
    user_id: session?.id ?? 'local',
    plan: params.plan,
    status: 'reserved',
    amount_cents: params.amountCents,
    currency,
    created_at: now,
    updated_at: now,
  };
  const orders = readLocalOrders();
  orders.push(order);
  writeLocalOrders(orders);
  await new Promise((r) => setTimeout(r, 400));
  return order;
}

/** List the signed-in user's orders, newest first. */
export async function listOrders(): Promise<OrderRow[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
  const session = getLocalSessionUser();
  return readLocalOrders()
    .filter((o) => !session || o.user_id === session.id || o.user_id === 'local')
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** Convenience: the user's most recent order, or null. */
export async function getLatestOrder(): Promise<OrderRow | null> {
  const orders = await listOrders();
  return orders[0] ?? null;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

// In local-dev mode the account owner (the first registered user) is treated as
// admin, plus any email listed in VITE_ADMIN_EMAILS. In a real Supabase project
// admin status comes from profiles.is_admin (flip it with the SQL in 0002).
const LOCAL_ADMIN_EMAILS = String(import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/** Whether the signed-in user has admin access. */
export async function isAdmin(): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return false;
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', auth.user.id)
      .single();
    if (error) return false;
    return Boolean(data?.is_admin);
  }

  // --- Local fallback -------------------------------------------------------
  const session = getLocalSessionUser();
  if (!session) return false;
  // An explicit per-account flag (set in the admin console) always wins.
  if (session.isAdmin) return true;
  if (LOCAL_ADMIN_EMAILS.includes(session.email)) return true;
  // Default bootstrap: the first account created on this machine is the owner,
  // so there's always at least one admin to start from.
  const users = readLocalUsers();
  return users.length > 0 && users[0].id === session.id;
}

/** Admin: every order across all users, newest first. */
export async function listAllOrders(): Promise<OrderRow[]> {
  if (isSupabaseConfigured && supabase) {
    // RLS lets admins read all rows; non-admins only see their own.
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
  return readLocalOrders().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ---------------------------------------------------------------------------
// Admin console — user management + privacy
// ---------------------------------------------------------------------------
// These power the /admin console. In local mode they fully manage the
// localStorage stores. In a configured Supabase project they rely on the admin
// RLS policies from 0003 (read/manage profiles, delete waitlist / orders /
// gesture_configs). NOTE: a soft "ban" here makes the *app* refuse service; it
// does NOT disable Supabase Auth — that needs the service_role Admin API on a
// server (never the browser).

export interface AdminUser {
  id: string;
  email: string | null;
  fullName: string | null;
  userCategory: string | null;
  createdAt: string;
  isAdmin: boolean;
  banned: boolean;
  bannedReason: string | null;
  bannedAt: string | null;
  ordersCount: number;
  layoutsCount: number;
}

/** Effective local-admin check for an arbitrary user (mirrors isAdmin()). */
function localUserIsAdmin(u: LocalUser, all: LocalUser[]): boolean {
  if (u.isAdmin) return true;
  if (LOCAL_ADMIN_EMAILS.includes(u.email)) return true;
  return all.length > 0 && all[0].id === u.id;
}

/** Admin: list every account with its admin/ban state and activity counts. */
export async function listAllUsers(): Promise<AdminUser[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const orders = await listAllOrders().catch(() => [] as OrderRow[]);
    return (data ?? []).map((p) => ({
      id: p.id,
      // profiles doesn't store email (it lives in auth.users, which the anon key
      // can't read). Surface that honestly in the UI.
      email: null,
      fullName: p.full_name,
      userCategory: p.user_category,
      createdAt: p.created_at,
      isAdmin: Boolean(p.is_admin),
      banned: Boolean(p.is_banned),
      bannedReason: p.banned_reason ?? null,
      bannedAt: p.banned_at ?? null,
      ordersCount: orders.filter((o) => o.user_id === p.id).length,
      layoutsCount: 0,
    }));
  }

  // --- Local fallback -------------------------------------------------------
  const users = readLocalUsers();
  const orders = readLocalOrders();
  const configs: GestureConfigRow[] = JSON.parse(
    localStorage.getItem(GESTURE_LS_KEY) ?? '[]',
  );
  return users
    .map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      userCategory: u.userCategory,
      createdAt: u.createdAt,
      isAdmin: localUserIsAdmin(u, users),
      banned: Boolean(u.banned),
      bannedReason: u.bannedReason ?? null,
      bannedAt: u.bannedAt ?? null,
      ordersCount: orders.filter((o) => o.user_id === u.id).length,
      layoutsCount: configs.filter((c) => c.user_id === u.id || c.user_id === 'local').length,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Admin: suspend or restore an account (application-level ban). */
export async function setUserBanned(
  userId: string,
  banned: boolean,
  reason?: string,
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: banned, banned_reason: banned ? (reason ?? null) : null })
      .eq('id', userId);
    if (error) throw error;
    return;
  }
  const session = getLocalSessionUser();
  if (session && session.id === userId && banned) {
    throw new Error('You can’t suspend your own account.');
  }
  const users = readLocalUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) throw new Error('User not found.');
  target.banned = banned;
  target.bannedReason = banned ? (reason?.trim() || null) : null;
  target.bannedAt = banned ? new Date().toISOString() : null;
  writeLocalUsers(users);
}

/** Admin: grant or revoke admin access. */
export async function setUserAdmin(userId: string, value: boolean): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: value })
      .eq('id', userId);
    if (error) throw error;
    return;
  }
  const users = readLocalUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) throw new Error('User not found.');
  if (!value) {
    // Don't allow removing the last remaining admin.
    const admins = users.filter((u) => localUserIsAdmin(u, users));
    if (admins.length <= 1 && admins[0]?.id === userId) {
      throw new Error('You can’t remove the only remaining admin.');
    }
  }
  target.isAdmin = value;
  writeLocalUsers(users);
}

/** Admin: move an order through its lifecycle. */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (error) throw error;
    return;
  }
  const orders = readLocalOrders();
  const target = orders.find((o) => o.id === orderId);
  if (!target) throw new Error('Order not found.');
  target.status = status;
  target.updated_at = new Date().toISOString();
  writeLocalOrders(orders);
}

/** Admin: delete a single order. */
export async function deleteOrder(orderId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) throw error;
    return;
  }
  writeLocalOrders(readLocalOrders().filter((o) => o.id !== orderId));
}

/** Admin: remove a waitlist signup (privacy / spam cleanup). */
export async function deleteWaitlistEntry(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('waitlist').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  // Local ids are `local-<index>` into the stored array.
  const idx = Number(id.replace(/^local-/, ''));
  const saved: unknown[] = JSON.parse(localStorage.getItem(WAITLIST_LS_KEY) ?? '[]');
  if (!Number.isNaN(idx) && idx >= 0 && idx < saved.length) {
    saved.splice(idx, 1);
    localStorage.setItem(WAITLIST_LS_KEY, JSON.stringify(saved));
  }
}

export interface UserDataExport {
  exportedAt: string;
  profile: {
    id: string;
    email: string | null;
    fullName: string | null;
    userCategory: string | null;
    createdAt: string;
    isAdmin: boolean;
    banned: boolean;
  };
  orders: OrderRow[];
  layouts: GestureConfigRow[];
}

/** Admin/privacy: gather everything stored about one user (for a data request). */
export async function exportUserData(userId: string): Promise<UserDataExport> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured && supabase) {
    const [{ data: profile }, { data: orders }, { data: layouts }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('orders').select('*').eq('user_id', userId),
      supabase.from('gesture_configs').select('*').eq('user_id', userId),
    ]);
    return {
      exportedAt: now,
      profile: {
        id: userId,
        email: null,
        fullName: profile?.full_name ?? null,
        userCategory: profile?.user_category ?? null,
        createdAt: profile?.created_at ?? '',
        isAdmin: Boolean(profile?.is_admin),
        banned: Boolean(profile?.is_banned),
      },
      orders: orders ?? [],
      layouts: layouts ?? [],
    };
  }

  const users = readLocalUsers();
  const u = users.find((x) => x.id === userId);
  if (!u) throw new Error('User not found.');
  const configs: GestureConfigRow[] = JSON.parse(
    localStorage.getItem(GESTURE_LS_KEY) ?? '[]',
  );
  return {
    exportedAt: now,
    profile: {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      userCategory: u.userCategory,
      createdAt: u.createdAt,
      isAdmin: localUserIsAdmin(u, users),
      banned: Boolean(u.banned),
    },
    orders: readLocalOrders().filter((o) => o.user_id === u.id),
    layouts: configs.filter((c) => c.user_id === u.id || c.user_id === 'local'),
  };
}

/** Admin/privacy: erase a user's orders, layouts, and account record. */
export async function eraseUserData(userId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    // Delete the data we can via RLS. The auth.users row + email must be removed
    // server-side with the service_role Admin API (never from the browser).
    await supabase.from('orders').delete().eq('user_id', userId);
    await supabase.from('gesture_configs').delete().eq('user_id', userId);
    return;
  }
  const session = getLocalSessionUser();
  if (session && session.id === userId) {
    throw new Error('You can’t erase the account you’re signed in as.');
  }
  writeLocalOrders(readLocalOrders().filter((o) => o.user_id !== userId));
  const configs: GestureConfigRow[] = JSON.parse(
    localStorage.getItem(GESTURE_LS_KEY) ?? '[]',
  );
  localStorage.setItem(
    GESTURE_LS_KEY,
    JSON.stringify(configs.filter((c) => c.user_id !== userId)),
  );
  writeLocalUsers(readLocalUsers().filter((u) => u.id !== userId));
}

export interface AdminStats {
  users: number;
  admins: number;
  banned: number;
  waitlist: number;
  orders: number;
  reservedCents: number;
}

/** Admin: high-level counts for the console overview. */
export async function getAdminStats(): Promise<AdminStats> {
  const [users, orders, waitlist] = await Promise.all([
    listAllUsers().catch(() => [] as AdminUser[]),
    listAllOrders().catch(() => [] as OrderRow[]),
    listWaitlist().then((r) => (r.ok ? r.entries.length : 0)).catch(() => 0),
  ]);
  return {
    users: users.length,
    admins: users.filter((u) => u.isAdmin).length,
    banned: users.filter((u) => u.banned).length,
    waitlist,
    orders: orders.length,
    reservedCents: orders.reduce((sum, o) => sum + o.amount_cents, 0),
  };
}

export type { OrderRow, OrderStatus };
